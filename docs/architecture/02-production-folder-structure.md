# CreativeForge AI Studio: Production Folder Structure

## Root Directory
```
creativeforge/
├── apps/                  # Runnable applications
├── packages/              # Shared internal packages
├── infrastructure/        # DevOps, cloud, containerization
├── docs/                  # All project documentation
├── scripts/               # Automation and setup scripts
├── tests/                 # Cross-app testing
├── README.md              # Project overview and quickstart
├── package.json           # Monorepo root config (npm workspaces)
└── pyproject.toml         # Python project config (backend)
```

---

## apps/ (Runnable Applications)
### apps/web/ (Frontend - React 19 + Vite 8)
```
web/
├── src/
│   ├── components/        # Atomic UI components (shadcn/ui based)
│   ├── pages/             # Route-based page components
│   ├── hooks/             # Custom React hooks (TanStack Query, Zustand)
│   ├── store/             # Zustand state management slices
│   ├── services/          # API client calls (using packages/sdk)
│   ├── utils/             # Helper functions, formatters
│   ├── styles/            # Global CSS, Tailwind config, theme variables
│   ├── App.tsx            # Root component with router/providers
│   └── main.tsx           # Vite entry point
├── public/                # Static assets (icons, fonts, images)
├── package.json           # Frontend dependencies
├── vite.config.ts         # Vite configuration (proxy, plugins)
└── tsconfig.json          # TypeScript config
```

### apps/api/ (Backend - FastAPI + Python 3.13)
```
api/
├── src/
│   ├── routers/           # API route handlers (versioned: /api/v1/)
│   ├── services/          # Business logic layer (AI, auth, projects)
│   ├── repositories/      # Database access layer (SQLAlchemy/SQLModel)
│   ├── models/            # Database ORM models
│   ├── schemas/           # Pydantic request/response schemas
│   ├── middleware/        # CORS, auth, rate limiting, logging
│   ├── core/              # Config, security, dependency injection
│   ├── workers/           # Background task definitions (for API-triggered jobs)
│   ├── events/            # Event bus handlers (WebSocket, SSE)
│   └── utils/             # Helpers (file handling, model loading)
├── pyproject.toml         # Python dependencies
├── alembic.ini            # Database migration config
└── main.py                # FastAPI application entry point
```

### apps/workers/ (Async Inference Workers)
```
workers/
├── src/
│   ├── text/              # Text generation pipelines (GPT-2, Mistral, OpenAI)
│   ├── image/             # Image generation (SDXL, Flux, ControlNet)
│   ├── workflows/         # Multimodal loop execution logic
│   ├── queues/            # Redis/Celery task consumers
│   └── utils/             # Model loading, GPU memory management
├── pyproject.toml         # Worker-specific dependencies
└── main.py                # Worker entry point
```

---

## packages/ (Shared Internal Libraries)
### packages/ui/ (Shared Design System)
```
ui/
├── src/
│   ├── atoms/             # Basic components (buttons, inputs, badges)
│   ├── molecules/         # Composite components (form fields, cards)
│   ├── organisms/         # Complex components (navbars, sidebars)
│   ├── templates/         # Page layout templates
│   └── styles/            # Design tokens, theme config, global styles
└── package.json           # UI package config
```

### packages/types/ (Shared TypeScript Types)
```
types/
├── src/
│   ├── api.ts             # API request/response types
│   ├── models.ts          # AI model, generation types
│   └── common.ts          # Shared enums, utility types
└── package.json
```

### packages/config/ (Shared Configuration)
```
config/
├── src/
│   ├── env.ts             # Environment variable validation (Zod)
│   ├── constants.ts       # App-wide constants
│   └── themes.ts          # Theme configuration (dark/light)
└── package.json
```

### packages/sdk/ (API SDK)
```
sdk/
├── src/
│   ├── client.ts          # Base API client (Axios/Fetch)
│   ├── auth.ts            # Auth-related API calls
│   ├── generations.ts     # Text/image generation endpoints
│   └── projects.ts        # Project management endpoints
└── package.json
```

---

## infrastructure/ (DevOps & Cloud)
### infrastructure/docker/
```
docker/
├── web/                   # Frontend Dockerfile (Node alpine)
├── api/                   # Backend Dockerfile (Python slim)
├── workers/               # Worker Dockerfile (Python with GPU support)
└── nginx/                 # NGINX reverse proxy config
```

### infrastructure/nginx/
```
nginx/
├── conf.d/                # Site configurations
└── ssl/                   # SSL certificate storage
```

### infrastructure/terraform/ (Cloud Provisioning)
```
terraform/
├── modules/               # Reusable cloud modules (AWS/GCP)
└── environments/          # Staging/production configs
```

### infrastructure/kubernetes/ (K8s Deployment)
```
kubernetes/
├── helm/                  # Helm charts for all services
└── manifests/             # Raw K8s YAML manifests
```

---

## docs/ (Documentation)
```
docs/
├── api/                   # OpenAPI/Swagger documentation
├── architecture/          # System design docs (including this blueprint)
├── deployment/            # Docker, K8s, cloud deployment guides
└── development/           # Contributor guides, setup instructions
```

---

## scripts/ (Automation)
```
scripts/
├── setup.sh               # Local development setup
├── migrate.sh             # Database migration runner
└── deploy.sh              # Production deployment script
```