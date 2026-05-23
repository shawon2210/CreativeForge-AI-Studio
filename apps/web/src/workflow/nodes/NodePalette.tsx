/**
 * Node Palette — Draggable node templates organized by category
 */
import React, { useState, useMemo } from 'react'
import { NODE_TEMPLATES } from '../utils/nodeTemplates'
import type { WorkflowNodeType } from '../types'

interface Props {
  onDragStart: (event: React.DragEvent, nodeType: string) => void
  isMobile?: boolean
}

const CATEGORIES = [
  { id: 'input', label: 'Input', icon: '📥' },
  { id: 'processing', label: 'Processing', icon: '⚙️' },
  { id: 'output', label: 'Output', icon: '📤' },
  { id: 'logic', label: 'Logic', icon: '🔀' },
  { id: 'advanced', label: 'Advanced', icon: '🚀' },
]

export const NodePalette: React.FC<Props> = ({ onDragStart, isMobile }) => {
  const [search, setSearch] = useState('')
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())

  const filteredTemplates = useMemo(() => {
    if (!search) return NODE_TEMPLATES
    const q = search.toLowerCase()
    return NODE_TEMPLATES.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q)
    )
  }, [search])

  const templatesByCategory = useMemo(() => {
    const map: Record<string, typeof NODE_TEMPLATES> = {}
    for (const cat of CATEGORIES) {
      map[cat.id] = filteredTemplates.filter((t) => t.category === cat.id)
    }
    return map
  }, [filteredTemplates])

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(catId)) next.delete(catId)
      else next.add(catId)
      return next
    })
  }

  return (
    <div style={{
      padding: isMobile ? 12 : 14,
      background: '#0a0a14',
      height: '100%',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <h3 style={{
          margin: 0, color: '#f1f5f9',
          fontSize: isMobile ? 14 : 15, fontWeight: 700,
          letterSpacing: '-0.01em',
        }}>
          Node Palette
        </h3>
        <p style={{ margin: '2px 0 0', fontSize: 10, color: '#475569' }}>
          Drag nodes to canvas
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search nodes..."
          style={{
            width: '100%', padding: '6px 10px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 6, fontSize: 11, color: '#e2e8f0',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Categories */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {CATEGORIES.map((cat) => {
          const templates = templatesByCategory[cat.id] || []
          if (templates.length === 0 && search) return null
          const isCollapsed = collapsedCategories.has(cat.id)

          return (
            <div key={cat.id} style={{ marginBottom: 8 }}>
              {/* Category header */}
              <button
                onClick={() => toggleCategory(cat.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 8px', background: 'transparent', border: 'none',
                  cursor: 'pointer', borderRadius: 6, textAlign: 'left',
                  color: '#94a3b8', fontSize: 11, fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}
              >
                <span style={{ fontSize: 10 }}>{isCollapsed ? '▶' : '▼'}</span>
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span style={{ marginLeft: 'auto', color: '#475569', fontWeight: 400 }}>
                  {templates.length}
                </span>
              </button>

              {/* Templates */}
              {!isCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                  {templates.map((template) => (
                    <div
                      key={template.type}
                      draggable
                      onDragStart={(e) => onDragStart(e, template.type)}
                      style={{
                        padding: '8px 10px',
                        background: 'rgba(255,255,255,0.02)',
                        border: `1px solid ${template.color}20`,
                        borderRadius: 8,
                        cursor: 'grab',
                        transition: 'all 150ms ease',
                        userSelect: 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${template.color}10`
                        e.currentTarget.style.borderColor = `${template.color}40`
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                        e.currentTarget.style.borderColor = `${template.color}20`
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 28, height: 28, borderRadius: 6,
                          background: `${template.color}15`,
                          border: `1px solid ${template.color}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, flexShrink: 0,
                        }}>
                          {template.icon}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 11 }}>
                            {template.label}
                          </div>
                          <div style={{ fontSize: 9, color: '#64748b', marginTop: 1,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {template.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Tips */}
      <div style={{
        marginTop: 12, padding: 10,
        background: 'rgba(99,102,241,0.04)',
        border: '1px solid rgba(99,102,241,0.08)',
        borderRadius: 8,
      }}>
        <h4 style={{ fontSize: 10, marginTop: 0, color: '#818cf8', fontWeight: 600 }}>Tips</h4>
        <ul style={{ fontSize: 9, color: '#64748b', paddingLeft: 14, margin: 0, lineHeight: 1.8 }}>
          <li>Drag nodes to canvas</li>
          <li>Connect bottom → top handles</li>
          <li>Click node to configure</li>
          <li>Ctrl+Z to undo</li>
          <li>Ctrl+D to duplicate</li>
        </ul>
      </div>
    </div>
  )
}

export default NodePalette
