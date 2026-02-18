from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.api.deps import get_db, require_director_or_instructor
from app.models.instructor import Instructor
from app.schemas.instructor import InstructorCreate, InstructorUpdate, InstructorResponse

router = APIRouter(dependencies=[Depends(require_director_or_instructor)])


@router.post("", response_model=InstructorResponse, status_code=201)
async def create_instructor(
    instructor_data: InstructorCreate,
    db: Session = Depends(get_db)
):
    """Create a new instructor"""
    # Check for duplicate email
    existing = db.query(Instructor).filter(Instructor.email == instructor_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    instructor = Instructor(**instructor_data.model_dump())
    db.add(instructor)
    db.commit()
    db.refresh(instructor)
    return instructor


@router.get("", response_model=List[InstructorResponse])
async def list_instructors(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: str = Query(None, description="Filter by status"),
    db: Session = Depends(get_db)
):
    """List all instructors with pagination"""
    query = db.query(Instructor)

    if status:
        query = query.filter(Instructor.status == status)

    instructors = query.offset(skip).limit(limit).all()
    return instructors


@router.get("/{instructor_id}", response_model=InstructorResponse)
async def get_instructor(
    instructor_id: UUID = Path(..., description="Instructor ID"),
    db: Session = Depends(get_db)
):
    """Get a specific instructor by ID"""
    instructor = db.query(Instructor).filter(Instructor.id == instructor_id).first()
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")
    return instructor


@router.put("/{instructor_id}", response_model=InstructorResponse)
async def update_instructor(
    instructor_data: InstructorUpdate,
    instructor_id: UUID = Path(..., description="Instructor ID"),
    db: Session = Depends(get_db)
):
    """Update an instructor"""
    instructor = db.query(Instructor).filter(Instructor.id == instructor_id).first()
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")

    update_data = instructor_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(instructor, field, value)

    db.commit()
    db.refresh(instructor)
    return instructor


@router.delete("/{instructor_id}", status_code=204)
async def delete_instructor(
    instructor_id: UUID = Path(..., description="Instructor ID"),
    db: Session = Depends(get_db)
):
    """Delete an instructor"""
    instructor = db.query(Instructor).filter(Instructor.id == instructor_id).first()
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")

    db.delete(instructor)
    db.commit()
    return None
