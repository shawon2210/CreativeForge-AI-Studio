# CreativeForge AI Studio: CI/CD Pipeline

## Pipeline Tool: GitHub Actions
## Trigger: Push to `main`/`develop`, PRs to `main`

---

## 1. Pipeline Stages
```
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│  Lint   │──►│  Test   │──►│  Build  │──►│ Deploy  │──►│ Notify  │
│         │   │         │   │  Images  │   │ Staging │   │         │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
                                    │
                                    ▼
                              ┌─────────┐
                              │ Deploy  │
                              │ Production│
                              └─────────┘
```

---

## 2. GitHub Actions Workflow (.github/workflows/ci-cd.yml)
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # Frontend lint
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci --workspaces
      - run: npm run lint --workspaces
      # Backend lint
      - uses: actions/setup-python@v5
        with: { python-version: '3.13' }
      - run: pip install ruff black
      - run: ruff check apps/api src
      - run: black --check apps/api src

  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      # Frontend tests
      - uses: actions/setup-node@v4
      - run: npm ci --workspaces
      - run: npm run test --workspace=apps/web
      # Backend tests
      - uses: actions/setup-python@v5
      - run: pip install pytest httpx
      - run: pytest apps/api/tests

  build:
    runs-on: ubuntu-latest
    needs: test
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      # Build and push images
      - uses: docker/build-push-action@v5
        with:
          context: ./apps/web
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/web:${{ github.sha }}
      - uses: docker/build-push-action@v5
        with:
          context: ./apps/api
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/api:${{ github.sha }}

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - run: echo "Deploy to staging K8s cluster"
      - run: kubectl set image deployment/creativeforge-api api=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/api:${{ github.sha }}

  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    needs: build
    environment: production  # Requires manual approval
    steps:
      - uses: actions/checkout@v4
      - run: echo "Deploy to production K8s cluster"
      - run: kubectl set image deployment/creativeforge-api api=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/api:${{ github.sha }}
      # Run DB migrations
      - run: kubectl exec deployment/creativeforge-api -- alembic upgrade head
```

---

## 3. Secrets Management (GitHub)
Required secrets:
- `DATABASE_URL`: Production PostgreSQL URL
- `REDIS_URL`: Production Redis URL
- `JWT_SECRET`: Secret for JWT signing
- `DOCKER_REGISTRY_TOKEN`: Container registry access

---

## 4. Pipeline Features
- **Parallel jobs**: Lint/test run in parallel
- **Caching**: Node modules/Python packages cached between runs
- **Artifact storage**: Test results, build logs stored for 30 days
- **Email/Slack notifications**: On success/failure
- **Rollback**: Manually trigger previous image deployment

---

## 5. Local CI Check (Pre-commit)
```bash
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/mirrors-eslint
    hooks:
      - id: eslint
  - repo: https://github.com/psf/black
    hooks:
      - id: black
```