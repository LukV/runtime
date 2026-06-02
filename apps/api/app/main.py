"""FastAPI application factory and ASGI entrypoint (`app.main:app`)."""

from __future__ import annotations

import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.config import get_settings
from app.db import create_pool
from app.routes.health import router as health_router
from app.state import AppState

logger = logging.getLogger("runtime.api")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
    """Open the shared connection pool on startup, close it on shutdown."""
    settings = get_settings()
    pool = await create_pool(settings.database_url)
    app.state.app_state = AppState(settings=settings, pool=pool)
    try:
        yield
    finally:
        if pool is not None:
            await pool.close()
            logger.info("Connection pool closed")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()
    app = FastAPI(title="Runtime API", version=__version__, lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router, prefix="/api")
    return app


app = create_app()
