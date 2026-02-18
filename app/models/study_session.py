"""
자습 시간 모델
수업 후 자습 시간 관리
"""
from sqlalchemy import Column, String, Integer, Time, Boolean
from app.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class StudySession(Base, UUIDMixin, TimestampMixin):
    """자습 시간 (수업 후 조교 투입)"""
    __tablename__ = "study_sessions"

    name = Column(String, nullable=False, comment="자습 시간 이름 (예: 야간 자습)")
    day_of_week = Column(Integer, nullable=False, comment="요일 (0=월요일, 6=일요일)")
    start_time = Column(Time, nullable=False, comment="자습 시작 시간")
    end_time = Column(Time, nullable=False, comment="자습 종료 시간")
    max_instructors = Column(Integer, default=1, comment="필요한 조교 수")
    is_active = Column(Boolean, default=True, comment="활성화 여부")
    description = Column(String, nullable=True, comment="자습 시간 설명")

    def __repr__(self):
        return f"<StudySession {self.name} - Day {self.day_of_week} {self.start_time}-{self.end_time}>"
