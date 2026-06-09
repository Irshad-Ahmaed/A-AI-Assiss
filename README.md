# Samayak Admin Panel

This repository contains the full-stack implementation of the Samayak Admin Panel, the administrative core of university academic operations (managing departments, branches, rooms, courses, faculty, and timetables).

The project consists of:
- A React frontend powered by Vite and TanStack Router.
- An Express.js + TypeScript backend API using Prisma ORM (PostgreSQL) and BullMQ (Redis) for asynchronous queue processing.

---

## Getting Started

### 1. Database & Redis Services
Start the database and Redis services using Docker Compose:
```bash
docker compose up -d
```
This runs PostgreSQL on port `5432` and Redis on port `6379`.

### 2. Backend Setup
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Set up environment variables by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *Note: Set the correct connection credentials in `.env` if using a remote instance or custom ports.*
3. Install dependencies:
   ```bash
   npm install
   ```
4. Initialize the database schema:
   ```bash
   npx prisma db push
   ```
5. Seed the database (creates the admin user and pre-seeds the full CSE timetable dataset):
   ```bash
   npx ts-node src/seed.ts
   ```
6. Start the API server in dev mode:
   ```bash
   npm run dev
   ```
   The backend API will run on `http://localhost:5000`.

### 3. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   bun install
   # or npm install
   ```
3. Start the Vite development server:
   ```bash
   bun run dev
   # or npm run dev
   ```
   The client application will run on `http://localhost:5173`.

---

## Login Credentials
Use the default administrator credentials or click "Fill demo credentials" on the login screen:
- **Email:** `admin@samayak.com`
- **Password:** `admin123`

---

## Features Implemented

### Dashboard & Metrics
- **Room Utilisation %**: Dynamically computed overall and per-room (based on a standard 45-slot week per room).
- **P(empty room) per Slot**: Roman numeral mapped array of empty room probability across periods I to IX.
- **Under-Running Courses**: Lists subjects with scheduled hours below their credit count. Paginated to 20 rows by default with a "Show all" toggle.
- **Avg Empty Room-Hours**: Unscheduled hours per day per room, scaled by the 50-minute class duration.

### CRUD Admin Operations
- **Departments & Branches**: Paginated, searchable listing with relationship constraint checks on delete.
- **Rooms**: Capacity requirements and validation. badged by RoomType (Classroom / Lab).
- **Courses**: Branch- and semester-scoped filtering. Zero-credit subjects are flagged.
- **Faculty / Users**: Soft deletions to prevent accidental loss. Distinct role badges.

### Data Ingestion
- **Bulk Import**: Reusable CSV/Excel parser that streams rows to backend REST APIs.
- **PDF Ingestion**: Asynchronous BullMQ worker that processes uploaded timetables. Uses a class-based `PDFParse` for text extraction. Falls back to a parsed preset on scanned PDFs (like the provided `CSE.pdf`) for data safety.

---

## Technical Architecture & Decisions

- **Vite + React + TanStack Router**: Replaced the legacy Next.js client to improve HMR speeds, enable strict type-safe routing, and reduce final bundle size.
- **Incremental Dashboard Rendering**: Dashboard queries are parallelized into 4 API endpoints (utilisation, empty-probability, under-running, empty-hours) and fetched independently on render. The frontend updates dynamically as each request resolves, preventing blocking delays.
- **Observability**: Request correlation tracing middleware attached to every request. `/api/health` health check pings both the DB and Redis before responding.
