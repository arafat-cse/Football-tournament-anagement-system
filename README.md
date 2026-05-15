# TournamentPro

Full-stack football/cricket tournament management platform built with Next.js App Router, TypeScript, Tailwind CSS, Strapi 5 and PostgreSQL.

## What is included

- Public tournament pages: home, tournaments, details, registration, players, teams, team squad and auction results.
- Admin dashboard: overview, tournaments, registrations, payments, auction control and reports.
- Strapi 5 content types: Tournament, Team, Player, Registration, Payment, Auction, Bid, TeamPlayer, Match, Sponsor, Notification and ActionLog.
- Business rules in backend controllers:
  - only approved players enter auction,
  - payment-required tournaments can only approve paid players,
  - teams cannot bid or buy beyond remaining budget,
  - a player cannot be assigned to more than one team in the same tournament unless an admin override is used,
  - important actions write to ActionLog.
- Export endpoints for player PDF, squad PDF, registration Excel-compatible `.xls`, and payment Excel-compatible `.xls`.
- Demo fallback data in the frontend and demo seed creation in Strapi bootstrap.

## Local Setup Guide

Requirements:

- Node.js `18` to `22`
- npm and Yarn
- PostgreSQL `14+`
- Git Bash, PowerShell, or Windows Terminal

## Environment Files

Copy examples:

PowerShell:

```powershell
Copy-Item client/.env.example client/.env
Copy-Item server/.env.example server/.env
```

PostgreSQL settings live in `server/.env`:

```env
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=tournament_manager
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_SCHEMA=public
DATABASE_SSL=false
```

Frontend API settings live in `client/.env`:

```env
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
STRAPI_BASE_URL=http://localhost:1337
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Create Command

Create the PostgreSQL database before starting Strapi.

First check PostgreSQL is running:

```powershell
pg_isready -h 127.0.0.1 -p 5432
```

If it says `no response`, start PostgreSQL from Windows Services:

```powershell
services.msc
```

Find a service like `postgresql-x64-16`, `postgresql-x64-15`, or `postgresql-x64-14`, then click **Start**.

You can also try PowerShell:

```powershell
Get-Service *postgres*
Start-Service postgresql-x64-16
```

Use your actual service name from `Get-Service *postgres*`.

Option 1: using `psql`:

```powershell
psql -U postgres -c "CREATE DATABASE tournament_manager;"
```

If your PostgreSQL password is requested, enter the password from `server/.env`:

```env
DATABASE_PASSWORD=postgres
```

Option 2: open PostgreSQL shell manually:

```sql
CREATE DATABASE tournament_manager;
```

Option 3: with `createdb`:

```powershell
createdb -U postgres tournament_manager
```

If the database already exists and you want a fresh local database:

```powershell
psql -U postgres -c "DROP DATABASE IF EXISTS tournament_manager;"
psql -U postgres -c "CREATE DATABASE tournament_manager;"
```

Do not run the drop command on production data.

## Install Dependencies

Install the frontend:

```powershell
cd client
npm install
```

Install the backend:

```powershell
cd ../server
yarn install
```

If Yarn is slow or blocked, use npm in the server folder:

```powershell
cd server
npm install
```

Make sure PostgreSQL driver is installed in the server app:

```powershell
cd server
npm install pg
```

## Run Project

Run backend first:

```powershell
cd server
yarn develop
```

Alternative backend command with npm:

```powershell
cd server
npm run develop
```

Then run frontend in a second terminal:

```powershell
cd client
npm run dev
```

Open:

- Frontend: `http://localhost:3000`
- Strapi Admin: `http://localhost:1337/admin`

First time Strapi starts, open `http://localhost:1337/admin` and create the first Super Admin account.

## Full Setup From Fresh Clone

```powershell
cd D:\MY-WORK\Football-tournament-anagement-system

Copy-Item client/.env.example client/.env
Copy-Item server/.env.example server/.env

psql -U postgres -c "CREATE DATABASE tournament_manager;"

cd client
npm install

cd ../server
yarn install
yarn develop
```

Open another terminal:

```powershell
cd D:\MY-WORK\Football-tournament-anagement-system\client
npm run dev
```

## Common Backend Errors

### Error: Cannot find module `mysql2`

This means `server/.env` is set to MySQL. For this project, use PostgreSQL:

```env
DATABASE_CLIENT=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=tournament_manager
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_SCHEMA=public
DATABASE_SSL=false
```

Then run:

```powershell
cd server
yarn develop
```

### Error: `connect ECONNREFUSED 127.0.0.1:5432`

This means Strapi cannot connect to PostgreSQL. Usually PostgreSQL is not running.

Check:

```powershell
pg_isready -h 127.0.0.1 -p 5432
```

Start PostgreSQL:

```powershell
Get-Service *postgres*
Start-Service postgresql-x64-16
```

Then create the database if needed:

```powershell
psql -U postgres -c "CREATE DATABASE tournament_manager;"
```

Run backend again:

```powershell
cd server
yarn develop
```

### Error: password authentication failed

Your `server/.env` password does not match your PostgreSQL `postgres` user password. Change this line:

```env
DATABASE_PASSWORD=your_actual_postgres_password
```

## Seed/Demo Data

The backend bootstrap creates a demo tournament, teams, registrations, payments, players and auction data unless this env value is set:

```env
SEED_DEMO_DATA=false
```

To allow demo data, keep it unset or set:

```env
SEED_DEMO_DATA=true
```

The frontend also has fallback demo data, so public pages can load even before Strapi is fully connected.

## API Notes

Core Strapi REST endpoints are created for every content type under `/api/*`.

Custom backend endpoints:

- `POST /api/registrations/:id/approve`
- `POST /api/registrations/:id/reject`
- `POST /api/auctions/:id/bid`
- `POST /api/auctions/:id/finalize-sale`
- `POST /api/auctions/:id/mark-unsold`
- `GET /api/reports/players.pdf`
- `GET /api/reports/team-squad.pdf`
- `GET /api/reports/registrations.xlsx`
- `GET /api/reports/payments.xlsx`

Frontend local export endpoints:

- `/api/exports/players`
- `/api/exports/team-squad`
- `/api/exports/registrations`
- `/api/exports/payments`

## Roles

Use Strapi Users & Permissions for authentication and RBAC. Suggested roles:

- Super Admin
- Tournament Admin
- Team Owner/Manager
- Player
- Public Visitor

Grant public read permissions for public tournament data, and restrict registration approval, payment updates, auction finalization and report exports to admin/manager roles.

## Verification

Frontend build:

```bash
cd client
npm run build
```

Backend build:

```bash
cd server
yarn build
```
