# CreativeForge AI Studio: Architectural Blueprint

## 1. System Design Overview
CreativeForge is a **modular, monorepo-based full-stack AI platform** designed for scalable multimodal generative AI workflows. It preserves the existing React 19 + FastAPI ecosystem while upgrading to enterprise standards.

### Core Principles
- **Monorepo architecture** for shared code reuse and unified versioning
- **Layered backend** with clear separation of concerns (routers → services → repositories)
- **GPU-ready worker pool** for async AI inference
- **Local-first + cloud-ready** dual execution mode
- **Premium UX** inspired by RunwayML/Leonardo AI with glassmorphism and dark theme

---

## 2. Service Interactions
```
┌─────────────────┐     REST/WebSocket     ┌─────────────────┐
│   Web Frontend  │ ◄───────────────────► │  FastAPI Backend │
│  (React 19/Vite)│                       │  (Python 3.13)  │
└─────────────────┘                       └─────────────────┘
         │                                         │
         │ Uses                                    │ Enqueue Tasks
         ▼                                         ▼
┌─────────────────┐                       ┌─────────────────┐
│  Shared SDK    │                       │  Redis Queue    │
│ (packages/sdk) │                       │  (Celery/RQ)    │
└─────────────────┘                       └─────────────────┘
                                               │
                                               │ Pick up Tasks
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

---

## 3. Data Flow
1. **User Action**: Trigger generation (text/image/remix) via frontend
2. **Auth Check**: Backend validates JWT/session via middleware
3. **Task Enqueue**: Backend creates task record in DB, pushes to Redis queue
4. **Worker Processing**: Async worker picks up task, loads required AI model (GPU/CPU)
5. **Streaming Response**: Workers stream progress via WebSocket/SSE to frontend
6. **Persistence**: Results saved to DB + file storage (local/S3)
7. **UI Update**: Frontend updates workspace with results, adds to project history

---

## 4. Scalability Plan
### Horizontal Scaling
- **API Workers**: Scale FastAPI instances behind NGINX reverse proxy
- **Inference Workers**: Separate GPU node pool for AI tasks, CPU nodes for mock mode
- **Database**: Read replicas for analytics, connection pooling (PgBouncer)
- **Redis**: Cluster mode for high-throughput task queuing

### Performance Optimizations
- **Frontend**: Code splitting, lazy loading, virtualized lists for asset galleries
- **Backend**: Redis caching for frequent queries, async batch processing for GPU inference
- **Storage**: CDN for static assets, image compression before storage

### Multi-Tenancy Ready
- Row-level security in PostgreSQL for user/project isolation
- API keys for programmatic access with rate limiting
- Team workspaces with RBAC (admin/member/viewer roles)

---

## 5. Key Design Decisions
| Component | Choice | Rationale |
|-----------|--------|-----------|
| Frontend State | Zustand + TanStack Query | Lightweight, no boilerplate, great for async data |
| Backend ORM | SQLModel | Combines SQLAlchemy + Pydantic for type-safe DB ops |
| Task Queue | Celery + Redis | Mature, supports GPU worker pools, async task support |
| AI Model Loading | Dynamic module loader | Hot-swap models, GPU memory optimization |
| UI Library | shadcn/ui + Tailwind | Customizable, accessible, fits premium dark theme |
| Observability | OpenTelemetry + Prometheus | Standardized tracing, metrics for AI inference monitoring |

---

## 6. Backward Compatibility
- Mock mode retained for CPU-only development (GPT-2 simulation, SD simulation)
- Existing API endpoints preserved with versioning (/api/v1/*)
- React 19 + Vite 8 stack unchanged, upgraded with TypeScript and modern tooling