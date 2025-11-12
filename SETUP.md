# Quick Setup Guide

This is a condensed setup guide. 

For an overview, see [README.md](README.md).

**Setup Time:** ~10 minutes (excluding Google OAuth setup)

**Note:** The Google OAuth setup is required for authentication features to work. Without it, you can still run the application but won't be able to sign in.

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 13+
- UV package manager

Install UV:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## Backend Setup (5 minutes)

```bash
cd backend

# 1. Install dependencies
uv sync
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 2. Configure environment
cp env-template.txt src/.env

# Generate SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
# Edit src/.env - MUST update: SECRET_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# 3. Setup database
./scripts/init-pgsql.sh
# Edit src/.env - MUST update: POSTGRES_PASSWORD, POSTGRES_USER, POSTGRES_DB, POSTGRES_SERVER, POSTGRES_PORT

# 4. Generate migrations, if not present
uv run alembic revision --autogenerate -m "Initial migration"

# 5. Run migrations
uv run alembic upgrade head

# 6. Start server
uv run uvicorn src.app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000

API Docs: http://localhost:8000/docs

You can refer to backend specific [README.md](backend/README.md) for more details.

## Frontend Setup (3 minutes)

Open a new terminal:

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Configure environment
cp env-template.txt .env
# Default values should work for local development

# 3. Start dev server
npm run dev
```

Frontend will be available at: http://localhost:3000

You can refer to frontend specific [README.md](frontend/README.md) for more details.

## Google OAuth Setup

Required for authentication to work:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000`
5. Copy Client ID and Client Secret to `backend/src/.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id-here
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   ```
6. Copy Client ID to `frontend/.env`:
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here
   ```

## Verify Setup

1. **Backend Health Check:**
   ```bash
   curl http://localhost:8000/docs
   ```
   - You should see the docs page serving

2. **Frontend:**
   - Open http://localhost:3000
   - You should see the landing page

3. **Database:**
   ```bash
   psql -U sl_admin -d sl_compute_platform -c "SELECT COUNT(*) FROM users;"
   ```

## Common Issues

### Database Connection Failed
```bash
# Check PostgreSQL is running
pg_isready

# Start PostgreSQL (macOS Homebrew)
brew services start postgresql
```

### Port Already in Use
```bash
# Kill process on port 8000 (backend)
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Migration Errors
```bash
cd backend
./scripts/drop-pgsql.sh
./scripts/init-pgsql.sh
uv run alembic upgrade head
```

## Running Both Services

Use two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
source .venv/bin/activate
uv run uvicorn src.app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Docker Setup (Alternative)

If you prefer Docker:

```bash
# Backend
cd backend
docker-compose up -d

# Frontend
cd frontend
docker-compose up -d
```
The dockerfiles for your reference:
- [Backend Dockerfile](../backend/Dockerfile)
- [Frontend Dockerfile](../frontend/Dockerfile)

Now the configuration is complete and you are all set.

**Time to Compute! 🚀**