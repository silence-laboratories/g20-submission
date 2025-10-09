from datetime import timedelta
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from ...api.dependencies import check_session

from ...core.config import settings
from ...core.db.database import async_get_db
from ...core.exceptions.http_exceptions import UnauthorizedException
from ...core.google_oauth import google_oauth_service
from ...core.security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    create_refresh_token,
    verify_token,
)
from ...crud import user

router = APIRouter(tags=["google-auth"])


@router.get("/me")
async def get_current_user_info(
    request: Request, db: AsyncSession = Depends(async_get_db)
):
    """
    Get current user information from JWT token in the cookie with name sl_session
    """
    existing_user = await check_session(request, db)

    if existing_user.bank_id is None and existing_user.sme_id is None:
        return {
            "id": existing_user.id,
            "email": existing_user.email,
            "name": existing_user.name,
            "picture": existing_user.profile_image_url,
            "entityId": None,
            "entityType": None,
            "isFirstTime": True,
        }
    else:
        if existing_user.sme_id is None:
            return {
                "id": existing_user.id,
                "email": existing_user.email,
                "name": existing_user.name,
                "picture": existing_user.profile_image_url,
                "entityId": existing_user.bank_id,
                "entityType": "bank",
                "isFirstTime": False,
            }
        else:
            return {
                "id": existing_user.id,
                "email": existing_user.email,
                "name": existing_user.name,
                "picture": existing_user.profile_image_url,
                "entityId": existing_user.sme_id,
                "entityType": "sme",
                "isFirstTime": False,
            }


@router.post("/logout")
async def logout(
    request: Request, response: Response, db: AsyncSession = Depends(async_get_db)
):
    """
    Logout user by clearing tokens (client should discard JWT).
    """
    existing_user = await check_session(request, db)

    if existing_user is None:
        raise HTTPException(status_code=401, detail="User not found")

    # Clear sl_session cookie while sending response
    response.delete_cookie(
        key="sl_session", 
        httponly=True, 
        secure=True, 
        samesite="none",  # Changed to "none" for cross-origin
        domain=".silencelaboratories.com"  # Set to your root domain with leading dot
    )
    return {"message": "Logged out successfully"}


@router.get("/google/login")
async def google_login():
    """Initiate Google OAuth login"""
    logging.warning("Initiating Google OAuth login")
    authorization_url, state = await google_oauth_service.get_authorization_url()
    return {"authorization_url": authorization_url, "state": state}

@router.get("/google/callback")
async def google_callback(
    code: str,
    response: Response,
    db: Annotated[AsyncSession, Depends(async_get_db)],
):
    """Handle Google OAuth callback"""
    try:
        
        # Mock login for bank user
        if code == "MOCK_LOGIN_CODE":
            existing_user = await user.get_by_google_id(db, google_id=code)

            # Create JWT tokens
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = await create_access_token(
                data={"sub": existing_user.email}, expires_delta=access_token_expires
            )
            max_age = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60

            response.set_cookie(
                key="sl_session",
                value=access_token,
                httponly=True,
                secure=True,
                samesite="none",  # Changed to "none" for cross-origin
                max_age=max_age,
                domain=".silencelaboratories.com"  # Set to your root domain with leading dot
            )
            
            return {
                    "id": existing_user.id,
                    "email": existing_user.email,
                    "name": existing_user.name,
                    "picture": existing_user.profile_image_url,
                    "entityId": existing_user.bank_id,
                    "entityType": "bank",
                    "isFirstTime": False,
                }
        
        # Get access token
        access_token = await google_oauth_service.get_access_token(code)

        # Get user info from Google
        user_info = await google_oauth_service.get_user_info(access_token)
        
        print(user_info)

        # Check if user exists
        existing_user = await user.get_by_google_id(db, google_id=user_info["id"])

        # Create JWT tokens
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = await create_access_token(
            data={"sub": user_info["email"]}, expires_delta=access_token_expires
        )
        max_age = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60

        response.set_cookie(
            key="sl_session",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="none",  # Changed to "none" for cross-origin
            max_age=max_age,
            domain=".silencelaboratories.com"  # Set to your root domain with leading dot
        )

        if not existing_user:
            # Create new user
            existing_user = await user.create_google_user(
                db,
                google_id=user_info["id"],
                email=user_info["email"],
                name=user_info["name"],
                picture=user_info["picture"],
            )
            return {
                "id": existing_user.id,
                "email": existing_user.email,
                "name": existing_user.name,
                "picture": existing_user.profile_image_url,
                "entityId": None,
                "entityType": None,
                "isFirstTime": True,
            }
        else:
            # Check if bank_id or sme_is null and choose entity
            if existing_user.bank_id is None and existing_user.sme_id is None:
                return {
                    "id": existing_user.id,
                    "email": existing_user.email,
                    "name": existing_user.name,
                    "picture": existing_user.profile_image_url,
                    "entityId": None,
                    "entityType": None,
                    "isFirstTime": True,
                }
            else:
                if existing_user.sme_id is None:
                    return {
                        "id": existing_user.id,
                        "email": existing_user.email,
                        "name": existing_user.name,
                        "picture": existing_user.profile_image_url,
                        "entityId": existing_user.bank_id,
                        "entityType": "bank",
                        "isFirstTime": False,
                    }
                else:
                    return {
                        "id": existing_user.id,
                        "email": existing_user.email,
                        "name": existing_user.name,
                        "picture": existing_user.profile_image_url,
                        "entityId": existing_user.sme_id,
                        "entityType": "sme",
                        "isFirstTime": False,
                    }

    except Exception as e:
        print(str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Authentication failed: {str(e)}",
        )
