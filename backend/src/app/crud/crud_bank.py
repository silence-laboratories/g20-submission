from fastcrud import FastCRUD
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.bank import Bank
from ..schemas.bank import BankUpdate, BankUpdateInternal, BankDelete, BankRead, BankCreate

CRUDBank = FastCRUD[Bank, BankUpdate, BankUpdateInternal, BankDelete, BankRead, BankCreate]
crud_banks = CRUDBank(Bank)


class CRUDBankExtended(CRUDBank):
    async def create_bank(
        self, db: AsyncSession, *, name: str, country: str, interest_rate_min: float, interest_rate_max: float
    ) -> Bank:
        
        bank_data = BankCreate(
            name=name,
            country=country,
            interest_rate_min=interest_rate_min,
            interest_rate_max=interest_rate_max,
        )
        
        return await self.create(db, object=bank_data)
    
    async def get_bank_by_id(self, db: AsyncSession, *, id: int) -> Bank | None:
        """Get Bank by ID"""
        stmt = select(self.model).where(self.model.id == id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_banks_by_country(self, db: AsyncSession, *, country: str) -> list[Bank]:
        """Get Banks by Country"""
        stmt = select(self.model).where(self.model.country == country)
        result = await db.execute(stmt)
        return result.scalars().all()

bank = CRUDBankExtended(Bank)
