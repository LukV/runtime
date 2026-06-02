"""Core types shared across the API.

The `Result[T]` container is the project's return shape for anything that can
fail a validation or business-logic check: functions don't raise for those,
they return a `Result` carrying diagnostics. Mirrors the lumen convention.
Genuine programming errors (a bug, an unreachable branch) still raise.
"""

from enum import StrEnum
from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class Severity(StrEnum):
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


class Diag(BaseModel):
    """A structured diagnostic message."""

    severity: Severity
    code: str
    message: str
    hint: str | None = None


class Result(BaseModel, Generic[T]):  # noqa: UP046 — Pydantic requires the Generic[T] subclass form
    """Result container that pairs output with diagnostics.

    Functions never throw for validation/business-logic failures. They return a
    `Result` with diagnostics instead.
    """

    data: T | None = None
    diagnostics: list[Diag] = Field(default_factory=list)

    @property
    def has_errors(self) -> bool:
        return any(d.severity == Severity.ERROR for d in self.diagnostics)

    @property
    def ok(self) -> bool:
        return not self.has_errors

    def error(self, code: str, message: str, *, hint: str | None = None) -> None:
        self.diagnostics.append(Diag(severity=Severity.ERROR, code=code, message=message, hint=hint))

    def warning(self, code: str, message: str, *, hint: str | None = None) -> None:
        self.diagnostics.append(Diag(severity=Severity.WARNING, code=code, message=message, hint=hint))

    def info(self, code: str, message: str, *, hint: str | None = None) -> None:
        self.diagnostics.append(Diag(severity=Severity.INFO, code=code, message=message, hint=hint))
