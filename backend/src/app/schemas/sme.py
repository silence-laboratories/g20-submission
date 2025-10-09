from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

from ..core.schemas import PersistentDeletion, TimestampSchema, UUIDSchema


class SMEBase(BaseModel):
    name: Annotated[str, Field(min_length=2, max_length=30, examples=["ABC Corporation"])]
    registration_number: Annotated[str, Field(min_length=5, max_length=50, examples=["REG123456789"])]
    country: Annotated[str, Field(min_length=2, max_length=50, examples=["United States"])]
    director: Annotated[str, Field(min_length=2, max_length=50, examples=["John Smith"])]
    din: Annotated[str, Field(min_length=5, max_length=50, examples=["DIN123456789"])]
    registered_phone_number: Annotated[str, Field(min_length=10, max_length=50, examples=["+1234567890"])]
    bank_account_number: Annotated[str, Field(min_length=10, max_length=50, examples=["1234567890"])]
    bank_id: Annotated[int, Field(examples=[1])]


class SME(TimestampSchema, SMEBase, UUIDSchema, PersistentDeletion):
    id: int


class SMERead(BaseModel):
    id: int
    name: Annotated[str, Field(min_length=2, max_length=30, examples=["ABC Corporation"])]
    registration_number: Annotated[str, Field(min_length=5, max_length=50, examples=["REG123456789"])]
    country: Annotated[str, Field(min_length=2, max_length=50, examples=["United States"])]
    director: Annotated[str, Field(min_length=2, max_length=50, examples=["John Smith"])]
    din: Annotated[str, Field(min_length=5, max_length=50, examples=["DIN123456789"])]
    registered_phone_number: Annotated[str, Field(min_length=10, max_length=50, examples=["+1234567890"])]
    bank_account_number: Annotated[str, Field(min_length=10, max_length=50, examples=["1234567890"])]
    bank_id: Annotated[int, Field(examples=[1])]

class SMECreate(SMEBase):
    model_config = ConfigDict(extra="forbid")


class SMEUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: Annotated[str | None, Field(min_length=2, max_length=30, examples=["ABC Corporation Ltd"], default=None)]
    registration_number: Annotated[str | None, Field(min_length=5, max_length=50, examples=["REG987654321"], default=None)]
    country: Annotated[str | None, Field(min_length=2, max_length=50, examples=["Canada"], default=None)]
    director: Annotated[str | None, Field(min_length=2, max_length=50, examples=["Jane Doe"], default=None)]
    din: Annotated[str | None, Field(min_length=5, max_length=50, examples=["DIN987654321"], default=None)]
    registered_phone_number: Annotated[str | None, Field(min_length=10, max_length=50, examples=["+1987654321"], default=None)]
    bank_account_number: Annotated[str | None, Field(min_length=10, max_length=50, examples=["1234567890"], default=None)]
    bank_id: Annotated[int | None, Field(examples=[1], default=None)]

class SMEUpdateInternal(SMEUpdate):
    updated_at: datetime


class SMEDelete(BaseModel):
    model_config = ConfigDict(extra="forbid")

    is_deleted: bool
    deleted_at: datetime


class SMERestoreDeleted(BaseModel):
    is_deleted: bool
