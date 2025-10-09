import uuid as uuid_pkg
from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, String, Float
from sqlalchemy.orm import Mapped, mapped_column
from ..core.db.database import Base


class Loan(Base):
    __tablename__ = "loan"

    id: Mapped[int] = mapped_column("id", autoincrement=True, nullable=False, unique=True, primary_key=True, init=False)

    type: Mapped[str] = mapped_column(String(30))
    amount: Mapped[float] = mapped_column(Float)
    purpose: Mapped[str] = mapped_column(String(30))
    interest_rate_min: Mapped[float] = mapped_column(Float)
    interest_rate_max: Mapped[float] = mapped_column(Float)
    duration: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(30))
    consent_status: Mapped[str] = mapped_column(String(30))
    insights_status: Mapped[str] = mapped_column(String(30), default="pending")
    
    uuid: Mapped[uuid_pkg.UUID] = mapped_column(default_factory=uuid_pkg.uuid4, primary_key=True, unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default_factory=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    is_deleted: Mapped[bool] = mapped_column(default=False, index=True)
    
    lending_bank_id: Mapped[int] = mapped_column(ForeignKey("bank.id"), index=True, default=None)
    sme_id: Mapped[int] = mapped_column(ForeignKey("sme.id"), index=True, default=None)
