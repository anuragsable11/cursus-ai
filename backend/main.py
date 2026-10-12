
from fastapi import FastAPI

app = FastAPI(
    title="CURSUS AI",
    description="AI-powered career intelligence platform",
    version="0.1.0",
)


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
