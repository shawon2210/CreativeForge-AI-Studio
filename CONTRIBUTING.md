# Contributing to CreativeForge AI Studio

Thank you for your interest in contributing to CreativeForge AI Studio! This document outlines the guidelines and workflow for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branch Naming Convention](#branch-naming-convention)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Testing](#testing)

## Code of Conduct

- Be respectful and inclusive in all interactions
- Welcome contributors of all experience levels
- Focus on constructive feedback
- Respect different viewpoints and experiences

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/<your-username>/CreativeForge-AI-Studio.git`
3. Install dependencies: `npm install` (root) and `pip install -r requirements.txt` (API)
4. Copy `.env.example` to `.env` and configure environment variables
5. Start development servers: `npm run dev`

## Development Workflow

1. Create a new branch from `main` for your feature or fix
2. Make your changes following our code standards
3. Write or update tests as needed
4. Ensure all tests pass: `npm run test`
5. Commit following our commit message convention
6. Push to your fork and open a Pull Request

## Branch Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<description>` | `feature/ai-style-genome` |
| Bug Fix | `fix/<description>` | `fix/dashboard-responsive` |
| Hotfix | `hotfix/<description>` | `hotfix/auth-bypass` |
| Release | `release/<version>` | `release/v1.2.0` |
| Docs | `docs/<description>` | `docs/api-endpoints` |
| Refactor | `refactor/<description>` | `refactor/state-management` |

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes
- `ci`: CI/CD configuration changes

### Examples

```
feat(dashboard): add responsive sidebar collapse

Implement mobile-first sidebar with smooth collapse animation
at 768px breakpoint. Includes touch gesture support.

Closes #42
```

```
fix(api): resolve race condition in asset upload

Prevent concurrent uploads from overwriting each other by
implementing file-level locking mechanism.

Fixes #38
```

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update documentation in `/docs` for any new features
3. Add tests for new functionality
4. Ensure CI passes (linting, tests, build)
5. Request review from at least one maintainer
6. Address review feedback promptly
7. Squash commits if requested

### PR Title Format

Follow the same convention as commit messages:

```
feat(emotion-ai): add real-time emotion detection slider
fix(workflow-canvas): prevent node overlap on drag
docs(deployment): add Kubernetes setup guide
```

## Code Standards

### Frontend (React + TypeScript)

- Use functional components with hooks
- Prefer named exports over default exports
- Use TypeScript strict mode
- Follow the existing component folder structure
- Use Tailwind CSS for styling (no inline styles)
- Mobile-first responsive design (360px, 768px, 1024px+)
- Maximum component file length: 300 lines (split if longer)

### Backend (FastAPI + Python)

- Follow PEP 8 style guide
- Use type hints for all function signatures
- Async/await for I/O operations
- Maximum function length: 50 lines
- Docstrings for all public functions (Google style)

### General

- No secrets or credentials in code
- Environment variables for configuration
- Meaningful variable and function names
- Comments for complex logic only (code should be self-documenting)

## Testing

- Unit tests for all utility functions and services
- Integration tests for API endpoints
- E2E tests for critical user flows
- Minimum 80% code coverage for new features
- Run tests before every commit: `npm run test`

## Questions?

Feel free to open an issue with the `question` label or reach out to the maintainers.

---

**Maintainer**: MD Shawon Molla (22103330@iubat.edu)
