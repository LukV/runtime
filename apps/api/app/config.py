"""Application settings, loaded from the environment (12-factor / Railway)."""

from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    environment: str = "development"

    # Postgres DSN for the shared Supabase database. Unset locally until the
    # schema work lands; the app still boots (health reports the database as
    # unconfigured) so the surface stays testable without a database.
    database_url: str | None = None

    # Comma-separated CORS origins for browser clients (the Next.js app).
    # Server-to-server callers (iOS, SSR) don't need CORS.
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Return the process-wide settings, parsed once from the environment."""
    return Settings()
