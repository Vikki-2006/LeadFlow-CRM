![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)# LeadFlow CRM — SaaS Customer Relationship Management

LeadFlow is a production-ready, high-fidelity SaaS Customer Relationship Management (CRM) application. It features a modern React 19 + TypeScript + Tailwind CSS v4 frontend and a clean FastAPI + SQLAlchemy backend with role-based JWT authentication, a sales lead pipeline board, automatic activity logging, tasks & meetings scheduling, and sales analytics charts.

---

## Technical Architecture

### Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query (React Query) v5, Axios, React Hook Form, Zod, Recharts, Framer Motion, Lucide Icons.
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL (SQLite fallback for local ease-of-use), Alembic migrations, PyJWT (HMAC-SHA256 signature tokens), Passlib (bcrypt password hashing), Pydantic v2.
- **Database**: Supports PostgreSQL/SQLite database engines.

---

## Directory Structure
```text
CRM System/
├── backend/
│   ├── app/
│   │   ├── api/             # REST endpoints (auth, leads, customers, analytics, etc.)
│   │   ├── core/            # Configs, DB connectors, JWT security helpers
│   │   ├── models/          # SQLAlchemy Database tables schema
│   │   ├── schemas/         # Pydantic validation rules
│   │   ├── crud/            # Encapsulated query logic
│   │   └── main.py          # App initialization, CORS and DB seeders
│   └── requirements.txt     # Python backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # Common sidebar & dashboard wrappers
│   │   ├── context/         # Auth states, Framer Motion Toast portal
│   │   ├── hooks/           # TanStack Query custom server sync hooks
│   │   ├── pages/           # Landing, Dashboard, CRM boards and profile
│   │   ├── services/        # Axios wrapper with header interceptors
│   │   ├── index.css        # Global CSS-first theme and custom tokens
│   │   └── main.tsx         # Main entry point
│   ├── vite.config.ts       # Tailwind CSS v4 Vite integration
│   └── package.json         # Frontend packages
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Run the Backend FastAPI Server
Navigate to the `/backend` folder:
```bash
cd backend
```

Create a virtual environment and activate it:
```bash
# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1
```

Install requirements:
```bash
pip install -r requirements.txt
```

Launch the FastAPI server:
```bash
uvicorn app.main:app --reload --port 8000
```
- **Swagger Documentation**: Available at [http://localhost:8000/docs](http://localhost:8000/docs)
- **Local DB Fallback**: On first startup, the database is automatically created locally as `leadflow.db` (SQLite) and seeded with sample companies, customers, won leads, activities, and tasks.

### 2. Run the Frontend React Application
Navigate to the `/frontend` folder:
```bash
cd frontend
```

Install packages:
```bash
npm install --legacy-peer-deps
```

Start the Vite development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Onboarding Demo Credentials
The database seeds the following accounts for testing out roles:

| Access Role | Email Address | Password | Scoping Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@leadflow.com` | `AdminPassword123` | Full access, user creation/deletion, analytics audits. |
| **Sales Executive** | `sarah@leadflow.com` | `SarahPassword123` | Access to own clients, meetings, pipeline deal stages. |
| **Sales Executive** | `david@leadflow.com` | `DavidPassword123` | Access to own clients, meetings, pipeline deal stages. |

---

## Principal CRM Modules

1. **Global Landing Page**: Sleek marketing hero, pricing grid, and call to action.
2. **Interactive Dashboard**: KPI summaries, Area/Bar charts for sales volume, upcoming event calendars, and audit logs.
3. **Role-Based Pipelines**: Kanban column tracking, stage transition updates, deal value aggregates, and inline note streams.
4. **CRM Accounts & Contacts**: Customer tables, Search bar filters, and parent Organization attachments.
5. **Spreadsheet Exports**: Generates and downloads detailed CSV reports containing client data and rep performance indexes.
6. **Framer Motion Toast System**: Soft micro-animations and color alerts for seamless client interaction tracking.
