from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class ParticipantBase(BaseModel):
    name: str
    surname: str
    paid_amount: Decimal
    birth_date: date | None = None
    phone_number: str
    email: EmailStr | None = None


class ParticipantCreate(ParticipantBase):
    tour_id: UUID


class ParticipantUpdate(BaseModel):
    name: str | None = None
    surname: str | None = None
    paid_amount: Decimal | None = None
    birth_date: date | None = None
    phone_number: str | None = None
    email: EmailStr | None = None
    tour_id: UUID | None = None


class ParticipantResponse(ParticipantBase):
    id: UUID
    tour_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
