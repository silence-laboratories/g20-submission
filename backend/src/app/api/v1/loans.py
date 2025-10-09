from numbers import Number
from typing import Annotated, Any, List, cast

from fastapi import APIRouter, Depends, Request, HTTPException
from fastcrud.paginated import PaginatedListResponse, compute_offset, paginated_response
from sqlalchemy.ext.asyncio import AsyncSession

from ...api.dependencies import get_current_superuser, get_current_user
from ...core.db.database import async_get_db
from ...core.exceptions.http_exceptions import (
    DuplicateValueException,
    ForbiddenException,
    NotFoundException,
)
from ...crud.crud_loan import crud_loans, loan
from ...schemas.loan import LoanRead, LoanCreate, LoanUpdate
from ...core.security import verify_token
from ...crud import user


router = APIRouter(tags=["loans"])


@router.post("/loan", response_model=LoanRead, status_code=201)
async def write_loan(
    request: Request,
    loan: LoanCreate,
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> LoanRead:

    token = request.cookies.get("sl_session")
    if not token:
        raise HTTPException(status_code=401, detail="Missing or invalid authorization")

    token_data = await verify_token(token, "access", db)

    existing_user = await user.get_by_email(db, email=token_data.username_or_email)
    if not existing_user:
        raise HTTPException(status_code=401, detail="User not found")

    loan_internal_dict = loan.model_dump()

    loan_internal = LoanCreate(**loan_internal_dict)
    created_loan = await crud_loans.create(db=db, object=loan_internal)

    loan_read = await crud_loans.get(
        db=db, id=created_loan.id, schema_to_select=LoanRead
    )
    if loan_read is None:
        raise NotFoundException("Created loan not found")

    return cast(LoanRead, loan_read)


@router.get("/loans", response_model=PaginatedListResponse[LoanRead])
async def read_loans(
    request: Request,
    db: Annotated[AsyncSession, Depends(async_get_db)],
    page: int = 1,
    items_per_page: int = 10,
) -> dict:
    loans_data = await crud_loans.get_multi(
        db=db,
        offset=compute_offset(page, items_per_page),
        limit=items_per_page,
        is_deleted=False,
    )

    response: dict[str, Any] = paginated_response(
        crud_data=loans_data, page=page, items_per_page=items_per_page
    )
    return response


@router.get("/loan/sme/{sme_id}", response_model=List[LoanRead])
async def read_loan_with_sme(
    request: Request, sme_id: int, db: Annotated[AsyncSession, Depends(async_get_db)]
) -> List[LoanRead]:
    db_loans = await loan.get_loans_by_sme(
        db=db, sme_id=sme_id
    )
    if not db_loans:
        raise NotFoundException("Loans not found")
    
    print(db_loans)
    return [cast(LoanRead, loan) for loan in db_loans]

@router.get("/loan/bank/{bank_id}", response_model=List[LoanRead])
async def read_loan_with_bank(
    request: Request, bank_id: int, db: Annotated[AsyncSession, Depends(async_get_db)]
) -> List[LoanRead]:
    db_loans = await loan.get_loans_by_bank(
        db=db, bank_id=bank_id
    )
    if not db_loans:
        return []

    return [cast(LoanRead, loan) for loan in db_loans]

@router.patch("/loan/{id}")
async def patch_user(
    request: Request,
    values: LoanUpdate,
    id: int,
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> dict[str, str]:
    print(id)
    db_loan = await crud_loans.get(db=db, id=id, schema_to_select=LoanRead)
    if db_loan is None:
        raise NotFoundException("Loan not found")

    db_loan = cast(LoanRead, db_loan)
    
    print(db_loan)

    await crud_loans.update(db=db, object=values, id=id)
    return {"message": "Loan updated"}
