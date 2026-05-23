/**
 * Loop Node — Iteration support
 */
import React from 'react'
import { Handle, Position } from 'reactflow'
import type { NodeStatus } from '../types'

interface Props {
  data: {
    label: string
    status?: NodeStatus
    maxIterations?: number
    loopVariable?: string
    breakCondition?: string
    currentIteration?: number
  }
}

const statusColors: Record<string, string> = {
  idle: '#14b8a6', running: '#f59e0b', success: '#10b981',
  error: '#ef4444', warning: '#f97316', cancelled: '#64748b',
}

export const LoopNode: React.FC<Props> = ({ data }) => {
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
        <span style={{ fontSize: 14, color: '#14b8a6' }}>↻</span>
        <span style={{ fontWeight: 600, color: '#f1f5f9', flex: 1 }}>{data.label || 'Loop'}</span>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color,
          boxShadow: status === 'running' ? `0 0 8px ${color}` : 'none',
          animation: status === 'running' ? 'pulse 1s infinite' : 'none',
        }} />
      </div>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
          <span style={badge('#14b8a6')}>Max: {data.maxIterations || 10}</span>
          <span style={badge('#64748b')}>Var: {data.loopVariable || 'item'}</span>
        </div>
        {status === 'running' && data.currentIteration !== undefined && (
          <div style={{ fontSize: 10, color: '#fbbf24' }}>
            Iteration {data.currentIteration + 1}/{data.maxIterations || 10}
            <div style={{
              height: 3, background: 'rgba(245,158,11,0.2)', borderRadius: 2, marginTop: 2,
            }}>
              <div style={{
                height: '100%', borderRadius: 2, background: '#f59e0b',
                width: `${((data.currentIteration + 1) / (data.maxIterations || 10)) * 100}%`,
                transition: 'width 300ms ease',
              }} />
            </div>
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
