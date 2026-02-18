"""
성적 관리 API
학생의 수학 성적을 기록하는 API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.api.deps import get_db, require_director_or_instructor
from app.models.grade import Grade
from app.models.student import Student
from app.schemas.grade import (
    GradeCreate,
    GradeUpdate,
    GradeResponse
)

router = APIRouter(dependencies=[Depends(require_director_or_instructor)])


@router.post("", response_model=GradeResponse, status_code=201)
def create_grade(
    grade: GradeCreate,
    db: Session = Depends(get_db)
):
    """성적 기록 생성"""
    # 학생 존재 확인
    student = db.query(Student).filter(Student.id == grade.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db_grade = Grade(**grade.model_dump())
    db.add(db_grade)
    db.commit()
    db.refresh(db_grade)
    return db_grade


@router.get("", response_model=List[GradeResponse])
def list_grades(
    skip: int = 0,
    limit: int = 100,
    student_id: str = None,
    exam_type: str = None,
    db: Session = Depends(get_db)
):
    """성적 기록 목록 조회"""
    query = db.query(Grade)

    if student_id:
        query = query.filter(Grade.student_id == student_id)
    if exam_type:
        query = query.filter(Grade.exam_type == exam_type)

    grades = query.order_by(Grade.exam_date.desc()).offset(skip).limit(limit).all()
    return grades


@router.get("/student/{student_id}", response_model=List[GradeResponse])
def get_student_grades(
    student_id: str,
    db: Session = Depends(get_db)
):
    """특정 학생의 모든 성적 조회"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    grades = db.query(Grade).filter(
        Grade.student_id == student_id
    ).order_by(Grade.exam_date.desc()).all()

    return grades


@router.get("/{grade_id}", response_model=GradeResponse)
def get_grade(
    grade_id: str,
    db: Session = Depends(get_db)
):
    """성적 기록 상세 조회"""
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not grade:
        raise HTTPException(status_code=404, detail="Grade record not found")
    return grade


@router.put("/{grade_id}", response_model=GradeResponse)
def update_grade(
    grade_id: str,
    grade_update: GradeUpdate,
    db: Session = Depends(get_db)
):
    """성적 기록 수정"""
    db_grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not db_grade:
        raise HTTPException(status_code=404, detail="Grade record not found")

    update_data = grade_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_grade, field, value)

    db.commit()
    db.refresh(db_grade)
    return db_grade


@router.delete("/{grade_id}", status_code=204)
def delete_grade(
    grade_id: str,
    db: Session = Depends(get_db)
):
    """성적 기록 삭제"""
    db_grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not db_grade:
        raise HTTPException(status_code=404, detail="Grade record not found")

    db.delete(db_grade)
    db.commit()
    return None
