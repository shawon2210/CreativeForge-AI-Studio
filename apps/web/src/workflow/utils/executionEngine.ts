/**
 * Execution Engine Utilities
 * Graph traversal, ordering, and variable interpolation for workflow execution.
 */

import { WorkflowNode, WorkflowEdge, NodeExecutionResult } from '../types'

// ─── Topological Sort ────────────────────────────────────────────────────────

/**
 * Return node IDs in topological (execution) order using Kahn's algorithm.
 * Returns an empty array if the graph contains a cycle.
 */
export function topologicalSort(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
  const nodeIds = new Set(nodes.map((n) => n.id))
  const inDegree = new Map<string, number>()
  const adjacency = new Map<string, string[]>()

  for (const id of nodeIds) {
    inDegree.set(id, 0)
    adjacency.set(id, [])
  }

  for (const edge of edges) {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      adjacency.get(edge.source)!.push(edge.target)
      inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1)
    }
  }

  const queue: string[] = []
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id)
  }

  const sorted: string[] = []
  while (queue.length > 0) {
    const current = queue.shift()!
    sorted.push(current)
    for (const neighbor of adjacency.get(current) ?? []) {
      const newDeg = (inDegree.get(neighbor) ?? 0) - 1
      inDegree.set(neighbor, newDeg)
      if (newDeg === 0) queue.push(neighbor)
    }
  }

  return sorted.length === nodes.length ? sorted : []
}

// ─── Upstream / Downstream Traversal ─────────────────────────────────────────

/**
 * Build a reverse adjacency map (child → parents) from edges.
 */
function buildReverseAdjacency(
  nodeIds: Set<string>,
  edges: WorkflowEdge[]
): Map<string, string[]> {
  const reverse = new Map<string, string[]>()
  for (const id of nodeIds) reverse.set(id, [])
  for (const edge of edges) {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      reverse.get(edge.target)!.push(edge.source)
    }
  }
  return reverse
}

/**
 * Build a forward adjacency map (parent → children) from edges.
 */
function buildForwardAdjacency(
  nodeIds: Set<string>,
  edges: WorkflowEdge[]
): Map<string, string[]> {
  const forward = new Map<string, string[]>()
  for (const id of nodeIds) forward.set(id, [])
  for (const edge of edges) {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      forward.get(edge.source)!.push(edge.target)
    }
  }
  return forward
}

/**
 * Return all ancestor node IDs (upstream) for a given node via BFS on reverse edges.
 */
export function getUpstreamNodes(nodeId: string, edges: WorkflowEdge[]): string[] {
  const nodeIds = new Set<string>()
  for (const e of edges) {
    nodeIds.add(e.source)
    nodeIds.add(e.target)
  }
  const reverse = buildReverseAdjacency(nodeIds, edges)

  const visited = new Set<string>()
  const queue = [nodeId]
  const ancestors: string[] = []

  while (queue.length > 0) {
    const current = queue.shift()!
    for (const parent of reverse.get(current) ?? []) {
      if (!visited.has(parent)) {
        visited.add(parent)
        ancestors.push(parent)
        queue.push(parent)
      }
    }
  }

  return ancestors
}

/**
 * Return all descendant node IDs (downstream) for a given node via BFS on forward edges.
 */
export function getDownstreamNodes(nodeId: string, edges: WorkflowEdge[]): string[] {
  const nodeIds = new Set<string>()
  for (const e of edges) {
    nodeIds.add(e.source)
    nodeIds.add(e.target)
  }
  const forward = buildForwardAdjacency(nodeIds, edges)

  const visited = new Set<string>()
  const queue = [nodeId]
  const descendants: string[] = []

  while (queue.length > 0) {
    const current = queue.shift()!
    for (const child of forward.get(current) ?? []) {
      if (!visited.has(child)) {
        visited.add(child)
        descendants.push(child)
        queue.push(child)
      }
    }
  }

  return descendants
}

// ─── Node Input Collection ───────────────────────────────────────────────────

/**
 * Collect inputs for a node from the results of its upstream nodes.
 * Returns a map of handle ID → output value.
 */
export function getNodeInputs(
  nodeId: string,
  edges: WorkflowEdge[],
  results: Record<string, NodeExecutionResult>
): Record<string, unknown> {
  const inputs: Record<string, unknown> = {}

  // Find all edges targeting this node, grouped by target handle
  const incomingEdges = edges.filter((e) => e.target === nodeId)

  for (const edge of incomingEdges) {
    const sourceResult = results[edge.source]
    if (!sourceResult) continue

    const handle = edge.targetHandle ?? 'input'
    const value = sourceResult.output ?? sourceResult.data ?? sourceResult.imageUrl
    if (value !== undefined) {
      inputs[handle] = value
    }
  }

  return inputs
}

// ─── Variable Interpolation ──────────────────────────────────────────────────

/**
 * Replace {{nodeId.output}} patterns in a template string with values from context.
 *
 * Supported patterns:
 *   {{nodeId.output}}       — replaced with context[nodeId].output
 *   {{nodeId.data.field}}   — replaced with context[nodeId].data.field
 *   {{nodeId.anyKey}}       — replaced with context[nodeId][anyKey]
 *
 * Unresolved patterns are left as-is.
 */
export function interpolateVariables(
  template: string,
  context: Record<string, unknown>
): string {
  // Match {{nodeId.something}} patterns
  const pattern = /\{\{([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_.-]+)\}\}/g

  return template.replace(pattern, (_match, nodeId: string, path: string) => {
    const nodeData = context[nodeId]
    if (nodeData == null) return _match

    // Traverse dotted path
    const keys = path.split('.')
    let value: unknown = nodeData
    for (const key of keys) {
      if (value == null || typeof value !== 'object') return _match
      value = (value as Record<string, unknown>)[key]
    }

    if (value == null) return _match
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  })
}
