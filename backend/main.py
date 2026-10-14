import asyncio
import os
from contextlib import asynccontextmanager
from typing import Annotated, Awaitable, TypeVar

from fastapi import APIRouter, Depends, FastAPI, File, HTTPException, Request, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from ai_career_service import generate_ai_skill_gap_analysis
from ai_service import get_ollama_status
from auth import get_current_user
from auth import router as auth_router
from database import init_db
from job_matcher import match_job
from profile_analyzer import analyze_profile
from resume_service import extract_resume_text
from skill_gap_analyzer import analyze_skill_gaps


SkillName = Annotated[str, Field(max_length=60)]
T = TypeVar("T")


class JobMatchRequest(BaseModel):
    resume_skills: list[SkillName] = Field(max_length=100)
    job_description: str = Field(min_length=30, max_length=20000)


class SkillGapRequest(BaseModel):
    resume_skills: list[SkillName] = Field(max_length=100)
    job_description: str = Field(min_length=30, max_length=20000)
    target_weeks: int = Field(default=4, ge=1, le=12)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="CURSUS AI",
    description="AI-powered career intelligence platform",
    version="0.3.0",
    lifespan=lifespan,
)

# Comma-separated list of frontend origins allowed to call the API.
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]

UNSAFE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


class CrossSiteWriteGuard:
    """
    Defense in depth next to SameSite cookies: browsers always send Origin on
    cross-origin writes, so refuse any that don't come from the frontend.

    Written as plain ASGI rather than @app.middleware("http"): that helper
    wraps the request stream and hides client disconnects from endpoints,
    which would stop a cancelled AI request from cancelling the model.
    """

    def __init__(self, app, allowed_origins: list[str]):
        self.app = app
        self.allowed_origins = set(allowed_origins)

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http" and scope["method"] in UNSAFE_METHODS:
            origin = next(
                (value.decode("latin-1") for name, value in scope["headers"] if name == b"origin"),
                None,
            )
            if origin and origin not in self.allowed_origins:
                response = JSONResponse({"detail": "Cross-site request blocked."}, status_code=403)
                await response(scope, receive, send)
                return
        await self.app(scope, receive, send)


app.add_middleware(CrossSiteWriteGuard, allowed_origins=CORS_ORIGINS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    # Needed so the browser sends and accepts the session cookie.
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


# Public routes


@app.get("/")
def home():
    return {
        "message": "Welcome to CURSUS AI",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "cursus-ai-backend",
    }


@app.get("/api/v1/ai/status")
async def ai_status():
    return await get_ollama_status()


app.include_router(auth_router)


# Routes that require a signed-in user

features = APIRouter(prefix="/api/v1", dependencies=[Depends(get_current_user)])


@features.post("/resumes/extract")
async def extract_resume(file: UploadFile = File(...)):
    return await extract_resume_text(file)


@features.post("/resumes/analyze")
async def analyze_resume(file: UploadFile = File(...)):
    resume = await extract_resume_text(file)
    profile = analyze_profile(resume["extracted_text"])

    return {
        "filename": resume["filename"],
        "pages": resume["pages"],
        "characters_extracted": resume["characters_extracted"],
        "profile": profile,
        "status": "profile_analyzed",
    }


@features.post("/jobs/match")
async def match_job_endpoint(request: JobMatchRequest):
    try:
        return match_job(
            resume_skills=request.resume_skills,
            job_description=request.job_description,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@features.post("/skills/gap-analysis")
async def skill_gap_analysis_endpoint(request: SkillGapRequest):
    try:
        return analyze_skill_gaps(
            resume_skills=request.resume_skills,
            job_description=request.job_description,
            target_weeks=request.target_weeks,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


class ClientDisconnected(Exception):
    pass


async def run_until_disconnect(http_request: Request, work: Awaitable[T]) -> T:
    """
    Await long-running work, but cancel it if the browser goes away.
    Cancelling closes the connection to Ollama, which stops generating,
    so a cancelled or abandoned request doesn't keep the model busy.
    """

    task = asyncio.ensure_future(work)
    try:
        while True:
            done, _ = await asyncio.wait({task}, timeout=1.0)
            if done:
                return task.result()
            if await http_request.is_disconnected():
                raise ClientDisconnected()
    finally:
        if not task.done():
            task.cancel()


@features.post("/skills/ai-gap-analysis")
async def ai_skill_gap_analysis_endpoint(
    request: SkillGapRequest,
    http_request: Request,
):
    try:
        return await run_until_disconnect(
            http_request,
            generate_ai_skill_gap_analysis(
                resume_skills=request.resume_skills,
                job_description=request.job_description,
                target_weeks=request.target_weeks,
            ),
        )
    except ClientDisconnected:
        # Nobody is listening; 499 is the conventional "client closed" code.
        return Response(status_code=499)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error))


app.include_router(features)
