import os
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.core.config import get_settings
from backend.app.database.base import Base

settings = get_settings()
configured_database_url = os.getenv("LIBRAFLOW_DATABASE_URL") or settings.DATABASE_URL
if "PYTEST_CURRENT_TEST" in os.environ:
    configured_database_url = "sqlite:///:memory:"
elif not os.getenv("LIBRAFLOW_DATABASE_URL") and os.getenv("LIBRAFLOW_USE_MYSQL", "").lower() not in {"1", "true", "yes"}:
    configured_database_url = "sqlite:///./libraflow.db"

engine_kwargs = {"pool_pre_ping": True, "echo": settings.DATABASE_ECHO}
if configured_database_url.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
    if configured_database_url == "sqlite:///:memory:":
        engine_kwargs["poolclass"] = StaticPool

engine = create_engine(configured_database_url, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_database() -> None:
    Base.metadata.create_all(bind=engine)
