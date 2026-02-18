"""
수업 시간표 API
원장이 수학 수업 시간을 설정하는 API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, require_director_or_instructor
from app.models.class_schedule import ClassSchedule
from app.schemas.class_schedule import (
    ClassScheduleCreate,
    ClassScheduleUpdate,
    ClassScheduleResponse
)

router = APIRouter(dependencies=[Depends(require_director_or_instructor)])


@router.post("", response_model=ClassScheduleResponse, status_code=201)
def create_class_schedule(
    schedule: ClassScheduleCreate,
    db: Session = Depends(get_db)
):
    """수업 시간표 생성"""
    db_schedule = ClassSchedule(**schedule.model_dump())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule


@router.get("", response_model=List[ClassScheduleResponse])
def list_class_schedules(
    skip: int = 0,
    limit: int = 100,
    is_active: bool = None,
    db: Session = Depends(get_db)
):
    """수업 시간표 목록 조회"""
    query = db.query(ClassSchedule)

    if is_active is not None:
        query = query.filter(ClassSchedule.is_active == is_active)

    schedules = query.offset(skip).limit(limit).all()
    return schedules


@router.get("/{schedule_id}", response_model=ClassScheduleResponse)
def get_class_schedule(
    schedule_id: str,
    db: Session = Depends(get_db)
):
    """수업 시간표 상세 조회"""
    schedule = db.query(ClassSchedule).filter(ClassSchedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Class schedule not found")
    return schedule


@router.put("/{schedule_id}", response_model=ClassScheduleResponse)
def update_class_schedule(
    schedule_id: str,
    schedule_update: ClassScheduleUpdate,
    db: Session = Depends(get_db)
):
    """수업 시간표 수정"""
    db_schedule = db.query(ClassSchedule).filter(ClassSchedule.id == schedule_id).first()
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Class schedule not found")

    update_data = schedule_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_schedule, field, value)

    db.commit()
    db.refresh(db_schedule)
    return db_schedule


@router.delete("/{schedule_id}", status_code=204)
def delete_class_schedule(
    schedule_id: str,
    db: Session = Depends(get_db)
):
    """수업 시간표 삭제"""
    db_schedule = db.query(ClassSchedule).filter(ClassSchedule.id == schedule_id).first()
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Class schedule not found")

    db.delete(db_schedule)
    db.commit()
    return None
