/**
 * Configuration Panel — Dynamic sidebar for editing node properties
 */
import React, { useState, useEffect } from 'react'
import type { WorkflowNode, WorkflowNodeData } from '../types'
import { NODE_TEMPLATES } from '../utils/nodeTemplates'

interface Props {
  nodeId: string
  node: WorkflowNode | undefined
  onClose: () => void
  onUpdate: (data: Record<string, unknown>) => void
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '6px 10px',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6,
  fontSize: 11, fontFamily: 'inherit',
  background: 'rgba(255,255,255,0.03)', color: '#e2e8f0',
  outline: 'none', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: 10, color: '#94a3b8', fontWeight: 600,
  marginBottom: 4, display: 'block',
}

const NODE_STATUS_COLORS: Record<string, string> = {
  idle: '#6366f1', running: '#f59e0b', success: '#10b981',
  error: '#ef4444', warning: '#f97316', cancelled: '#64748b',
}

export const ConfigPanel: React.FC<Props> = ({ nodeId, node, onClose, onUpdate }) => {
  const [localData, setLocalData] = useState<Record<string, unknown>>({})

  useEffect(() => {
    if (node?.data) {
      setLocalData({ ...node.data } as Record<string, unknown>)
    }
  }, [node?.data])

  if (!node) {
    return (
      <div style={{ padding: 16, color: '#64748b', fontSize: 12, textAlign: 'center' }}>
        No node selected
      </div>
    )
  }

  const template = NODE_TEMPLATES.find((t) => t.type === node.type)
  const color = template?.color || '#6366f1'
  const status = (localData.status as string) || 'idle'
  const statusColor = NODE_STATUS_COLORS[status] || color

  const update = (key: string, value: unknown) => {
    const newData = { ...localData, [key]: value }
    setLocalData(newData)
    onUpdate({ [key]: value })
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#0c0c16',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{
          width: 32, height: 32, borderRadius: 8,
          background: `${color}15`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>
          {template?.icon || '⬡'}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>
            {template?.label || node.type}
          </div>
          <div style={{ fontSize: 10, color: '#64748b' }}>
            {nodeId}
          </div>
        </div>
        {/* Status indicator */}
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: statusColor,
          boxShadow: status === 'running' ? `0 0 8px ${statusColor}` : 'none',
          animation: status === 'running' ? 'pulse 1s infinite' : 'none',
        }} />
        <button onClick={onClose}
          style={{
            background: 'transparent', border: 'none',
            color: '#64748b', cursor: 'pointer', fontSize: 16,
            padding: 4, borderRadius: 4,
          }}>
          ✕
        </button>
      </div>

      {/* Form */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {/* Label */}
        <div>
          <label style={labelStyle}>Label</label>
          <input type="text"
            value={(localData.label as string) || ''}
            onChange={(e) => update('label', e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description</label>
          <input type="text"
            value={(localData.description as string) || ''}
            onChange={(e) => update('description', e.target.value)}
            style={inputStyle}
            placeholder="Optional description..."
          />
        </div>

        {/* ─── Type-specific fields ─────────────────────────────────── */}
        {node.type === 'start' && (
          <>
            <div>
              <label style={labelStyle}>Trigger Mode</label>
              <select value={(localData.triggerMode as string) || 'manual'}
                onChange={(e) => update('triggerMode', e.target.value)}
                style={inputStyle}>
                <option value="manual">Manual</option>
                <option value="webhook">Webhook</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            {localData.triggerMode === 'webhook' && (
              <div>
                <label style={labelStyle}>Webhook URL</label>
                <input type="text"
                  value={(localData.webhookUrl as string) || ''}
                  onChange={(e) => update('webhookUrl', e.target.value)}
                  style={inputStyle}
                  placeholder="https://..."
                />
              </div>
            )}
            {localData.triggerMode === 'scheduled' && (
              <div>
                <label style={labelStyle}>Cron Expression</label>
                <input type="text"
                  value={(localData.schedule as string) || ''}
                  onChange={(e) => update('schedule', e.target.value)}
                  style={inputStyle}
                  placeholder="0 * * * *"
                />
              </div>
            )}
          </>
        )}

        {node.type === 'text_gen' && (
          <>
            <div>
              <label style={labelStyle}>Prompt</label>
              <textarea
                value={(localData.prompt as string) || ''}
                onChange={(e) => update('prompt', e.target.value)}
                style={{ ...inputStyle, height: 80, resize: 'vertical' }}
                placeholder="Enter your prompt..."
              />
            </div>
            <div>
              <label style={labelStyle}>Model</label>
              <select value={(localData.model as string) || 'gpt-4o'}
                onChange={(e) => update('model', e.target.value)}
                style={inputStyle}>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                <option value="claude-3-haiku">Claude 3 Haiku</option>
                <option value="gemini-pro">Gemini Pro</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="llama-3.1-70b">Llama 3.1 70B</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>System Prompt</label>
              <textarea
                value={(localData.systemPrompt as string) || ''}
                onChange={(e) => update('systemPrompt', e.target.value)}
                style={{ ...inputStyle, height: 60, resize: 'vertical' }}
                placeholder="System instructions..."
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Temperature: {localData.temperature as number || 0.7}</label>
                <input type="range" min="0" max="2" step="0.1"
                  value={(localData.temperature as number) || 0.7}
                  onChange={(e) => update('temperature', parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#3b82f6' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Max Tokens</label>
                <input type="number"
                  value={(localData.maxTokens as number) || 2048}
                  onChange={(e) => update('maxTokens', parseInt(e.target.value))}
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="streaming"
                checked={(localData.streaming as boolean) || false}
                onChange={(e) => update('streaming', e.target.checked)}
                style={{ accentColor: '#3b82f6' }}
              />
              <label htmlFor="streaming" style={{ fontSize: 11, color: '#94a3b8' }}>
                Enable streaming output
              </label>
            </div>
          </>
        )}

        {node.type === 'image_gen' && (
          <>
            <div>
              <label style={labelStyle}>Prompt</label>
              <textarea
                value={(localData.prompt as string) || ''}
                onChange={(e) => update('prompt', e.target.value)}
                style={{ ...inputStyle, height: 80, resize: 'vertical' }}
                placeholder="Describe the image..."
              />
            </div>
            <div>
              <label style={labelStyle}>Model</label>
              <select value={(localData.model as string) || 'dall-e-3'}
                onChange={(e) => update('model', e.target.value)}
                style={inputStyle}>
                <option value="dall-e-3">DALL-E 3</option>
                <option value="stable-diffusion-xl">Stable Diffusion XL</option>
                <option value="midjourney">Midjourney</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Style</label>
              <select value={(localData.style as string) || 'photorealistic'}
                onChange={(e) => update('style', e.target.value)}
                style={inputStyle}>
                <option value="photorealistic">Photorealistic</option>
                <option value="cinematic">Cinematic</option>
                <option value="anime">Anime</option>
                <option value="digital-art">Digital Art</option>
                <option value="oil-painting">Oil Painting</option>
                <option value="watercolor">Watercolor</option>
                <option value="3d-render">3D Render</option>
                <option value="pixel-art">Pixel Art</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Width</label>
                <input type="number"
                  value={(localData.width as number) || 1024}
                  onChange={(e) => update('width', parseInt(e.target.value))}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Height</label>
                <input type="number"
                  value={(localData.height as number) || 1024}
                  onChange={(e) => update('height', parseInt(e.target.value))}
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Negative Prompt</label>
              <input type="text"
                value={(localData.negativePrompt as string) || ''}
                onChange={(e) => update('negativePrompt', e.target.value)}
                style={inputStyle}
                placeholder="What to avoid..."
              />
            </div>
          </>
        )}

        {node.type === 'canvas' && (
          <>
            <div>
              <label style={labelStyle}>Operation</label>
              <select value={(localData.operation as string) || 'merge'}
                onChange={(e) => update('operation', e.target.value)}
                style={inputStyle}>
                <option value="merge">Merge</option>
                <option value="transform">Transform</option>
                <option value="filter">Filter</option>
                <option value="overlay">Overlay</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Width</label>
                <input type="number"
                  value={(localData.width as number) || 1024}
                  onChange={(e) => update('width', parseInt(e.target.value))}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Height</label>
                <input type="number"
                  value={(localData.height as number) || 1024}
                  onChange={(e) => update('height', parseInt(e.target.value))}
                  style={inputStyle}
                />
              </div>
            </div>
          </>
        )}

        {node.type === 'output' && (
          <div>
            <label style={labelStyle}>Format</label>
            <select value={(localData.format as string) || 'text'}
              onChange={(e) => update('format', e.target.value)}
              style={inputStyle}>
              <option value="text">Text</option>
              <option value="markdown">Markdown</option>
              <option value="json">JSON</option>
              <option value="image">Image</option>
            </select>
          </div>
        )}

        {node.type === 'agent' && (
          <>
            <div>
              <label style={labelStyle}>Agent Type</label>
              <select value={(localData.agentType as string) || 'reAct'}
                onChange={(e) => update('agentType', e.target.value)}
                style={inputStyle}>
                <option value="reAct">ReAct</option>
                <option value="plan-execute">Plan & Execute</option>
                <option value="conversation">Conversation</option>
                <option value="tool-use">Tool Use</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>System Prompt</label>
              <textarea
                value={(localData.systemPrompt as string) || ''}
                onChange={(e) => update('systemPrompt', e.target.value)}
                style={{ ...inputStyle, height: 80, resize: 'vertical' }}
                placeholder="Agent instructions..."
              />
            </div>
            <div>
              <label style={labelStyle}>Model</label>
              <select value={(localData.model as string) || 'gpt-4o'}
                onChange={(e) => update('model', e.target.value)}
                style={inputStyle}>
                <option value="gpt-4o">GPT-4o</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Max Iterations: {localData.maxIterations as number || 10}</label>
              <input type="range" min="1" max="50" step="1"
                value={(localData.maxIterations as number) || 10}
                onChange={(e) => update('maxIterations', parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#ec4899' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="agent-memory"
                checked={(localData.memory as boolean) || false}
                onChange={(e) => update('memory', e.target.checked)}
                style={{ accentColor: '#ec4899' }}
              />
              <label htmlFor="agent-memory" style={{ fontSize: 11, color: '#94a3b8' }}>
                Enable memory
              </label>
            </div>
          </>
        )}

        {node.type === 'condition' && (
          <>
            <div>
              <label style={labelStyle}>Condition Expression</label>
              <textarea
                value={(localData.condition as string) || ''}
                onChange={(e) => update('condition', e.target.value)}
                style={{ ...inputStyle, height: 60, resize: 'vertical', fontFamily: 'monospace' }}
                placeholder="e.g., input.length > 0"
              />
            </div>
            <div>
              <label style={labelStyle}>Operator</label>
              <select value={(localData.operator as string) || 'equals'}
                onChange={(e) => update('operator', e.target.value)}
                style={inputStyle}>
                <option value="equals">Equals</option>
                <option value="contains">Contains</option>
                <option value="greater">Greater Than</option>
                <option value="less">Less Than</option>
                <option value="exists">Exists</option>
                <option value="regex">Regex Match</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Compare Value</label>
              <input type="text"
                value={(localData.value as string) || ''}
                onChange={(e) => update('value', e.target.value)}
                style={inputStyle}
                placeholder="Value to compare against..."
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>True Label</label>
                <input type="text"
                  value={(localData.trueLabel as string) || 'TRUE'}
                  onChange={(e) => update('trueLabel', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>False Label</label>
                <input type="text"
                  value={(localData.falseLabel as string) || 'FALSE'}
                  onChange={(e) => update('falseLabel', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </>
        )}

        {node.type === 'loop' && (
          <>
            <div>
              <label style={labelStyle}>Max Iterations</label>
              <input type="number"
                value={(localData.maxIterations as number) || 10}
                onChange={(e) => update('maxIterations', parseInt(e.target.value))}
                style={inputStyle}
                min="1" max="1000"
              />
            </div>
            <div>
              <label style={labelStyle}>Loop Variable</label>
              <input type="text"
                value={(localData.loopVariable as string) || 'item'}
                onChange={(e) => update('loopVariable', e.target.value)}
                style={inputStyle}
                placeholder="item"
              />
            </div>
            <div>
              <label style={labelStyle}>Break Condition</label>
              <input type="text"
                value={(localData.breakCondition as string) || ''}
                onChange={(e) => update('breakCondition', e.target.value)}
                style={inputStyle}
                placeholder="e.g., item > 100"
              />
            </div>
          </>
        )}

        {node.type === 'memory' && (
          <>
            <div>
              <label style={labelStyle}>Memory Type</label>
              <select value={(localData.memoryType as string) || 'short-term'}
                onChange={(e) => update('memoryType', e.target.value)}
                style={inputStyle}>
                <option value="short-term">Short-term</option>
                <option value="long-term">Long-term</option>
                <option value="vector">Vector</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Storage</label>
              <select value={(localData.storage as string) || 'local'}
                onChange={(e) => update('storage', e.target.value)}
                style={inputStyle}>
                <option value="local">Local</option>
                <option value="redis">Redis</option>
                <option value="postgres">PostgreSQL</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Key</label>
              <input type="text"
                value={(localData.key as string) || ''}
                onChange={(e) => update('key', e.target.value)}
                style={inputStyle}
                placeholder="memory key..."
              />
            </div>
            <div>
              <label style={labelStyle}>Value</label>
              <textarea
                value={(localData.value as string) || ''}
                onChange={(e) => update('value', e.target.value)}
                style={{ ...inputStyle, height: 60, resize: 'vertical' }}
                placeholder="Value to store..."
              />
            </div>
          </>
        )}

        {node.type === 'webhook' && (
          <>
            <div>
              <label style={labelStyle}>Method</label>
              <select value={(localData.method as string) || 'POST'}
                onChange={(e) => update('method', e.target.value)}
                style={inputStyle}>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>URL</label>
              <input type="text"
                value={(localData.url as string) || ''}
                onChange={(e) => update('url', e.target.value)}
                style={inputStyle}
                placeholder="https://..."
              />
            </div>
            <div>
              <label style={labelStyle}>Timeout (seconds)</label>
              <input type="number"
                value={(localData.timeout as number) || 30}
                onChange={(e) => update('timeout', parseInt(e.target.value))}
                style={inputStyle}
                min="1" max="300"
              />
            </div>
            <div>
              <label style={labelStyle}>Body (JSON)</label>
              <textarea
                value={(localData.body as string) || ''}
                onChange={(e) => update('body', e.target.value)}
                style={{ ...inputStyle, height: 80, resize: 'vertical', fontFamily: 'monospace' }}
                placeholder='{"key": "value"}'
              />
            </div>
          </>
        )}

        {node.type === 'subflow' && (
          <>
            <div>
              <label style={labelStyle}>Workflow ID</label>
              <input type="text"
                value={(localData.workflowId as string) || ''}
                onChange={(e) => update('workflowId', e.target.value)}
                style={inputStyle}
                placeholder="workflow_id..."
              />
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', gap: 8,
      }}>
        <button
          onClick={() => {
            // Delete node callback would go here
            onClose()
          }}
          style={{
            flex: 1, padding: '8px 12px',
            background: 'rgba(239,68,68,0.1)',
            color: '#f87171',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 6, cursor: 'pointer',
            fontSize: 11, fontWeight: 600,
          }}
        >
          Delete Node
        </button>
      </div>
    </div>
  )
}

export default ConfigPanel
