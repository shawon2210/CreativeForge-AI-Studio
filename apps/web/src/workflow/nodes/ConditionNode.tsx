/**
 * Condition Node — Branching logic with true/false outputs
 */
import React from 'react'
import { Handle, Position } from 'reactflow'
import type { NodeStatus } from '../types'

interface Props {
  data: {
    label: string
    status?: NodeStatus
    condition?: string
    operator?: string
    value?: string
    trueLabel?: string
    falseLabel?: string
  }
}

const statusColors: Record<string, string> = {
  idle: '#f97316', running: '#f59e0b', success: '#10b981',
  error: '#ef4444', warning: '#f97316', cancelled: '#64748b',
}

export const ConditionNode: React.FC<Props> = ({ data }) => {
  const status = data.status || 'idle'
  const color = statusColors[status] || statusColors.idle

  return (
    <div style={{
      padding: 0, background: 'rgba(14,14,24,0.95)',
      border: `2px solid ${color}44`, borderRadius: 10,
      minWidth: 200, maxWidth: 260, fontSize: 12,
      boxShadow: status === 'running' ? `0 0 20px ${color}30` : `0 2px 8px ${color}10`,
      transition: 'all 200ms ease', overflow: 'hidden',
    }}>
      <Handle type="target" position={Position.Top}
        style={{ background: color, width: 10, height: 10, border: '2px solid #0a0a14' }} />

      <div style={{
        padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 14, color: '#f97316' }}>◆</span>
        <span style={{ fontWeight: 600, color: '#f1f5f9', flex: 1 }}>{data.label || 'Condition'}</span>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color,
          boxShadow: status === 'running' ? `0 0 8px ${color}` : 'none',
          animation: status === 'running' ? 'pulse 1s infinite' : 'none',
        }} />
      </div>

      <div style={{ padding: '10px 12px' }}>
        <div style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.03)',
          borderRadius: 4, fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>
          <span style={{ color: '#f97316' }}>IF </span>
          {(data.condition || 'condition').substring(0, 40)}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <span style={badge('#f97316')}>{data.operator || 'equals'}</span>
          <span style={badge('#64748b')}>{data.value || 'value'}</span>
        </div>
      </div>

      {/* Two output handles: true (bottom-left) and false (bottom-right) */}
      <Handle type="source" position={Position.Bottom} id="true"
        style={{ background: '#10b981', width: 10, height: 10, border: '2px solid #0a0a14', left: '25%' }} />
      <Handle type="source" position={Position.Bottom} id="false"
        style={{ background: '#ef4444', width: 10, height: 10, border: '2px solid #0a0a14', left: '75%' }} />

      {/* Labels for handles */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 12px 6px', fontSize: 9 }}>
        <span style={{ color: '#10b981', fontWeight: 600 }}>{data.trueLabel || 'TRUE'}</span>
        <span style={{ color: '#ef4444', fontWeight: 600 }}>{data.falseLabel || 'FALSE'}</span>
      </div>
    </div>
  )
}

const badge = (color: string): React.CSSProperties => ({
  padding: '2px 6px', background: `${color}15`,
  border: `1px solid ${color}30`, borderRadius: 4,
  fontSize: 9, color, fontWeight: 600,
})
