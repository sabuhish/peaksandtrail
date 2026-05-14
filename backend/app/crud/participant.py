from uuid import UUID
from sqlalchemy import select, or_

from app.core.database import SessionLocal
from app.models.participant import Participant
from app.schemas.participant import ParticipantCreate, ParticipantUpdate


async def get_participants(tour_id: UUID | None = None, skip: int = 0, limit: int = 100) -> list[Participant]:
    if tour_id is not None:
        return await Participant.select_all(Participant.tour_id==tour_id, limit=limit, offset=skip, order_by=[Participant.created_at.desc()])
    return await Participant.select_all(limit=limit, offset=skip, order_by=[Participant.created_at.desc()])


async def get_participant(participant_id: UUID) -> Participant | None:
    return await Participant.select_one(Participant.participant_id==participant_id)


async def create_participant(participant: ParticipantCreate) -> Participant:
    db_participant = await Participant.create(participant.model_dump())
  
    return db_participant


async def update_participant(
    participant_id: UUID, participant: ParticipantUpdate
) -> Participant | None:
    db_participant = await Participant.update(Participant.id==participant_id, participant.model_dump(exclude_unset=True))
    
    return db_participant



async def delete_participant(participant_id: UUID) -> bool:
    return await Participant.delete(Participant.id == participant_id)


async def search_participants(query: str, limit: int = 10) -> list[Participant]:
    pattern = f"%{query}%"
    stmt = (
        select(Participant)
        .where(
            or_(
                Participant.name.ilike(pattern),
                Participant.surname.ilike(pattern),
            )
        )
        .distinct(Participant.name, Participant.surname, Participant.phone_number)
        .order_by(Participant.name, Participant.surname, Participant.phone_number)
        .limit(limit)
    )
    async with SessionLocal() as session:
        result = await session.execute(stmt)
        return list(result.scalars().all())
