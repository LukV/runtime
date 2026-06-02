"""FastAPI dependency providers."""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Request

from app.state import AppState


def get_app_state(request: Request) -> AppState:
    """Retrieve the application state attached to the FastAPI app at startup."""
    return request.app.state.app_state  # type: ignore[no-any-return]


StateDep = Annotated[AppState, Depends(get_app_state)]
