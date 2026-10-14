from datetime import timedelta

from sqlalchemy import select, update

from auth import SESSION_COOKIE
from database import SessionLocal
from models import AuthSession, User, utcnow

JOB = "We need Python, SQL, Docker and LLM experience for this AI Engineer role."


def register(client, email="ada@example.com", password="correct horse battery", name="Ada Lovelace"):
    return client.post("/api/v1/auth/register", json={"name": name, "email": email, "password": password})


def test_register_signs_in_with_http_only_cookie(client):
    response = register(client, email="  Ada@Example.com ")

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "ada@example.com"
    assert body["name"] == "Ada Lovelace"
    assert "password" not in str(body).lower()

    cookie = response.headers["set-cookie"]
    assert cookie.startswith(f"{SESSION_COOKIE}=")
    assert "HttpOnly" in cookie
    assert "SameSite=lax" in cookie
    assert "Max-Age=" in cookie

    me = client.get("/api/v1/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == "ada@example.com"


def test_passwords_and_tokens_are_stored_hashed(client):
    register(client)
    token = client.cookies.get(SESSION_COOKIE)

    with SessionLocal() as db:
        user = db.scalar(select(User))
        session = db.scalar(select(AuthSession))

    assert user.password_hash.startswith("$argon2id$")
    assert "correct horse battery" not in user.password_hash
    assert session.token_hash != token
    assert len(session.token_hash) == 64


def test_duplicate_email_is_rejected_case_insensitively(client):
    assert register(client).status_code == 201
    client.cookies.clear()

    response = register(client, email="ADA@example.com")

    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]


def test_register_validates_input(client):
    bad_email = register(client, email="not-an-email")
    short_password = register(client, email="b@example.com", password="short")
    blank_name = register(client, email="c@example.com", name="   ")

    assert bad_email.status_code == 422
    assert bad_email.json()["detail"][0]["msg"] == "Enter a valid email address."
    assert short_password.status_code == 422
    assert blank_name.status_code == 422


def test_login_failures_share_one_message(client):
    register(client)
    client.cookies.clear()

    wrong_password = client.post("/api/v1/auth/login", json={"email": "ada@example.com", "password": "nope-nope"})
    unknown_email = client.post("/api/v1/auth/login", json={"email": "who@example.com", "password": "nope-nope"})

    assert wrong_password.status_code == 401
    assert unknown_email.status_code == 401
    assert wrong_password.json()["detail"] == unknown_email.json()["detail"] == "Incorrect email or password."
    assert SESSION_COOKIE not in client.cookies


def test_login_without_remember_sets_browser_session_cookie(client):
    register(client)
    client.cookies.clear()

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "ADA@example.com", "password": "correct horse battery", "remember": False},
    )

    assert response.status_code == 200
    assert "Max-Age=" not in response.headers["set-cookie"]
    assert client.get("/api/v1/auth/me").status_code == 200


def test_logout_revokes_the_session(client):
    register(client)
    token = client.cookies.get(SESSION_COOKIE)

    response = client.post("/api/v1/auth/logout")

    assert response.status_code == 204
    assert client.get("/api/v1/auth/me").status_code == 401
    # The old token no longer works even if someone kept a copy.
    client.cookies.set(SESSION_COOKIE, token)
    assert client.get("/api/v1/auth/me").status_code == 401


def test_expired_session_is_rejected(client):
    register(client)
    with SessionLocal() as db:
        db.execute(update(AuthSession).values(expires_at=utcnow() - timedelta(seconds=1)))
        db.commit()

    response = client.get("/api/v1/auth/me")

    assert response.status_code == 401
    assert "expired" in response.json()["detail"]


def test_feature_endpoints_require_sign_in(client):
    payload = {"resume_skills": ["Python"], "job_description": JOB}

    assert client.post("/api/v1/jobs/match", json=payload).status_code == 401
    assert client.post("/api/v1/skills/gap-analysis", json={**payload, "target_weeks": 2}).status_code == 401

    register(client)

    match = client.post("/api/v1/jobs/match", json=payload)
    assert match.status_code == 200
    assert "Python" in match.json()["matched_skills"]


def test_public_endpoints_stay_open(client):
    assert client.get("/health").status_code == 200


def test_repeated_failures_are_throttled(client):
    register(client)
    client.cookies.clear()
    attempt = {"email": "ada@example.com", "password": "wrong-password"}

    statuses = [client.post("/api/v1/auth/login", json=attempt).status_code for _ in range(8)]
    blocked = client.post("/api/v1/auth/login", json={**attempt, "password": "correct horse battery"})

    assert statuses == [401] * 8
    assert blocked.status_code == 429
    assert int(blocked.headers["retry-after"]) > 0


def test_cross_site_writes_are_blocked(client):
    evil = client.post(
        "/api/v1/auth/login",
        json={"email": "a@example.com", "password": "x"},
        headers={"Origin": "https://evil.example"},
    )
    allowed = client.post(
        "/api/v1/auth/login",
        json={"email": "a@example.com", "password": "x"},
        headers={"Origin": "http://localhost:3000"},
    )

    assert evil.status_code == 403
    assert allowed.status_code == 401


def test_no_middleware_hides_client_disconnects():
    # @app.middleware("http") wraps the request stream and hides disconnects,
    # which stops a cancelled AI request from cancelling the model.
    from starlette.middleware.base import BaseHTTPMiddleware

    import main

    assert all(middleware.cls is not BaseHTTPMiddleware for middleware in main.app.user_middleware)
