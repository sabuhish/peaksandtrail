from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.crud import participant as participant_crud
from app.models.user import User
from app.schemas.participant import (ParticipantCreate, ParticipantResponse,
                                     ParticipantUpdate)

router = APIRouter(prefix="/participants", tags=["participants"])


@router.get("/", response_model=list[ParticipantResponse])
async def list_participants(
    tour_id: UUID | None = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
):
    participants = await participant_crud.get_participants(
        tour_id=tour_id, skip=skip, limit=limit
    )
    return participants


@router.get("/{participant_id}", response_model=ParticipantResponse)
async def get_participant(
    participant_id: UUID,
    current_user: User = Depends(get_current_user),
):
    participant = await participant_crud.get_participant(participant_id=participant_id)
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    return participant


@router.post("/", response_model=ParticipantResponse, status_code=201)
async def create_participant(
    participant: ParticipantCreate,
    current_user: User = Depends(get_current_user),
):
    return await participant_crud.create_participant(participant=participant)


@router.put("/{participant_id}", response_model=ParticipantResponse)
async def update_participant(
    participant_id: UUID,
    participant: ParticipantUpdate,
    current_user: User = Depends(get_current_user),
):
    db_participant = await participant_crud.update_participant(
        participant_id=participant_id, participant=participant
    )
    if not db_participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    return db_participant


@router.delete("/{participant_id}", status_code=204)
async def delete_participant(
    participant_id: UUID,
    current_user: User = Depends(get_current_user),
):
    success = await participant_crud.delete_participant(participant_id=participant_id)
    if not success:
        raise HTTPException(status_code=404, detail="Participant not found")
