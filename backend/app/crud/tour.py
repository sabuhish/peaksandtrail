from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.tour import Tour
from app.schemas.tour import TourCreate, TourUpdate


async def get_tours(skip: int = 0, limit: int = 100) -> list[Tour]:
    return await Tour.select_all(limit=limit, offset=skip, order_by=[Tour.created_at.desc()])



async def get_tour(tour_id: UUID) -> Tour | None:
    result = await Tour.select_one(Tour.id == tour_id, load_with=["participants"])
    return result


async def create_tour(tour: TourCreate) -> Tour:
    db_tour = await Tour.create(tour.model_dump())
    return db_tour


async def update_tour(tour_id: UUID, tour: TourUpdate) -> Tour | None:
    db_tour = await get_tour(tour_id)

    if not db_tour:
        return None

    update_data = tour.model_dump(exclude_unset=True)

    await Tour.update(update_data, Tour.id==tour_id)

    return db_tour


async def delete_tour(tour_id: UUID) -> bool:
    await Tour.delete(Tour.id == tour_id)
    return True
