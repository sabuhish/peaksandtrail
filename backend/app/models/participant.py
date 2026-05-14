from datetime import date
from decimal import Decimal
from typing import Optional
from uuid import UUID

from sqlalchemy import Date, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.tour import Tour


class Participant(Base):
    __tablename__ = "participants"

    tour_id: Mapped[UUID] = mapped_column(
        ForeignKey("tours.id", ondelete="CASCADE"),
        nullable=False
)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    surname: Mapped[str] = mapped_column(String(100), nullable=False)
    paid_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    birth_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    phone_number: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    

    tour: Mapped[Tour] = relationship(back_populates="participants")
