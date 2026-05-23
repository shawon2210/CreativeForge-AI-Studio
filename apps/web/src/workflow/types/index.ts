/**
 * Workflow Type Definitions
 * Complete type system for the visual AI workflow builder
 */

import { Node, Edge, Connection, NodeChange, EdgeChange, XYPosition } from 'reactflow'

// ─── Node Status ──────────────────────────────────────────────────────────────
export type NodeStatus = 'idle' | 'running' | 'success' | 'error' | 'warning' | 'cancelled'

// ─── Node Data ────────────────────────────────────────────────────────────────
export interface BaseNodeData {
  label: string
  status: NodeStatus
  description?: string
  icon?: string
  color?: string
}

export interface StartNodeData extends BaseNodeData {
  triggerMode: 'manual' | 'webhook' | 'scheduled'
  webhookUrl?: string
  schedule?: string
}

export interface TextGenNodeData extends BaseNodeData {
  prompt: string
  model: string
  temperature: number
  maxTokens: number
  systemPrompt: string
  streaming: boolean
  output?: string
  result?: string
}

export interface ImageGenNodeData extends BaseNodeData {
  prompt: string
  model: string
  width: number
  height: number
  style: string
  negativePrompt: string
  seed?: number
  imageUrl?: string
  result?: string
}

export interface CanvasNodeData extends BaseNodeData {
  inputText: string
  inputImage: string
  output: string
  operation: 'merge' | 'transform' | 'filter' | 'overlay'
  result?: string
}

export interface OutputNodeData extends BaseNodeData {
  format: 'text' | 'image' | 'json' | 'markdown'
  result?: string
  type?: 'text' | 'image'
  input?: string
}

export interface AgentNodeData extends BaseNodeData {
  agentType: 'reAct' | 'plan-execute' | 'conversation' | 'tool-use'
  systemPrompt: string
  tools: string[]
  maxIterations: number
  model: string
  memory: boolean
  result?: string
}

export interface ConditionNodeData extends BaseNodeData {
  condition: string
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'exists' | 'regex'
  value: string
  trueLabel: string
  falseLabel: string
}

export interface LoopNodeData extends BaseNodeData {
  maxIterations: number
  loopVariable: string
  breakCondition: string
  currentIteration?: number
}

export interface MemoryNodeData extends BaseNodeData {
  memoryType: 'short-term' | 'long-term' | 'vector'
  storage: 'local' | 'redis' | 'postgres'
  key: string
  value: string
  ttl?: number
}

export interface WebhookNodeData extends BaseNodeData {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url: string
  headers: Record<string, string>
  body: string
  timeout: number
}

export interface SubflowNodeData extends BaseNodeData {
  workflowId: string
  inputs: Record<string, string>
  outputs: Record<string, string>
}

// Union type for all node data
export type WorkflowNodeData =
  | StartNodeData
  | TextGenNodeData
  | ImageGenNodeData
  | CanvasNodeData
  | OutputNodeData
  | AgentNodeData
  | ConditionNodeData
  | LoopNodeData
  | MemoryNodeData
  | WebhookNodeData
  | SubflowNodeData

// ─── Custom Node Types ───────────────────────────────────────────────────────
export type WorkflowNodeType =
  | 'start'
  | 'text_gen'
  | 'image_gen'
  | 'canvas'
  | 'output'
  | 'agent'
  | 'condition'
  | 'loop'
  | 'memory'
  | 'webhook'
  | 'subflow'

// ─── Workflow Node ───────────────────────────────────────────────────────────
export interface WorkflowNode extends Node<WorkflowNodeData> {
  type: WorkflowNodeType
  position: XYPosition
  data: WorkflowNodeData
}

// ─── Workflow Edge ───────────────────────────────────────────────────────────
export interface WorkflowEdge extends Omit<Edge, 'id'> {
  id: string
  animated?: boolean
  label?: string
  style?: Record<string, string | number>
  data?: {
    connectionType?: 'data' | 'control' | 'event'
  }
}

// ─── Execution ───────────────────────────────────────────────────────────────
export interface NodeExecutionResult {
  nodeId: string
  success: boolean
  output?: string
  imageUrl?: string
  data?: Record<string, unknown>
  error?: string
  duration: number
  timestamp: string
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt: string
  completedAt?: string
  results: Record<string, NodeExecutionResult>
  logs: ExecutionLog[]
  error?: string
}

export interface ExecutionLog {
  id: string
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'success'
  nodeId?: string
  message: string
  data?: Record<string, unknown>
}

// ─── Workflow Definition ─────────────────────────────────────────────────────
export interface WorkflowDefinition {
  id: string
  name: string
  description: string
  version: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  viewport: { x: number; y: number; zoom: number }
  createdAt: string
  updatedAt: string
  isTemplate: boolean
  tags: string[]
  userId: string
}

// ─── Node Template ───────────────────────────────────────────────────────────
export interface NodeTemplate {
  type: WorkflowNodeType
  label: string
  description: string
  category: 'input' | 'processing' | 'output' | 'logic' | 'advanced'
  icon: string
  color: string
  defaultData: Partial<WorkflowNodeData>
  inputs: PortDefinition[]
  outputs: PortDefinition[]
}

export interface PortDefinition {
  id: string
  label: string
  type: 'text' | 'image' | 'any' | 'number' | 'boolean' | 'json'
  required?: boolean
}

// ─── Validation ──────────────────────────────────────────────────────────────
export interface ValidationError {
  type: 'error' | 'warning'
  nodeId?: string
  edgeId?: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

// ─── History (Undo/Redo) ────────────────────────────────────────────────────
export interface HistoryEntry {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  timestamp: number
  description: string
}

// ─── AI Provider ─────────────────────────────────────────────────────────────
export interface AIProvider {
  id: string
  name: string
  type: 'openai' | 'gemini' | 'claude' | 'stability' | 'local'
  models: string[]
  icon: string
  color: string
}

// ─── Connection Validation ───────────────────────────────────────────────────
export interface ConnectionRule {
  sourceType: WorkflowNodeType
  targetType: WorkflowNodeType
  sourcePort?: string
  targetPort?: string
  allowed: boolean
  reason?: string
}
