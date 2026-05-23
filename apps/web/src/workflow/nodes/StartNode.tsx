/**
 * Start Node — Workflow entry point
 * Only node with no input handle, only output
 */
import React from 'react'
import { Handle, Position } from 'reactflow'
import type { NodeStatus } from '../types'

interface Props {
  data: {
    label: string
    status?: NodeStatus
    isRunning?: boolean
    triggerMode?: string
  }
}

const statusColors: Record<string, string> = {
  idle: '#6366f1', running: '#f59e0b', success: '#10b981',
  error: '#ef4444', warning: '#f97316', cancelled: '#64748b',
}

export const StartNode: React.FC<Props> = ({ data }) => {
  const status = data.status || 'idle'
  const color = statusColors[status] || statusColors.idle
  const isRunning = status === 'running' || data.isRunning

  return (
    <div style={{
      padding: '14px 22px',
      background: `rgba(14,14,24,0.95)`,
      border: `2px solid ${color}55`,
      borderRadius: 10,
      fontWeight: 600,
      fontSize: 13,
      minWidth: 140,
      textAlign: 'center' as const,
      cursor: 'pointer',
      color: '#c7d2fe',
      boxShadow: isRunning
        ? `0 0 20px ${color}40, 0 0 40px ${color}20`
        : `0 2px 8px ${color}15`,
      transition: 'all 200ms ease',
      position: 'relative' as const,
    }}>
      {/* Glow ring when running */}
      {isRunning && (
        <div style={{
          position: 'absolute', inset: -3, borderRadius: 12,
          border: `2px solid ${color}`,
          animation: 'pulse-ring 1.5s ease-in-out infinite',
          opacity: 0.6,
        }} />
      )}

      <Handle type="source" position={Position.Bottom}
        style={{ background: color, width: 10, height: 10, border: '2px solid #0a0a14' }} />

      <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 4, position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 20, filter: isRunning ? `drop-shadow(0 0 6px ${color})` : 'none' }}>▶</span>
        <span>{data.label || 'Start'}</span>
        {isRunning && (
          <span style={{ fontSize: 10, color, fontWeight: 400 }}>Running...</span>
        )}
        {status === 'success' && (
          <span style={{ fontSize: 10, color: '#10b981' }}>✓ Complete</span>
        )}
      </div>
    </div>
  )
}
