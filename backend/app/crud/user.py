from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.user import UserCreate


async def get_user_by_email(email: str) -> User | None:
    result = await User.select_one(User.email == email)
    return result


async def get_user_by_username(username: str) -> User | None:
    result = await User.select_one(User.username == username)
    return result


async def create_user(user: UserCreate) -> User:
    hashed_password = get_password_hash(user.password)
    db_user = await User.create(
        data={
            "email":user.email,
            "username":user.username,
            "full_name":user.full_name,
            "hashed_password":hashed_password,
        }
       
    )

    return db_user
