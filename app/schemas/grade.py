"""
성적 스키마
"""
from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional
from decimal import Decimal


class GradeBase(BaseModel):
    """성적 기본 스키마"""
    student_id: str = Field(..., description="학생 ID")
    exam_date: date = Field(..., description="시험 날짜")
    exam_type: str = Field(..., description="시험 유형")
    subject: str = Field(default="수학", description="과목")
    score: Decimal = Field(..., description="획득 점수")
    max_score: Decimal = Field(..., description="만점")
    notes: Optional[str] = Field(None, description="비고")


class GradeCreate(GradeBase):
    """성적 생성 스키마"""
    pass


class GradeUpdate(BaseModel):
    """성적 수정 스키마"""
    exam_date: Optional[date] = None
    exam_type: Optional[str] = None
    subject: Optional[str] = None
    score: Optional[Decimal] = None
    max_score: Optional[Decimal] = None
    notes: Optional[str] = None


class GradeResponse(GradeBase):
    """성적 응답 스키마"""
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
