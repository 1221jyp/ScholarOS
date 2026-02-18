from sqlalchemy import Column, DateTime, String
from datetime import datetime
import uuid


class UUIDMixin:
    """Mixin to add UUID primary key to models"""
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))


class TimestampMixin:
    """Mixin to add created_at and updated_at timestamps to models"""

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
