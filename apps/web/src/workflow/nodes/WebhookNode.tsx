/**
 * Webhook Node — HTTP request trigger/action
 */
import React from 'react'
import { Handle, Position } from 'reactflow'
import type { NodeStatus } from '../types'

interface Props {
  data: {
    label: string
    status?: NodeStatus
    method?: string
    url?: string
    headers?: Record<string, string>
    body?: string
    timeout?: number
  }
}

const statusColors: Record<string, string> = {
  idle: '#ef4444', running: '#f59e0b', success: '#10b981',
  error: '#ef4444', warning: '#f97316', cancelled: '#64748b',
}

export const WebhookNode: React.FC<Props> = ({ data }) => {
  const status = data.status || 'idle'
  const color = statusColors[status] || statusColors.idle

  return (
    <div style={{
      padding: 0, background: 'rgba(14,14,24,0.95)',
      border: `2px solid ${color}44`, borderRadius: 10,
      minWidth: 180, maxWidth: 240, fontSize: 12,
      boxShadow: status === 'running' ? `0 0 20px ${color}30` : `0 2px 8px ${color}10`,
      transition: 'all 200ms ease', overflow: 'hidden',
    }}>
      <Handle type="target" position={Position.Top}
        style={{ background: color, width: 10, height: 10, border: '2px solid #0a0a14' }} />
      <div style={{
        padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 14, color: '#ef4444' }}>🔗</span>
        <span style={{ fontWeight: 600, color: '#f1f5f9', flex: 1 }}>{data.label || 'Webhook'}</span>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color,
          boxShadow: status === 'running' ? `0 0 8px ${color}` : 'none',
          animation: status === 'running' ? 'pulse 1s infinite' : 'none',
        }} />
      </div>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
          <span style={{
            padding: '2px 6px',
            background: (data.method || 'POST') === 'GET' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
            border: `1px solid ${(data.method || 'POST') === 'GET' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
            borderRadius: 4, fontSize: 9,
            color: (data.method || 'POST') === 'GET' ? '#10b981' : '#fbbf24',
            fontWeight: 700,
          }}>
            {data.method || 'POST'}
          </span>
          <span style={badge('#64748b')}>{data.timeout || 30}s</span>
        </div>
        {data.url && (
          <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {data.url.substring(0, 40)}...
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom}
        style={{ background: color, width: 10, height: 10, border: '2px solid #0a0a14' }} />
    </div>
  )
}

const badge = (color: string): React.CSSProperties => ({
  padding: '2px 6px', background: `${color}15`,
  border: `1px solid ${color}30`, borderRadius: 4,
  fontSize: 9, color, fontWeight: 600,
})
