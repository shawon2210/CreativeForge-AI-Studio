/**
 * Output Node — Final output renderer
 */
import React from 'react'
import { Handle, Position } from 'reactflow'
import type { NodeStatus } from '../types'

interface Props {
  data: {
    label?: string
    status?: NodeStatus
    input?: string
    result?: string
    type?: 'text' | 'image' | 'json'
    format?: string
  }
}

const statusColors: Record<string, string> = {
  idle: '#10b981', running: '#f59e0b', success: '#10b981',
  error: '#ef4444', warning: '#f97316', cancelled: '#64748b',
}

export const OutputNodeComponent: React.FC<Props> = ({ data }) => {
  const status = data.status || 'idle'
  const color = statusColors[status] || statusColors.idle
  const output = data.result || data.input

  return (
    <div style={{
      padding: 0,
      background: 'rgba(14,14,24,0.95)',
      border: `2px solid ${color}44`,
      borderRadius: 10,
      minWidth: 220,
      maxWidth: 300,
      fontSize: 12,
      boxShadow: status === 'running' ? `0 0 20px ${color}30` : `0 2px 8px ${color}10`,
      transition: 'all 200ms ease',
      overflow: 'hidden',
    }}>
      <Handle type="target" position={Position.Top}
        style={{ background: color, width: 10, height: 10, border: '2px solid #0a0a14' }} />

      <div style={{
        padding: '10px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 14, color: '#10b981' }}>💾</span>
        <span style={{ fontWeight: 600, color: '#f1f5f9', flex: 1 }}>
          {data.label || 'Output'}
        </span>
        <span style={{
          padding: '2px 6px', background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.2)', borderRadius: 4,
          fontSize: 9, color: '#10b981', fontWeight: 600,
        }}>
          {(data.format || data.type || 'text').toUpperCase()}
        </span>
      </div>

      <div style={{ padding: '10px 12px' }}>
        {data.type === 'image' && output && (
          <div style={{ textAlign: 'center' }}>
            <img src={output} alt="Output"
              style={{ maxWidth: '100%', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
        )}

        {data.type === 'json' && output && (
          <pre style={{
            padding: 8, background: 'rgba(0,0,0,0.3)', borderRadius: 6,
            fontSize: 10, color: '#94a3b8', maxHeight: 100, overflow: 'auto',
            margin: 0, fontFamily: 'monospace',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {typeof output === 'string' ? output : JSON.stringify(output, null, 2)}
          </pre>
        )}

        {(data.type === 'text' || !data.type) && output && (
          <div style={{
            padding: 8, background: 'rgba(16,185,129,0.04)',
            border: '1px solid rgba(16,185,129,0.1)', borderRadius: 6,
            fontSize: 11, color: '#e2e8f0', maxHeight: 120, overflow: 'auto',
            lineHeight: 1.5, whiteSpace: 'pre-wrap',
          }}>
            {typeof output === 'string' ? output : JSON.stringify(output, null, 2)}
          </div>
        )}

        {!output && (
          <div style={{
            padding: 16, textAlign: 'center',
            fontStyle: 'italic', fontSize: 11, color: '#475569',
          }}>
            Waiting for input...
          </div>
        )}

        {status === 'running' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fbbf24', fontSize: 10 }}>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span>
            Collecting output...
          </div>
        )}
      </div>
    </div>
  )
}
