# 3D6 Encounter Generator

Monorepo containing the backend (NestJS) and frontend (React + Vite) for the 3D6 Encounter Generator.

## Structure

```
3d6/
├── backend/          # NestJS REST API
├── frontend/         # React + Vite UI
└── package.json      # Monorepo root with workspaces
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker (for PostgreSQL database)

## Getting Started

### 1. Install all dependencies

From the root directory:

```bash
npm install
```

This will install dependencies for both backend and frontend workspaces.

### 2. Start the database

```bash
cd backend
docker-compose up -d
```

### 3. Run development servers

From the root directory:

```bash
# Start both backend and frontend
npm run dev

# Or start them individually:
npm run dev:backend    # Backend on http://localhost:3000
npm run dev:frontend   # Frontend on http://localhost:5173
```

## Available Scripts

### Development

- `npm run dev` - Start both backend and frontend in dev mode
- `npm run dev:backend` - Start only backend (watch mode)
- `npm run dev:frontend` - Start only frontend (Vite dev server)

### Build

- `npm run build` - Build both projects
- `npm run build:backend` - Build backend only
- `npm run build:frontend` - Build frontend only

### Production

- `npm run start:backend` - Run backend in production mode
- `npm run start:frontend` - Preview frontend production build

### Testing & Quality

- `npm run lint` - Lint both projects
- `npm run test` - Run backend unit tests
- `npm run test:e2e` - Run backend e2e tests

### Utilities

- `npm run clean` - Clean all node_modules

## Backend (NestJS)

API runs on `http://localhost:3000`

- Swagger docs: `http://localhost:3000/api`
- Database: PostgreSQL (via Docker Compose)

See [backend/README.md](backend/README.md) for more details.

## Frontend (React + Vite)

UI runs on `http://localhost:5173`

- Modern React with TypeScript
- Vite for fast HMR
- Light/Dark theme support
- PT-BR/EN language toggle

See [frontend/README.md](frontend/README.md) for more details.

## Tech Stack

### Backend
- NestJS
- TypeScript
- PostgreSQL + TypeORM
- Swagger/OpenAPI
- Docker

### Frontend
- React 19
- TypeScript
- Vite
- CSS Variables (theming)

## Development Workflow

1. Make sure Docker is running and the database is up
2. Run `npm run dev` from root
3. Backend will be on `:3000`, frontend on `:5173`
4. Frontend proxies API requests to backend automatically

## Contributing

When adding dependencies:

```bash
# Backend dependency
npm install <package> --workspace=backend

# Frontend dependency
npm install <package> --workspace=frontend

# Root dev dependency
npm install <package> -D
```
