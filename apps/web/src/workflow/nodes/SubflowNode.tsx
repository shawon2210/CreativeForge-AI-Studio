/**
 * Subflow Node — Reusable workflow reference
 */
import React from 'react'
import { Handle, Position } from 'reactflow'
import type { NodeStatus } from '../types'

interface Props {
  data: {
    label: string
    status?: NodeStatus
    workflowId?: string
    inputs?: Record<string, string>
    outputs?: Record<string, string>
  }
}

const statusColors: Record<string, string> = {
  idle: '#64748b', running: '#f59e0b', success: '#10b981',
  error: '#ef4444', warning: '#f97316', cancelled: '#64748b',
}

export const SubflowNode: React.FC<Props> = ({ data }) => {
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
        <span style={{ fontSize: 14, color: '#64748b' }}>📦</span>
        <span style={{ fontWeight: 600, color: '#f1f5f9', flex: 1 }}>{data.label || 'Subflow'}</span>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color,
          boxShadow: status === 'running' ? `0 0 8px ${color}` : 'none',
          animation: status === 'running' ? 'pulse 1s infinite' : 'none',
        }} />
      </div>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace', marginBottom: 4 }}>
          WF: {data.workflowId || 'none'}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <span style={badge('#10b981')}>In: {Object.keys(data.inputs || {}).length}</span>
          <span style={badge('#3b82f6')}>Out: {Object.keys(data.outputs || {}).length}</span>
        </div>
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
