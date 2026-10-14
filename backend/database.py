import os
from collections.abc import Iterator
from pathlib import Path

from sqlalchemy import URL, create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


BACKEND_DIR = Path(__file__).resolve().parent
DEFAULT_SQLITE_PATH = BACKEND_DIR / "data" / "cursus.db"


def _database_url() -> str | URL:
    # SQLite for now. Point DATABASE_URL at Postgres (or anything SQLAlchemy
    # supports) later without touching the rest of the code.
    configured = os.getenv("DATABASE_URL")
    if configured:
        return configured
    DEFAULT_SQLITE_PATH.parent.mkdir(parents=True, exist_ok=True)
    return URL.create("sqlite", database=str(DEFAULT_SQLITE_PATH))


def _create_engine(url: str | URL) -> Engine:
    is_sqlite = str(url).startswith("sqlite")
    if not is_sqlite:
        return create_engine(url, pool_pre_ping=True)

    # FastAPI serves requests from a thread pool, so the connection must be
    # shareable across threads.
    engine = create_engine(url, connect_args={"check_same_thread": False})

    @event.listens_for(engine, "connect")
    def _configure_sqlite(dbapi_connection, _record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        # The default rollback journal keeps every committed row inside the
        # .db file itself, so any SQLite viewer shows the tables. WAL mode
        # parked recent writes in a side file that many viewers ignore. This
        # also converts a database that was created in WAL mode.
        cursor.execute("PRAGMA journal_mode=DELETE")
        cursor.close()

    return engine


engine = _create_engine(_database_url())
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def init_db() -> None:
    """Create tables that don't exist yet. Use migrations once the schema evolves."""
    import models  # noqa: F401  Registers the tables on Base.metadata.

    Base.metadata.create_all(engine)


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
