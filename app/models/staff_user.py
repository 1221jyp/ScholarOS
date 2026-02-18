from sqlalchemy import Column, String, Boolean, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
import enum
from app.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class StaffRole(str, enum.Enum):
    director = "director"    # 원장
    instructor = "instructor"  # 조교


class StaffUser(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "staff_users"

    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(SQLEnum(StaffRole), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    instructor_id = Column(String, ForeignKey("instructors.id", ondelete="SET NULL"), nullable=True)

    instructor = relationship("Instructor", foreign_keys=[instructor_id])

    def __repr__(self):
        return f"<StaffUser(username={self.username}, role={self.role})>"
