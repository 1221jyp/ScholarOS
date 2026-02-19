from sqlalchemy import Column, String, Date, Enum as SQLEnum
import enum
from app.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class StudentStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    GRADUATED = "graduated"


class Student(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "students"

    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=True, index=True)
    phone = Column(String(20), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    enrollment_date = Column(Date, nullable=True)
    status = Column(SQLEnum(StudentStatus), default=StudentStatus.ACTIVE, nullable=False)

    def __repr__(self):
        return f"<Student(id={self.id}, name={self.name}, email={self.email})>"
