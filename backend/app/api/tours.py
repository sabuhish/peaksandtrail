from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.crud import tour as tour_crud
from app.models.user import User
from app.schemas.tour import (TourCreate, TourResponse, TourUpdate,
                              TourWithParticipants)
from app.utils.export import generate_tour_excel

router = APIRouter(prefix="/tours", tags=["tours"])


@router.get("/", response_model=list[TourResponse])
async def list_tours(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
):
    tours = await tour_crud.get_tours(skip=skip, limit=limit)
    return tours


@router.get("/{tour_id}", response_model=TourWithParticipants)
async def get_tour(
    tour_id: UUID,
    current_user: User = Depends(get_current_user),
):
    tour = await tour_crud.get_tour(tour_id=tour_id)
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    return tour


@router.post("/", response_model=TourResponse, status_code=201)
async def create_tour(
    tour: TourCreate,
    current_user: User = Depends(get_current_user),
):
    return await tour_crud.create_tour(tour=tour)


@router.put("/{tour_id}", response_model=TourResponse)
async def update_tour(
    tour_id: UUID,
    tour: TourUpdate,
    current_user: User = Depends(get_current_user),
):
    db_tour = await tour_crud.update_tour(tour_id=tour_id, tour=tour)
    if not db_tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    return db_tour


@router.delete("/{tour_id}", status_code=204)
async def delete_tour(
    tour_id: UUID,
    current_user: User = Depends(get_current_user),
):
    success = await tour_crud.delete_tour(tour_id=tour_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tour not found")


@router.get("/{tour_id}/export")
async def export_tour(
    tour_id: UUID,
    current_user: User = Depends(get_current_user),
):
    tour = await tour_crud.get_tour(tour_id=tour_id)
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")

    # Generate Excel file
    excel_file = generate_tour_excel(tour, tour.participants)

    # Create filename with tour name (sanitized)
    safe_name = "".join(c for c in tour.name if c.isalnum() or c in (" ", "-", "_"))
    filename = f"{safe_name}_participants.xlsx"

    return StreamingResponse(
        excel_file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
