from typing import Annotated, Any, cast

from fastapi import APIRouter, Depends, Request, HTTPException
from fastcrud.paginated import PaginatedListResponse, compute_offset, paginated_response
from sqlalchemy.ext.asyncio import AsyncSession

from ...api.dependencies import check_session, get_current_superuser, get_current_user
from ...core.db.database import async_get_db
from ...core.exceptions.http_exceptions import DuplicateValueException, ForbiddenException, NotFoundException
from ...crud.crud_sme import crud_smes
from ...crud.crud_users import crud_users
from ...schemas.sme import SMECreate, SMERead, SMEUpdate, SMEUpdateInternal
from ...core.security import verify_token
from ...crud import user


router = APIRouter(tags=["smes"])

@router.post("/sme", response_model=SMERead, status_code=201)
async def write_sme(
    request: Request, sme: SMECreate, db: Annotated[AsyncSession, Depends(async_get_db)]
) -> SMERead:
    
    existing_user = await check_session(request, db)
    
    sme_row = await crud_smes.exists(db=db, registration_number=sme.registration_number)
    
    if sme_row:
        raise DuplicateValueException("SME is already registered")

    sme_internal_dict = sme.model_dump()
    
    print(sme_internal_dict)

    sme_internal = SMECreate(**sme_internal_dict)
    created_sme = await crud_smes.create(db=db, object=sme_internal)
    
    try:
        await user.update_entity_id(db=db, user_id=existing_user.id, entity_id=created_sme.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update user entity ID: {e}")

    sme_read = await crud_smes.get(db=db, id=created_sme.id, schema_to_select=SMERead)
    if sme_read is None:
        raise NotFoundException("Created SME not found")

    return cast(SMERead, sme_read)


@router.get("/smes", response_model=PaginatedListResponse[SMERead])
async def read_smes(
    request: Request, db: Annotated[AsyncSession, Depends(async_get_db)], page: int = 1, items_per_page: int = 10
) -> dict:
    
    await check_session(request, db)
    
    smes_data = await crud_smes.get_multi(
        db=db,
        offset=compute_offset(page, items_per_page),
        limit=items_per_page,
        is_deleted=False,
    )

    response: dict[str, Any] = paginated_response(crud_data=smes_data, page=page, items_per_page=items_per_page)
    return response

@router.get("/sme/{id}", response_model=SMERead)
async def read_sme(request: Request, id: int, db: Annotated[AsyncSession, Depends(async_get_db)]) -> SMERead:
    
    await check_session(request, db)
    
    db_sme = await crud_smes.get(db=db, id=id, is_deleted=False, schema_to_select=SMERead)
    if db_sme is None:
        raise NotFoundException("SME not found")

    return cast(SMERead, db_sme)
