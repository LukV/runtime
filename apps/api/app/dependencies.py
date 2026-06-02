"""FastAPI dependency providers."""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends, HTTPException, Request

from app.repositories.races import PostgresRaceRepository, RaceRepository
from app.state import AppState


def get_app_state(request: Request) -> AppState:
    """Retrieve the application state attached to the FastAPI app at startup."""
    return request.app.state.app_state  # type: ignore[no-any-return]


StateDep = Annotated[AppState, Depends(get_app_state)]


def get_race_repo(state: StateDep) -> RaceRepository:
    """Provide the race data-access layer. Overridable in tests so routes can be
    exercised without a database."""
    if state.pool is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    return PostgresRaceRepository(state.pool)


RaceRepoDep = Annotated[RaceRepository, Depends(get_race_repo)]
