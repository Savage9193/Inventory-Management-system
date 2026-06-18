# Inventory & Order Management System

Production-ready full-stack inventory and order management application.

## Tech Stack

- **Backend:** Python, FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL, JWT
- **Frontend:** React, TypeScript, Vite, React Query, TailwindCSS, Shadcn-style UI
- **Infrastructure:** Docker, Docker Compose

## Features

- Product, Customer, and Order management
- Inventory tracking with audit trail
- JWT authentication with role-based access (Admin, Manager, Staff)
- Dashboard analytics with charts
- Atomic order transactions with stock validation

## Quick Start (Docker)

```bash
docker compose up --build
```

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:3000        |
| Backend  | http://localhost:8000        |
| API Docs | http://localhost:8000/docs   |
| Postgres | localhost:5432               |

Register the first user — they automatically become **Admin**.

## Manual Setup

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL 16+

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your settings

python -m venv venv
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at http://localhost:5173

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing key |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token TTL |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token TTL |
| `CORS_ORIGINS` | Comma-separated allowed origins |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

## Running Tests

### Backend

```bash
cd backend
pip install -r requirements.txt
pytest --cov=app --cov-report=term-missing
```

### Frontend

```bash
cd frontend
npm install
npm test
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh token |
| POST | `/api/v1/auth/logout` | Logout |
| CRUD | `/api/v1/products` | Product management |
| CRUD | `/api/v1/customers` | Customer management |
| CRUD | `/api/v1/orders` | Order management |
| GET | `/api/v1/inventory/history` | Stock history |
| GET | `/api/v1/inventory/low-stock` | Low stock products |
| GET | `/api/v1/dashboard` | Analytics |

## Role Permissions

| Role | Permissions |
|------|-------------|
| Admin | Full access |
| Manager | Products, Customers, Orders, Dashboard, Inventory |
| Staff | Read products, Create orders |

## Deployment

### Backend

Build and run the Docker image, or deploy to any platform supporting Python/FastAPI:

```bash
cd backend
docker build -t inventory-backend .
docker run -p 8000:8000 --env-file .env inventory-backend
```

### Frontend

```bash
cd frontend
npm run build
# Deploy dist/ to any static host (Nginx, Vercel, S3, etc.)
```

Set `VITE_API_URL` to your production API URL at build time.

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/v1/          # REST routes
│   │   ├── core/            # Config, security, exceptions
│   │   ├── database/        # DB session
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── repositories/    # Data access
│   │   ├── services/        # Business logic
│   │   └── main.py
│   ├── alembic/             # Migrations
│   └── tests/
├── frontend/
│   └── src/
│       ├── api/             # Axios client
│       ├── components/      # UI components
│       ├── contexts/        # Auth context
│       ├── layouts/         # App layout
│       ├── pages/           # Route pages
│       └── types/           # TypeScript types
└── docker-compose.yml
```

## License

MIT
