"""
조교 시간 기록 API
출퇴근 시간 관리, 급여 계산, 원장 승인(정산)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from typing import List, Optional
import pytz

KST = pytz.timezone('Asia/Seoul')

def _now_kst() -> datetime:
    return datetime.now(KST)

def _today_kst() -> date:
    return _now_kst().date()

from app.api.deps import get_db, get_current_staff_user, require_director
from app.models.staff_user import StaffUser, StaffRole
from app.models.instructor_time_record import InstructorTimeRecord
from app.models.instructor import Instructor
from app.schemas.time_record import (
    TimeRecordCreate,
    TimeRecordUpdate,
    TimeRecordResponse,
    PayrollSummary,
    InstructorMySummary,
    SettlementInstructorItem,
    SettlementOverview,
)

router = APIRouter()


# ──────────────── 헬퍼 함수 ────────────────

def _check_record_ownership(record: InstructorTimeRecord, current_user: StaffUser):
    """조교는 본인 레코드만 접근 가능"""
    if current_user.role == StaffRole.instructor:
        if record.instructor_id != current_user.instructor_id:
            raise HTTPException(status_code=403, detail="본인의 기록만 접근 가능합니다.")


def _calculate_hours(clock_in: Optional[time], clock_out: Optional[time]) -> Optional[Decimal]:
    """출근/퇴근 시간으로 근무시간 계산 (시간 단위)"""
    if not clock_in or not clock_out:
        return None
    if clock_in >= clock_out:
        return Decimal("0")
    today = date.today()
    dt_in = datetime.combine(today, clock_in)
    dt_out = datetime.combine(today, clock_out)
    delta = dt_out - dt_in
    return round(Decimal(str(delta.total_seconds() / 3600)), 2)


# ──────────────── 조교 요약 (사이드바용) ────────────────

@router.get("/my-summary", response_model=InstructorMySummary)
def get_my_summary(
    current_user: StaffUser = Depends(get_current_staff_user),
    db: Session = Depends(get_db),
):
    """조교 이번 달 미정산/정산 요약 (사이드바 표시용)"""
    if current_user.role != StaffRole.instructor:
        raise HTTPException(status_code=403, detail="조교만 조회할 수 있습니다.")
    if not current_user.instructor_id:
        raise HTTPException(status_code=400, detail="조교 정보가 연결되지 않았습니다.")

    instructor = db.query(Instructor).filter(Instructor.id == current_user.instructor_id).first()
    hourly_rate = (instructor.hourly_rate if instructor else None) or Decimal("0")

    today = date.today()
    month_start = today.replace(day=1)

    records = (
        db.query(InstructorTimeRecord)
        .filter(
            InstructorTimeRecord.instructor_id == current_user.instructor_id,
            InstructorTimeRecord.work_date >= month_start,
            InstructorTimeRecord.work_date <= today,
        )
        .all()
    )

    pending_hours = sum((r.hours_worked or Decimal("0")) for r in records if not r.is_approved)
    approved_hours = sum((r.hours_worked or Decimal("0")) for r in records if r.is_approved)

    return InstructorMySummary(
        pending_hours=pending_hours,
        pending_pay=pending_hours * hourly_rate,
        approved_hours=approved_hours,
        approved_pay=approved_hours * hourly_rate,
        hourly_rate=instructor.hourly_rate if instructor else None,
    )


# ──────────────── 정산 개요 (원장 전용) ────────────────

@router.get("/settlement-overview", response_model=SettlementOverview)
def get_settlement_overview(
    month_start: Optional[date] = None,
    month_end: Optional[date] = None,
    current_user: StaffUser = Depends(require_director),
    db: Session = Depends(get_db),
):
    """원장: 전체 조교 미정산/정산 현황"""
    today = date.today()
    if not month_start:
        month_start = today.replace(day=1)
    if not month_end:
        month_end = today

    linked_instructor_ids = [
        row.instructor_id
        for row in db.query(StaffUser.instructor_id).filter(
            StaffUser.instructor_id.isnot(None), StaffUser.role == StaffRole.instructor
        ).all()
    ]

    instructors = (
        db.query(Instructor)
        .filter(Instructor.id.in_(linked_instructor_ids))
        .all()
    )

    items = []
    total_pending_pay = Decimal("0")

    for instr in instructors:
        records = (
            db.query(InstructorTimeRecord)
            .filter(
                InstructorTimeRecord.instructor_id == instr.id,
                InstructorTimeRecord.work_date >= month_start,
                InstructorTimeRecord.work_date <= month_end,
            )
            .all()
        )
        hourly_rate = instr.hourly_rate or Decimal("0")
        pending_hours = sum((r.hours_worked or Decimal("0")) for r in records if not r.is_approved)
        approved_hours = sum((r.hours_worked or Decimal("0")) for r in records if r.is_approved)
        pending_records = sum(1 for r in records if not r.is_approved)
        pending_pay = pending_hours * hourly_rate
        total_pending_pay += pending_pay

        items.append(SettlementInstructorItem(
            instructor_id=instr.id,
            instructor_name=instr.name,
            hourly_rate=instr.hourly_rate,
            pending_hours=pending_hours,
            pending_pay=pending_pay,
            pending_records=pending_records,
            approved_hours=approved_hours,
            approved_pay=approved_hours * hourly_rate,
        ))

    return SettlementOverview(instructors=items, total_pending_pay=total_pending_pay)


# ──────────────── 급여 계산 ────────────────

@router.get("/payroll", response_model=PayrollSummary)
def calculate_payroll(
    current_user: StaffUser = Depends(get_current_staff_user),
    db: Session = Depends(get_db),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
):
    """급여 계산 - 기간별 총 근무시간과 급여"""
    if current_user.role != StaffRole.instructor:
        raise HTTPException(status_code=403, detail="조교만 급여를 조회할 수 있습니다.")
    if not current_user.instructor_id:
        raise HTTPException(status_code=400, detail="조교 정보가 연결되지 않았습니다.")

    instructor = db.query(Instructor).filter(Instructor.id == current_user.instructor_id).first()
    if not instructor:
        raise HTTPException(status_code=404, detail="조교 정보를 찾을 수 없습니다.")

    query = db.query(InstructorTimeRecord).filter(
        InstructorTimeRecord.instructor_id == current_user.instructor_id
    )
    if start_date:
        query = query.filter(InstructorTimeRecord.work_date >= start_date)
    if end_date:
        query = query.filter(InstructorTimeRecord.work_date <= end_date)

    records = query.all()
    hourly_rate = instructor.hourly_rate or Decimal("0")
    total_hours = sum((r.hours_worked or Decimal("0")) for r in records)
    approved_hours = sum((r.hours_worked or Decimal("0")) for r in records if r.is_approved)
    pending_hours = sum((r.hours_worked or Decimal("0")) for r in records if not r.is_approved)

    if records:
        period_start = start_date or min(r.work_date for r in records)
        period_end = end_date or max(r.work_date for r in records)
    else:
        period_start = start_date or date.today()
        period_end = end_date or date.today()

    return PayrollSummary(
        instructor_id=instructor.id,
        instructor_name=instructor.name,
        hourly_rate=instructor.hourly_rate,
        total_hours=total_hours,
        total_pay=total_hours * hourly_rate,
        approved_hours=approved_hours,
        approved_pay=approved_hours * hourly_rate,
        pending_hours=pending_hours,
        pending_pay=pending_hours * hourly_rate,
        period_start=period_start,
        period_end=period_end,
        records_count=len(records),
    )


# ──────────────── CRUD 엔드포인트 ────────────────

@router.get("", response_model=List[TimeRecordResponse])
def list_time_records(
    current_user: StaffUser = Depends(get_current_staff_user),
    db: Session = Depends(get_db),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    instructor_id: Optional[str] = None,
):
    """출퇴근 기록 조회 - 조교는 본인 기록만, 원장은 전체(instructor_id 필터 가능)"""
    query = db.query(InstructorTimeRecord)

    if current_user.role == StaffRole.instructor:
        if not current_user.instructor_id:
            raise HTTPException(status_code=400, detail="조교 정보가 연결되지 않았습니다.")
        query = query.filter(InstructorTimeRecord.instructor_id == current_user.instructor_id)
    elif instructor_id:
        query = query.filter(InstructorTimeRecord.instructor_id == instructor_id)

    if start_date:
        query = query.filter(InstructorTimeRecord.work_date >= start_date)
    if end_date:
        query = query.filter(InstructorTimeRecord.work_date <= end_date)

    return query.order_by(InstructorTimeRecord.work_date.desc()).all()


@router.post("", response_model=TimeRecordResponse, status_code=201)
def create_time_record(
    data: TimeRecordCreate,
    current_user: StaffUser = Depends(get_current_staff_user),
    db: Session = Depends(get_db),
):
    """출퇴근 기록 생성 - 조교만 가능"""
    if current_user.role != StaffRole.instructor:
        raise HTTPException(status_code=403, detail="조교만 시간 기록을 생성할 수 있습니다.")
    if not current_user.instructor_id:
        raise HTTPException(status_code=400, detail="조교 정보가 연결되지 않았습니다.")

    record = InstructorTimeRecord(
        instructor_id=current_user.instructor_id,
        work_date=data.work_date,
        clock_in=data.clock_in,
        clock_out=data.clock_out,
        hours_worked=_calculate_hours(data.clock_in, data.clock_out),
        notes=data.notes,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.put("/{record_id}", response_model=TimeRecordResponse)
def update_time_record(
    record_id: str,
    data: TimeRecordUpdate,
    current_user: StaffUser = Depends(get_current_staff_user),
    db: Session = Depends(get_db),
):
    """출퇴근 기록 수정 - 승인된 기록은 수정 불가"""
    record = db.query(InstructorTimeRecord).filter(InstructorTimeRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="기록을 찾을 수 없습니다.")

    _check_record_ownership(record, current_user)

    if record.is_approved:
        raise HTTPException(status_code=400, detail="승인(정산)된 기록은 수정할 수 없습니다.")

    if data.work_date is not None:
        record.work_date = data.work_date
    if data.clock_in is not None:
        record.clock_in = data.clock_in
    if data.clock_out is not None:
        record.clock_out = data.clock_out
    if data.notes is not None:
        record.notes = data.notes

    record.hours_worked = _calculate_hours(record.clock_in, record.clock_out)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{record_id}", status_code=204)
def delete_time_record(
    record_id: str,
    current_user: StaffUser = Depends(get_current_staff_user),
    db: Session = Depends(get_db),
):
    """출퇴근 기록 삭제 - 승인된 기록은 삭제 불가"""
    record = db.query(InstructorTimeRecord).filter(InstructorTimeRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="기록을 찾을 수 없습니다.")

    _check_record_ownership(record, current_user)

    if record.is_approved:
        raise HTTPException(status_code=400, detail="승인(정산)된 기록은 삭제할 수 없습니다.")

    db.delete(record)
    db.commit()
    return None


# ──────────────── 승인(정산) - 원장 전용 ────────────────

@router.patch("/{record_id}/approve", response_model=TimeRecordResponse)
def approve_time_record(
    record_id: str,
    current_user: StaffUser = Depends(require_director),
    db: Session = Depends(get_db),
):
    """원장: 시간 기록 승인(정산 처리)"""
    record = db.query(InstructorTimeRecord).filter(InstructorTimeRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="기록을 찾을 수 없습니다.")

    record.is_approved = True
    record.approved_at = datetime.now()
    db.commit()
    db.refresh(record)
    return record


@router.patch("/{record_id}/unapprove", response_model=TimeRecordResponse)
def unapprove_time_record(
    record_id: str,
    current_user: StaffUser = Depends(require_director),
    db: Session = Depends(get_db),
):
    """원장: 승인 취소"""
    record = db.query(InstructorTimeRecord).filter(InstructorTimeRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="기록을 찾을 수 없습니다.")

    record.is_approved = False
    record.approved_at = None
    db.commit()
    db.refresh(record)
    return record


# ──────────────── 출퇴근 버튼 ────────────────

@router.post("/clock-in", response_model=TimeRecordResponse, status_code=201)
def clock_in(
    current_user: StaffUser = Depends(get_current_staff_user),
    db: Session = Depends(get_db),
):
    """출근 버튼 - 오늘 날짜에 현재 시간으로 출근 기록"""
    if current_user.role != StaffRole.instructor:
        raise HTTPException(status_code=403, detail="조교만 출근할 수 있습니다.")
    if not current_user.instructor_id:
        raise HTTPException(status_code=400, detail="조교 정보가 연결되지 않았습니다.")

    today = _today_kst()
    now_time = _now_kst().time().replace(microsecond=0, tzinfo=None)

    record = InstructorTimeRecord(
        instructor_id=current_user.instructor_id,
        work_date=today,
        clock_in=now_time,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/clock-out", response_model=TimeRecordResponse)
def clock_out(
    current_user: StaffUser = Depends(get_current_staff_user),
    db: Session = Depends(get_db),
):
    """퇴근 버튼 - 오늘 기록에 퇴근 시간 기록"""
    if current_user.role != StaffRole.instructor:
        raise HTTPException(status_code=403, detail="조교만 퇴근할 수 있습니다.")
    if not current_user.instructor_id:
        raise HTTPException(status_code=400, detail="조교 정보가 연결되지 않았습니다.")

    today = _today_kst()
    now_time = _now_kst().time().replace(microsecond=0, tzinfo=None)

    record = (
        db.query(InstructorTimeRecord)
        .filter(
            InstructorTimeRecord.instructor_id == current_user.instructor_id,
            InstructorTimeRecord.work_date == today,
            InstructorTimeRecord.clock_in.isnot(None),
            InstructorTimeRecord.clock_out.is_(None),
        )
        .order_by(InstructorTimeRecord.clock_in.desc())
        .first()
    )

    if not record:
        raise HTTPException(status_code=400, detail="퇴근할 출근 기록이 없습니다. 먼저 출근해주세요.")

    if record.is_approved:
        raise HTTPException(status_code=400, detail="이미 승인된 기록이 있습니다.")

    record.clock_out = now_time
    record.hours_worked = _calculate_hours(record.clock_in, record.clock_out)
    db.commit()
    db.refresh(record)
    return record
