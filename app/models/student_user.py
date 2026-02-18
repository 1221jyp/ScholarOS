from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class StudentUser(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "student_users"

    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    student_id = Column(String, ForeignKey("students.id", ondelete="SET NULL"), nullable=True)

    student = relationship("Student", foreign_keys=[student_id])

    def __repr__(self):
        return f"<StudentUser(username={self.username})>"
