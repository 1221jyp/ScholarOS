from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID


class InstructorBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    hourly_rate: Optional[Decimal] = None
    specialization: Optional[str] = None
    hire_date: Optional[date] = None
    status: str = "active"


class InstructorCreate(InstructorBase):
    pass


class InstructorUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    hourly_rate: Optional[Decimal] = None
    specialization: Optional[str] = None
    status: Optional[str] = None


class InstructorResponse(InstructorBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime
