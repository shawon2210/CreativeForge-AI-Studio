/**
 * Export / Import Utilities
 * Serialize workflows to JSON, trigger browser downloads, and read uploaded files.
 */

import { WorkflowDefinition, ValidationError } from '../types'

// ─── JSON Serialization ──────────────────────────────────────────────────────

/**
 * Serialize a workflow definition to a pretty-printed JSON string.
 */
export function exportWorkflowToJson(workflow: WorkflowDefinition): string {
  return JSON.stringify(workflow, null, 2)
}

// ─── JSON Deserialization ────────────────────────────────────────────────────

/**
 * Validate that an object conforms to the WorkflowDefinition shape.
 * Returns an array of validation errors (empty if valid).
 */
function validateWorkflowObject(obj: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = []

  if (typeof obj.id !== 'string') {
    errors.push({ type: 'error', message: 'Missing or invalid "id" field' })
  }
  if (typeof obj.name !== 'string') {
    errors.push({ type: 'error', message: 'Missing or invalid "name" field' })
  }
  if (typeof obj.description !== 'string') {
    errors.push({ type: 'error', message: 'Missing or invalid "description" field' })
  }
  if (typeof obj.version !== 'string') {
    errors.push({ type: 'error', message: 'Missing or invalid "version" field' })
  }
  if (!Array.isArray(obj.nodes)) {
    errors.push({ type: 'error', message: 'Missing or invalid "nodes" field (must be an array)' })
  } else {
    for (let i = 0; i < obj.nodes.length; i++) {
      const node = obj.nodes[i] as Record<string, unknown>
      if (typeof node.id !== 'string') {
        errors.push({ type: 'error', message: `Node at index ${i} is missing an "id"` })
      }
      if (typeof node.type !== 'string') {
        errors.push({ type: 'error', message: `Node at index ${i} is missing a "type"` })
      }
    }
  }
  if (!Array.isArray(obj.edges)) {
    errors.push({ type: 'error', message: 'Missing or invalid "edges" field (must be an array)' })
  } else {
    for (let i = 0; i < obj.edges.length; i++) {
      const edge = obj.edges[i] as Record<string, unknown>
      if (typeof edge.id !== 'string') {
        errors.push({ type: 'error', message: `Edge at index ${i} is missing an "id"` })
      }
      if (typeof edge.source !== 'string') {
        errors.push({ type: 'error', message: `Edge at index ${i} is missing a "source"` })
      }
      if (typeof edge.target !== 'string') {
        errors.push({ type: 'error', message: `Edge at index ${i} is missing a "target"` })
      }
    }
  }
  if (!obj.viewport || typeof (obj.viewport as Record<string, unknown>).x !== 'number') {
    errors.push({ type: 'error', message: 'Missing or invalid "viewport" field' })
  }

  return errors
}

/**
 * Deserialize a JSON string into a WorkflowDefinition with validation.
 * Throws an error if the JSON is malformed or fails structural validation.
 */
export function importWorkflowFromJson(json: string): WorkflowDefinition {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('Invalid JSON: unable to parse workflow file')
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Invalid workflow: expected a JSON object at the top level')
  }

  const obj = parsed as Record<string, unknown>
  const errors = validateWorkflowObject(obj)

  if (errors.length > 0) {
    const messages = errors.map((e) => e.message).join('; ')
    throw new Error(`Workflow validation failed: ${messages}`)
  }

  return obj as unknown as WorkflowDefinition
}

// ─── Browser Download ────────────────────────────────────────────────────────

/**
 * Trigger a browser download of the workflow as a JSON file.
 */
export function downloadWorkflow(workflow: WorkflowDefinition): void {
  const json = exportWorkflowToJson(workflow)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${workflow.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_v${workflow.version}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ─── Browser Upload ──────────────────────────────────────────────────────────

/**
 * Open a file picker, read the selected JSON file, and return a WorkflowDefinition.
 * The user can cancel the picker, in which case the promise rejects.
 */
export function uploadWorkflow(): Promise<WorkflowDefinition> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'

    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) {
        reject(new Error('No file selected'))
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        try {
          const json = reader.result as string
          const workflow = importWorkflowFromJson(json)
          resolve(workflow)
        } catch (err) {
          reject(err instanceof Error ? err : new Error(String(err)))
        }
      }
      reader.onerror = () => {
        reject(new Error('Failed to read the selected file'))
      }
      reader.readAsText(file)
    }

    input.oncancel = () => {
      reject(new Error('File selection was cancelled'))
    }

    input.click()
  })
}
