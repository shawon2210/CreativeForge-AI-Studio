/**
 * Workflow Execution Hooks
 *
 * Core React hooks for executing workflows, handling keyboard shortcuts,
 * and auto-saving. Bridges the Zustand store, API service, and execution
 * engine utilities.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

import { useWorkflowStore } from '../stores/workflowStore'
import { workflowApi } from '../services/workflowApi'
import {
  WorkflowNode,
  WorkflowEdge,
  NodeExecutionResult,
  ExecutionLog,
  WorkflowDefinition,
} from '../types'
import { validateWorkflow } from '../utils/validation'
import { topologicalSort, getNodeInputs } from '../utils/executionEngine'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildWorkflowDefinition(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  workflowId: string | null,
  workflowName: string,
  workflowDescription: string,
): WorkflowDefinition {
  return {
    id: workflowId ?? `wf_${Date.now()}`,
    name: workflowName,
    description: workflowDescription,
    version: '1.0.0',
    nodes,
    edges,
    viewport: { x: 0, y: 0, zoom: 1 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isTemplate: false,
    tags: [],
    userId: '',
  }
}

// ─── useWorkflowExecution ─────────────────────────────────────────────────────

export function useWorkflowExecution() {
  const nodes = useWorkflowStore((s) => s.nodes)
  const edges = useWorkflowStore((s) => s.edges)
  const isExecuting = useWorkflowStore((s) => s.isExecuting)
  const executionLogs = useWorkflowStore((s) => s.executionLogs)
  const nodeResults = useWorkflowStore((s) => s.nodeResults)
  const executionId = useWorkflowStore((s) => s.executionId)
  const workflowId = useWorkflowStore((s) => s.workflowId)
  const workflowName = useWorkflowStore((s) => s.workflowName)
  const workflowDescription = useWorkflowStore((s) => s.workflowDescription)

  const startExecution = useWorkflowStore((s) => s.startExecution)
  const stopExecution = useWorkflowStore((s) => s.stopExecution)
  const setNodeResult = useWorkflowStore((s) => s.setNodeResult)
  const addLog = useWorkflowStore((s) => s.addLog)
  const clearLogs = useWorkflowStore((s) => s.clearLogs)
  const updateNodeStatus = useWorkflowStore((s) => s.updateNodeStatus)

  // Ref to track cancellation without causing re-renders
  const cancelledRef = useRef(false)

  // ── Execute single node ───────────────────────────────────────────────────

  const executeNode = useCallback(
    async (nodeId: string): Promise<NodeExecutionResult> => {
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) {
        return {
          nodeId,
          success: false,
          error: `Node ${nodeId} not found`,
          duration: 0,
          timestamp: new Date().toISOString(),
        }
      }

      updateNodeStatus(nodeId, 'running')
      const startTime = Date.now()

      try {
        let result: NodeExecutionResult

        switch (node.type) {
          case 'text_gen':
          case 'image_gen':
          case 'agent': {
            const response = await workflowApi.testNode(node.type, node.data as unknown as Record<string, unknown>)
            result = {
              nodeId,
              success: response.success,
              output: response.output,
              error: response.error,
              duration: Date.now() - startTime,
              timestamp: new Date().toISOString(),
            }
            break
          }

          case 'canvas': {
            const inputs = getNodeInputs(nodeId, edges, useWorkflowStore.getState().nodeResults)
            const nodeData = node.data as unknown as Record<string, unknown>
            result = {
              nodeId,
              success: true,
              output: `Canvas processed: ${JSON.stringify(inputs)}`,
              data: { inputs, operation: nodeData.operation },
              duration: Date.now() - startTime,
              timestamp: new Date().toISOString(),
            }
            break
          }

          case 'output': {
            const inputs = getNodeInputs(nodeId, edges, useWorkflowStore.getState().nodeResults)
            const collectedOutputs = Object.values(inputs)
            result = {
              nodeId,
              success: true,
              output: collectedOutputs.length > 0 ? String(collectedOutputs[collectedOutputs.length - 1]) : '',
              data: { inputs },
              duration: Date.now() - startTime,
              timestamp: new Date().toISOString(),
            }
            break
          }

          case 'start': {
            // Start nodes pass through immediately
            result = {
              nodeId,
              success: true,
              output: 'started',
              duration: Date.now() - startTime,
              timestamp: new Date().toISOString(),
            }
            break
          }

          default: {
            // Generic handler for condition, loop, memory, webhook, subflow
            const response = await workflowApi.testNode(node.type, node.data as unknown as Record<string, unknown>)
            result = {
              nodeId,
              success: response.success,
              output: response.output,
              error: response.error,
              duration: Date.now() - startTime,
              timestamp: new Date().toISOString(),
            }
            break
          }
        }

        setNodeResult(nodeId, result)

        if (result.success) {
          addLog({
            level: 'success',
            nodeId,
            message: `Node "${node.data.label}" executed successfully (${result.duration}ms)`,
          })
        } else {
          addLog({
            level: 'error',
            nodeId,
            message: `Node "${node.data.label}" failed: ${result.error ?? 'Unknown error'}`,
          })
        }

        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        const result: NodeExecutionResult = {
          nodeId,
          success: false,
          error: errorMessage,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        }
        setNodeResult(nodeId, result)
        addLog({
          level: 'error',
          nodeId,
          message: `Node "${node.data.label}" threw an error: ${errorMessage}`,
        })
        return result
      }
    },
    [nodes, edges, updateNodeStatus, setNodeResult, addLog],
  )

  // ── Execute full workflow ────────────────────────────────────────────────

  const executeWorkflow = useCallback(async () => {
    // 1. Validate the workflow first
    const validation = validateWorkflow(nodes, edges)

    if (!validation.valid) {
      for (const error of validation.errors) {
        addLog({
          level: 'error',
          nodeId: error.nodeId,
          message: `Validation error: ${error.message}`,
        })
      }
      for (const warning of validation.warnings) {
        addLog({
          level: 'warn',
          nodeId: warning.nodeId,
          message: `Validation warning: ${warning.message}`,
        })
      }
      return
    }

    // 2. Start execution
    cancelledRef.current = false
    startExecution()
    addLog({ level: 'info', message: 'Workflow execution started' })

    try {
      // 3. Get topological sort of nodes
      const sortedIds = topologicalSort(nodes, edges)

      if (sortedIds.length === 0) {
        addLog({ level: 'error', message: 'Cannot determine execution order — graph may contain cycles' })
        stopExecution()
        return
      }

      // 4. Iterate through nodes in order
      for (const nodeId of sortedIds) {
        if (cancelledRef.current) {
          addLog({ level: 'warn', message: 'Execution cancelled by user' })
          break
        }

        const node = nodes.find((n) => n.id === nodeId)
        if (!node) continue

        await executeNode(nodeId)
      }

      if (!cancelledRef.current) {
        addLog({ level: 'success', message: 'Workflow execution completed' })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown execution error'
      addLog({ level: 'error', message: `Execution failed: ${errorMessage}` })
    } finally {
      stopExecution()
    }
  }, [nodes, edges, startExecution, stopExecution, addLog, executeNode])

  // ── Cancel execution ──────────────────────────────────────────────────────

  const cancelExecution = useCallback(() => {
    cancelledRef.current = true
    if (executionId) {
      workflowApi.stopWorkflow(executionId).catch(() => {
        // Best-effort cancellation on the server side
      })
    }
    stopExecution()
    addLog({ level: 'warn', message: 'Execution cancelled' })
  }, [executionId, stopExecution, addLog])

  // ── Clear results ─────────────────────────────────────────────────────────

  const clearResults = useCallback(() => {
    clearLogs()
    // Reset node statuses back to idle
    for (const node of nodes) {
      updateNodeStatus(node.id, 'idle')
    }
    // Clear nodeResults via resetExecution
    useWorkflowStore.getState().resetExecution()
  }, [clearLogs, nodes, updateNodeStatus])

  return {
    // Execution State
    isExecuting,
    executionLogs,
    nodeResults,

    // Execution Methods
    executeWorkflow,
    executeNode,
    cancelExecution,
    clearResults,
  }
}

// ─── useWorkflowKeyboard ──────────────────────────────────────────────────────

export function useWorkflowKeyboard() {
  const undo = useWorkflowStore((s) => s.undo)
  const redo = useWorkflowStore((s) => s.redo)
  const deleteSelected = useWorkflowStore((s) => s.deleteSelected)
  const duplicateNode = useWorkflowStore((s) => s.duplicateNode)
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId)
  const selectedEdgeId = useWorkflowStore((s) => s.selectedEdgeId)
  const selectNode = useWorkflowStore((s) => s.selectNode)
  const isExecuting = useWorkflowStore((s) => s.isExecuting)
  const nodes = useWorkflowStore((s) => s.nodes)
  const edges = useWorkflowStore((s) => s.edges)
  const workflowId = useWorkflowStore((s) => s.workflowId)
  const workflowName = useWorkflowStore((s) => s.workflowName)
  const workflowDescription = useWorkflowStore((s) => s.workflowDescription)
  const markSaved = useWorkflowStore((s) => s.markSaved)

  const { executeWorkflow, cancelExecution } = useWorkflowExecution()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey

      // Ctrl/Cmd + Z: undo
      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }

      // Ctrl/Cmd + Shift + Z: redo
      if (isMod && e.shiftKey && e.key === 'Z') {
        e.preventDefault()
        redo()
        return
      }

      // Delete / Backspace: delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isMod) {
        // Don't intercept when user is typing in an input/textarea
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return
        }
        if (selectedNodeId || selectedEdgeId) {
          e.preventDefault()
          deleteSelected()
        }
        return
      }

      // Ctrl/Cmd + D: duplicate selected
      if (isMod && e.key === 'd') {
        e.preventDefault()
        if (selectedNodeId) {
          duplicateNode(selectedNodeId)
        }
        return
      }

      // Ctrl/Cmd + S: save workflow
      if (isMod && e.key === 's') {
        e.preventDefault()
        const def = buildWorkflowDefinition(nodes, edges, workflowId, workflowName, workflowDescription)
        workflowApi.saveWorkflow(def).then(() => {
          markSaved()
        }).catch(() => {
          // Save failure is silently ignored; the store remains dirty
        })
        return
      }

      // Space: toggle execution
      if (e.key === ' ' && !isMod) {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return
        }
        e.preventDefault()
        if (isExecuting) {
          cancelExecution()
        } else {
          executeWorkflow()
        }
        return
      }

      // Escape: deselect
      if (e.key === 'Escape') {
        selectNode(null)
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    undo,
    redo,
    deleteSelected,
    duplicateNode,
    selectedNodeId,
    selectedEdgeId,
    selectNode,
    isExecuting,
    nodes,
    edges,
    workflowId,
    workflowName,
    workflowDescription,
    markSaved,
    executeWorkflow,
    cancelExecution,
  ])
}

// ─── useAutoSave ──────────────────────────────────────────────────────────────

export function useAutoSave(intervalMs = 30_000) {
  const isDirty = useWorkflowStore((s) => s.isDirty)
  const nodes = useWorkflowStore((s) => s.nodes)
  const edges = useWorkflowStore((s) => s.edges)
  const workflowId = useWorkflowStore((s) => s.workflowId)
  const workflowName = useWorkflowStore((s) => s.workflowName)
  const workflowDescription = useWorkflowStore((s) => s.workflowDescription)
  const markSaved = useWorkflowStore((s) => s.markSaved)

  const [saveIndicator, setSaveIndicator] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const indicatorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const id = setInterval(() => {
      if (!isDirty) return

      setSaveIndicator('saving')

      const def = buildWorkflowDefinition(nodes, edges, workflowId, workflowName, workflowDescription)

      workflowApi
        .saveWorkflow(def)
        .then(() => {
          markSaved()
          setSaveIndicator('saved')
        })
        .catch(() => {
          setSaveIndicator('error')
        })
        .finally(() => {
          // Clear the indicator after 2 seconds
          if (indicatorTimerRef.current) clearTimeout(indicatorTimerRef.current)
          indicatorTimerRef.current = setTimeout(() => setSaveIndicator('idle'), 2000)
        })
    }, intervalMs)

    return () => {
      clearInterval(id)
      if (indicatorTimerRef.current) clearTimeout(indicatorTimerRef.current)
    }
  }, [isDirty, nodes, edges, workflowId, workflowName, workflowDescription, markSaved, intervalMs])

  return { saveIndicator }
}
