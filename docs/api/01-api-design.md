# CreativeForge AI Studio: Backend API Design

## API Standards
- **Base URL**: `/api/v1` (versioned for backward compatibility)
- **Auth**: JWT Bearer token (header: `Authorization: Bearer <token>`)
- **Content-Type**: `application/json` (REST), `application/json` + WebSocket (realtime)
- **Rate Limiting**: 100 requests/minute per user (configurable)
- **Streaming**: SSE for simple progress, WebSocket for bidirectional realtime

---

## 1. Authentication Endpoints
### POST /api/v1/auth/login
**Request**:
```json
{ "username": "string", "password": "string" }
```
**Response**:
```json
{ "access_token": "string", "token_type": "bearer", "user": { "id": "uuid", "role": "admin|member" } }
```

### POST /api/v1/auth/register
**Request**:
```json
{ "username": "string", "email": "string", "password": "string" }
```

### POST /api/v1/auth/refresh
Refresh JWT token using refresh token cookie

### GET /api/v1/auth/me
Get current authenticated user details

---

## 2. Project Endpoints
### GET /api/v1/projects
List user's projects (paginated)
**Query**: `page=1&limit=20`

### POST /api/v1/projects
Create new project
**Request**: `{ "name": "string", "description": "string", "is_public": false }`

### GET /api/v1/projects/:id
Get project details + recent generations

### PATCH /api/v1/projects/:id
Update project settings

### DELETE /api/v1/projects/:id
Soft delete project

---

## 3. Generation Endpoints
### POST /api/v1/generations/text
Start text generation (enqueues to worker)
**Request**:
```json
{
  "project_id": "uuid",
  "prompt": "string",
  "model": "gpt-2|mistral|openai",
  "max_tokens": 500,
  "temperature": 0.7
}
```
**Response**: `{ "generation_id": "uuid", "status": "queued" }`

### POST /api/v1/generations/image
Start image generation
**Request**:
```json
{
  "project_id": "uuid",
  "prompt": "string",
  "model": "sdxl|flux",
  "cfg_scale": 7.5,
  "steps": 30,
  "negative_prompt": "string"
}
```

### GET /api/v1/generations/:id/stream (SSE)
Stream generation progress:
```
event: progress
data: { "step": 10, "total_steps": 30, "preview_url": "string" }

event: complete
data: { "status": "complete", "result_url": "string" }
```

### GET /api/v1/generations
List generations (filter by project/status)
**Query**: `project_id=uuid&status=complete&page=1`

### DELETE /api/v1/generations/:id
Delete generation + associated assets

---

## 4. Model Endpoints
### GET /api/v1/models
List available AI models (text + image)
**Response**:
```json
[
  { "id": "gpt-2", "type": "text", "provider": "local", "loaded": true },
  { "id": "sdxl", "type": "image", "provider": "local", "loaded": false }
]
```

### POST /api/v1/models/:id/load
Load model into GPU memory (admin only)

### POST /api/v1/models/:id/unload
Unload model from memory

---

## 5. Workflow Endpoints
### POST /api/v1/workflows
Create/save node-based workflow
**Request**: `{ "name": "string", "nodes": [], "edges": [] }`

### GET /api/v1/workflows/:id/execute
Run workflow (triggers multimodal loop)

---

## 6. WebSocket Endpoint
### WS /api/v1/ws/generations
Bidirectional realtime updates:
- **Client → Server**: Subscribe to generation updates (`{ "action": "subscribe", "generation_id": "uuid" }`)
- **Server → Client**: Progress updates, completion notifications, queue status

---

## 7. Backward Compatibility (Mock Mode)
Existing mock endpoints preserved at:
- `/api/v1/mock/text/generate` (GPT-2 simulation)
- `/api/v1/mock/image/generate` (SD simulation)
- `/api/v1/mock/remix` (Image-to-image simulation)

All mock endpoints return the same response shape as production endpoints.

---

## 8. Error Responses
Standard error format:
```json
{
  "error": {
    "code": "GENERATION_FAILED",
    "message": "Human-readable error",
    "details": { "step": "inference", "model": "sdxl" }
  }
}
```
**Status Codes**:
- 400: Bad Request (validation error)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error