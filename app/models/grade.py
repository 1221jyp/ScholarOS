"""
성적 모델
학생의 시험 성적 기록 (수학)
"""
from sqlalchemy import Column, String, Numeric, ForeignKey, Index, Date, Text
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class Grade(Base, UUIDMixin, TimestampMixin):
    """성적 기록 (수학 학원 전용)"""
    __tablename__ = "grades"

    student_id = Column(
        String,
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        comment="학생 ID"
    )
    exam_date = Column(Date, nullable=False, comment="시험 날짜")
    exam_type = Column(String(50), nullable=False, comment="시험 유형 (예: 중간고사, 기말고사, 모의고사)")
    subject = Column(String(50), default="수학", nullable=False, comment="과목 (기본: 수학)")

    score = Column(Numeric(5, 2), nullable=False, comment="획득 점수")
    max_score = Column(Numeric(5, 2), nullable=False, comment="만점")

    notes = Column(Text, nullable=True, comment="비고")

    # Relationships
    student = relationship("Student", backref="grades")

    # Index for efficient queries
    __table_args__ = (
        Index('idx_student_exam', 'student_id', 'exam_date'),
    )

    def __repr__(self):
        return f"<Grade {self.exam_type} - Student {self.student_id}, Score={self.score}/{self.max_score}>"
