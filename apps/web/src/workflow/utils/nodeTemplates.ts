/**
 * Node Templates
 * Pre-configured templates for each workflow node type used in the node palette.
 */

import {
  NodeTemplate,
  WorkflowNodeType,
  WorkflowNodeData,
  StartNodeData,
  TextGenNodeData,
  ImageGenNodeData,
  CanvasNodeData,
  OutputNodeData,
  AgentNodeData,
  ConditionNodeData,
  LoopNodeData,
  MemoryNodeData,
  WebhookNodeData,
  SubflowNodeData,
} from '../types'

// ─── Default Data Factories ──────────────────────────────────────────────────

function defaultStartData(): Partial<StartNodeData> {
  return {
    label: 'Start',
    status: 'idle',
    description: 'Workflow entry point',
    icon: '▶',
    color: '#6366f1',
    triggerMode: 'manual',
  }
}

function defaultTextGenData(): Partial<TextGenNodeData> {
  return {
    label: 'Text Generation',
    status: 'idle',
    description: 'Generate text with AI',
    icon: '✦',
    color: '#3b82f6',
    prompt: '',
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: '',
    streaming: false,
  }
}

function defaultImageGenData(): Partial<ImageGenNodeData> {
  return {
    label: 'Image Generation',
    status: 'idle',
    description: 'Generate images with AI',
    icon: '🖼',
    color: '#f59e0b',
    prompt: '',
    model: 'dall-e-3',
    width: 1024,
    height: 1024,
    style: 'natural',
    negativePrompt: '',
  }
}

function defaultCanvasData(): Partial<CanvasNodeData> {
  return {
    label: 'Canvas',
    status: 'idle',
    description: 'Merge and transform content',
    icon: '🎨',
    color: '#8b5cf6',
    inputText: '',
    inputImage: '',
    output: '',
    operation: 'merge',
  }
}

function defaultOutputData(): Partial<OutputNodeData> {
  return {
    label: 'Output',
    status: 'idle',
    description: 'Workflow output',
    icon: '💾',
    color: '#10b981',
    format: 'text',
  }
}

function defaultAgentData(): Partial<AgentNodeData> {
  return {
    label: 'Agent',
    status: 'idle',
    description: 'Autonomous AI agent',
    icon: '🤖',
    color: '#ec4899',
    agentType: 'reAct',
    systemPrompt: '',
    tools: [],
    maxIterations: 10,
    model: 'gpt-4o',
    memory: true,
  }
}

function defaultConditionData(): Partial<ConditionNodeData> {
  return {
    label: 'Condition',
    status: 'idle',
    description: 'Branch based on a condition',
    icon: '◆',
    color: '#f97316',
    condition: '',
    operator: 'equals',
    value: '',
    trueLabel: 'True',
    falseLabel: 'False',
  }
}

function defaultLoopData(): Partial<LoopNodeData> {
  return {
    label: 'Loop',
    status: 'idle',
    description: 'Iterate over items',
    icon: '↻',
    color: '#14b8a6',
    maxIterations: 10,
    loopVariable: 'item',
    breakCondition: '',
  }
}

function defaultMemoryData(): Partial<MemoryNodeData> {
  return {
    label: 'Memory',
    status: 'idle',
    description: 'Store and retrieve data',
    icon: '🧠',
    color: '#a855f7',
    memoryType: 'short-term',
    storage: 'local',
    key: '',
    value: '',
  }
}

function defaultWebhookData(): Partial<WebhookNodeData> {
  return {
    label: 'Webhook',
    status: 'idle',
    description: 'HTTP request trigger',
    icon: '🔗',
    color: '#ef4444',
    method: 'POST',
    url: '',
    headers: {},
    body: '',
    timeout: 30000,
  }
}

function defaultSubflowData(): Partial<SubflowNodeData> {
  return {
    label: 'Subflow',
    status: 'idle',
    description: 'Run a nested workflow',
    icon: '📦',
    color: '#64748b',
    workflowId: '',
    inputs: {},
    outputs: {},
  }
}

// ─── Template Definitions ────────────────────────────────────────────────────

export const NODE_TEMPLATES: NodeTemplate[] = [
  {
    type: 'start',
    label: 'Start',
    description: 'Workflow entry point — triggers manually, via webhook, or on a schedule',
    category: 'input',
    icon: '▶',
    color: '#6366f1',
    defaultData: defaultStartData(),
    inputs: [],
    outputs: [
      { id: 'output', label: 'Output', type: 'any', required: false },
    ],
  },
  {
    type: 'text_gen',
    label: 'Text Generation',
    description: 'Generate text using a language model',
    category: 'processing',
    icon: '✦',
    color: '#3b82f6',
    defaultData: defaultTextGenData(),
    inputs: [
      { id: 'input', label: 'Input', type: 'text', required: true },
    ],
    outputs: [
      { id: 'output', label: 'Output', type: 'text', required: false },
    ],
  },
  {
    type: 'image_gen',
    label: 'Image Generation',
    description: 'Generate images from a text prompt',
    category: 'processing',
    icon: '🖼',
    color: '#f59e0b',
    defaultData: defaultImageGenData(),
    inputs: [
      { id: 'input', label: 'Prompt', type: 'text', required: true },
    ],
    outputs: [
      { id: 'output', label: 'Image', type: 'image', required: false },
    ],
  },
  {
    type: 'canvas',
    label: 'Canvas',
    description: 'Merge, transform, filter, or overlay content',
    category: 'processing',
    icon: '🎨',
    color: '#8b5cf6',
    defaultData: defaultCanvasData(),
    inputs: [
      { id: 'input_0', label: 'Input 1', type: 'any', required: true },
      { id: 'input_1', label: 'Input 2', type: 'any', required: false },
    ],
    outputs: [
      { id: 'output', label: 'Output', type: 'any', required: false },
    ],
  },
  {
    type: 'output',
    label: 'Output',
    description: 'Final output of the workflow',
    category: 'output',
    icon: '💾',
    color: '#10b981',
    defaultData: defaultOutputData(),
    inputs: [
      { id: 'input', label: 'Input', type: 'any', required: true },
    ],
    outputs: [],
  },
  {
    type: 'agent',
    label: 'Agent',
    description: 'Autonomous AI agent with tool use and reasoning',
    category: 'advanced',
    icon: '🤖',
    color: '#ec4899',
    defaultData: defaultAgentData(),
    inputs: [
      { id: 'input', label: 'Input', type: 'text', required: true },
    ],
    outputs: [
      { id: 'output', label: 'Output', type: 'text', required: false },
    ],
  },
  {
    type: 'condition',
    label: 'Condition',
    description: 'Branch the workflow based on a condition',
    category: 'logic',
    icon: '◆',
    color: '#f97316',
    defaultData: defaultConditionData(),
    inputs: [
      { id: 'input', label: 'Input', type: 'any', required: true },
    ],
    outputs: [
      { id: 'true', label: 'True', type: 'any', required: false },
      { id: 'false', label: 'False', type: 'any', required: false },
    ],
  },
  {
    type: 'loop',
    label: 'Loop',
    description: 'Iterate over a set of items or a number of times',
    category: 'logic',
    icon: '↻',
    color: '#14b8a6',
    defaultData: defaultLoopData(),
    inputs: [
      { id: 'input', label: 'Input', type: 'any', required: true },
    ],
    outputs: [
      { id: 'output', label: 'Output', type: 'any', required: false },
    ],
  },
  {
    type: 'memory',
    label: 'Memory',
    description: 'Store and retrieve data across workflow steps',
    category: 'advanced',
    icon: '🧠',
    color: '#a855f7',
    defaultData: defaultMemoryData(),
    inputs: [
      { id: 'input', label: 'Input', type: 'any', required: true },
    ],
    outputs: [
      { id: 'output', label: 'Output', type: 'any', required: false },
    ],
  },
  {
    type: 'webhook',
    label: 'Webhook',
    description: 'Trigger the workflow via an HTTP request',
    category: 'advanced',
    icon: '🔗',
    color: '#ef4444',
    defaultData: defaultWebhookData(),
    inputs: [],
    outputs: [
      { id: 'output', label: 'Output', type: 'json', required: false },
    ],
  },
  {
    type: 'subflow',
    label: 'Subflow',
    description: 'Run a nested workflow inside this workflow',
    category: 'advanced',
    icon: '📦',
    color: '#64748b',
    defaultData: defaultSubflowData(),
    inputs: [
      { id: 'input', label: 'Input', type: 'any', required: true },
    ],
    outputs: [
      { id: 'output', label: 'Output', type: 'any', required: false },
    ],
  },
]

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Look up a single node template by its type string.
 */
export function getTemplateByType(type: WorkflowNodeType): NodeTemplate | undefined {
  return NODE_TEMPLATES.find((t) => t.type === type)
}

/**
 * Return all node templates in a given category.
 */
export function getTemplatesByCategory(
  category: NodeTemplate['category']
): NodeTemplate[] {
  return NODE_TEMPLATES.filter((t) => t.category === category)
}
