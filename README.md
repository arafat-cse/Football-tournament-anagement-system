# TournamentPro

Full-stack football tournament management platform built with Next.js App Router, TypeScript, Tailwind CSS, Strapi 5 and MySQL.

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
- MySQL `8+` or MariaDB compatible server
- Git Bash, PowerShell, or Windows Terminal

## Environment Files

Copy examples:

PowerShell:

```powershell
Copy-Item client/.env.example client/.env
Copy-Item server/.env.example server/.env
```

MySQL settings live in `server/.env`:

```env
DATABASE_CLIENT=mysql
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_NAME=tournament_manager
DATABASE_USERNAME=root
DATABASE_PASSWORD=
DATABASE_SSL=false
```

Frontend API settings live in `client/.env`:

```env
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
STRAPI_BASE_URL=http://localhost:1337
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRAPI_API_TOKEN=
```

`STRAPI_API_TOKEN` is optional only if you enable Public permissions in Strapi. For local development, the easiest reliable setup is:

1. Open Strapi Admin: `http://localhost:1337/admin`
2. Go to **Settings -> API Tokens**
3. Create a token with **Full access** for local development
4. Put it in `client/.env`:

```env
STRAPI_API_TOKEN=your_token_here
```

5. Restart Next.js:

```powershell
cd client
npm run dev
```

Without this token or public permissions, player registration may show an API permission error and data will not save.

## MySQL Database Create Command

Create the MySQL database before starting Strapi.

First check MySQL is running:

```powershell
mysqladmin -u root ping
```

If it cannot connect, start MySQL from Windows Services:

```powershell
services.msc
```

Find a service like `MySQL80`, `MySQL`, `MariaDB`, or `mariadb`, then click **Start**.

You can also try PowerShell:

```powershell
Get-Service *mysql*
Start-Service MySQL80
```

Use your actual service name from `Get-Service *mysql*`.

Option 1: using MySQL CLI without password:

```powershell
mysql -u root -e "CREATE DATABASE IF NOT EXISTS tournament_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Option 2: using MySQL CLI with password:

```powershell
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS tournament_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Option 3: open MySQL shell manually:

```sql
CREATE DATABASE IF NOT EXISTS tournament_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

If you want a fresh local database:

```powershell
mysql -u root -e "DROP DATABASE IF EXISTS tournament_manager; CREATE DATABASE tournament_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
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

Make sure MySQL driver is installed in the server app:

```powershell
cd server
npm install mysql2
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

mysql -u root -e "CREATE DATABASE IF NOT EXISTS tournament_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

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

This means Strapi is using MySQL but the MySQL driver is missing. Install it:

```powershell
cd server
npm install mysql2
```

Then make sure `server/.env` uses MySQL:

```env
DATABASE_CLIENT=mysql
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_NAME=tournament_manager
DATABASE_USERNAME=root
DATABASE_PASSWORD=
DATABASE_SSL=false
```

Then run:

```powershell
cd server
yarn develop
```

### Error: `connect ECONNREFUSED 127.0.0.1:3306`

This means Strapi cannot connect to MySQL. Usually MySQL is not running.

Check:

```powershell
mysqladmin -u root ping
```

Start MySQL:

```powershell
Get-Service *mysql*
Start-Service MySQL80
```

Then create the database if needed:

```powershell
mysql -u root -e "CREATE DATABASE IF NOT EXISTS tournament_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Run backend again:

```powershell
cd server
yarn develop
```

### Error: password authentication failed

Your `server/.env` password does not match your MySQL user password. Change this line:

```env
DATABASE_PASSWORD=your_actual_mysql_password
```

## Dynamic Data

All tournament, team, registration, player, auction and dashboard data is loaded from Strapi. The app no longer creates demo records on backend bootstrap and the frontend does not keep local sample data.

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
