"""Health / readiness endpoint."""

from __future__ import annotations

from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

from app import __version__
from app.db import ping
from app.dependencies import StateDep

router = APIRouter()

DatabaseStatus = Literal["up", "down", "not_configured"]


class HealthResponse(BaseModel):
    ok: bool
    version: str
    environment: str
    database: DatabaseStatus


@router.get("/health")
async def health(state: StateDep) -> HealthResponse:
    """Report service liveness and database connectivity. `ok` is False only
    when a database is configured but unreachable — an unconfigured database
    (the scaffold's default) is a healthy, expected state for now."""
    if state.pool is None:
        database: DatabaseStatus = "not_configured"
    elif await ping(state.pool):
        database = "up"
    else:
        database = "down"

    return HealthResponse(
        ok=database != "down",
        version=__version__,
        environment=state.settings.environment,
        database=database,
    )
