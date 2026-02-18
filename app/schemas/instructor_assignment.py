"""
조교 배치 스키마
"""
from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional


class InstructorAssignmentBase(BaseModel):
    """조교 배치 기본 스키마"""
    study_session_id: str = Field(..., description="자습 시간 ID")
    instructor_id: str = Field(..., description="조교 ID")
    assignment_date: date = Field(..., description="배치 날짜")
    is_confirmed: bool = Field(default=True, description="배치 확정 여부")
    notes: Optional[str] = Field(None, description="특이사항")


class InstructorAssignmentCreate(InstructorAssignmentBase):
    """조교 배치 생성 스키마"""
    pass


class InstructorAssignmentUpdate(BaseModel):
    """조교 배치 수정 스키마"""
    instructor_id: Optional[str] = None
    assignment_date: Optional[date] = None
    is_confirmed: Optional[bool] = None
    notes: Optional[str] = None


class InstructorAssignmentResponse(InstructorAssignmentBase):
    """조교 배치 응답 스키마"""
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
