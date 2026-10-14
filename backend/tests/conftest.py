import os
import sys
import tempfile
from pathlib import Path

import pytest

BACKEND_DIR = Path(__file__).resolve().parents[1]


def pytest_configure(config):
    # Point the app at a throwaway database before any app module is imported.
    temp_dir = Path(tempfile.mkdtemp(prefix="cursus-tests-"))
    os.environ["DATABASE_URL"] = f"sqlite:///{(temp_dir / 'test.db').as_posix()}"
    sys.path.insert(0, str(BACKEND_DIR))


@pytest.fixture()
def client():
    from fastapi.testclient import TestClient
    from sqlalchemy import delete

    import auth
    import main
    from database import SessionLocal
    from models import AuthSession, User

    with TestClient(main.app) as test_client:
        yield test_client

    with SessionLocal() as db:
        db.execute(delete(AuthSession))
        db.execute(delete(User))
        db.commit()
    auth.login_limiter._failures.clear()
