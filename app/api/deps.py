from typing import Generator
from sqlalchemy.orm import Session
from app.database import SessionLocal


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.
    This will be used across all API routes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
