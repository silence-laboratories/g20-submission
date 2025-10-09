import logging
import secrets
from typing import Any

import httpx
from fastapi import HTTPException, status
from httpx_oauth.clients.google import GoogleOAuth2

from .config import settings


class GoogleOAuthService:
    def __init__(self):
        self.client = GoogleOAuth2(
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
        )
        self.redirect_uri = settings.GOOGLE_REDIRECT_URI

    async def get_authorization_url(self) -> tuple[str, str]:
        """Generate Google OAuth authorization URL and state"""
        logging.warning("Generating Google OAuth authorization URL and state")
        state = secrets.token_urlsafe(32)
        authorization_url = await self.client.get_authorization_url(
            redirect_uri=self.redirect_uri,
            scope=["openid", "email", "profile"],
            state=state,
        )
        logging.warning(f"Authorization URL: {authorization_url}")
        logging.debug(f"State: {state}")
        return authorization_url, state

    async def get_access_token(self, code: str) -> str:
        """Exchange authorization code for access token"""
        try:
            token = await self.client.get_access_token(
                code=code,
                redirect_uri=self.redirect_uri,
            )
            return token["access_token"]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to get access token: {str(e)}"
            )

    async def get_user_info(self, access_token: str) -> dict[str, Any]:
        """Get user information from Google using access token"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to get user info: {str(e)}"
            )


google_oauth_service = GoogleOAuthService()
