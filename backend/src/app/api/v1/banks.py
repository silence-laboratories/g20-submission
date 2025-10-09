from typing import Annotated, Any, cast, List

from fastapi import APIRouter, Depends, Request
from fastcrud.paginated import PaginatedListResponse, compute_offset, paginated_response
from sqlalchemy.ext.asyncio import AsyncSession

from ...api.dependencies import get_current_superuser, get_current_user
from ...core.db.database import async_get_db
from ...core.exceptions.http_exceptions import DuplicateValueException, ForbiddenException, NotFoundException
from ...crud.crud_bank import crud_banks, bank
from ...schemas.bank import BankCreate, BankRead, BankUpdate, BankUpdateInternal


router = APIRouter(tags=["banks"])

@router.post("/bank", response_model=BankRead, status_code=201)
async def write_bank(
    request: Request, bank: BankCreate, db: Annotated[AsyncSession, Depends(async_get_db)]
) -> BankRead:

    bank_internal_dict = bank.model_dump()

    bank_internal = BankCreate(**bank_internal_dict)
    created_bank = await crud_banks.create(db=db, object=bank_internal)

    bank_read = await crud_banks.get(db=db, id=created_bank.id, schema_to_select=BankRead)
    if bank_read is None:
        raise NotFoundException("Created bank not found")

    return cast(BankRead, bank_read)

@router.get("/bank/{id}", response_model=BankRead)
async def read_bank_with_id(request: Request, id: int, db: Annotated[AsyncSession, Depends(async_get_db)]) -> BankRead:
    db_banks = await bank.get_bank_by_id(db=db, id=id)
    if db_banks is None:
        raise NotFoundException("Bank not found")

    return cast(BankRead, db_banks)


@router.get("/bank/country/{country}", response_model=List[BankRead])
async def read_bank_with_country(request: Request, country: str, db: Annotated[AsyncSession, Depends(async_get_db)]) -> List[BankRead]:
    db_banks = await bank.get_banks_by_country(db=db, country=country)
    if not db_banks:
        raise NotFoundException("Banks not found")

    return [cast(BankRead, bank) for bank in db_banks]
