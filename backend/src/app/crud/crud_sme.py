from fastcrud import FastCRUD
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.sme import SME
from ..schemas.sme import SMEUpdate, SMEUpdateInternal, SMEDelete, SMERead, SMECreate

CRUDSME = FastCRUD[SME, SMEUpdate, SMEUpdateInternal, SMEDelete, SMERead, SMECreate]
crud_smes = CRUDSME(SME)


class CRUDSmeExtended(CRUDSME):
    async def create_sme(
        self, db: AsyncSession, *, name: str, registration_number: str, country: str, director: str, din: str, registered_phone_number: str, bank_account_number: str, bank_id: int
    ) -> SME:
        
        # Ensure registration number is unique
        original_registration_number = registration_number
        counter = 1
        while await self.get_by_registration_number(db, registration_number=registration_number):
            registration_number = f"{original_registration_number}{counter}"
            counter += 1

        sme_data = SMECreate(
            name=name,
            registration_number=registration_number,
            country=country,
            director=director,
            din=din,
            registered_phone_number=registered_phone_number,
            bank_account_number=bank_account_number,
            bank_id=bank_id,
        )
        
        return await self.create(db, object=sme_data)

    async def get_by_registration_number(self, db: AsyncSession, *, registration_number: str) -> SME | None:
        """Get SME by registration number"""
        stmt = select(self.model).where(self.model.registration_number == registration_number)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_sme_by_id(self, db: AsyncSession, *, id: int) -> SME | None:
        """Get SME by ID"""
        stmt = select(self.model).where(self.model.id == id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

sme = CRUDSmeExtended(SME)
