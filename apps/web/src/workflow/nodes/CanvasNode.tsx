/**
 * Canvas Node — Process and combine outputs
 */
import React from 'react'
import { Handle, Position } from 'reactflow'
import type { NodeStatus } from '../types'

interface Props {
  data: {
    label: string
    status?: NodeStatus
    inputText?: string
    inputImage?: string
    output?: string
    operation?: string
    result?: string
  }
}

const statusColors: Record<string, string> = {
  idle: '#8b5cf6', running: '#f59e0b', success: '#10b981',
  error: '#ef4444', warning: '#f97316', cancelled: '#64748b',
}

export const CanvasNodeComponent: React.FC<Props> = ({ data }) => {
  const status = data.status || 'idle'
  const color = statusColors[status] || statusColors.idle

  return (
    <div style={{
      padding: 0,
      background: 'rgba(14,14,24,0.95)',
      border: `2px solid ${color}44`,
      borderRadius: 10,
      minWidth: 200,
      maxWidth: 260,
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
        <span style={{ fontSize: 14, color: '#8b5cf6' }}>🎨</span>
        <span style={{ fontWeight: 600, color: '#f1f5f9', flex: 1 }}>
          {data.label || 'Canvas'}
        </span>
        <span style={{
          width: 8, height: 8, borderRadius: '50%', background: color,
          boxShadow: status === 'running' ? `0 0 8px ${color}` : 'none',
          animation: status === 'running' ? 'pulse 1s infinite' : 'none',
        }} />
      </div>

      <div style={{ padding: '10px 12px' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <span style={badgeStyle('#8b5cf6')}>{(data.operation || 'merge').toUpperCase()}</span>
        </div>

        {data.inputText && (
          <div style={{
            padding: '4px 8px', background: 'rgba(255,255,255,0.03)',
            borderRadius: 4, fontSize: 10, color: '#94a3b8', marginBottom: 4,
            maxHeight: 30, overflow: 'hidden',
          }}>
            <span style={{ color: '#8b5cf6' }}>In: </span>
            {data.inputText.substring(0, 50)}...
          </div>
        )}

        {status === 'success' && (
          <div style={{
            padding: '4px 8px', background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.15)', borderRadius: 4,
            fontSize: 10, color: '#10b981',
          }}>✓ Processed</div>
        )}
        {status === 'error' && (
          <div style={{ fontSize: 10, color: '#f87171' }}>✗ Failed</div>
        )}
        {status === 'running' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fbbf24', fontSize: 10 }}>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span>
            Processing...
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom}
        style={{ background: color, width: 10, height: 10, border: '2px solid #0a0a14' }} />
    </div>
  )
}

const badgeStyle = (color: string): React.CSSProperties => ({
  padding: '2px 8px',
  background: `${color}15`,
  border: `1px solid ${color}30`,
  borderRadius: 4,
  fontSize: 10,
  color: color,
  fontWeight: 600,
})
