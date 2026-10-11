# FarmIQ (MooFlow)

Dairy & livestock farm management system — AUCA INSY 8322 (Web Technologies) course
project. A Spring Boot REST API + Next.js dashboard for tracking a dairy farm's herd,
milk production, veterinary records, finances, inventory, and staff, with multiple
people (an owner plus invited workers/branches) sharing the same farm's data under
role-based access.

## What this is

A farm owner registers and gets their own `Farm`. They can invite workers or other
branches by email; invited people join via a one-time link, no shared passwords. Every
record — cattle, milk production, vet visits, finance transactions, inventory, workers —
is scoped to a `Farm`, so one farm's data is never visible to another, and a `WORKER`/
`BRANCH` account never sees Finance or Workers data, which is owner-only.

See [`docs/MIDTERM_REPORT.md`](docs/MIDTERM_REPORT.md) (or the `.docx` version) for the
full problem statement, requirements, user stories, ER/class diagram, and schema —
written for the course's mid-term deliverable, but it's also the best single reference
for how the domain is modeled.

## Project layout

```
backend/     Spring Boot 3 / Java 21 REST API (JWT auth, PostgreSQL, RabbitMQ)
frontend/    Next.js 16 dashboard (App Router, Tailwind v4)
docs/        Mid-term report, ER/class diagram, responsive-design screenshots
docker-compose.yml   Postgres + RabbitMQ + backend + frontend, wired together
```

Each of `backend/` and `frontend/` has its own README with more detail specific to
that half of the stack.

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3, Java 21, Spring Security (JWT + Google OAuth2), Hibernate/JPA |
| Database | PostgreSQL |
| Async messaging | RabbitMQ — OTP and invite emails are queued and sent by a separate consumer, not inline on the request |
| Frontend | Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4 |
| Auth | Email/password + OTP verification, or "Continue with Google" |

## Running it

**With Docker (simplest):**

```bash
docker compose up --build
```

This starts Postgres, RabbitMQ, the backend (`:8080`), and the frontend (`:3000`)
together. Copy `backend/.env.example` to `backend/.env.local` first and fill in
`JWT_SECRET` (required, 32+ chars) and SMTP credentials if you want real emails to send;
everything else has a working default for local use.

**Running backend and frontend separately** (useful while developing):

1. Start Postgres and RabbitMQ (`docker compose up postgres rabbitmq`, or your own
   local instances).
2. Backend: `cd backend && ./mvnw spring-boot:run` (see `backend/README.md` for env vars).
3. Frontend: `cd frontend && npm install && npm run dev`, then open `http://localhost:3000`.

## Current scope

**Implemented:** full CRUD for cattle, milk production, veterinary records, finance,
inventory, and workers; JWT auth with OTP email verification; Google OAuth2 login;
farm-scoped multi-tenancy with an invite-to-join flow (invite emails sent
asynchronously via RabbitMQ); role-based access (`FARM_OWNER` / `WORKER` / `BRANCH`).

**Deliberately out of scope for now:** a non-relational database alongside PostgreSQL.

See the "Project Checklist" section of the mid-term report for the detailed,
item-by-item status against the course rubric.
