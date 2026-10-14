import math
import os
import re
import time
from collections import defaultdict, deque
from datetime import datetime, timedelta
from threading import Lock
from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic_core import PydanticCustomError
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database import SessionLocal, get_db
from models import AuthSession, User, utcnow
from security import (
    hash_password,
    hash_token,
    new_session_token,
    password_needs_rehash,
    spend_verification_time,
    verify_password,
)


SESSION_COOKIE = "cursus_session"
# Set COOKIE_SECURE=true when serving over HTTPS. Use COOKIE_SAMESITE=none
# (with Secure) only if the frontend and API end up on different sites.
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"
COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "lax").lower()

REMEMBERED_SESSION = timedelta(days=30)
BROWSER_SESSION = timedelta(hours=12)

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


# Schemas


def _normalize_email(value: str) -> str:
    return value.strip().lower()


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: str = Field(max_length=254)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if not cleaned:
            raise PydanticCustomError("name", "Enter your name.")
        return cleaned

    @field_validator("email")
    @classmethod
    def clean_email(cls, value: str) -> str:
        email = _normalize_email(value)
        if not EMAIL_PATTERN.match(email):
            raise PydanticCustomError("email", "Enter a valid email address.")
        return email

    @field_validator("password")
    @classmethod
    def check_password(cls, value: str) -> str:
        if not value.strip():
            raise PydanticCustomError("password", "Password can't be only spaces.")
        return value


class LoginRequest(BaseModel):
    email: str = Field(min_length=1, max_length=254)
    password: str = Field(min_length=1, max_length=128)
    remember: bool = True

    @field_validator("email")
    @classmethod
    def clean_email(cls, value: str) -> str:
        return _normalize_email(value)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    created_at: datetime


# Failed-login throttling


class AttemptLimiter:
    """Counts recent failures per key in memory. Enough for a single process."""

    def __init__(self, max_failures: int, window_seconds: int):
        self.max_failures = max_failures
        self.window = window_seconds
        self._failures: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def _prune(self, key: str, now: float) -> deque[float]:
        attempts = self._failures[key]
        while attempts and now - attempts[0] > self.window:
            attempts.popleft()
        return attempts

    def retry_after(self, *keys: str) -> int:
        """Seconds until another attempt is allowed, or 0."""
        now = time.monotonic()
        wait = 0.0
        with self._lock:
            for key in keys:
                attempts = self._prune(key, now)
                if len(attempts) >= self.max_failures:
                    wait = max(wait, self.window - (now - attempts[0]))
        return math.ceil(wait)

    def record_failure(self, *keys: str) -> None:
        now = time.monotonic()
        with self._lock:
            for key in keys:
                self._prune(key, now).append(now)

    def reset(self, *keys: str) -> None:
        with self._lock:
            for key in keys:
                self._failures.pop(key, None)


login_limiter = AttemptLimiter(max_failures=8, window_seconds=15 * 60)


def _limiter_keys(request: Request, email: str) -> tuple[str, str]:
    ip = request.client.host if request.client else "unknown"
    return f"ip:{ip}", f"email:{email}"


# Sessions


def _set_session_cookie(response: Response, token: str, lifetime: timedelta, remember: bool) -> None:
    response.set_cookie(
        SESSION_COOKIE,
        token,
        # Without Max-Age the cookie lasts until the browser closes.
        max_age=int(lifetime.total_seconds()) if remember else None,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path="/",
    )


def _start_session(db: Session, user: User, request: Request, response: Response, remember: bool) -> None:
    token = new_session_token()
    lifetime = REMEMBERED_SESSION if remember else BROWSER_SESSION
    now = utcnow()
    db.add(
        AuthSession(
            user_id=user.id,
            token_hash=hash_token(token),
            created_at=now,
            expires_at=now + lifetime,
            user_agent=(request.headers.get("user-agent") or "")[:255] or None,
        )
    )
    # Housekeeping: drop sessions that have already expired.
    db.execute(delete(AuthSession).where(AuthSession.expires_at <= now))
    db.commit()
    _set_session_cookie(response, token, lifetime, remember)


def get_current_user(
    session_token: Annotated[str | None, Cookie(alias=SESSION_COOKIE)] = None,
) -> User:
    """
    Resolve the signed-in user from the session cookie.

    Uses its own short-lived database session, so long requests such as the
    AI analysis don't hold a connection open while they wait on the model.
    """

    if not session_token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Please sign in to continue.")

    with SessionLocal() as db:
        session = db.scalar(
            select(AuthSession).where(AuthSession.token_hash == hash_token(session_token))
        )
        if session is None or session.expires_at <= utcnow():
            raise HTTPException(
                status.HTTP_401_UNAUTHORIZED,
                "Your session has expired. Please sign in again.",
            )
        user = session.user
        db.expunge(user)
        return user


CurrentUser = Annotated[User, Depends(get_current_user)]


# Routes

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, request: Request, response: Response, db: Annotated[Session, Depends(get_db)]):
    if db.scalar(select(User.id).where(User.email == body.email)) is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists. Try signing in.")

    user = User(
        name=body.name,
        email=body.email,
        password_hash=hash_password(body.password),
        last_login_at=utcnow(),
    )
    db.add(user)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists. Try signing in.")

    _start_session(db, user, request, response, remember=True)
    return user


@router.post("/login", response_model=UserOut)
def login(body: LoginRequest, request: Request, response: Response, db: Annotated[Session, Depends(get_db)]):
    keys = _limiter_keys(request, body.email)
    wait = login_limiter.retry_after(*keys)
    if wait:
        minutes = max(1, math.ceil(wait / 60))
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            f"Too many sign-in attempts. Try again in {minutes} minute{'s' if minutes != 1 else ''}.",
            headers={"Retry-After": str(wait)},
        )

    user = db.scalar(select(User).where(User.email == body.email))
    if user is None:
        spend_verification_time(body.password)
        valid = False
    else:
        valid = verify_password(user.password_hash, body.password)

    if not valid:
        login_limiter.record_failure(*keys)
        # One message for both cases, so the form doesn't reveal which emails exist.
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password.")

    login_limiter.reset(*keys)
    if password_needs_rehash(user.password_hash):
        user.password_hash = hash_password(body.password)
    user.last_login_at = utcnow()
    _start_session(db, user, request, response, remember=body.remember)
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    db: Annotated[Session, Depends(get_db)],
    session_token: Annotated[str | None, Cookie(alias=SESSION_COOKIE)] = None,
):
    if session_token:
        db.execute(delete(AuthSession).where(AuthSession.token_hash == hash_token(session_token)))
        db.commit()

    response = Response(status_code=status.HTTP_204_NO_CONTENT)
    response.delete_cookie(
        SESSION_COOKIE,
        path="/",
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
    )
    return response


@router.get("/me", response_model=UserOut)
def me(user: CurrentUser):
    return user
