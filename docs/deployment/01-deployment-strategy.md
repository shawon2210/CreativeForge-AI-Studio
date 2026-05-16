# CreativeForge AI Studio: Deployment Strategy

## 1. Deployment Modes
### A. Local Development (Developer Experience First)
**Stack**: Docker Compose + hot-reload
**Components**:
- Frontend: Vite dev server with HMR
- Backend: Uvicorn with `--reload` flag
- Database: PostgreSQL container
- Redis: Redis container
- Mock AI mode (CPU-only)

**Command**:
```bash
cd /mnt/d/all files/Project/CreativeForge
docker-compose -f infrastructure/docker/docker-compose.dev.yml up --build
```

---

### B. Local Production (Self-Hosted Mode)
**Stack**: Docker Compose + production builds
**Components**:
- Frontend: Nginx serving static Vite build
- Backend: Gunicorn + Uvicorn workers
- Workers: GPU-enabled containers (optional)
- Database: PostgreSQL with persistent volume
- Redis: Redis with persistence
- NGINX reverse proxy + HTTPS (Let's Encrypt)

**Command**:
```bash
docker-compose -f infrastructure/docker/docker-compose.prod.yml up -d
```

---

### C. Cloud Deployment (AWS/GCP)
**Infrastructure as Code**: Terraform
**Container Orchestration**: Kubernetes (EKS/GKE)
**Components**:
1. **Frontend**: Static assets on S3/Cloud Storage + CloudFront/CDN
2. **Backend API**: Kubernetes Deployment (horizontal pod autoscaling)
3. **Workers**: Separate GPU node pool (for AI inference)
4. **Database**: RDS/Azure Database for PostgreSQL (multi-AZ)
5. **Cache/Queue**: ElastiCache/Memorystore for Redis
6. **Storage**: S3/Cloud Storage for AI assets
7. **Monitoring**: Prometheus + Grafana (EKS/GKE add-on)

---

## 2. Scaling Strategy
| Component | Scale Strategy | Max Capacity |
|-----------|----------------|--------------|
| API Pods | HPA (CPU >70%) | 20 pods |
| Worker Pods | HPA (Queue length >100) | 50 pods (GPU nodes) |
| Database | Read replicas + connection pooling | 10k concurrent connections |
| Redis | Cluster mode | 100k ops/sec |
| CDN | Global edge locations | Unlimited static assets |

---

## 3. Rollout Strategy
### Blue-Green Deployment (Cloud)
1. Deploy new version to green environment
2. Run smoke tests
3. Switch load balancer to green
4. Keep blue as rollback target

### Canary Deployment (New Features)
1. Route 10% traffic to canary pods
2. Monitor error rates + latency
3. Gradually increase to 100%

---

## 4. Rollback Procedure
### Docker Compose
```bash
# Revert to previous image version
docker-compose up -d --no-deps api:previous-tag
```

### Kubernetes
```bash
# Rollback to previous deployment revision
kubectl rollout undo deployment/creativeforge-api
```

---

## 5. HTTPS & Security
- **Local**: NGINX with self-signed certs (dev) or Let's Encrypt (prod)
- **Cloud**: AWS ACM/GCP Certificate Manager for SSL
- **Headers**: Security headers via NGINX (CSP, X-Frame-Options)
- **Secrets**: Kubernetes Secrets / AWS Secrets Manager

---

## 6. Dual-Mode Support
| Mode | Trigger | Behavior |
|------|---------|----------|
| CPU Mock | `AI_MODE=mock` | Use simulated AI pipelines, no GPU required |
| GPU Production | `AI_MODE=production` | Load real models, use GPU workers |

---

## 7. Zero-Downtime Updates
- **Frontend**: CDN with cache invalidation
- **Backend**: Rolling updates (Kubernetes) / health check grace periods (Docker)
- **Database**: Alembic migrations with backward-compatible schema changes