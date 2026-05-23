/**
 * Text Generation Node — AI text generation with model selection
 */
import React, { useState } from 'react'
import { Handle, Position } from 'reactflow'
import type { NodeStatus } from '../types'

interface Props {
  data: {
    label: string
    status?: NodeStatus
    prompt?: string
    model?: string
    temperature?: number
    maxTokens?: number
    systemPrompt?: string
    streaming?: boolean
    result?: string
    output?: string
    error?: string
  }
}

const statusColors: Record<string, string> = {
  idle: '#3b82f6', running: '#f59e0b', success: '#10b981',
  error: '#ef4444', warning: '#f97316', cancelled: '#64748b',
}

const MODELS = ['gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet', 'claude-3-haiku', 'gemini-pro', 'gemini-1.5-pro', 'llama-3.1-70b']

export const TextGenNode: React.FC<Props> = ({ data }) => {
  const status = data.status || 'idle'
  const color = statusColors[status] || statusColors.idle
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{
      padding: 0,
      background: 'rgba(14,14,24,0.95)',
      border: `2px solid ${color}44`,
      borderRadius: 10,
      minWidth: 220,
      maxWidth: 280,
      fontSize: 12,
      boxShadow: status === 'running'
        ? `0 0 20px ${color}30, 0 0 40px ${color}15`
        : `0 2px 8px ${color}10`,
      transition: 'all 200ms ease',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Running glow */}
      {status === 'running' && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 10,
          background: `linear-gradient(135deg, ${color}08, transparent)`,
          pointerEvents: 'none',
        }} />
      )}

      <Handle type="target" position={Position.Top}
        style={{ background: color, width: 10, height: 10, border: '2px solid #0a0a14' }} />

      {/* Header */}
      <div style={{
        padding: '10px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 8,
        cursor: 'pointer',
      }} onClick={() => setExpanded(!expanded)}>
        <span style={{ fontSize: 14, color: '#3b82f6' }}>✦</span>
        <span style={{ fontWeight: 600, color: '#f1f5f9', flex: 1 }}>
          {data.label || 'Text Generation'}
        </span>
        {/* Status dot */}
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: color,
          boxShadow: status === 'running' ? `0 0 8px ${color}` : 'none',
          animation: status === 'running' ? 'pulse 1s infinite' : 'none',
        }} />
      </div>

      {/* Body */}
      <div style={{ padding: '10px 12px' }}>
        {/* Prompt preview */}
        <div style={{
          padding: '6px 8px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 6,
          fontSize: 11,
          color: '#94a3b8',
          marginBottom: 6,
          maxHeight: 40,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={{ color: '#3b82f6', fontWeight: 600 }}>Prompt: </span>
          {(data.prompt || 'No prompt').substring(0, 60)}
          {(data.prompt?.length || 0) > 60 ? '...' : ''}
        </div>

        {/* Model badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{
            padding: '2px 8px',
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 4,
            fontSize: 10,
            color: '#60a5fa',
            fontWeight: 600,
          }}>
            {data.model || 'gpt-4o'}
          </span>
          {data.temperature !== undefined && (
            <span style={{ fontSize: 10, color: '#64748b' }}>
              T={data.temperature}
            </span>
          )}
        </div>

        {/* Expanded config */}
        {expanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 6 }}>
            <select value={data.model || 'gpt-4o'}
              style={selectStyle}
              onChange={() => {}}>
              {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <textarea
              value={data.prompt || ''}
              placeholder="Enter prompt..."
              style={{ ...inputStyle, height: 50, resize: 'vertical' }}
              readOnly
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <label style={{ fontSize: 10, color: '#64748b', flex: 1 }}>
                Temp: {data.temperature || 0.7}
                <input type="range" min="0" max="2" step="0.1"
                  value={data.temperature || 0.7}
                  style={{ width: '100%', accentColor: '#3b82f6' }}
                  readOnly
                />
              </label>
              <label style={{ fontSize: 10, color: '#64748b' }}>
                Tokens
                <input type="number" value={data.maxTokens || 2048}
                  style={{ ...inputStyle, width: 60, height: 26 }}
                  readOnly
                />
              </label>
            </div>
          </div>
        )}

        {/* Result preview */}
        {status === 'success' && (data.result || data.output) && (
          <div style={{
            padding: '6px 8px',
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.15)',
            borderRadius: 6,
            fontSize: 10,
            color: '#94a3b8',
            maxHeight: 60,
            overflow: 'hidden',
          }}>
            <span style={{ color: '#10b981', fontWeight: 600 }}>Output: </span>
            {(data.result || data.output || '').substring(0, 100)}
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div style={{
            padding: '4px 8px',
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: 4,
            fontSize: 10,
            color: '#f87171',
          }}>
            ✗ {data.error || 'Generation failed'}
          </div>
        )}

        {/* Running indicator */}
        {status === 'running' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 0',
            color: '#fbbf24',
            fontSize: 10,
          }}>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span>
            Generating...
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom}
        style={{ background: color, width: 10, height: 10, border: '2px solid #0a0a14' }} />
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '5px 8px',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4,
  fontSize: 11, fontFamily: 'inherit',
  background: 'rgba(255,255,255,0.03)', color: '#e2e8f0',
  outline: 'none', boxSizing: 'border-box',
}

const selectStyle: React.CSSProperties = {
  padding: '4px 8px',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4,
  fontSize: 11, fontFamily: 'inherit',
  background: 'rgba(255,255,255,0.03)', color: '#e2e8f0',
  outline: 'none',
}
