"""Surface test for the health endpoint.

Builds a minimal app, includes the router under test, and injects AppState via
`dependency_overrides` — the framework pattern for FastAPI route tests.
"""

from __future__ import annotations

import httpx
from fastapi import FastAPI

from app.config import Settings
from app.dependencies import get_app_state
from app.routes.health import router as health_router
from app.state import AppState


def _build_app(state: AppState) -> FastAPI:
    app = FastAPI()
    app.include_router(health_router, prefix="/api")
    app.dependency_overrides[get_app_state] = lambda: state
    return app


async def test_health_ok_without_database() -> None:
    """Returns 200 and reports the database as unconfigured when no pool is
    wired — the scaffold's default, healthy state."""
    state = AppState(settings=Settings(environment="test"), pool=None)
    app = _build_app(state)

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/health")

    assert response.status_code == 200
    body = response.json()
    assert body["ok"] is True
    assert body["database"] == "not_configured"
    assert body["environment"] == "test"
