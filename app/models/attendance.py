"""
출석 모델
학생의 수업 출석 기록
"""
from sqlalchemy import Column, String, Boolean, ForeignKey, UniqueConstraint, DateTime, Text, Date
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class Attendance(Base, UUIDMixin, TimestampMixin):
    """출석 기록"""
    __tablename__ = "attendance"

    student_id = Column(
        String,
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        comment="학생 ID"
    )
    class_schedule_id = Column(
        String,
        ForeignKey("class_schedules.id", ondelete="CASCADE"),
        nullable=False,
        comment="수업 시간표 ID"
    )
    attendance_date = Column(Date, nullable=False, comment="출석 날짜")
    attended = Column(Boolean, nullable=False, default=False, comment="출석 여부")
    attendance_time = Column(DateTime, nullable=True, comment="출석 체크 시간")
    notes = Column(Text, nullable=True, comment="비고")

    # Relationships
    student = relationship("Student", backref="attendances")
    class_schedule = relationship("ClassSchedule", backref="attendances")

    # 한 학생이 같은 날 같은 수업에 대해 하나의 출석 기록만 가질 수 있음
    __table_args__ = (
        UniqueConstraint('student_id', 'class_schedule_id', 'attendance_date', name='unique_student_class_date_attendance'),
    )

    def __repr__(self):
        return f"<Attendance {self.attendance_date} - Student {self.student_id}, Attended={self.attended}>"
