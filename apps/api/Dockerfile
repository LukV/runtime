# Runtime API — FastAPI on Railway. uv-based, single stage. CI builds this to
# verify it compiles; it doesn't push the image (Railway builds its own on
# push to main). uv reads .python-version and downloads the interpreter.
FROM ghcr.io/astral-sh/uv:bookworm-slim

WORKDIR /app

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PYTHONUNBUFFERED=1

# Install dependencies first as a cached layer, then the project itself.
COPY pyproject.toml uv.lock .python-version ./
RUN uv sync --frozen --no-install-project --no-dev

COPY . .
RUN uv sync --frozen --no-dev

EXPOSE 8000

# Railway injects $PORT; default to 8000 for a local `docker run`.
CMD ["sh", "-c", "uv run uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
