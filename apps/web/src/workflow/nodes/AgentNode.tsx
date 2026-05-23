/**
 * Agent Node — Autonomous AI agent
 */
import React from 'react'
import { Handle, Position } from 'reactflow'
import type { NodeStatus } from '../types'

interface Props {
  data: {
    label: string
    status?: NodeStatus
    agentType?: string
    systemPrompt?: string
    tools?: string[]
    maxIterations?: number
    model?: string
    memory?: boolean
    result?: string
  }
}

const statusColors: Record<string, string> = {
  idle: '#ec4899', running: '#f59e0b', success: '#10b981',
  error: '#ef4444', warning: '#f97316', cancelled: '#64748b',
}

export const AgentNode: React.FC<Props> = ({ data }) => {
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
        <span style={{ fontSize: 14, color: '#ec4899' }}>🤖</span>
        <span style={{ fontWeight: 600, color: '#f1f5f9', flex: 1 }}>{data.label || 'Agent'}</span>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color,
          boxShadow: status === 'running' ? `0 0 8px ${color}` : 'none',
          animation: status === 'running' ? 'pulse 1s infinite' : 'none',
        }} />
      </div>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
          <span style={badge('#ec4899')}>{data.agentType || 'reAct'}</span>
          <span style={badge('#64748b')}>{data.model || 'gpt-4o'}</span>
          {data.memory && <span style={badge('#a855f7')}>Memory</span>}
        </div>
        {data.systemPrompt && (
          <div style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.03)',
            borderRadius: 4, fontSize: 10, color: '#94a3b8', maxHeight: 30, overflow: 'hidden' }}>
            {data.systemPrompt.substring(0, 60)}...
          </div>
        )}
        {status === 'running' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fbbf24', fontSize: 10, marginTop: 4 }}>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span>
            Thinking...
          </div>
        )}
        {status === 'success' && data.result && (
          <div style={{ padding: '4px 8px', background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.15)', borderRadius: 4,
            fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
            {data.result.substring(0, 80)}
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
