/**
 * Image Generation Node — AI image generation with preview
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
    width?: number
    height?: number
    style?: string
    negativePrompt?: string
    imageUrl?: string
    result?: string
    error?: string
  }
}

const statusColors: Record<string, string> = {
  idle: '#f59e0b', running: '#f59e0b', success: '#10b981',
  error: '#ef4444', warning: '#f97316', cancelled: '#64748b',
}

const STYLES = ['photorealistic', 'cinematic', 'anime', 'digital-art', 'oil-painting', 'watercolor', '3d-render', 'pixel-art']

export const ImageGenNode: React.FC<Props> = ({ data }) => {
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
        ? `0 0 20px ${color}30`
        : `0 2px 8px ${color}10`,
      transition: 'all 200ms ease',
      overflow: 'hidden',
    }}>
      <Handle type="target" position={Position.Top}
        style={{ background: color, width: 10, height: 10, border: '2px solid #0a0a14' }} />

      {/* Header */}
      <div style={{
        padding: '10px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 8,
        cursor: 'pointer',
      }} onClick={() => setExpanded(!expanded)}>
        <span style={{ fontSize: 14, color: '#f59e0b' }}>🖼</span>
        <span style={{ fontWeight: 600, color: '#f1f5f9', flex: 1 }}>
          {data.label || 'Image Generation'}
        </span>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: color,
          boxShadow: status === 'running' ? `0 0 8px ${color}` : 'none',
          animation: status === 'running' ? 'pulse 1s infinite' : 'none',
        }} />
      </div>

      <div style={{ padding: '10px 12px' }}>
        {/* Prompt preview */}
        <div style={{
          padding: '6px 8px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 6,
          fontSize: 11,
          color: '#94a3b8',
          marginBottom: 6,
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={{ color: '#f59e0b', fontWeight: 600 }}>Prompt: </span>
          {(data.prompt || 'No prompt').substring(0, 50)}
          {(data.prompt?.length || 0) > 50 ? '...' : ''}
        </div>

        {/* Config badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
          <span style={badgeStyle('#f59e0b')}>{data.model || 'dall-e-3'}</span>
          <span style={badgeStyle('#64748b')}>{data.width || 1024}×{data.height || 1024}</span>
          {data.style && <span style={badgeStyle('#8b5cf6')}>{data.style}</span>}
        </div>

        {/* Expanded */}
        {expanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 6 }}>
            <textarea value={data.prompt || ''} placeholder="Describe the image..."
              style={{ ...inputStyle, height: 50, resize: 'vertical' }} readOnly />
            <select value={data.style || 'photorealistic'} style={selectStyle}>
              {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 8 }}>
              <label style={{ fontSize: 10, color: '#64748b' }}>
                W
                <input type="number" value={data.width || 1024}
                  style={{ ...inputStyle, width: 60, height: 26 }} readOnly />
              </label>
              <label style={{ fontSize: 10, color: '#64748b' }}>
                H
                <input type="number" value={data.height || 1024}
                  style={{ ...inputStyle, width: 60, height: 26 }} readOnly />
              </label>
            </div>
          </div>
        )}

        {/* Image preview */}
        {status === 'success' && data.imageUrl && (
          <div style={{ marginTop: 6, textAlign: 'center' }}>
            <img src={data.imageUrl} alt="Generated"
              style={{
                maxWidth: '100%', borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
        )}

        {status === 'error' && (
          <div style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.15)', borderRadius: 4,
            fontSize: 10, color: '#f87171' }}>
            ✗ {data.error || 'Generation failed'}
          </div>
        )}

        {status === 'running' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 0', color: '#fbbf24', fontSize: 10 }}>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span>
            Generating image...
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
