"""
조교 시간 기록 모델
조교의 출퇴근 시간 기록 및 급여 계산용
"""
from sqlalchemy import Column, String, ForeignKey, Date, Time, Numeric, Text, Boolean, DateTime
from app.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class InstructorTimeRecord(Base, UUIDMixin, TimestampMixin):
    """조교 출퇴근 시간 기록"""
    __tablename__ = "instructor_time_records"

    instructor_id = Column(
        String,
        ForeignKey("instructors.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="조교 ID"
    )
    work_date = Column(Date, nullable=False, index=True, comment="근무 날짜")
    clock_in = Column(Time, nullable=True, comment="출근 시간")
    clock_out = Column(Time, nullable=True, comment="퇴근 시간")
    hours_worked = Column(Numeric(5, 2), nullable=True, comment="근무 시간 (시간 단위)")
    notes = Column(Text, nullable=True, comment="비고")
    is_approved = Column(Boolean, nullable=False, default=False, server_default='false', comment="원장 승인(정산) 여부")
    approved_at = Column(DateTime, nullable=True, comment="승인 일시")

    __table_args__ = ()

    def __repr__(self):
        return f"<InstructorTimeRecord {self.work_date} - Instructor {self.instructor_id}>"
