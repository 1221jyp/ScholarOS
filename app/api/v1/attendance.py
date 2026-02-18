"""
출석 관리 API
학생의 수업 출석을 기록하는 API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date, datetime

from app.api.deps import get_db
from app.models.attendance import Attendance
from app.models.student import Student
from app.models.class_schedule import ClassSchedule
from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceUpdate,
    AttendanceResponse
)

router = APIRouter()


@router.post("", response_model=AttendanceResponse, status_code=201)
def create_attendance(
    attendance: AttendanceCreate,
    db: Session = Depends(get_db)
):
    """출석 기록 생성"""
    # 학생 존재 확인
    student = db.query(Student).filter(Student.id == attendance.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # 수업 시간표 존재 확인
    class_schedule = db.query(ClassSchedule).filter(
        ClassSchedule.id == attendance.class_schedule_id
    ).first()
    if not class_schedule:
        raise HTTPException(status_code=404, detail="Class schedule not found")

    # 중복 체크
    existing = db.query(Attendance).filter(
        Attendance.student_id == attendance.student_id,
        Attendance.class_schedule_id == attendance.class_schedule_id,
        Attendance.attendance_date == attendance.attendance_date
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Attendance record already exists")

    db_attendance = Attendance(**attendance.model_dump())
    if db_attendance.attended:
        db_attendance.attendance_time = datetime.now()

    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance


@router.get("", response_model=List[AttendanceResponse])
def list_attendance(
    skip: int = 0,
    limit: int = 100,
    student_id: str = None,
    class_schedule_id: str = None,
    attendance_date: date = None,
    db: Session = Depends(get_db)
):
    """출석 기록 목록 조회"""
    query = db.query(Attendance)

    if student_id:
        query = query.filter(Attendance.student_id == student_id)
    if class_schedule_id:
        query = query.filter(Attendance.class_schedule_id == class_schedule_id)
    if attendance_date:
        query = query.filter(Attendance.attendance_date == attendance_date)

    records = query.offset(skip).limit(limit).all()
    return records


@router.get("/{attendance_id}", response_model=AttendanceResponse)
def get_attendance(
    attendance_id: str,
    db: Session = Depends(get_db)
):
    """출석 기록 상세 조회"""
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    return attendance


@router.put("/{attendance_id}", response_model=AttendanceResponse)
def update_attendance(
    attendance_id: str,
    attendance_update: AttendanceUpdate,
    db: Session = Depends(get_db)
):
    """출석 기록 수정"""
    db_attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not db_attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    update_data = attendance_update.model_dump(exclude_unset=True)

    # 출석 여부가 True로 변경되면 현재 시간 기록
    if update_data.get("attended") is True and not db_attendance.attended:
        db_attendance.attendance_time = datetime.now()

    for field, value in update_data.items():
        setattr(db_attendance, field, value)

    db.commit()
    db.refresh(db_attendance)
    return db_attendance


@router.delete("/{attendance_id}", status_code=204)
def delete_attendance(
    attendance_id: str,
    db: Session = Depends(get_db)
):
    """출석 기록 삭제"""
    db_attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not db_attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    db.delete(db_attendance)
    db.commit()
    return None
