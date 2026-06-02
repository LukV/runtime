"""asyncpg connection-pool lifecycle.

The pool is created once at startup and shared across requests (per
architecture: a long-lived process, every read/write through one pool — never a
per-request connection). A missing or unreachable database must not stop the
service from booting; health surfaces the degraded state instead.
"""

from __future__ import annotations

import logging

import asyncpg

logger = logging.getLogger("runtime.api.db")


async def create_pool(database_url: str | None) -> asyncpg.Pool | None:
    """Create the shared connection pool, or return None when no database is
    configured or it can't be reached at startup."""
    if not database_url:
        logger.info("DATABASE_URL not set — starting without a database pool")
        return None
    try:
        pool = await asyncpg.create_pool(database_url, min_size=2, max_size=10)
        logger.info("Created asyncpg pool (min=2, max=10)")
        return pool
    except Exception:  # noqa: BLE001 — any pool failure is non-fatal; degrade, don't crash
        logger.exception("Failed to create asyncpg pool — continuing without a database")
        return None


async def ping(pool: asyncpg.Pool) -> bool:
    """Return True if a trivial query succeeds on the pool."""
    try:
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        return True
    except Exception:  # noqa: BLE001 — a failed ping is a reportable health state, not an error to raise
        logger.exception("Database ping failed")
        return False
