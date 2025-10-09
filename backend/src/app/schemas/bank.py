from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

from ..core.schemas import PersistentDeletion, TimestampSchema, UUIDSchema


class BankBase(BaseModel):
    name: Annotated[str, Field(min_length=2, max_length=30, examples=["First National Bank"])]
    country: Annotated[str, Field(min_length=2, max_length=50, examples=["United States"])]
    interest_rate_min: Annotated[float, Field(ge=0.0, le=100.0, examples=[2.5])]
    interest_rate_max: Annotated[float, Field(ge=0.0, le=100.0, examples=[15.0])]


class Bank(TimestampSchema, BankBase, UUIDSchema, PersistentDeletion):
    id: int


class BankRead(BaseModel):
    id: int
    name: Annotated[str, Field(min_length=2, max_length=30, examples=["First National Bank"])]
    country: Annotated[str, Field(min_length=2, max_length=50, examples=["United States"])]
    interest_rate_min: Annotated[float, Field(ge=0.0, le=100.0, examples=[2.5])]
    interest_rate_max: Annotated[float, Field(ge=0.0, le=100.0, examples=[15.0])]


class BankCreate(BankBase):
    model_config = ConfigDict(extra="forbid")


class BankUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: Annotated[str | None, Field(min_length=2, max_length=30, examples=["First National Bank Ltd"], default=None)]
    country: Annotated[str | None, Field(min_length=2, max_length=50, examples=["Canada"], default=None)]
    interest_rate_min: Annotated[float | None, Field(ge=0.0, le=100.0, examples=[3.0], default=None)]
    interest_rate_max: Annotated[float | None, Field(ge=0.0, le=100.0, examples=[18.0], default=None)]


class BankUpdateInternal(BankUpdate):
    updated_at: datetime


class BankDelete(BaseModel):
    model_config = ConfigDict(extra="forbid")

    is_deleted: bool
    deleted_at: datetime


class BankRestoreDeleted(BaseModel):
    is_deleted: bool
