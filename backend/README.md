# Installation

uv sync && source .venv/bin/activate

# DB create

./scripts/init-pgsql.sh

./scripts/drop-pgsql.sh

# DB migrate

## Create migration

uv run alembic revision --autogenerate -m "message"

# Apply all pending migrations
uv run alembic upgrade head

# Apply specific number of migrations
uv run alembic upgrade +2

# Apply to specific revision
uv run alembic upgrade abc123def456

# Run

uv run uvicorn src.app.main:app --reload --host 0.0.0.0 --port 8000

# Docs

http://localhost:8000/docs

# Swagger

http://localhost:8000/swagger