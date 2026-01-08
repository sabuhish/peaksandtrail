from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.schemas.participant import ParticipantResponse


class TourBase(BaseModel):
    name: str
    plan: str
    start_date: date
    end_date: date
    guides: str
    info: str | None = None


class TourCreate(TourBase):
    pass


class TourUpdate(BaseModel):
    name: str | None = None
    plan: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    guides: str | None = None
    info: str | None = None


class TourResponse(TourBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TourWithParticipants(TourResponse):
    participants: list[ParticipantResponse] = []

    model_config = ConfigDict(from_attributes=True)
