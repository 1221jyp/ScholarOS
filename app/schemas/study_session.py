"""
자습 시간 스키마
"""
from pydantic import BaseModel, Field
from datetime import datetime, time
from typing import Optional


class StudySessionBase(BaseModel):
    """자습 시간 기본 스키마"""
    name: str = Field(..., description="자습 시간 이름")
    day_of_week: int = Field(..., ge=0, le=6, description="요일 (0=월요일, 6=일요일)")
    start_time: time = Field(..., description="자습 시작 시간")
    end_time: time = Field(..., description="자습 종료 시간")
    max_instructors: int = Field(default=1, ge=1, description="필요한 조교 수")
    is_active: bool = Field(default=True, description="활성화 여부")
    description: Optional[str] = Field(None, description="자습 시간 설명")


class StudySessionCreate(StudySessionBase):
    """자습 시간 생성 스키마"""
    pass


class StudySessionUpdate(BaseModel):
    """자습 시간 수정 스키마"""
    name: Optional[str] = None
    day_of_week: Optional[int] = Field(None, ge=0, le=6)
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    max_instructors: Optional[int] = Field(None, ge=1)
    is_active: Optional[bool] = None
    description: Optional[str] = None


class StudySessionResponse(StudySessionBase):
    """자습 시간 응답 스키마"""
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
