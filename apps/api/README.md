# Runtime API

The single API surface for the product. The Next.js website, the iOS app, and
the coach console all read and write the shared Supabase Postgres through here
— no client touches the database directly
(see [`docs/architecture/001-stack-decisions`](../../docs/architecture/001-stack-decisions.md)).

FastAPI + asyncpg, managed with [uv](https://docs.astral.sh/uv/). Deployed as a
long-lived process on Railway (not serverless).

## Layout

```
app/
  main.py          create_app() factory + ASGI `app`; lifespan owns the pool
  config.py        Settings (env-driven, 12-factor)
  core.py          Result[T] — the no-exceptions return shape for validation
  db.py            asyncpg pool lifecycle + ping
  state.py         AppState (injected via dependencies)
  dependencies.py  get_app_state / StateDep
  routes/          one module per concern (health so far)
tests/             surface tests — one per route, AppState injected
```

Database migrations are **not** here — they live at the repo root in
`supabase/migrations/` because the database is shared across services.

## Run it locally

Everything below runs from this directory (`apps/api`), and assumes
[uv](https://docs.astral.sh/uv/getting-started/installation/) is installed
(`curl -LsSf https://astral.sh/uv/install.sh | sh`).

```sh
cd apps/api
uv sync                                   # create .venv + install deps (first run downloads Python 3.14)
uv run uvicorn app.main:app --reload      # dev server on http://127.0.0.1:8000
```

Then check the health endpoint (note the `/api` prefix):

```sh
curl http://127.0.0.1:8000/api/health
```

Expected response with no database configured (the current scaffold state):

```json
{ "ok": true, "version": "0.1.0", "environment": "development", "database": "not_configured" }
```

You can also open it in a browser:

- Health: <http://127.0.0.1:8000/api/health>
- Interactive API docs (Swagger UI): <http://127.0.0.1:8000/docs>

`database` becomes `"up"` once `DATABASE_URL` points at a reachable Postgres,
or `"down"` if it's set but unreachable. Stop the server with `Ctrl-C`.

### Via Docker (optional)

Mirrors how Railway runs it:

```sh
docker build -t runtime-api .
docker run --rm -p 8000:8000 runtime-api
# then: curl http://127.0.0.1:8000/api/health
```

## Gates

```sh
uv run ruff check .
uv run ruff format --check .
uv run mypy app
uv run pytest
```

## Configuration

| Env var        | Default                   | Notes                                   |
| -------------- | ------------------------- | --------------------------------------- |
| `DATABASE_URL` | _(unset)_                 | Supabase Postgres DSN.                  |
| `ENVIRONMENT`  | `development`             | Reported by `/api/health`.              |
| `CORS_ORIGINS` | `http://localhost:3000`   | Comma-separated browser origins.        |
| `PORT`         | `8000`                    | Injected by Railway in production.      |
