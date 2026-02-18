"""
수업 시간표 스키마
"""
from pydantic import BaseModel, Field
from datetime import time, datetime
from typing import Optional


class ClassScheduleBase(BaseModel):
    """수업 시간표 기본 스키마"""
    name: str = Field(..., description="수업명")
    day_of_week: int = Field(..., ge=0, le=6, description="요일 (0=월요일, 6=일요일)")
    start_time: time = Field(..., description="수업 시작 시간")
    end_time: time = Field(..., description="수업 종료 시간")
    is_active: bool = Field(default=True, description="활성화 여부")
    description: Optional[str] = Field(None, description="수업 설명")


class ClassScheduleCreate(ClassScheduleBase):
    """수업 시간표 생성 스키마"""
    pass


class ClassScheduleUpdate(BaseModel):
    """수업 시간표 수정 스키마"""
    name: Optional[str] = None
    day_of_week: Optional[int] = Field(None, ge=0, le=6)
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    is_active: Optional[bool] = None
    description: Optional[str] = None


class ClassScheduleResponse(ClassScheduleBase):
    """수업 시간표 응답 스키마"""
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
