/**
 * Workflow API Service
 * HTTP client and WebSocket service for the visual AI workflow builder
 */

import {
  WorkflowDefinition,
  NodeTemplate,
  ValidationResult,
} from '../types'

// ─── Configuration ───────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const API_PREFIX = `${BASE_URL}/api/workflow`
const WS_BASE_URL = BASE_URL.replace(/^http/, 'ws')

// ─── Error Handling ──────────────────────────────────────────────────────────

class ApiError extends Error {
  status: number
  details?: string

  constructor(message: string, status: number, details?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

// ─── Fetch Helper ────────────────────────────────────────────────────────────

interface ApiFetchOptions extends RequestInit {
  timeout?: number
}

async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { timeout = 30000, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(`${API_PREFIX}${endpoint}`, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      let details: string | undefined

      try {
        const body = await response.json()
        if (body.message) errorMessage = body.message
        if (body.error) details = body.error
        if (body.details) details = body.details
      } catch {
        // Response body is not JSON, use default error message
      }

      throw new ApiError(errorMessage, response.status, details)
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T
    }

    const contentType = response.headers.get('Content-Type') || ''

    if (contentType.includes('application/json')) {
      return response.json() as Promise<T>
    }

    // Return raw text for non-JSON responses (e.g., export)
    return response.text() as unknown as T
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(`Request timeout after ${timeout}ms`, 408)
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    )
  }
}

// ─── API Functions ───────────────────────────────────────────────────────────

export async function executeWorkflow(
  workflow: WorkflowDefinition
): Promise<{ executionId: string }> {
  return apiFetch<{ executionId: string }>('/execute', {
    method: 'POST',
    body: JSON.stringify(workflow),
  })
}

export async function stopWorkflow(executionId: string): Promise<void> {
  return apiFetch<void>(`/stop/${encodeURIComponent(executionId)}`, {
    method: 'POST',
  })
}

export async function saveWorkflow(
  workflow: WorkflowDefinition
): Promise<{ id: string }> {
  return apiFetch<{ id: string }>('/save', {
    method: 'POST',
    body: JSON.stringify(workflow),
  })
}

export async function loadWorkflow(id: string): Promise<WorkflowDefinition> {
  return apiFetch<WorkflowDefinition>(`/${encodeURIComponent(id)}`, {
    method: 'GET',
  })
}

export async function listWorkflows(): Promise<WorkflowDefinition[]> {
  return apiFetch<WorkflowDefinition[]>('/list', {
    method: 'GET',
  })
}

export async function deleteWorkflow(id: string): Promise<void> {
  return apiFetch<void>(`/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export async function testNode(
  nodeType: string,
  config: Record<string, unknown>
): Promise<{ success: boolean; output?: string; error?: string }> {
  return apiFetch<{ success: boolean; output?: string; error?: string }>(
    '/node/test',
    {
      method: 'POST',
      body: JSON.stringify({ nodeType, config }),
    }
  )
}

export async function validateWorkflow(
  workflow: WorkflowDefinition
): Promise<ValidationResult> {
  return apiFetch<ValidationResult>('/validate', {
    method: 'POST',
    body: JSON.stringify(workflow),
  })
}

export async function exportWorkflow(id: string): Promise<string> {
  return apiFetch<string>(`/${encodeURIComponent(id)}/export`, {
    method: 'GET',
  })
}

export async function importWorkflow(
  json: string
): Promise<WorkflowDefinition> {
  return apiFetch<WorkflowDefinition>('/import', {
    method: 'POST',
    body: JSON.stringify({ json }),
  })
}

export async function getTemplates(): Promise<NodeTemplate[]> {
  return apiFetch<NodeTemplate[]>('/templates', {
    method: 'GET',
  })
}

// ─── WebSocket Message Types ─────────────────────────────────────────────────

interface WSLogMessage {
  type: 'log'
  level: 'info' | 'warn' | 'error' | 'success'
  message: string
  nodeId?: string
  timestamp: string
  data?: Record<string, unknown>
}

interface WSNodeUpdateMessage {
  type: 'node_update'
  nodeId: string
  status: 'idle' | 'running' | 'success' | 'error' | 'warning' | 'cancelled'
  output?: string
  error?: string
  timestamp: string
}

interface WSCompleteMessage {
  type: 'complete'
  executionId: string
  status: 'completed' | 'failed' | 'cancelled'
  timestamp: string
}

interface WSErrorMessage {
  type: 'error'
  message: string
  code?: string
  timestamp: string
}

type WSMessage =
  | WSLogMessage
  | WSNodeUpdateMessage
  | WSCompleteMessage
  | WSErrorMessage

// ─── WebSocket Callbacks ────────────────────────────────────────────────────

export interface WorkflowWebSocketCallbacks {
  onLog?: (log: WSLogMessage) => void
  onNodeUpdate?: (update: WSNodeUpdateMessage) => void
  onComplete?: (result: WSCompleteMessage) => void
  onError?: (error: WSErrorMessage) => void
}

// ─── WebSocket Service ──────────────────────────────────────────────────────

export class WorkflowWebSocket {
  private executionId: string
  private callbacks: WorkflowWebSocketCallbacks
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private isIntentionallyClosed = false
  private url: string

  constructor(executionId: string, callbacks: WorkflowWebSocketCallbacks = {}) {
    this.executionId = executionId
    this.callbacks = callbacks
    this.url = `${WS_BASE_URL}/api/workflow/stream/${encodeURIComponent(executionId)}`
  }

  connect(): void {
    this.isIntentionallyClosed = false
    this.reconnectAttempts = 0
    this.doConnect()
  }

  private doConnect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return
    }

    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const message: WSMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch {
          // Ignore malformed messages
        }
      }

      this.ws.onerror = () => {
        // onclose will fire after onerror; reconnection is handled there
      }

      this.ws.onclose = (event: CloseEvent) => {
        if (!this.isIntentionallyClosed && !event.wasClean) {
          this.scheduleReconnect()
        }
      }
    } catch {
      this.scheduleReconnect()
    }
  }

  private handleMessage(message: WSMessage): void {
    switch (message.type) {
      case 'log':
        this.callbacks.onLog?.(message)
        break
      case 'node_update':
        this.callbacks.onNodeUpdate?.(message)
        break
      case 'complete':
        this.callbacks.onComplete?.(message)
        break
      case 'error':
        this.callbacks.onError?.(message)
        break
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.callbacks.onError?.({
        type: 'error',
        message: `WebSocket connection lost. Max reconnection attempts (${this.maxReconnectAttempts}) exceeded.`,
        code: 'WS_MAX_RECONNECT',
        timestamp: new Date().toISOString(),
      })
      return
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    const delay = Math.pow(2, this.reconnectAttempts) * 1000
    this.reconnectAttempts++

    this.reconnectTimer = setTimeout(() => {
      this.doConnect()
    }, delay)
  }

  disconnect(): void {
    this.isIntentionallyClosed = true

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnected')
      this.ws = null
    }

    this.reconnectAttempts = 0
  }

  get connected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}

// ─── Singleton Export ───────────────────────────────────────────────────────

export const workflowApi = {
  executeWorkflow,
  stopWorkflow,
  saveWorkflow,
  loadWorkflow,
  listWorkflows,
  deleteWorkflow,
  testNode,
  validateWorkflow,
  exportWorkflow,
  importWorkflow,
  getTemplates,
  WorkflowWebSocket,
}

export default workflowApi
