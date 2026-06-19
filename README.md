# Inventory Management System

A full-stack Inventory Management System built using React, TypeScript, FastAPI, PostgreSQL, JWT Authentication, Docker, and Docker Compose.

## Live Application

### Frontend
https://inventory-management-system-two-amber.vercel.app

### Backend API
https://inventory-management-system-pf3p.onrender.com

### API Documentation
https://inventory-management-system-pf3p.onrender.com/docs

### GitHub Repository
https://github.com/Savage9193/Inventory-Management-system

### Docker Images

Backend Image:
https://hub.docker.com/r/taughher465/inventory-backend

Frontend Image:
https://hub.docker.com/r/taughher465/inventory-frontend

---

## Features

### Authentication & Authorization

- JWT Authentication (Access & Refresh Tokens)
- Secure Password Hashing
- Role-Based Access Control (RBAC)
- Protected Routes
- Token Refresh Mechanism

### User Roles

#### Admin
- Full System Access
- Dashboard Access
- Product Management
- Customer Management
- Inventory Management
- Order Management

#### Manager
- Dashboard Access
- Product Management
- Customer Management
- Inventory Management
- Order Management

#### Staff
- Dashboard Access
- Product Viewing
- Order Creation
- Order Management

### Dashboard

- Total Products Overview
- Total Customers Overview
- Total Orders Overview
- Inventory Statistics
- Business Metrics Summary

### Product Management

- Create Products
- Update Products
- Soft Delete Products
- Product Listing
- SKU Validation
- Product Search & Filtering

### Customer Management

- Create Customers
- Update Customers
- Customer Listing
- Customer Details View

### Inventory Management

- Track Inventory Levels
- Update Stock Quantities
- Low Stock Monitoring
- Inventory Summary

### Order Management

- Create Orders
- Manage Order Items
- Automatic Stock Deduction
- Order History Tracking
- Insufficient Stock Validation

---

## Tech Stack

### Frontend

- React
- TypeScript
- React Router
- TanStack Query
- Axios
- Tailwind CSS
- ShadCN UI

### Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic
- Pydantic
- JWT Authentication

### DevOps

- Docker
- Docker Compose
- Render
- Vercel

---

## Project Structure

```text
Inventory-Management-System
│
├── backend
├── frontend
├── docker-compose.yml
├── README.md
└── .env.example
```

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://username:password@host/database
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
```

---

## Local Setup

### Clone Repository

```bash
git clone https://github.com/Savage9193/Inventory-Management-system.git
cd Inventory-Management-system
```

### Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

alembic upgrade head

uvicorn app.main:app --reload
```

Backend:
http://localhost:8000

Swagger Docs:
http://localhost:8000/docs

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend:
http://localhost:5173

---

## Docker Setup

Build and start containers:

```bash
docker compose up --build
```

Stop containers:

```bash
docker compose down
```

Application URLs:

Frontend:
http://localhost:5173

Backend:
http://localhost:8000

API Docs:
http://localhost:8000/docs

---

## Running Tests

### Backend

```bash
cd backend
pytest -v
```

Result:

```text
8 Passed
0 Failed
```

### Frontend

```bash
cd frontend
npm test
```

Result:

```text
2 Passed
0 Failed
```

---

## Deployment

### Backend (Render)

https://inventory-management-system-pf3p.onrender.com

### Frontend (Vercel)

https://inventory-management-system-two-amber.vercel.app

---

## Assignment Requirements Covered

- JWT Authentication
- Role-Based Access Control
- PostgreSQL Database
- FastAPI Backend
- React Frontend
- Docker Containerization
- Docker Compose
- Environment Variables
- Backend Deployment
- Frontend Deployment
- Automated Testing
- Public URLs
- Docker Images
- GitHub Repository

---

## Author

**Mohd Shahvez Tyagi**

GitHub:
https://github.com/Savage9193