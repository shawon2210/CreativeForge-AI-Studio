/**
 * Zustand Workflow Store
 *
 * Central state management for the visual AI workflow builder.
 * Manages nodes, edges, execution state, UI panels, undo/redo history,
 * and workflow metadata.
 */

import { create } from 'zustand'
import type { NodeChange, EdgeChange } from 'reactflow'
import { applyNodeChanges, applyEdgeChanges } from 'reactflow'

import type {
  WorkflowNode,
  WorkflowEdge,
  WorkflowNodeData,
  NodeStatus,
  WorkflowDefinition,
  HistoryEntry,
  ExecutionLog,
  NodeExecutionResult,
} from '../types'

// ─── Store Interface ────────────────────────────────────────────────────────

interface WorkflowStore {
  // ═══════════════════════════════════════════════════════════════════════════
  // Core State
  // ═══════════════════════════════════════════════════════════════════════════
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  selectedNodeId: string | null
  selectedEdgeId: string | null

  // ═══════════════════════════════════════════════════════════════════════════
  // Execution State
  // ═══════════════════════════════════════════════════════════════════════════
  isExecuting: boolean
  executionId: string | null
  nodeResults: Record<string, NodeExecutionResult>
  executionLogs: ExecutionLog[]
  executionStatus: 'idle' | 'running' | 'completed' | 'failed' | 'cancelled'

  // ═══════════════════════════════════════════════════════════════════════════
  // UI State
  // ═══════════════════════════════════════════════════════════════════════════
  paletteOpen: boolean
  configPanelOpen: boolean
  logsPanelOpen: boolean
  minimapOpen: boolean
  gridSnap: boolean
  zoom: number

  // ═══════════════════════════════════════════════════════════════════════════
  // History State
  // ═══════════════════════════════════════════════════════════════════════════
  history: HistoryEntry[]
  historyIndex: number
  maxHistory: number

  // ═══════════════════════════════════════════════════════════════════════════
  // Workflow Meta
  // ═══════════════════════════════════════════════════════════════════════════
  workflowId: string | null
  workflowName: string
  workflowDescription: string
  isDirty: boolean
  lastSaved: string | null

  // ═══════════════════════════════════════════════════════════════════════════
  // Core Actions
  // ═══════════════════════════════════════════════════════════════════════════
  setNodes: (nodes: WorkflowNode[]) => void
  setEdges: (edges: WorkflowEdge[]) => void
  addNode: (node: WorkflowNode) => void
  removeNode: (nodeId: string) => void
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void
  updateNodeStatus: (nodeId: string, status: NodeStatus) => void
  addEdge: (edge: WorkflowEdge) => void
  removeEdge: (edgeId: string) => void
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  selectNode: (nodeId: string | null) => void
  selectEdge: (edgeId: string | null) => void
  duplicateNode: (nodeId: string) => void
  deleteSelected: () => void

  // ═══════════════════════════════════════════════════════════════════════════
  // Execution Actions
  // ═══════════════════════════════════════════════════════════════════════════
  startExecution: () => void
  stopExecution: () => void
  setNodeResult: (nodeId: string, result: NodeExecutionResult) => void
  addLog: (log: Omit<ExecutionLog, 'id' | 'timestamp'>) => void
  clearLogs: () => void
  resetExecution: () => void

  // ═══════════════════════════════════════════════════════════════════════════
  // History Actions
  // ═══════════════════════════════════════════════════════════════════════════
  pushHistory: (description: string) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  // ═══════════════════════════════════════════════════════════════════════════
  // UI Actions
  // ═══════════════════════════════════════════════════════════════════════════
  togglePalette: () => void
  toggleConfigPanel: () => void
  toggleLogsPanel: () => void
  toggleMinimap: () => void
  setGridSnap: (enabled: boolean) => void
  setZoom: (zoom: number) => void

  // ═══════════════════════════════════════════════════════════════════════════
  // Workflow Actions
  // ═══════════════════════════════════════════════════════════════════════════
  setWorkflow: (def: Partial<WorkflowDefinition>) => void
  newWorkflow: () => void
  markDirty: () => void
  markSaved: () => void
}

// ─── Helpers ────────────────────────────────────────────────────────────────

let logIdCounter = 0

function generateLogId(): string {
  return `log_${++logIdCounter}_${Date.now()}`
}

function generateExecutionId(): string {
  return `exec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

function generateNodeId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

function createStartNode(): WorkflowNode {
  return {
    id: 'start_1',
    type: 'start',
    position: { x: 250, y: 100 },
    data: {
      label: 'Start',
      status: 'idle',
      description: 'Workflow entry point',
      triggerMode: 'manual',
    },
  }
}

function cloneNodes(nodes: WorkflowNode[]): WorkflowNode[] {
  return nodes.map((n) => ({
    ...n,
    position: { ...n.position },
    data: { ...n.data },
  }))
}

function cloneEdges(edges: WorkflowEdge[]): WorkflowEdge[] {
  return edges.map((e) => ({
    ...e,
    style: e.style ? { ...e.style } : undefined,
    data: e.data ? { ...e.data } : undefined,
  }))
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useWorkflowStore = create<WorkflowStore>()((set, get) => ({
  // ── Initial State ──────────────────────────────────────────────────────

  // Core
  nodes: [createStartNode()],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,

  // Execution
  isExecuting: false,
  executionId: null,
  nodeResults: {},
  executionLogs: [],
  executionStatus: 'idle',

  // UI
  paletteOpen: true,
  configPanelOpen: false,
  logsPanelOpen: false,
  minimapOpen: true,
  gridSnap: true,
  zoom: 1,

  // History
  history: [],
  historyIndex: -1,
  maxHistory: 50,

  // Workflow Meta
  workflowId: null,
  workflowName: 'Untitled Workflow',
  workflowDescription: '',
  isDirty: false,
  lastSaved: null,

  // ── Core Actions ───────────────────────────────────────────────────────

  setNodes: (nodes) => {
    set({ nodes, isDirty: true })
  },

  setEdges: (edges) => {
    set({ edges, isDirty: true })
  },

  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node],
      isDirty: true,
    }))
  },

  removeNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      isDirty: true,
    }))
  },

  updateNodeData: (nodeId, data) => {
    set((state) => {
      const nodes = state.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, ...data } }
          : n
      )
      return { nodes, isDirty: true }
    })
  },

  updateNodeStatus: (nodeId, status) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, status } }
          : n
      ),
    }))
  },

  addEdge: (edge) => {
    set((state) => ({
      edges: [...state.edges, edge],
      isDirty: true,
    }))
  },

  removeEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== edgeId),
      selectedEdgeId: state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
      isDirty: true,
    }))
  },

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes) as WorkflowNode[],
      isDirty: true,
    }))
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges) as WorkflowEdge[],
      isDirty: true,
    }))
  },

  selectNode: (nodeId) => {
    if (nodeId !== null) {
      set({ selectedNodeId: nodeId, selectedEdgeId: null })
    } else {
      set({ selectedNodeId: null })
    }
  },

  selectEdge: (edgeId) => {
    if (edgeId !== null) {
      set({ selectedEdgeId: edgeId, selectedNodeId: null })
    } else {
      set({ selectedEdgeId: null })
    }
  },

  duplicateNode: (nodeId) => {
    const state = get()
    const node = state.nodes.find((n) => n.id === nodeId)
    if (!node) return

    const newId = generateNodeId()
    const duplicate: WorkflowNode = {
      ...node,
      id: newId,
      position: {
        x: node.position.x + 40,
        y: node.position.y + 40,
      },
      data: {
        ...node.data,
        label: `${node.data.label} (copy)`,
        status: 'idle',
      },
      selected: false,
    }

    set({
      nodes: [...state.nodes, duplicate],
      selectedNodeId: newId,
      isDirty: true,
    })
  },

  deleteSelected: () => {
    const state = get()
    if (state.selectedNodeId) {
      get().removeNode(state.selectedNodeId)
    } else if (state.selectedEdgeId) {
      get().removeEdge(state.selectedEdgeId)
    }
  },

  // ── Execution Actions ──────────────────────────────────────────────────

  startExecution: () => {
    set((state) => ({
      isExecuting: true,
      executionId: generateExecutionId(),
      executionStatus: 'running',
      nodeResults: {},
      executionLogs: [],
      nodes: state.nodes.map((n) => ({
        ...n,
        data: { ...n.data, status: 'idle' as NodeStatus },
      })),
    }))
  },

  stopExecution: () => {
    set((state) => ({
      isExecuting: false,
      executionStatus: 'cancelled',
      nodes: state.nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          status: n.data.status === 'running' ? 'cancelled' as NodeStatus : n.data.status,
        },
      })),
    }))
  },

  setNodeResult: (nodeId, result) => {
    set((state) => ({
      nodeResults: { ...state.nodeResults, [nodeId]: result },
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, status: result.success ? 'success' as NodeStatus : 'error' as NodeStatus } }
          : n
      ),
    }))
  },

  addLog: (log) => {
    const entry: ExecutionLog = {
      ...log,
      id: generateLogId(),
      timestamp: new Date().toISOString(),
    }
    set((state) => ({
      executionLogs: [...state.executionLogs, entry],
    }))
  },

  clearLogs: () => {
    set({ executionLogs: [] })
  },

  resetExecution: () => {
    set((state) => ({
      isExecuting: false,
      executionId: null,
      executionStatus: 'idle',
      nodeResults: {},
      executionLogs: [],
      nodes: state.nodes.map((n) => ({
        ...n,
        data: { ...n.data, status: 'idle' as NodeStatus },
      })),
    }))
  },

  // ── History Actions ────────────────────────────────────────────────────

  pushHistory: (description) => {
    set((state) => {
      const entry: HistoryEntry = {
        nodes: cloneNodes(state.nodes),
        edges: cloneEdges(state.edges),
        timestamp: Date.now(),
        description,
      }

      // Truncate any redo entries above current index
      const history =
        state.historyIndex < state.history.length - 1
          ? state.history.slice(0, state.historyIndex + 1)
          : [...state.history]

      history.push(entry)

      // Enforce max history size
      const trimmed = history.length > state.maxHistory ? history.slice(history.length - state.maxHistory) : history
      const indexShift = history.length > state.maxHistory ? history.length - state.maxHistory : 0
      const newIndex = history.length - 1 - indexShift + (history.length > state.maxHistory ? indexShift : 0)

      return {
        history: trimmed,
        historyIndex: trimmed.length - 1,
      }
    })
  },

  undo: () => {
    const state = get()
    if (state.historyIndex < 0) return

    const entry = state.history[state.historyIndex]
    set({
      nodes: cloneNodes(entry.nodes),
      edges: cloneEdges(entry.edges),
      historyIndex: state.historyIndex - 1,
      isDirty: true,
      selectedNodeId: null,
      selectedEdgeId: null,
    })
  },

  redo: () => {
    const state = get()
    if (state.historyIndex >= state.history.length - 1) return

    const entry = state.history[state.historyIndex + 1]
    set({
      nodes: cloneNodes(entry.nodes),
      edges: cloneEdges(entry.edges),
      historyIndex: state.historyIndex + 1,
      isDirty: true,
      selectedNodeId: null,
      selectedEdgeId: null,
    })
  },

  canUndo: () => {
    return get().historyIndex >= 0
  },

  canRedo: () => {
    const state = get()
    return state.historyIndex < state.history.length - 1
  },

  // ── UI Actions ─────────────────────────────────────────────────────────

  togglePalette: () => {
    set((state) => ({ paletteOpen: !state.paletteOpen }))
  },

  toggleConfigPanel: () => {
    set((state) => ({ configPanelOpen: !state.configPanelOpen }))
  },

  toggleLogsPanel: () => {
    set((state) => ({ logsPanelOpen: !state.logsPanelOpen }))
  },

  toggleMinimap: () => {
    set((state) => ({ minimapOpen: !state.minimapOpen }))
  },

  setGridSnap: (enabled) => {
    set({ gridSnap: enabled })
  },

  setZoom: (zoom) => {
    set({ zoom: Math.max(0.1, Math.min(2, zoom)) })
  },

  // ── Workflow Actions ───────────────────────────────────────────────────

  setWorkflow: (def) => {
    set((state) => {
      const updates: Partial<WorkflowStore> = {
        history: [],
        historyIndex: -1,
        isDirty: false,
        lastSaved: new Date().toISOString(),
      }
      if (def.id) updates.workflowId = def.id
      if (def.name) updates.workflowName = def.name
      if (def.description) updates.workflowDescription = def.description
      if (def.nodes) updates.nodes = def.nodes
      if (def.edges) updates.edges = def.edges
      if (def.viewport) updates.zoom = def.viewport.zoom
      return updates
    })
  },

  newWorkflow: () => {
    set({
      nodes: [createStartNode()],
      edges: [],
      workflowId: null,
      workflowName: 'Untitled Workflow',
      workflowDescription: '',
      isDirty: false,
      lastSaved: null,
      selectedNodeId: null,
      selectedEdgeId: null,
      history: [],
      historyIndex: -1,
      nodeResults: {},
      executionLogs: [],
      isExecuting: false,
      executionId: null,
      executionStatus: 'idle',
    })
  },

  markDirty: () => {
    set({ isDirty: true })
  },

  markSaved: () => {
    set({ isDirty: false, lastSaved: new Date().toISOString() })
  },
}))

// ─── Selector Hooks ─────────────────────────────────────────────────────────

/** Select the full nodes array. */
export const useNodes = () => useWorkflowStore((state) => state.nodes)

/** Select the full edges array. */
export const useEdges = () => useWorkflowStore((state) => state.edges)

/** Select the currently selected node object (or undefined). */
export const useSelectedNode = () =>
  useWorkflowStore((state) => {
    if (!state.selectedNodeId) return undefined
    return state.nodes.find((n) => n.id === state.selectedNodeId)
  })

/** Select the node results record. */
export const useNodeResults = () =>
  useWorkflowStore((state) => state.nodeResults)

/** Select the execution logs array. */
export const useExecutionLogs = () =>
  useWorkflowStore((state) => state.executionLogs)

/** Select whether a workflow execution is currently running. */
export const useIsExecuting = () =>
  useWorkflowStore((state) => state.isExecuting)

export default useWorkflowStore
