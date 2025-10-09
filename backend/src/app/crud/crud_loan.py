from fastcrud import FastCRUD
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.loan import Loan
from ..schemas.loan import LoanCreate, LoanRead, LoanUpdate, LoanUpdateInternal, LoanDelete

CRUDLoan = FastCRUD[Loan, LoanUpdate, LoanUpdateInternal, LoanDelete, LoanRead, LoanCreate]
crud_loans = CRUDLoan(Loan)


class CRUDLoanExtended(CRUDLoan):
    async def create_bank(
        self, db: AsyncSession, *, type: str, amount: float, purpose: str, interest_rate_min: float, interest_rate_max: float, duration: int, status: str, lending_bank_id: int, sme_id: int, consent_status: str
    ) -> Loan:
        
        loan_data = LoanCreate(
            type=type,
            amount=amount,
            purpose=purpose,
            interest_rate_min=interest_rate_min,
            interest_rate_max=interest_rate_max,
            duration=duration,
            status=status,
            consent_status=consent_status,
            lending_bank_id=lending_bank_id,
            sme_id=sme_id,
        )
        
        return await self.create(db, object=loan_data)
    
    async def get_loan_by_id(self, db: AsyncSession, *, id: int) -> Loan | None:
        """Get Loan by ID"""
        stmt = select(self.model).where(self.model.id == id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_loans_by_sme(self, db: AsyncSession, *, sme_id: int) -> list[Loan]:
        """Get Loans by SME"""
        stmt = select(self.model).where(self.model.sme_id == sme_id)
        result = await db.execute(stmt)
        return result.scalars().all()
    
    async def get_loans_by_bank(self, db: AsyncSession, *, bank_id: int) -> list[Loan]:
        """Get Loans by Bank"""
        stmt = select(self.model).where(self.model.lending_bank_id == bank_id)
        result = await db.execute(stmt)
        return result.scalars().all()

loan = CRUDLoanExtended(Loan)
