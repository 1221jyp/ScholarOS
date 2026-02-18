"""
조교 배치 모델
특정 자습 시간에 조교를 배치
"""
from sqlalchemy import Column, String, ForeignKey, Date, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID as pgUUID
import uuid
from app.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class InstructorAssignment(Base, UUIDMixin, TimestampMixin):
    """조교 배치 (자습 시간에 조교 투입)"""
    __tablename__ = "instructor_assignments"

    study_session_id = Column(
        String,
        ForeignKey("study_sessions.id", ondelete="CASCADE"),
        nullable=False,
        comment="자습 시간 ID"
    )
    instructor_id = Column(
        String,
        ForeignKey("instructors.id", ondelete="CASCADE"),
        nullable=False,
        comment="조교 ID"
    )
    assignment_date = Column(Date, nullable=False, comment="배치 날짜")
    is_confirmed = Column(Boolean, default=True, comment="배치 확정 여부")
    notes = Column(String, nullable=True, comment="특이사항")

    # Relationships
    study_session = relationship("StudySession", backref="assignments")
    instructor = relationship("Instructor", backref="assignments")

    def __repr__(self):
        return f"<InstructorAssignment {self.assignment_date} - Session {self.study_session_id}>"
