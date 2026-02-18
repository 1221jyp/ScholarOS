"""
출석 스키마
"""
from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional


class AttendanceBase(BaseModel):
    """출석 기본 스키마"""
    student_id: str = Field(..., description="학생 ID")
    class_schedule_id: str = Field(..., description="수업 시간표 ID")
    attendance_date: date = Field(..., description="출석 날짜")
    attended: bool = Field(default=False, description="출석 여부")
    notes: Optional[str] = Field(None, description="비고")


class AttendanceCreate(AttendanceBase):
    """출석 생성 스키마"""
    pass


class AttendanceUpdate(BaseModel):
    """출석 수정 스키마"""
    attended: Optional[bool] = None
    notes: Optional[str] = None


class AttendanceResponse(AttendanceBase):
    """출석 응답 스키마"""
    id: str
    attendance_time: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
