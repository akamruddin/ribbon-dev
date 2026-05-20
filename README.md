# Ribbon Developer Community

React + Vite frontend for the Ribbon Developer Community portal — forum, on-demand sandbox, docs, and code exchange.

## Running locally

**Prerequisites:** Node 18+, Docker Desktop

```bash
# 1. Start Postgres + Redis
docker compose up -d

# 2. Install frontend dependencies (already done if you cloned)
npm install

# 3. Copy env file
cp .env.example .env.local

# 4. Start dev server → http://localhost:5173
npm run dev
```

## Backend (Sprint 2)

```bash
cd backend
cp .env.example .env
npm install
npm run dev   # → :8000
```

The frontend proxies `/api/*` to `http://localhost:8000` via Vite config.

## Project structure

```
src/
  tokens.css              Ribbon design tokens (colors, typography, spacing)
  components/
    layout/               TopBar, NavBar, AppLayout
    ui/                   PillButton, Badge, Tag, Avatar, StatusChip, CodeBlock
    forum/                ForumHero, ForumSidebar, ThreadList, ThreadCard,
                          ThreadDetail, ForumAside, ReplyBox
    sandbox/              SessionHero, IdleWarning, BootingView, StageRow,
                          ReadyView, TopologyDiagram, DeviceTable,
                          NodeInfoCard, ConsoleModal
  pages/                  ForumPage, SandboxPage, PlaceholderPage
  store/                  useForumStore, useSandboxStore (Zustand)
  data/                   threads, devices, categories, bootStages (seed)
  api/                    forum.js, sandbox.js (Sprint 1: mock stubs)
backend/
  src/
    routes/               auth, forum, sandbox (Sprint 2/3: real implementations)
    middleware/           JWT auth
    db/                   Postgres pool
docker-compose.yml        Postgres 16 + Redis 7
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server on :5173 with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run test` | Vitest unit test run |
| `npm run test:watch` | Vitest watch mode |

## Sprint status

| Sprint | Status | Deliverable |
|---|---|---|
| Sprint 0 | ✅ Complete | Interactive HTML mockup |
| Sprint 1 | ✅ Complete | This scaffold — React app, all components, mock data |
| Sprint 2 | 🔜 Next | Auth, forum CRUD, reservation service backed by Postgres |
| Sprint 3 | 🔜 Planned | GNS3 + EC2 provisioning, real sandbox lifecycle |

## Design tokens

All Ribbon brand values are in [`src/tokens.css`](src/tokens.css).  
Primary: `#7D00B9` · Font: Roboto · Button radius: 50px pill
