# SIIntern — Internship Management Dashboard

Full-stack internship management system prototype for **Secretariat DPRD Banyumas**.

## Stack
- Frontend: React + Vite, Tailwind CSS, Framer Motion, Recharts
- Backend: Node.js + Express
- Auth: JWT
- Database: PostgreSQL (configured via `DATABASE_URL`)

## Project Structure
- `frontend/`: Landing page, role dashboards, and feature UI (attendance/logbook/evaluation/report/AI panel).
- `backend/`: API routes for auth and dashboard summary.

## Quick Start
### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

## Demo Accounts
- Admin: `admin@dprd.go.id` / `admin123`
- Mentor: `mentor@dprd.go.id` / `mentor123`
- Student: `student@dprd.go.id` / `student123`
