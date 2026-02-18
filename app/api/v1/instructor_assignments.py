"""
조교 배치 API
자습 시간에 조교를 배치하는 핵심 기능
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.api.deps import get_db, require_director_or_instructor
from app.models.instructor_assignment import InstructorAssignment
from app.models.study_session import StudySession
from app.models.instructor import Instructor
from app.schemas.instructor_assignment import (
    InstructorAssignmentCreate,
    InstructorAssignmentUpdate,
    InstructorAssignmentResponse
)

router = APIRouter(dependencies=[Depends(require_director_or_instructor)])


@router.post("", response_model=InstructorAssignmentResponse, status_code=201)
def create_instructor_assignment(
    assignment: InstructorAssignmentCreate,
    db: Session = Depends(get_db)
):
    """조교 배치 생성"""
    # 자습 시간 존재 확인
    study_session = db.query(StudySession).filter(
        StudySession.id == assignment.study_session_id
    ).first()
    if not study_session:
        raise HTTPException(status_code=404, detail="Study session not found")

    # 조교 존재 확인
    instructor = db.query(Instructor).filter(
        Instructor.id == assignment.instructor_id
    ).first()
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")

    # 중복 배치 확인
    existing = db.query(InstructorAssignment).filter(
        InstructorAssignment.study_session_id == assignment.study_session_id,
        InstructorAssignment.instructor_id == assignment.instructor_id,
        InstructorAssignment.assignment_date == assignment.assignment_date
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Instructor already assigned to this session on this date")

    db_assignment = InstructorAssignment(**assignment.model_dump())
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment


@router.get("", response_model=List[InstructorAssignmentResponse])
def list_instructor_assignments(
    skip: int = 0,
    limit: int = 100,
    study_session_id: str = None,
    instructor_id: str = None,
    assignment_date: date = None,
    db: Session = Depends(get_db)
):
    """조교 배치 목록 조회"""
    query = db.query(InstructorAssignment)

    if study_session_id:
        query = query.filter(InstructorAssignment.study_session_id == study_session_id)
    if instructor_id:
        query = query.filter(InstructorAssignment.instructor_id == instructor_id)
    if assignment_date:
        query = query.filter(InstructorAssignment.assignment_date == assignment_date)

    assignments = query.offset(skip).limit(limit).all()
    return assignments


@router.get("/by-week", response_model=List[InstructorAssignmentResponse])
def get_weekly_assignments(
    start_date: date = Query(..., description="주의 시작 날짜 (월요일)"),
    db: Session = Depends(get_db)
):
    """1주일치 조교 배치 조회"""
    from datetime import timedelta

    end_date = start_date + timedelta(days=6)

    assignments = db.query(InstructorAssignment).filter(
        InstructorAssignment.assignment_date >= start_date,
        InstructorAssignment.assignment_date <= end_date
    ).all()

    return assignments


@router.get("/{assignment_id}", response_model=InstructorAssignmentResponse)
def get_instructor_assignment(
    assignment_id: str,
    db: Session = Depends(get_db)
):
    """조교 배치 상세 조회"""
    assignment = db.query(InstructorAssignment).filter(
        InstructorAssignment.id == assignment_id
    ).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Instructor assignment not found")
    return assignment


@router.put("/{assignment_id}", response_model=InstructorAssignmentResponse)
def update_instructor_assignment(
    assignment_id: str,
    assignment_update: InstructorAssignmentUpdate,
    db: Session = Depends(get_db)
):
    """조교 배치 수정"""
    db_assignment = db.query(InstructorAssignment).filter(
        InstructorAssignment.id == assignment_id
    ).first()
    if not db_assignment:
        raise HTTPException(status_code=404, detail="Instructor assignment not found")

    update_data = assignment_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_assignment, field, value)

    db.commit()
    db.refresh(db_assignment)
    return db_assignment


@router.delete("/{assignment_id}", status_code=204)
def delete_instructor_assignment(
    assignment_id: str,
    db: Session = Depends(get_db)
):
    """조교 배치 삭제"""
    db_assignment = db.query(InstructorAssignment).filter(
        InstructorAssignment.id == assignment_id
    ).first()
    if not db_assignment:
        raise HTTPException(status_code=404, detail="Instructor assignment not found")

    db.delete(db_assignment)
    db.commit()
    return None
