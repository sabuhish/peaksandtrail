from datetime import date

from sqlalchemy import Date, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Tour(Base):
    __tablename__ = "tours"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    plan: Mapped[str] = mapped_column(Text, nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    guides: Mapped[str] = mapped_column(Text, nullable=False)
    info: Mapped[str | None] = mapped_column(Text, nullable=True)
   

    participants: Mapped[list["Participant"]] = relationship(
        back_populates="tour", cascade="all, delete-orphan"
    )
