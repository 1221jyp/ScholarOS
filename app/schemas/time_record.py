"""
조교 시간 기록 스키마
"""
from pydantic import BaseModel
from datetime import date, time, datetime
from decimal import Decimal
from typing import Optional, List


class TimeRecordCreate(BaseModel):
    """시간 기록 생성"""
    work_date: date
    clock_in: Optional[time] = None
    clock_out: Optional[time] = None
    notes: Optional[str] = None


class TimeRecordUpdate(BaseModel):
    """시간 기록 수정"""
    work_date: Optional[date] = None
    clock_in: Optional[time] = None
    clock_out: Optional[time] = None
    notes: Optional[str] = None


class TimeRecordResponse(BaseModel):
    """시간 기록 응답"""
    id: str
    instructor_id: str
    work_date: date
    clock_in: Optional[time]
    clock_out: Optional[time]
    hours_worked: Optional[Decimal]
    notes: Optional[str]
    is_approved: bool
    approved_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PayrollSummary(BaseModel):
    """급여 계산 요약"""
    instructor_id: str
    instructor_name: str
    hourly_rate: Optional[Decimal]
    total_hours: Decimal
    total_pay: Decimal
    approved_hours: Decimal
    approved_pay: Decimal
    pending_hours: Decimal
    pending_pay: Decimal
    period_start: date
    period_end: date
    records_count: int


class InstructorMySummary(BaseModel):
    """조교 사이드바용 요약 (이번 달 미정산)"""
    pending_hours: Decimal
    pending_pay: Decimal
    approved_hours: Decimal
    approved_pay: Decimal
    hourly_rate: Optional[Decimal]


class SettlementInstructorItem(BaseModel):
    """원장 정산 페이지 - 조교별 미정산 요약"""
    instructor_id: str
    instructor_name: str
    hourly_rate: Optional[Decimal]
    pending_hours: Decimal
    pending_pay: Decimal
    pending_records: int
    approved_hours: Decimal
    approved_pay: Decimal


class SettlementOverview(BaseModel):
    """원장 정산 페이지 전체 개요"""
    instructors: List[SettlementInstructorItem]
    total_pending_pay: Decimal
