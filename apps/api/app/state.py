"""Application state shared by FastAPI endpoints, injected via dependencies."""

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING

from app.config import Settings

if TYPE_CHECKING:
    import asyncpg


@dataclass(slots=True)
class AppState:
    """Mutable application state shared across requests."""

    settings: Settings
    pool: asyncpg.Pool | None = None
