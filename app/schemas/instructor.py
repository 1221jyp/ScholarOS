from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import date, datetime
from typing import Optional
from uuid import UUID


class InstructorBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    specialization: Optional[str] = None
    hire_date: date
    status: str = "active"


class InstructorCreate(InstructorBase):
    pass


class InstructorUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None
    status: Optional[str] = None


class InstructorResponse(InstructorBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime
