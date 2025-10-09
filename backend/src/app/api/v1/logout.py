from typing import Optional

from fastapi import APIRouter, Cookie, Depends, Response
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.db.database import async_get_db
from ...core.exceptions.http_exceptions import UnauthorizedException
from ...core.security import oauth2_scheme

router = APIRouter(tags=["login"])


@router.post("/logout")
async def logout(
    response: Response,
    refresh_token: Optional[str] = Cookie(None, alias="sl_session"),
    db: AsyncSession = Depends(async_get_db),
) -> dict[str, str]:
    try:
        if not refresh_token:
            raise UnauthorizedException("Refresh token not found")

        response.delete_cookie(key="sl_session")

        return {"message": "Logged out successfully"}

    except JWTError:
        raise UnauthorizedException("Invalid token.")
