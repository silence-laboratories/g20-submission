# Backend Setup Guide

## Quick Start

```bash
# 1. Install dependencies
uv sync && source .venv/bin/activate

# 2. Setup environment variables
cp env-template.txt src/.env
# Edit src/.env with your actual values (especially SECRET_KEY and Google OAuth credentials)

# 3. Create database
./scripts/init-pgsql.sh

# 4. Run migrations
uv run alembic upgrade head

# 5. Start server
uv run uvicorn src.app.main:app --reload --host 0.0.0.0 --port 8000
```

## Environment Configuration

Create `src/.env` file from the template:

```bash
cp env-template.txt src/.env
```

**Important:** Update the following values in `src/.env`:
- `SECRET_KEY` - Generate using: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- `GOOGLE_CLIENT_ID` - Get from Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - Get from Google Cloud Console
- `POSTGRES_PASSWORD` - Change from default if needed

## Database Management

### Create Database

```bash
# Using default settings (localhost, default credentials)
./scripts/init-pgsql.sh

# With custom PostgreSQL connection
./scripts/init-pgsql.sh -h localhost -p 5432 -u postgres -w your_password
```

This creates:
- Database: `sl_compute_platform`
- User: `sl_admin`
- Password: `password` (configurable in script)

### Drop Database

```bash
./scripts/drop-pgsql.sh
```

## Database Migrations

### Apply Migrations

```bash
# Apply all pending migrations
uv run alembic upgrade head

# Apply specific number of migrations
uv run alembic upgrade +2

# Apply to specific revision
uv run alembic upgrade abc123def456

# Rollback last migration
uv run alembic downgrade -1
```

### Create New Migration

```bash
# Auto-generate migration from model changes
uv run alembic revision --autogenerate -m "description of changes"

# Create empty migration
uv run alembic revision -m "description of changes"
```

### View Migration Status

```bash
# Show current migration
uv run alembic current

# Show migration history
uv run alembic history

# Show pending migrations
uv run alembic heads
```

## Running the Server

### Development Mode

```bash
# With auto-reload (recommended for development)
uv run uvicorn src.app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
# Using Gunicorn with Uvicorn workers (recommended for production)
uv run gunicorn src.app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

## API Documentation

Once the server is running:

- **Interactive API Docs (Swagger UI):** http://localhost:8000/docs
- **Alternative API Docs (ReDoc):** http://localhost:8000/redoc
- **Admin Panel:** http://localhost:8000/admin

## Development

### Code Quality

```bash
# Format code
uv run ruff format src/

# Lint code
uv run ruff check src/ --fix

# Type checking
uv run mypy src/
```

### Running Tests

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=src

# Run specific test file
uv run pytest tests/test_file.py
```

## Docker Setup

### Using Docker Compose

```bash
# Build and start all services (backend + database)
docker-compose up -d

# View logs
docker-compose logs -f web

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

### Using Docker CLI

```bash
# Build image
docker build -t backend-api .

# Run container
docker run -d -p 8000:8000 --env-file src/.env backend-api
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 8000
lsof -ti:8000

# Kill the process
lsof -ti:8000 | xargs kill -9
```

### Database Connection Issues

```bash
# Check PostgreSQL status
pg_isready

# Test connection
psql -U sl_admin -d sl_compute_platform -c "SELECT 1;"

# View database logs (macOS with Homebrew)
tail -f /opt/homebrew/var/log/postgres.log
```

### Migration Issues

```bash
# Reset database and migrations
./scripts/drop-pgsql.sh
./scripts/init-pgsql.sh
uv run alembic upgrade head
```

## Project Structure

```
backend/
├── src/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   │   ├── dependencies.py
│   │   │   └── v1/       # API version 1
│   │   ├── core/         # Core configuration
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── db/       # Database setup
│   │   ├── crud/         # CRUD operations
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── middleware/   # Custom middleware
│   │   └── main.py       # FastAPI application
│   ├── migrations/       # Alembic migrations
│   └── .env             # Environment variables (not in git)
├── scripts/             # Utility scripts
├── tests/              # Test files
├── env-template.txt    # Environment template
├── pyproject.toml      # Python dependencies
└── README.md          # This file
```