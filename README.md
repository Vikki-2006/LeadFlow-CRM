# 🚀 LeadFlow CRM

> A modern, production-ready Customer Relationship Management (CRM) platform built with React, FastAPI, and PostgreSQL.

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?style=for-the-badge&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 📖 Overview

LeadFlow CRM is a full-stack SaaS Customer Relationship Management platform designed to streamline customer interactions, sales pipeline management, and business analytics.

The application features secure JWT authentication, role-based access control, Kanban lead management, customer tracking, dashboards, meeting scheduling, activity logging, and CSV export capabilities.

---

# ✨ Features

## 🔐 Authentication & Security

- JWT Authentication
- Role-Based Access Control (RBAC)
- Secure Password Hashing
- Protected API Routes
- Persistent User Sessions

---

## 👥 Customer Management

- Customer Directory
- Company Management
- Contact Details
- Search & Filters
- Customer Activity Timeline

---

## 📊 Sales Pipeline

- Kanban Lead Board
- Drag & Drop Lead Stages
- Deal Tracking
- Sales Progress Monitoring
- Lead Assignment

---

## 📈 Analytics Dashboard

- KPI Cards
- Sales Charts
- Revenue Insights
- Performance Metrics
- Activity Overview

---

## 📅 Meetings & Tasks

- Schedule Meetings
- Task Management
- Activity Logging
- Daily Follow-ups
- Team Collaboration

---

## 📁 Data Management

- CSV Export
- Database Seeding
- Local SQLite Fallback
- PostgreSQL Support

---

## 🎨 User Experience

- Responsive Design
- Dark Mode
- Framer Motion Animations
- Toast Notifications
- Modern UI

---

# 🏗️ Tech Stack

## Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- React Router
- TanStack Query
- Axios
- React Hook Form
- Zod
- Framer Motion
- Recharts
- Lucide React

---

## Backend

- FastAPI
- SQLAlchemy
- Alembic
- Pydantic v2
- Passlib
- PyJWT

---

## Database

- PostgreSQL
- SQLite (Development)

---

# 📂 Project Structure

```
LeadFlow-CRM/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── crud/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── main.py
│   ├── requirements.txt
│   └── alembic/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL

---

## 1️⃣ Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/LeadFlow-CRM.git

cd LeadFlow-CRM
```

---

## 2️⃣ Backend Setup

```bash
cd backend

python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run server

```bash
uvicorn app.main:app --reload
```

API Docs

```
http://localhost:8000/docs
```

---

## 3️⃣ Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Open

```
http://localhost:5173
```

---

# 🔑 Demo Credentials

| Role | Email | Password |
|-------|-------|----------|
| Admin | admin@leadflow.com | AdminPassword123 |
| Sales Executive | sarah@leadflow.com | SarahPassword123 |
| Sales Executive | david@leadflow.com | DavidPassword123 |

---

# 📸 Screenshots

Add screenshots here.

```
/screenshots

dashboard.png

kanban.png

customers.png

analytics.png

login.png
```

---

# 🌟 Future Enhancements

- Email Integration
- Notification Center
- AI Sales Assistant
- Calendar Sync
- Team Chat
- Mobile App
- Multi-Tenant Architecture
- Payment Integration
- File Uploads
- Audit Reports

---

# 🛠️ API Documentation

FastAPI automatically generates API documentation.

Swagger UI

```
http://localhost:8000/docs
```

ReDoc

```
http://localhost:8000/redoc
```

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository

2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit changes

```bash
git commit -m "Add new feature"
```

4. Push

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.
---

⭐ If you like this project, consider giving it a Star!
