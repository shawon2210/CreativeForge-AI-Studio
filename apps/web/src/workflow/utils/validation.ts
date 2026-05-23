/**
 * Workflow Validation
 * Validates workflow graphs for structural correctness before execution.
 */

import { WorkflowNode, WorkflowEdge, ValidationResult, ValidationError } from '../types'

// ─── Cycle Detection (Tarjan-style DFS) ──────────────────────────────────────

/**
 * Detect all elementary cycles in the workflow graph using DFS.
 * Returns an array of cycles, where each cycle is an array of node IDs.
 */
export function detectCycles(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[][] {
  const nodeIds = new Set(nodes.map((n) => n.id))
  const adjacency = new Map<string, string[]>()

  for (const id of nodeIds) {
    adjacency.set(id, [])
  }
  for (const edge of edges) {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      adjacency.get(edge.source)!.push(edge.target)
    }
  }

  const cycles: string[][] = []
  const visited = new Set<string>()
  const onStack = new Set<string>()
  const stack: string[] = []
  const nodeIndex = new Map<string, number>()
  let index = 0

  function dfs(node: string): void {
    visited.add(node)
    onStack.add(node)
    stack.push(node)
    nodeIndex.set(node, index++)
    const lowLink = nodeIndex.get(node)!

    for (const neighbor of adjacency.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        dfs(neighbor)
      }
      if (onStack.has(neighbor)) {
        // Extract cycle from stack
        const cycleStart = stack.indexOf(neighbor)
        if (cycleStart !== -1) {
          const cycle = stack.slice(cycleStart)
          if (cycle.length > 1) {
            cycles.push([...cycle])
          }
        }
      }
    }

    stack.pop()
    onStack.delete(node)
  }

  for (const id of nodeIds) {
    if (!visited.has(id)) {
      dfs(id)
    }
  }

  return cycles
}

// ─── Reachability ────────────────────────────────────────────────────────────

/**
 * Return the set of node IDs reachable from any start node via BFS.
 */
function findReachableFromStarts(
  startIds: Set<string>,
  adjacency: Map<string, string[]>
): Set<string> {
  const reachable = new Set<string>()
  const queue = [...startIds]

  while (queue.length > 0) {
    const current = queue.shift()!
    if (reachable.has(current)) continue
    reachable.add(current)
    for (const neighbor of adjacency.get(current) ?? []) {
      if (!reachable.has(neighbor)) {
        queue.push(neighbor)
      }
    }
  }

  return reachable
}

// ─── Topological Sort ────────────────────────────────────────────────────────

/**
 * Kahn's algorithm for topological ordering. Returns empty array if a cycle exists.
 */
function topologicalSortInternal(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): string[] {
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

// ─── Connection Validation ───────────────────────────────────────────────────

/**
 * Validate whether a connection between two nodes is allowed.
 */
export function validateConnection(
  sourceNode: WorkflowNode,
  targetNode: WorkflowNode,
  sourceHandle: string | null | undefined,
  targetHandle: string | null | undefined
): boolean {
  // Prevent self-connections
  if (sourceNode.id === targetNode.id) return false

  // Start nodes have no inputs — nothing can connect to their input side
  if (sourceNode.type === 'start' && targetHandle === 'input') return false

  // Output nodes have no outputs — nothing can connect from their output side
  if (sourceNode.type === 'output' && sourceHandle === 'output') return false

  // Webhook nodes have no inputs
  if (targetNode.type === 'webhook' && targetHandle === 'input') return false

  return true
}

// ─── Full Workflow Validation ────────────────────────────────────────────────

/**
 * Validate an entire workflow graph.
 * Checks for start/output nodes, disconnected nodes, cycles, and required inputs.
 */
export function validateWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  if (nodes.length === 0) {
    return {
      valid: false,
      errors: [{ type: 'error', message: 'Workflow has no nodes' }],
      warnings: [],
    }
  }

  // 1. Check for at least one start node
  const startNodes = nodes.filter((n) => n.type === 'start')
  if (startNodes.length === 0) {
    errors.push({ type: 'error', message: 'Workflow must have at least one Start node' })
  }

  // 2. Check for at least one output node
  const outputNodes = nodes.filter((n) => n.type === 'output')
  if (outputNodes.length === 0) {
    errors.push({ type: 'error', message: 'Workflow must have at least one Output node' })
  }

  // 3. Check for circular dependencies via topological sort
  const sorted = topologicalSortInternal(nodes, edges)
  if (sorted.length === 0 && nodes.length > 0) {
    errors.push({ type: 'error', message: 'Workflow contains circular dependencies' })
    // Provide detail on the cycles
    const cycles = detectCycles(nodes, edges)
    for (const cycle of cycles) {
      errors.push({
        type: 'error',
        message: `Cycle detected: ${cycle.join(' → ')} → ${cycle[0]}`,
      })
    }
  }

  // 4. Check for disconnected nodes (not reachable from any start)
  if (startNodes.length > 0) {
    const adjacency = new Map<string, string[]>()
    for (const n of nodes) adjacency.set(n.id, [])
    for (const edge of edges) {
      if (adjacency.has(edge.source)) {
        adjacency.get(edge.source)!.push(edge.target)
      }
    }
    const startIds = new Set(startNodes.map((n) => n.id))
    const reachable = findReachableFromStarts(startIds, adjacency)

    for (const node of nodes) {
      if (!reachable.has(node.id)) {
        warnings.push({
          type: 'warning',
          nodeId: node.id,
          message: `Node "${node.data.label}" (${node.id}) is not reachable from any Start node`,
        })
      }
    }
  }

  // 5. Check that all required inputs are connected
  const incomingCounts = new Map<string, number>()
  for (const edge of edges) {
    incomingCounts.set(edge.target, (incomingCounts.get(edge.target) ?? 0) + 1)
  }

  for (const node of nodes) {
    // Start and webhook nodes have no required inputs
    if (node.type === 'start' || node.type === 'webhook') continue

    const incoming = incomingCounts.get(node.id) ?? 0
    if (incoming === 0) {
      errors.push({
        type: 'error',
        nodeId: node.id,
        message: `Node "${node.data.label}" (${node.id}) has no incoming connections but requires at least one input`,
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}
