# CreativeForge AI Studio

A production-grade multimodal AI creative platform built with React 19, Vite 8, TypeScript, FastAPI, and Python 3.13. Features 20 AI-powered creative tools unified under a dark-themed dashboard with real-time workflows, node-based pipeline building, and dual mock/production execution modes.

**Live URL**: http://localhost:3000 (frontend) | http://localhost:5000 (API)

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Monorepo Structure](#monorepo-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Running the Project](#running-the-project)
  - [Build for Production](#build-for-production)
- [Frontend](#frontend)
  - [Application Routes](#application-routes)
  - [State Management (Zustand Stores)](#state-management-zustand-stores)
  - [UI Component Library](#ui-component-library)
  - [Responsive Design](#responsive-design)
- [Backend](#backend)
  - [Mock Mode vs Production Mode](#mock-mode-vs-production-mode)
  - [API Endpoints](#api-endpoints)
  - [Data Flow](#data-flow)
  - [Database Schema](#database-schema)
- [Features (1–20)](#features-120)
  - [Feature 1: Creative Memory Engine (RAG)](#feature-1-creative-memory-engine-rag)
  - [Feature 2: AI Creative Director](#feature-2-ai-creative-director)
  - [Feature 3: Live Canvas](#feature-3-live-canvas)
  - [Feature 4: AI World Engine](#feature-4-ai-world-engine)
  - [Feature 5: Emotional AI Generation](#feature-5-emotional-ai-generation)
  - [Feature 6: AI Style Genome System](#feature-6-ai-style-genome-system)
  - [Feature 7: AI Render Preview](#feature-7-ai-render-preview)
  - [Feature 8: AI Asset Management](#feature-8-ai-asset-management)
  - [Feature 9: AI Prompt-to-Product](#feature-9-ai-prompt-to-product)
  - [Feature 10: AI Multi-Modal Fusion](#feature-10-ai-multi-modal-fusion)
  - [Feature 11: Cinematic AI Director](#feature-11-cinematic-ai-director)
  - [Feature 12: AI Knowledge Graph](#feature-12-ai-knowledge-graph)
  - [Feature 13: Generative UI](#feature-13-generative-ui)
  - [Feature 14: AI Marketplace Ecosystem](#feature-14-ai-marketplace-ecosystem)
  - [Feature 15: AI Timeline & Versioning](#feature-15-ai-timeline--versioning)
  - [Feature 16: Voice-Driven Creation](#feature-16-voice-driven-creation)
  - [Feature 17: Real-Time Collaborative AI Studio](#feature-17-real-time-collaborative-ai-studio)
  - [Feature 18: Personal AI Creative Twin](#feature-18-personal-ai-creative-twin)
  - [Feature 19: AI Research & Inspiration Engine](#feature-19-ai-research--inspiration-engine)
  - [Feature 20: Future-Ready Expansions](#feature-20-future-ready-expansions)
- [Visual Node Workflow System](#visual-node-workflow-system)
- [Deployment](#deployment)
- [Future Roadmap](#future-roadmap)

---

## Architecture Overview

```
┌─────────────────┐     REST/WebSocket     ┌─────────────────┐
│   Web Frontend  │ ◄───────────────────► │  FastAPI Backend │
│  (React 19/Vite)│                       │  (Python 3.13)  │
└─────────────────┘                       └─────────────────┘
                                                   │
                                          Enqueue Tasks
                                                   ▼
                                          ┌─────────────────┐
                                          │  Redis Queue    │
                                          │  (Celery/RQ)    │
                                          └─────────────────┘
                                                   │
                                          Pick up Tasks
                                                   ▼
                                          ┌─────────────────┐
                                          │ Inference Workers│
                                          │ (apps/workers)  │
                                          └─────────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │  AI Models      │
                                          │ (GPT-2/Mistral/ │
                                          │  SDXL/Flux)     │
                                          └─────────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │ PostgreSQL DB   │
                                          │ + S3/Local Store│
                                          └─────────────────┘
```

**Core Principles:**
- **Monorepo architecture** for shared code reuse and unified versioning
- **Layered backend** with clear separation (routers → services → repositories)
- **GPU-ready worker pool** for async AI inference
- **Dual-mode execution**: CPU mock for development, GPU production for real inference
- **Premium dark-themed UX** with glassmorphism, inspired by RunwayML/Leonardo AI

---

## Monorepo Structure

```
CreativeForge/
├── apps/
│   ├── web/                  # React 19 + Vite 8 + TypeScript frontend
│   │   ├── src/
│   │   │   ├── App.tsx              # BrowserRouter + Routes + lazy loading
│   │   │   ├── main.tsx             # React 19 root entry (StrictMode)
│   │   │   ├── index.css            # Dark theme + keyframe animations
│   │   │   ├── components/
│   │   │   │   ├── ui/              # Shared UI component library (inline styles)
│   │   │   │   │   ├── index.tsx    # Button, Card, Badge, Input, TextArea, Select, etc.
│   │   │   │   │   ├── Toast.tsx           # Toast notification system
│   │   │   │   │   ├── CommandPalette.tsx   # ⌘K fuzzy search command palette
│   │   │   │   │   └── ErrorBoundary.tsx    # React error boundary
│   │   │   │   ├── layout/
│   │   │   │   │   ├── DashboardLayout.tsx  # Responsive layout wrapper
│   │   │   │   │   ├── Sidebar.tsx          # Collapsible nav (240px/64px)
│   │   │   │   │   └── TopBar.tsx           # Search, mock indicator, user avatar
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── DashboardHome.tsx    # Stats cards + feature grid
│   │   │   │   ├── world-engine/    # Feature 4
│   │   │   │   ├── emotion-ai/      # Feature 5
│   │   │   │   ├── style-genome/    # Feature 6
│   │   │   │   ├── render-preview/  # Feature 7
│   │   │   │   ├── asset-management/ # Feature 8
│   │   │   │   ├── prompt-to-product/ # Feature 9
│   │   │   │   ├── multi-modal-fusion/ # Feature 10
│   │   │   │   ├── cinematic-ai/    # Feature 11
│   │   │   │   ├── knowledge-graph/ # Feature 12
│   │   │   │   ├── generative-ui/   # Feature 13
│   │   │   │   ├── marketplace/     # Feature 14
│   │   │   │   ├── timeline-versioning/ # Feature 15
│   │   │   │   ├── voice-driven/    # Feature 16
│   │   │   │   ├── collaborative-studio/ # Feature 17
│   │   │   │   ├── creative-twin/   # Feature 18
│   │   │   │   ├── research-inspiration/ # Feature 19
│   │   │   │   ├── future-ready/    # Feature 20
│   │   │   │   └── visual-node/     # Workflow canvas (ReactFlow)
│   │   │   └── stores/              # Zustand state management
│   │   │       ├── authStore.ts
│   │   │       ├── uiStore.ts
│   │   │       ├── generationStore.ts
│   │   │       ├── notificationStore.ts
│   │   │       └── canvasStore.ts
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── api/                  # FastAPI + Python 3.13 backend
│   │   ├── main.py                  # Production entry (with DB init)
│   │   ├── main_mock.py             # Mock entry (no DB required)
│   │   ├── database.py             # SQLModel engine + session factory
│   │   ├── models/                 # SQLModel table definitions
│   │   │   ├── creative_memory.py   # Feature 1 (pgvector embeddings)
│   │   │   ├── user_style_dna.py    # Feature 1 (style preferences)
│   │   │   ├── emotion_ai.py        # Feature 5
│   │   │   ├── style_genome.py      # Feature 6
│   │   │   ├── render_preview.py    # Feature 7
│   │   │   ├── asset_management.py  # Feature 8
│   │   │   ├── prompt_to_product.py # Feature 9
│   │   │   ├── multi_modal_fusion.py # Feature 10
│   │   │   ├── cinematic_ai.py      # Feature 11
│   │   │   ├── knowledge_graph.py   # Feature 12
│   │   │   ├── generative_ui.py     # Feature 13
│   │   │   ├── marketplace.py       # Feature 14
│   │   │   ├── timeline_versioning.py # Feature 15
│   │   │   ├── voice_driven.py      # Feature 16
│   │   │   ├── collaborative_studio.py # Feature 17
│   │   │   ├── creative_twin.py     # Feature 18
│   │   │   ├── research_inspiration.py # Feature 19
│   │   │   ├── future_ready.py      # Feature 20
│   │   │   ├── world_engine.py      # Feature 4
│   │   │   ├── generation.py        # Core generation table
│   │   │   ├── visual_node.py       # Workflow node tables
│   │   │   ├── co_creation.py       # Co-creation tables
│   │   │   ├── multi_agent.py       # Multi-agent tables
│   │   │   ├── os_core.py           # OS core tables
│   │   │   ├── cinematic.py         # Cinematic base tables
│   │   │   └── relationships.py     # Relationship mapper
│   │   ├── routers/                # FastAPI route handlers
│   │   │   ├── generations.py       # POST /generations/ (core generation)
│   │   │   ├── style_genome.py      # Feature 6 endpoints
│   │   │   ├── render_preview.py    # Feature 7 endpoints
│   │   │   ├── asset_management.py  # Feature 8 endpoints
│   │   │   ├── prompt_to_product.py # Feature 9 endpoints
│   │   │   ├── multi_modal_fusion.py # Feature 10 endpoints
│   │   │   ├── cinematic_ai.py      # Feature 11 endpoints
│   │   │   ├── knowledge_graph.py   # Feature 12 endpoints
│   │   │   ├── generative_ui.py     # Feature 13 endpoints
│   │   │   ├── marketplace.py       # Feature 14 endpoints
│   │   │   ├── timeline_versioning.py # Feature 15 endpoints
│   │   │   ├── voice_driven.py      # Feature 16 endpoints
│   │   │   ├── collaborative_studio.py # Feature 17 endpoints
│   │   │   ├── creative_twin.py     # Feature 18 endpoints
│   │   │   ├── research_inspiration.py # Feature 19 endpoints
│   │   │   ├── future_ready.py      # Feature 20 endpoints
│   │   │   ├── world_engine.py      # Feature 4 endpoints
│   │   │   ├── emotion_ai.py        # Feature 5 endpoints
│   │   │   ├── visual_node.py       # Workflow endpoints
│   │   │   ├── co_creation.py       # Co-creation endpoints
│   │   │   ├── multi_agent.py       # Multi-agent endpoints
│   │   │   ├── os_core.py           # OS core endpoints
│   │   │   └── relationships.py     # Relationship endpoints
│   │   └── services/               # Business logic layer
│   │       ├── rag_service.py              # Feature 1 (RAG pipeline)
│   │       ├── creative_director_agent.py  # Feature 2 (AI agent)
│   │       ├── emotion_service.py          # Feature 5
│   │       ├── style_genome_service.py     # Feature 6
│   │       ├── render_preview_service.py   # Feature 7
│   │       ├── asset_management_service.py # Feature 8
│   │       ├── prompt_to_product_service.py # Feature 9
│   │       ├── multi_modal_fusion_service.py # Feature 10
│   │       ├── cinematic_ai_service.py     # Feature 11
│   │       ├── knowledge_graph_service.py  # Feature 12
│   │       ├── generative_ui_service.py    # Feature 13
│   │       ├── marketplace_service.py      # Feature 14
│   │       ├── timeline_versioning_service.py # Feature 15
│   │       ├── voice_driven_service.py     # Feature 16
│   │       ├── collaborative_studio_service.py # Feature 17
│   │       ├── creative_twin_service.py    # Feature 18
│   │       ├── research_inspiration_service.py # Feature 19
│   │       ├── future_ready_service.py     # Feature 20
│   │       ├── world_engine_service.py     # Feature 4
│   │       ├── visual_node_service.py      # Workflow service
│   │       ├── co_creation_service.py      # Co-creation service
│   │       ├── multi_agent_service.py      # Multi-agent service
│   │       ├── os_core_service.py          # OS core service
│   │       ├── relationship_mapper.py      # Relationship mapping
│   │       ├── prompt_utils.py             # Shared prompt utilities
│   │       ├── shared_embedding_service.py # Shared embedding logic
│   │       └── shared_memory_service.py    # Shared memory logic
│   │
│   └── workers/                # Async GPU inference workers (Celery/RQ)
│
├── packages/                   # Shared packages (SDK, types)
├── docs/
│   ├── architecture/           # System design docs
│   │   ├── 01-architectural-blueprint.md
│   │   ├── 02-production-folder-structure.md
│   │   ├── 03-step-by-step-refactor-plan.md
│   │   ├── 04-modern-ui-component-plan.md
│   │   ├── 05-database-schema-design.md
│   │   └── 06-future-roadmap.md
│   ├── api/                    # API design docs
│   │   └── 01-api-design.md
│   └── deployment/             # Deployment docs
│       ├── 01-deployment-strategy.md
│       ├── 02-docker-setup.md
│       └── 03-ci-cd-pipeline.md
├── infrastructure/
│   ├── docker/                 # Docker Compose files
│   ├── kubernetes/             # K8s manifests
│   ├── nginx/                  # NGINX reverse proxy config
│   └── terraform/              # Infrastructure as Code
├── scripts/                    # Utility scripts
├── tests/                      # Test suites
├── package.json                # Root workspace config
└── README.md                   # This file
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 19.x |
| Frontend | Vite | 8.x |
| Frontend | TypeScript | 5.6.x |
| Frontend | Zustand | 5.x (state management) |
| Frontend | ReactFlow | 11.x (node workflows) |
| Frontend | React Router | 7.x (routing) |
| Frontend | Three.js / Pixi.js | 3D rendering |
| Frontend | Framer Motion | 12.x (animations) |
| Backend | FastAPI | Latest |
| Backend | Python | 3.13 |
| Backend | SQLModel | (SQLAlchemy + Pydantic) |
| Backend | Uvicorn | ASGI server |
| Database | PostgreSQL | 15+ |
| Database | pgvector | Vector similarity search |
| Queue | Redis | Task queue (Celery/RQ) |
| Auth | JWT | Bearer token auth |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.13+
- **PostgreSQL** 15+ (optional — mock mode works without it)
- **Redis** (optional — mock mode works without it)

### Running the Project

The project runs in **mock mode** by default — no database or Redis required.

**1. Install dependencies (first time only):**

```bash
# From the project root
cd "/mnt/d/all files/Project/CreativeForge"

# Install root-level dependencies (hoists to root node_modules)
npm install --legacy-peer-deps

# Install frontend dependencies
cd apps/web && npm install --legacy-peer-deps
```

**2. Start the backend (mock mode):**

```bash
cd "/mnt/d/all files/Project/CreativeForge/apps/api"
python3 main_mock.py
```

The API will start on `http://localhost:5000`. This loads 16 feature routers with in-memory mock data — no PostgreSQL needed.

**3. Start the frontend (new terminal):**

```bash
cd "/mnt/d/all files/Project/CreativeForge"
npx vite apps/web --port 3000 --host 0.0.0.0
```

The dashboard will be available at `http://localhost:3000`.

**4. Verify both are running:**

```bash
# Check backend
curl -s http://localhost:5000/generations/ -X POST \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A beautiful sunset", "user_id": "mock_user_123"}' | python3 -m json.tool

# Check frontend
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
```

### Build for Production

```bash
# Build frontend
cd apps/web && npx vite build

# Build all workspaces
npm run build --workspaces
```

---

## Frontend

### Application Routes

The frontend uses **React Router v7** with lazy-loaded routes for optimal performance. All routes are wrapped in `DashboardLayout` (sidebar + topbar) and `ErrorBoundary`.

| Route | Feature | Component |
|-------|---------|-----------|
| `/` | Dashboard Home | `DashboardHome` (stats + feature grid) |
| `/generations` | Dashboard Home | `DashboardHome` (alias) |
| `/workflow` | Visual Workflow | `WorkflowCanvas` (ReactFlow) |
| `/world-engine` | World Engine | `WorldDashboard` |
| `/emotion-ai` | Emotion AI | `EmotionSliders` |
| `/style-genome` | Style Genome | `StyleGenomeDashboard` |
| `/render-preview` | Render Preview | `RenderPreview` |
| `/asset-management` | Asset Management | `AssetManagement` |
| `/prompt-to-product` | Prompt → Product | `PromptToProduct` |
| `/multi-modal` | Multi-Modal Fusion | `MultiModalFusion` |
| `/cinematic-ai` | Cinematic AI | `CinematicAI` |
| `/knowledge-graph` | Knowledge Graph | `KnowledgeGraph` |
| `/generative-ui` | Generative UI | `GenerativeUI` |
| `/marketplace` | Marketplace | `Marketplace` |
| `/timeline` | Timeline & Versioning | `TimelineVersioning` |
| `/voice-driven` | Voice Creation | `VoiceDriven` |
| `/collaboration` | Collab Studio | `CollaborativeStudio` |
| `/creative-twin` | AI Creative Twin | `CreativeTwin` |
| `/research` | Research Engine | `ResearchInspiration` |
| `/future` | Future Features | `FutureReady` |

### State Management (Zustand Stores)

Four Zustand stores manage global state:

**`authStore`** — User authentication state
- `user`: User object (id, name, email, role)
- `token`: JWT token
- `isAuthenticated`: Boolean
- `login(user, token)` / `logout()`
- Pre-configured with mock user: `Shawon Admin` (admin role)

**`uiStore`** — UI state
- `sidebarCollapsed`: Sidebar collapsed state
- `sidebarOpen`: Mobile sidebar visibility
- `activeSection`: Current nav section
- `darkMode`: Theme toggle

**`generationStore`** — AI generation history
- `generations[]`: Array of generation records (id, prompt, result, status, createdAt)
- `activeJob`: Currently running job
- `addGeneration()`, `updateGeneration()`, `setActiveJob()`, `clearGenerations()`

**`notificationStore`** — Toast notifications
- `toasts[]`: Array of toast objects (id, type, message)
- `unreadCount`: Unread notification count
- `addToast()`, `removeToast()`, `clearToasts()`

**`canvasStore`** — Canvas/workflow state
- Nodes and edges for ReactFlow canvas

### UI Component Library

All components use **inline styles** (no Tailwind CSS — Tailwind is NOT configured). Located at `apps/web/src/components/ui/index.tsx`:

| Component | Props | Description |
|-----------|-------|-------------|
| `Button` | variant (primary/secondary/ghost/danger), size (sm/md/lg), loading | Action button with variants |
| `Card` | padding (sm/md/lg), hover, onClick | Container with hover border effect |
| `Badge` | variant (success/warning/error/info/neutral/new/beta), size | Status indicator pill |
| `Input` | label, error | Dark-themed text input with focus ring |
| `TextArea` | label | Dark-themed textarea |
| `Select` | label, options[] | Dark-themed dropdown |
| `Skeleton` | width, height, borderRadius | Shimmer loading placeholder |
| `StatCard` | title, value, icon, color, subtitle | Dashboard statistics card |
| `EmptyState` | icon, title, description, action | Empty state placeholder |
| `PageHeader` | title, subtitle, badge, actions, onBack | Page header with back button |
| `Table` | columns[], data[], keyExtractor | Dark-themed data table |
| `Tabs` | tabs[], activeTab, onChange | Tab bar with active indicator |
| `ProgressBar` | value, label, color | Animated progress bar |
| `Modal` | isOpen, onClose, title, children | Overlay modal with backdrop blur |
| `Spinner` | size | Loading spinner |
| `Tooltip` | content, children | Hover tooltip |
| `Divider` | style | Horizontal rule |

Additional standalone components:
- **`ToastContainer`** — Fixed bottom-right toast notifications, auto-dismiss 4s
- **`CommandPalette`** — ⌘K keyboard-navigable fuzzy search across all features/actions
- **`ErrorBoundary`** — React error boundary with dark-themed fallback and recovery

### Responsive Design

Three breakpoints with mobile-first approach:

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | < 768px | Sidebar hidden, floating ☰ button, 16px padding, 1-col grid |
| Tablet | 768–1024px | Sidebar visible, 20px padding, 2-col grid |
| Desktop | 1024px+ | Sidebar visible, 24px padding, 3–4 col grid |

**Design tokens:**
- Primary bg: `#0a0a0f`
- Secondary bg: `#12121a`
- Tertiary bg: `#1a1a25`
- Accent: `#6366f1` (indigo), `#8b5cf6` (violet)
- Glass borders: `rgba(255,255,255,0.08)` default, `rgba(255,255,255,0.15)` hover
- Sidebar: 240px expanded, 64px collapsed
- TopBar: 56px height
- Border radius: 8px cards, 12px modals
- Font: system-ui stack, 13px base

---

## Backend

### Mock Mode vs Production Mode

**Mock Mode** (`main_mock.py`):
- No PostgreSQL, Redis, or GPU required
- All data stored in-memory (Python dicts)
- Auto-progressing job statuses
- 16 feature routers pre-loaded
- Run: `cd apps/api && python3 main_mock.py`

**Production Mode** (`main.py`):
- Full PostgreSQL + pgvector for persistent storage
- Redis queue for async task processing
- GPU worker pool for real AI inference
- JWT authentication middleware
- Run: `cd apps/api && python3 main.py`

### API Endpoints

**Core Generation:**
```
POST /generations/          — Create AI generation (text/image/multi-modal)
```

**Feature 4 — World Engine:**
```
POST /world-engine/worlds/                         — Create world
POST /world-engine/worlds/{id}/characters/         — Add character
GET  /world-engine/worlds/{id}/relationship-graph/ — Get relationship graph
GET  /world-engine/worlds/{id}/validate-continuity/ — Story continuity check
```

**Feature 5 — Emotion AI:**
```
POST /emotion/analyze/      — Analyze prompt emotion
POST /emotion/map-visuals/  — Get visual params for emotion
POST /emotion/generation/    — Attach emotion to generation
```

**Feature 6 — Style Genome:**
```
GET  /style-genome/{user_id} — Get user's style DNA
POST /style-genome/mutate/   — Mutate style
POST /style-genome/evolve/   — Evolve style based on feedback
```

**Feature 7 — Render Preview:**
```
POST /render-preview/jobs/           — Create render job
GET  /render-preview/jobs/{job_id}   — Get job status
GET  /render-preview/jobs/{job_id}/preview/ — Get render preview
```

**Feature 8 — Asset Management:**
```
POST /asset-management/assets/                    — Upload asset
GET  /asset-management/assets/                    — List assets
POST /asset-management/assets/{asset_id}/tags/    — Add tag
POST /asset-management/collections/               — Create collection
POST /asset-management/collections/{id}/assets/   — Add asset to collection
```

**Feature 9 — Prompt-to-Product:**
```
POST /prompt-to-product/templates/          — Create template
POST /prompt-to-product/generate/           — Generate product from prompt
POST /prompt-to-product/products/{id}/iterate/ — Iterate on product
GET  /prompt-to-product/products/           — List user products
```

**Feature 10 — Multi-Modal Fusion:**
```
POST /multi-modal-fusion/jobs/       — Create fusion job
GET  /multi-modal-fusion/jobs/{id}   — Get job status
GET  /multi-modal-fusion/jobs/       — List user jobs
```

**Feature 11 — Cinematic AI:**
```
POST /cinematic-ai/scenes/                — Create scene
GET  /cinematic-ai/scenes/                — List user scenes
PUT  /cinematic-ai/scenes/{id}/status/    — Update scene status
```

**Feature 12 — Knowledge Graph:**
```
POST /knowledge-graph/entities/              — Create entity
POST /knowledge-graph/relations/             — Create relation
POST /knowledge-graph/graphs/                — Create graph
GET  /knowledge-graph/graphs/                — List user graphs
GET  /knowledge-graph/graphs/{id}/entities/  — Get graph entities
GET  /knowledge-graph/entities/{id}/relations/ — Get entity relations
```

**Feature 13 — Generative UI:**
```
POST /generative-ui/uis/                — Create UI
GET  /generative-ui/uis/                — List user UIs
GET  /generative-ui/uis/{id}/components/ — Get UI components
```

**Feature 14 — Marketplace:**
```
POST /marketplace/items/          — Create marketplace item
GET  /marketplace/items/          — List items
POST /marketplace/transactions/   — Purchase item
POST /marketplace/reviews/        — Add review
```

**Feature 15 — Timeline & Versioning:**
```
POST /timeline/events/                  — Create timeline event
POST /timeline/versions/                — Create version record
GET  /timeline/events/                  — Get project timeline
GET  /timeline/events/{id}/versions/    — Get version history
```

**Feature 16 — Voice-Driven Creation:**
```
POST /voice-driven/sessions/       — Create voice session
POST /voice-driven/commands/       — Record voice command
POST /voice-driven/transcripts/    — Create transcript
GET  /voice-driven/sessions/{id}/  — Get session history
```

**Feature 17 — Collaborative Studio:**
```
POST /collaborative-studio/sessions/       — Create session
POST /collaborative-studio/sessions/join/  — Join session
POST /collaborative-studio/updates/        — Record update
GET  /collaborative-studio/sessions/{id}/  — Get session state
```

**Feature 18 — AI Creative Twin:**
```
POST /creative-twin/twins/          — Create twin
POST /creative-twin/learnings/      — Record learning
POST /creative-twin/suggestions/    — Generate suggestion
GET  /creative-twin/twins/{id}/     — Get twin profile
```

**Feature 19 — Research & Inspiration:**
```
POST /research/topics/              — Create research topic
POST /research/papers/              — Add paper to topic
POST /research/inspirations/        — Create inspiration source
GET  /research/topics/{id}/         — Get topic with papers
GET  /research/inspirations/        — Get user inspirations
```

**Feature 20 — Future-Ready:**
```
POST /future-ready/features/              — Create feature entry
POST /future-ready/roadmap/               — Add roadmap item
POST /future-ready/expansion-plans/       — Create expansion plan
GET  /future-ready/features/              — List all features
GET  /future-ready/features/{id}/         — Get feature with roadmap
```

### Data Flow

1. **User Action**: Trigger a feature via the frontend dashboard
2. **API Request**: Frontend sends REST request to FastAPI backend
3. **Service Layer**: Router delegates to service (mock or prod)
4. **Mock Path**: Service returns in-memory data immediately
5. **Prod Path**: Service enqueues task to Redis → Worker picks up → AI model inference → Result saved to DB
6. **Response**: JSON returned to frontend → Zustand store updated → UI re-renders

### Database Schema

**ORM**: SQLModel (combines SQLAlchemy + Pydantic) with PostgreSQL 15+

**Core Tables:**
- `users` — User accounts (UUID PK, username, email, password_hash, role, soft delete)
- `projects` — User projects (name, description, is_public, soft delete)
- `generations` — AI outputs (type, prompt, model, status, result_url, metadata JSON)
- `assets` — Stored files (file_path, file_type, file_size, width/height)
- `prompt_history` — Prompt history per user
- `workflows` — Node-based workflow definitions (nodes JSON, edges JSON)
- `audit_logs` — Action audit trail

**Feature Tables:**
- `user_style_dna` — Style preferences, color palettes, composition tendencies
- `creative_memory` — Vector embeddings (pgvector 384-dim) for RAG retrieval
- `emotion_profiles` — Emotion-to-visual-parameter mappings
- Plus dedicated tables for each feature (worlds, characters, scenes, entities, etc.)

**Key Design Decisions:**
- UUID primary keys (avoid enumeration, distributed-safe)
- Soft deletes via `deleted_at` timestamp on all user-facing tables
- JSON columns for flexible metadata
- Alembic for migration management
- pgvector extension for vector similarity search

---

## Features (1–20)

Every feature follows a consistent 5-layer implementation pattern:
1. **SQLModel tables** — Database schema
2. **Dual mock/prod service** — Business logic with in-memory or DB-backed mode
3. **Router** — FastAPI REST endpoints
4. **Frontend components** — React/TypeScript UI
5. **Mock testing** — Verified via curl against mock backend

---

### Feature 1: Creative Memory Engine (RAG)

Retrieval-Augmented Generation system that stores and retrieves creative context using vector similarity.

**How it works:**
- User prompts and generation results are embedded using `all-MiniLM-L6-v2` (384-dim vectors)
- Embeddings stored in PostgreSQL via `pgvector` extension
- On new generation, similar past memories are retrieved via cosine similarity
- Retrieved context is injected into the generation prompt for personalized results

**Key files:**
- `apps/api/models/creative_memory.py` — CreativeMemory table (pgvector Vector(384))
- `apps/api/models/user_style_dna.py` — UserStyleDNA table
- `apps/api/services/rag_service.py` — Embedding + retrieval pipeline
- `apps/api/services/shared_embedding_service.py` — Shared embedding logic
- `apps/api/services/shared_memory_service.py` — Shared memory operations

**Working flow:**
1. User submits a prompt via `/generations/`
2. RAG service embeds the prompt and queries pgvector for similar past memories
3. Top-K similar memories are injected into the enhanced prompt
4. Generation proceeds with personalized context
5. New result is embedded and stored for future retrieval

---

### Feature 2: AI Creative Director

An agent system that analyzes prompts, detects weaknesses, and suggests improvements.

**How it works:**
- Receives the user's raw prompt
- Runs intent analysis (subject, genre, style detection)
- Detects weak prompts (vague, missing details)
- Generates suggestions: atmosphere, cinematic framing, color grading, camera angles, lighting
- Returns enhanced prompt with all analysis metadata

**Key files:**
- `apps/api/services/creative_director_agent.py` — Main agent with dual mock/prod mode
- `apps/api/services/prompt_utils.py` — Shared `detect_weak_prompt()` and `suggest_prompt_improvements()`

**Working flow:**
1. POST `/generations/` with `{ "prompt": "...", "user_id": "..." }`
2. Agent analyzes intent, detects weaknesses, generates suggestions
3. Enhanced prompt returned in `agent_analysis` field
4. In mock mode: rule-based analysis (no LLM calls)
5. In prod mode: LLM-powered analysis with full reasoning

---

### Feature 3: Live Canvas

Real-time collaborative canvas with co-creation preview.

**How it works:**
- Provides live preview URLs for in-progress generations
- Predicts user intent from partial input
- Suggests prompt variations in real-time
- Supports co-creation sessions with multiple users

**Key files:**
- `apps/api/services/co_creation_service.py` — Co-creation logic
- `apps/api/routers/co_creation.py` — Co-creation endpoints
- `apps/api/models/co_creation.py` — Co-creation tables

---

### Feature 4: AI World Engine

Build and manage consistent story worlds with character tracking and continuity validation.

**How it works:**
- Create worlds with descriptions and metadata
- Add characters with attributes and relationships
- Generate relationship graphs (character → character connections)
- Validate story continuity (detect plot holes, timeline inconsistencies)

**Endpoints:** `POST/GET /world-engine/worlds/`, `POST /world-engine/worlds/{id}/characters/`, `GET /world-engine/worlds/{id}/relationship-graph/`, `GET /world-engine/worlds/{id}/validate-continuity/`

**Frontend:** `WorldDashboard.tsx` — Create worlds, view character list, relationship graph visualization

---

### Feature 5: Emotional AI Generation

Map emotions to visual generation parameters for mood-aware AI output.

**How it works:**
- Detect emotion from prompt text (keyword-based in mock, NLP in prod)
- Map emotions to visual parameters: saturation, brightness, contrast, color temperature
- Track user emotion preferences over time
- Apply emotion parameters to generation pipeline

**Endpoints:** `POST /emotion/analyze/`, `POST /emotion/map-visuals/`, `POST /emotion/generation/`

**Frontend:** `EmotionSliders.tsx` — 6 emotion sliders (happy, sad, angry, nostalgic, fear, calm) with 0–1 intensity

---

### Feature 6: AI Style Genome System

Track and evolve a user's unique artistic style fingerprint.

**How it works:**
- Each user has a StyleDNA record storing color palettes, composition tendencies, lighting preferences
- Style mutations create variations of the user's style
- Style evolution learns from user feedback (likes/dislikes)
- Style fingerprint is applied to generations for consistent aesthetic

**Endpoints:** `GET /style-genome/{user_id}`, `POST /style-genome/mutate/`, `POST /style-genome/evolve/`

**Frontend:** `StyleGenomeDashboard.tsx` — View style DNA, trigger mutations, see evolution history

---

### Feature 7: AI Render Preview

Real-time render job monitoring with auto-progressing status.

**How it works:**
- Create render jobs that simulate GPU rendering
- Mock mode auto-progresses: queued → processing → done
- Track job status and preview URLs
- Poll for updates from frontend

**Endpoints:** `POST /render-preview/jobs/`, `GET /render-preview/jobs/{id}`, `GET /render-preview/jobs/{id}/preview/`

**Frontend:** `RenderPreview.tsx` — Create jobs, monitor status, view previews

---

### Feature 8: AI Asset Management

Organize, tag, and collect creative assets.

**How it works:**
- Upload assets with metadata (name, type, tags)
- Create named collections of assets
- Filter assets by type, tags, date
- Add/remove tags from existing assets

**Endpoints:** `POST /asset-management/assets/`, `GET /asset-management/assets/`, `POST /asset-management/assets/{id}/tags/`, `POST /asset-management/collections/`, `POST /asset-management/collections/{id}/assets/`

**Frontend:** `AssetManagement.tsx` — Asset grid, tag management, collection creation

---

### Feature 9: AI Prompt-to-Product

Turn prompts into products with iterative refinement.

**How it works:**
- Create prompt templates for reusable product patterns
- Generate products from prompts using AI
- Iterate on products (refine, modify, improve)
- Track iteration history per product

**Endpoints:** `POST /prompt-to-product/templates/`, `POST /prompt-to-product/generate/`, `POST /prompt-to-product/products/{id}/iterate/`, `GET /prompt-to-product/products/`

**Frontend:** `PromptToProduct.tsx` — Template builder, product generator, iteration history

---

### Feature 10: AI Multi-Modal Fusion

Combine text, image, and audio inputs in a single generation job.

**How it works:**
- Create fusion jobs with multiple input types (text prompt + image + audio)
- Mock mode auto-completes with combined result
- Track job status and retrieve fused output
- List all user fusion jobs

**Endpoints:** `POST /multi-modal-fusion/jobs/`, `GET /multi-modal-fusion/jobs/{id}`, `GET /multi-modal-fusion/jobs/`

**Frontend:** `MultiModalFusion.tsx` — Multi-input job creator, status monitor

---

### Feature 11: Cinematic AI Director

Professional camera, lighting, and color grading controls for AI generation.

**How it works:**
- Create cinematic scenes with camera settings (aperture, focal length, angle)
- Configure lighting rigs (three-point, neon, natural)
- Apply color grading presets (teal-orange, vintage, cinematic)
- Track scene status: draft → rendering → completed

**Endpoints:** `POST /cinematic-ai/scenes/`, `GET /cinematic-ai/scenes/`, `PUT /cinematic-ai/scenes/{id}/status/`

**Frontend:** `CinematicAI.tsx` — Scene builder, camera controls, lighting presets

---

### Feature 12: AI Knowledge Graph

Entity-relation knowledge base with graph visualization.

**How it works:**
- Create entities (people, places, concepts, objects)
- Define relations between entities (type, strength, metadata)
- Group entities into named knowledge graphs
- Query entities and their relations

**Endpoints:** `POST /knowledge-graph/entities/`, `POST /knowledge-graph/relations/`, `POST /knowledge-graph/graphs/`, `GET /knowledge-graph/graphs/`, `GET /knowledge-graph/graphs/{id}/entities/`, `GET /knowledge-graph/entities/{id}/relations/`

**Frontend:** `KnowledgeGraph.tsx` — Entity creator, relation builder, graph visualizer

---

### Feature 13: Generative UI

AI-generated UI components with a marketplace.

**How it works:**
- Generate UI components from text prompts
- List generated UIs with component breakdowns
- Browse marketplace of shared UI components
- Track component hierarchy per UI

**Endpoints:** `POST /generative-ui/uis/`, `GET /generative-ui/uis/`, `GET /generative-ui/uis/{id}/components/`

**Frontend:** `GenerativeUI.tsx` — UI generator, component tree viewer

---

### Feature 14: AI Marketplace Ecosystem

Buy and sell AI assets, prompts, and models.

**How it works:**
- List items on marketplace (prompts, models, assets, styles)
- Purchase items with mock transactions
- Review and rate purchased items
- Filter marketplace by category, price, rating

**Endpoints:** `POST /marketplace/items/`, `GET /marketplace/items/`, `POST /marketplace/transactions/`, `POST /marketplace/reviews/`

**Frontend:** `Marketplace.tsx` — Item browser, purchase flow, review system

---

### Feature 15: AI Timeline & Versioning

Project history tracking with version control and changelogs.

**How it works:**
- Create timeline events (milestones, changes, releases)
- Record version records with full changelog
- View project timeline chronologically
- Track version history per event

**Endpoints:** `POST /timeline/events/`, `POST /timeline/versions/`, `GET /timeline/events/`, `GET /timeline/events/{id}/versions/`

**Frontend:** `TimelineVersioning.tsx` — Timeline view, version history, changelog display

---

### Feature 16: Voice-Driven Creation

Voice command interface for hands-free AI creation.

**How it works:**
- Create voice sessions for tracking commands
- Record voice commands with transcripts
- Track command history per session
- Mock mode simulates voice-to-text

**Endpoints:** `POST /voice-driven/sessions/`, `POST /voice-driven/commands/`, `POST /voice-driven/transcripts/`, `GET /voice-driven/sessions/{id}/`

**Frontend:** `VoiceDriven.tsx` — Session manager, command recorder, transcript viewer

---

### Feature 17: Real-Time Collaborative AI Studio

Multi-user real-time collaboration with WebRTC support.

**How it works:**
- Create collaborative sessions
- Join sessions with user roles
- Record real-time updates (cursor positions, edits, chat)
- Retrieve full session state (users + updates)
- PeerJS signaling server for WebRTC (port 9000)

**Endpoints:** `POST /collaborative-studio/sessions/`, `POST /collaborative-studio/sessions/join/`, `POST /collaborative-studio/updates/`, `GET /collaborative-studio/sessions/{id}/`

**Frontend:** `CollaborativeStudio.tsx` — Session creator, join flow, live update feed

---

### Feature 18: Personal AI Creative Twin

An AI assistant that learns from your creative patterns and suggests improvements.

**How it works:**
- Create a "twin" that mirrors your creative style
- Record learnings from your generations and preferences
- Generate personalized suggestions based on learned patterns
- Twin profile shows learning history and suggestion accuracy

**Endpoints:** `POST /creative-twin/twins/`, `POST /creative-twin/learnings/`, `POST /creative-twin/suggestions/`, `GET /creative-twin/twins/{id}/`

**Frontend:** `CreativeTwin.tsx` — Twin creator, learning recorder, suggestion panel

---

### Feature 19: AI Research & Inspiration Engine

Track AI research papers and inspiration sources.

**How it works:**
- Create research topics of interest
- Add papers to topics (title, authors, abstract, URL)
- Track inspiration sources (artists, styles, references)
- Retrieve topics with associated papers

**Endpoints:** `POST /research/topics/`, `POST /research/papers/`, `POST /research/inspirations/`, `GET /research/topics/{id}/`, `GET /research/inspirations/`

**Frontend:** `ResearchInspiration.tsx` — Topic manager, paper library, inspiration board

---

### Feature 20: Future-Ready Expansions

Platform roadmap and expansion planning tool.

**How it works:**
- Create feature entries for the roadmap
- Add roadmap items with priorities and timelines
- Create expansion plans with detailed descriptions
- View all features with their roadmap status

**Endpoints:** `POST /future-ready/features/`, `POST /future-ready/roadmap/`, `POST /future-ready/expansion-plans/`, `GET /future-ready/features/`, `GET /future-ready/features/{id}/`

**Frontend:** `FutureReady.tsx` — Roadmap view, feature planner, expansion tracker

---

## Visual Node Workflow System

A ReactFlow-based drag-and-drop pipeline builder for chaining AI operations.

**How it works:**
- Start with a **Start node** (trigger)
- Drag nodes from the **Node Palette** onto the canvas
- Connect nodes by dragging from source handle to target handle
- **Execute Workflow** button runs nodes sequentially via BFS traversal
- Data passes between connected nodes
- **Clear** button resets canvas (keeps Start node)

**Node Types:**

| Node | Color | Description |
|------|-------|-------------|
| Start | Indigo | Workflow trigger (source handle only) |
| Text Generation | Blue | Calls `/generations/` for text output |
| Image Generation | Orange | Calls `/generations/` for image output |
| Canvas | Purple | Processes data on the canvas |
| Output | Indigo | Displays final results (target handle only) |

**Workflow execution flow:**
1. Build execution order via BFS from Start node
2. Execute nodes sequentially, passing data between connected nodes
3. Each node calls its backend API endpoint
4. Node status updates: idle → running → success/error
5. Execution log shows timestamped progress

**Key files:**
- `apps/web/src/components/visual-node/WorkflowCanvas.tsx` — Main canvas with ReactFlow
- `apps/web/src/components/visual-node/NodePalette.tsx` — Draggable node palette
- `apps/web/src/components/visual-node/StartNode.tsx` — Start node component
- `apps/web/src/components/visual-node/TextGenNode.tsx` — Text generation node
- `apps/web/src/components/visual-node/ImageGenNode.tsx` — Image generation node
- `apps/web/src/components/visual-node/CanvasNode.tsx` — Canvas processing node
- `apps/web/src/components/visual-node/OutputNode.tsx` — Output display node

**Pitfalls to avoid:**
- No self-looping connections (source === target)
- No looping between same node types (e.g., Image Gen → Image Gen)
- Always include Start and Output nodes
- Register all custom node types in `nodeTypes` object

---

## Deployment

Three deployment modes supported:

### Local Development
```bash
# Backend (mock mode)
cd apps/api && python3 main_mock.py

# Frontend
npx vite apps/web --port 3000 --host 0.0.0.0
```

### Docker Compose (Local Production)
```bash
docker-compose -f infrastructure/docker/docker-compose.prod.yml up -d
```
- Frontend: Nginx serving static Vite build
- Backend: Gunicorn + Uvicorn workers
- Database: PostgreSQL with persistent volume
- Redis: Redis with persistence
- NGINX reverse proxy + HTTPS

### Cloud (AWS/GCP Kubernetes)
```bash
# Infrastructure as Code
cd infrastructure/terraform && terraform apply

# Kubernetes deployment
kubectl apply -f infrastructure/kubernetes/
```
- Frontend: S3/Cloud Storage + CDN
- Backend: Kubernetes Deployment with HPA
- Workers: Separate GPU node pool
- Database: RDS/multi-AZ PostgreSQL
- Cache/Queue: ElastiCache/Memorystore Redis
- Monitoring: Prometheus + Grafana

**Scaling:**
- API pods: HPA at CPU >70%, max 20 pods
- Worker pods: HPA at queue length >100, max 50 GPU pods
- Database: Read replicas + PgBouncer connection pooling
- Redis: Cluster mode, 100k ops/sec

**Rollout:** Blue-Green deployment with canary releases (10% → 100%)
**Rollback:** `kubectl rollout undo deployment/creativeforge-api`

---

## Future Roadmap

**Short-Term (0–6 months):**
- Video generation (Stable Video Diffusion)
- AI voice input + transcription
- Prompt marketplace with revenue sharing
- Batch generation (100+ assets)
- Team billing (Stripe)
- SSO (SAML/OIDC)
- Mobile companion app (React Native)

**Medium-Term (6–12 months):**
- ComfyUI-compatible node library
- AI model fine-tuning UI
- Multi-GPU inference pooling
- AI chat assistant with context awareness
- Real-time collaborative editing (CRDTs)
- Public API for third-party integrations

**Long-Term (12–24 months):**
- On-premise deployment packages
- HIPAA/GDPR compliance modules
- AI content moderation pipeline
- Third-party model marketplace
- 3D asset generation (NeRF/Stable DreamFusion)
- Global edge inference network

**Monetization:**
- Freemium: 50 generations/month free
- Pro: $29/month (unlimited, priority queue)
- Team: $99/month (5 seats, team workflows)
- Enterprise: Custom pricing (on-premise, SSO, SLA)
