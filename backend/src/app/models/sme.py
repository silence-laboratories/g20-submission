import uuid as uuid_pkg
from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column
from ..core.db.database import Base


class SME(Base):
    __tablename__ = "sme"

    id: Mapped[int] = mapped_column("id", autoincrement=True, nullable=False, unique=True, primary_key=True, init=False)

    name: Mapped[str] = mapped_column(String(30))
    registration_number: Mapped[str] = mapped_column(String(50))
    country: Mapped[str] = mapped_column(String(50))
    director: Mapped[str] = mapped_column(String(50))
    din: Mapped[str] = mapped_column(String(50))
    registered_phone_number: Mapped[str] = mapped_column(String(50))
    bank_account_number: Mapped[str] = mapped_column(String(50))
    
    uuid: Mapped[uuid_pkg.UUID] = mapped_column(default_factory=uuid_pkg.uuid4, primary_key=True, unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default_factory=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    is_deleted: Mapped[bool] = mapped_column(default=False, index=True)
    
    bank_id: Mapped[int] = mapped_column(ForeignKey("bank.id"), index=True, default=None)
