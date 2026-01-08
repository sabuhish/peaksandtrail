import uuid

from sqla_async_orm_queries import Model
from sqla_async_orm_queries.models import Model
from sqlalchemy import UUID, Column, DateTime, func
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.config import settings

engine = create_async_engine(settings.database_url)
SessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)


Model.init_session(SessionLocal)


class SurrogatePK:
    __table_args__ = {"extend_existing": True}

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        nullable=False,
        default=uuid.uuid4,
    )
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(
        DateTime(timezone=True), default=func.now(), onupdate=func.now()
    )


class Base(SurrogatePK, Model):
    __abstract__ = True
