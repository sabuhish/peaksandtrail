import base64
import secrets
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings
from app.core.security import decode_access_token
from app.crud import user as user_crud
from app.models.user import User

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> User:
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    user = await user_crud.get_user_by_username(username=username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )

    return user


def verify_basic_credentials(x_api_key: str = Header(alias="X-API-Key")):
    """Verify credentials from X-API-Key header with base64 encoded username:password."""
    try:
        decoded = base64.b64decode(x_api_key).decode("utf-8")
        username, password = decoded.split(":", 1)

        correct_username = secrets.compare_digest(
            username, settings.auth_username
        )
        correct_password = secrets.compare_digest(
            password, settings.auth_password
        )
        if not (correct_username and correct_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Authentication failed",
        )
