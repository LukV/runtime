"""Runtime API — FastAPI backend.

The single API surface for the product: the Next.js website, the iOS app, and
the coach console all read and write the shared Supabase Postgres through here
(per docs/architecture/001-stack-decisions). No client touches the database
directly.
"""

__version__ = "0.1.0"
