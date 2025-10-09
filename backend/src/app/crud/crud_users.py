from typing import Any

from fastcrud import FastCRUD
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.user import User
from ..schemas.user import UserCreateInternal, UserDelete, UserRead, UserUpdate, UserUpdateInternal

CRUDUser = FastCRUD[User, UserCreateInternal, UserUpdate, UserUpdateInternal, UserDelete, UserRead]
crud_users = CRUDUser(User)


class CRUDUserExtended(CRUDUser):
    async def get_by_google_id(self, db: AsyncSession, *, google_id: str) -> User | None:
        """Get user by Google ID"""
        stmt = select(self.model).where(self.model.google_id == google_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, db: AsyncSession, *, email: str) -> User | None:
        """Get user by email"""
        stmt = select(self.model).where(self.model.email == email)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_google_user(
        self, db: AsyncSession, *, google_id: str, email: str, name: str, picture: str | None = None
    ) -> User:
        """Create a new user from Google OAuth data"""
        # Generate username from email
        username = email.split("@")[0].lower().replace(".", "").replace("+", "")
        
        print(picture)
        
        # Ensure username is unique
        original_username = username
        counter = 1
        while await self.get_by_username(db, username=username):
            username = f"{original_username}{counter}"
            counter += 1

        user_data = UserCreateInternal(
            name=name,
            username=username,
            email=email,
            google_id=google_id,
            profile_image_url=picture
        )
        
        return await self.create(db, object=user_data)

    async def get_by_username(self, db: AsyncSession, *, username: str) -> User | None:
        """Get user by username"""
        stmt = select(self.model).where(self.model.username == username)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def update_entity_id(self, db: AsyncSession, *, user_id: int, entity_id: int) -> User:
        """Update entity ID for a user"""
        stmt = update(self.model).where(self.model.id == user_id).values(sme_id=entity_id)
        await db.execute(stmt)
        await db.commit()
        return await self.get(db, id=user_id)


user = CRUDUserExtended(User)
