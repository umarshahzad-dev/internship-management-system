# IMAS – Internship Management & Automation System

A full-stack web application for managing the complete internship lifecycle.

## Tech Stack

- Backend: NestJS (TypeScript, CommonJS) + TypeORM + PostgreSQL
- Frontend: React + Vite + Tailwind CSS
- Database: PostgreSQL with Row-Level Security
- Testing: Vitest

## Project Structure

- `backend/` – NestJS API server
- `frontend/` – React SPA
- `docker-compose.yml` – PostgreSQL and Redis services

## Getting Started

1. Clone the repository.
2. Copy `.env.example` to `.env` and adjust values.
3. Start the database: `docker-compose up -d postgres`
4. Start the backend: `cd backend && npm install && npm run start:dev`
5. Start the frontend: `cd frontend && npm install && npm run dev`

See documentation in `/docs` for detailed requirements.