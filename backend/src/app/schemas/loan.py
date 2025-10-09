from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

from ..core.schemas import PersistentDeletion, TimestampSchema, UUIDSchema


class LoanBase(BaseModel):
    type: Annotated[str, Field(min_length=2, max_length=30, examples=["Personal Loan", "Business Loan", "Mortgage"])]
    amount: Annotated[float, Field(gt=0.0, examples=[50000.0, 100000.0, 250000.0])]
    purpose: Annotated[str, Field(min_length=2, max_length=30, examples=["Working Capital", "Equipment Purchase", "Expansion"])]
    interest_rate_min: Annotated[float, Field(ge=0.0, le=100.0, examples=[3.5, 5.0, 7.2])]
    interest_rate_max: Annotated[float, Field(ge=0.0, le=100.0, examples=[8.5, 12.0, 15.5])]
    duration: Annotated[int, Field(gt=0, le=360, examples=[12, 24, 60, 120])]  # months
    status: Annotated[str, Field(min_length=2, max_length=30, examples=["Pending", "Approved", "Rejected", "Disbursed"])]
    consent_status: Annotated[str, Field(min_length=2, max_length=30, examples=["Pending", "Approved", "Rejected"])]
    insights_status: Annotated[str, Field(min_length=2, max_length=30, examples=["Pending", "Generated", "Failed"])]
    lending_bank_id: Annotated[int, Field(gt=0, examples=[1, 2, 3])]
    sme_id: Annotated[int, Field(gt=0, examples=[1, 2, 3])]
    


class Loan(TimestampSchema, LoanBase, UUIDSchema, PersistentDeletion):
    id: int


class LoanRead(BaseModel):
    id: int
    type: Annotated[str, Field(min_length=2, max_length=30, examples=["Personal Loan", "Business Loan", "Mortgage"])]
    amount: Annotated[float, Field(gt=0.0, examples=[50000.0, 100000.0, 250000.0])]
    purpose: Annotated[str, Field(min_length=2, max_length=30, examples=["Working Capital", "Equipment Purchase", "Expansion"])]
    interest_rate_min: Annotated[float, Field(ge=0.0, le=100.0, examples=[3.5, 5.0, 7.2])]
    interest_rate_max: Annotated[float, Field(ge=0.0, le=100.0, examples=[8.5, 12.0, 15.5])]
    duration: Annotated[int, Field(gt=0, le=360, examples=[12, 24, 60, 120])]
    status: Annotated[str, Field(min_length=2, max_length=30, examples=["Pending", "Approved", "Rejected", "Disbursed"])]
    consent_status: Annotated[str, Field(min_length=2, max_length=30, examples=["Pending", "Approved", "Rejected"])]
    insights_status: Annotated[str, Field(min_length=2, max_length=30, examples=["Pending", "Generated", "Failed"])]
    lending_bank_id: Annotated[int, Field(gt=0, examples=[1, 2, 3])]
    sme_id: Annotated[int, Field(gt=0, examples=[1, 2, 3])]


class LoanCreate(LoanBase):
    model_config = ConfigDict(extra="forbid")


class LoanUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Annotated[str | None, Field(min_length=2, max_length=30, examples=["Personal Loan", "Business Loan"], default=None)]
    amount: Annotated[float | None, Field(gt=0.0, examples=[75000.0, 150000.0], default=None)]
    purpose: Annotated[str | None, Field(min_length=2, max_length=30, examples=["Working Capital", "Equipment Purchase"], default=None)]
    interest_rate_min: Annotated[float | None, Field(ge=0.0, le=100.0, examples=[4.0, 6.0], default=None)]
    interest_rate_max: Annotated[float | None, Field(ge=0.0, le=100.0, examples=[9.0, 13.0], default=None)]
    duration: Annotated[int | None, Field(gt=0, le=360, examples=[18, 36, 72], default=None)]
    status: Annotated[str | None, Field(min_length=2, max_length=30, examples=["Approved", "Rejected", "Disbursed"], default=None)]
    consent_status: Annotated[str, Field(min_length=2, max_length=30, examples=["Pending", "Approved", "Rejected"], default=None)]
    insights_status: Annotated[str, Field(min_length=2, max_length=30, examples=["Pending", "Generated", "Failed"], default=None)]
    lending_bank_id: Annotated[int | None, Field(gt=0, examples=[2, 4], default=None)]
    sme_id: Annotated[int | None, Field(gt=0, examples=[2, 4], default=None)]


class LoanUpdateInternal(LoanUpdate):
    updated_at: datetime


class LoanDelete(BaseModel):
    model_config = ConfigDict(extra="forbid")

    is_deleted: bool
    deleted_at: datetime


class LoanRestoreDeleted(BaseModel):
    is_deleted: bool
