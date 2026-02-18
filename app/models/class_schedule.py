"""
수업 시간표 모델
원장이 설정하는 고정된 수학 수업 시간
"""
from sqlalchemy import Column, String, Integer, Time, Boolean
from app.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class ClassSchedule(Base, UUIDMixin, TimestampMixin):
    """수업 시간표 (원장이 설정)"""
    __tablename__ = "class_schedules"

    name = Column(String, nullable=False, comment="수업명 (예: 수학 정규반)")
    day_of_week = Column(Integer, nullable=False, comment="요일 (0=월요일, 6=일요일)")
    start_time = Column(Time, nullable=False, comment="수업 시작 시간")
    end_time = Column(Time, nullable=False, comment="수업 종료 시간")
    is_active = Column(Boolean, default=True, comment="활성화 여부")
    description = Column(String, nullable=True, comment="수업 설명")

    def __repr__(self):
        return f"<ClassSchedule {self.name} - Day {self.day_of_week} {self.start_time}-{self.end_time}>"
