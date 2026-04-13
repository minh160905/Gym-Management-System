# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Application: Gym Management System

A full-stack gym management platform called "Iron & Forge" with four user roles.

### Artifacts

- **gym-management** — React + Vite frontend at `/` (port 24596)
- **api-server** — Express 5 backend at `/api` (port 8080)

### User Roles

1. **Gym Owner** — Full analytics, revenue, members, staff, memberships
2. **Manager** — Daily operations: members, classes, attendance
3. **Personal Trainer** — Client sessions, workout plans, client list
4. **Customer** — Class browsing/booking, membership info

### Key Pages

- `/` — Role selector landing
- `/owner/dashboard`, `/owner/members`, `/owner/staff`, `/owner/memberships`, `/owner/analytics`
- `/manager/dashboard`, `/manager/members`, `/manager/classes`, `/manager/attendance`
- `/trainer/dashboard`, `/trainer/sessions`, `/trainer/workouts`, `/trainer/clients`
- `/customer/dashboard`, `/customer/classes`, `/customer/bookings`, `/customer/membership`

### Database Schema (PostgreSQL)

Tables:
- `membership_plans` — gym membership plans
- `members` — gym members
- `staff` — staff (managers, trainers, receptionists)
- `classes` — fitness classes with schedule
- `bookings` — member class bookings
- `pt_sessions` — personal training sessions
- `workout_plans` — trainer-created workout plans
- `attendance` — member check-in/check-out records

### API Routes

All routes under `/api/`:
- `/members`, `/memberships`, `/staff`, `/classes`
- `/bookings`, `/sessions`, `/workouts`, `/attendance`
- `/analytics/dashboard`, `/analytics/revenue`, `/analytics/class-popularity`
- `/analytics/trainer-performance`, `/analytics/member-retention`

### Design

"Iron & Forge" aesthetic: dark background, electric lime green primary color, professional gym operations feel.
