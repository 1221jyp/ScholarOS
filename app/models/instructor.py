from sqlalchemy import Column, String, Date, Enum as SQLEnum
import enum
from app.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class InstructorStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class Instructor(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "instructors"

    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=True, index=True)
    phone = Column(String(20), nullable=True)
    specialization = Column(String(100), nullable=True)
    hire_date = Column(Date, nullable=True)
    status = Column(SQLEnum(InstructorStatus), default=InstructorStatus.ACTIVE, nullable=False)

    def __repr__(self):
        return f"<Instructor(id={self.id}, name={self.name}, specialization={self.specialization})>"
