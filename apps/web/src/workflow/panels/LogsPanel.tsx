/**
 * Logs Panel — Real-time execution logs display
 */
import React, { useEffect, useRef } from 'react'
import type { ExecutionLog } from '../types'

interface Props {
  logs: ExecutionLog[]
  onClear: () => void
}

const levelColors: Record<string, string> = {
  info: '#60a5fa',
  warn: '#fbbf24',
  error: '#f87171',
  success: '#34d399',
}

const levelIcons: Record<string, string> = {
  info: 'ℹ',
  warn: '⚠',
  error: '✗',
  success: '✓',
}

export const LogsPanel: React.FC<Props> = ({ logs, onClear }) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString()
    } catch {
      return timestamp
    }
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: '#0a0a14',
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>
          Execution Logs
        </span>
        <span style={{
          padding: '1px 6px', background: 'rgba(99,102,241,0.15)',
          border: '1px solid rgba(99,102,241,0.2)', borderRadius: 4,
          fontSize: 9, color: '#818cf8', fontWeight: 600,
        }}>
          {logs.length}
        </span>
        <div style={{ flex: 1 }} />
        <button onClick={onClear}
          style={{
            padding: '3px 8px', background: 'rgba(100,116,139,0.15)',
            border: '1px solid rgba(100,116,139,0.2)', borderRadius: 4,
            color: '#94a3b8', fontSize: 10, cursor: 'pointer',
          }}>
          Clear
        </button>
      </div>

      {/* Log entries */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, overflowY: 'auto', padding: '4px 0',
          fontFamily: 'monospace',
        }}
      >
        {logs.length === 0 ? (
          <div style={{
            padding: 20, textAlign: 'center',
            color: '#475569', fontSize: 11,
          }}>
            No logs yet. Run a workflow to see execution logs.
          </div>
        ) : (
          logs.map((log, idx) => {
            const color = levelColors[log.level] || '#94a3b8'
            const icon = levelIcons[log.level] || '•'

            return (
              <div
                key={log.id || idx}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 6,
                  padding: '3px 12px',
                  fontSize: 10,
                  lineHeight: 1.4,
                  borderLeft: `2px solid ${color}30`,
                  marginBottom: 1,
                }}
              >
                {/* Timestamp */}
                <span style={{ color: '#475569', flexShrink: 0, fontSize: 9 }}>
                  {formatTime(log.timestamp)}
                </span>

                {/* Level icon */}
                <span style={{ color, flexShrink: 0, fontSize: 10 }}>
                  {icon}
                </span>

                {/* Node badge */}
                {log.nodeId && (
                  <span style={{
                    padding: '0 4px',
                    background: `${color}10`,
                    border: `1px solid ${color}20`,
                    borderRadius: 3,
                    fontSize: 8,
                    color: color,
                    flexShrink: 0,
                    maxWidth: 80,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {log.nodeId}
                  </span>
                )}

                {/* Message */}
                <span style={{ color, wordBreak: 'break-word' }}>
                  {log.message}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default LogsPanel
