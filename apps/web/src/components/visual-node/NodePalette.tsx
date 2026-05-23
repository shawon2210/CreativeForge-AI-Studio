import React from 'react';

interface NodePaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
  isMobile?: boolean;
}

const NodePalette: React.FC<NodePaletteProps> = ({ onDragStart, isMobile }) => {
  const nodeTypes = [
    { type: 'start', label: 'Start', color: '#6366f1', icon: '▶', desc: 'Workflow entry point' },
    { type: 'text_gen', label: 'Text Generation', color: '#3b82f6', icon: '✦', desc: 'AI text generation' },
    { type: 'image_gen', label: 'Image Generation', color: '#f59e0b', icon: '🖼', desc: 'AI image generation' },
    { type: 'canvas', label: 'Canvas', color: '#8b5cf6', icon: '🎨', desc: 'Process & combine' },
    { type: 'output', label: 'Output', color: '#10b981', icon: '💾', desc: 'Final output node' },
  ];

  return (
    <div style={{
      padding: isMobile ? 12 : 15,
      background: '#0e0e18',
      height: '100%',
      overflowY: 'auto',
    }}>
      <h3 style={{
        marginTop: 0, marginBottom: 12, color: '#f1f5f9',
        fontSize: isMobile ? 14 : 15, fontWeight: 600,
      }}>
        Node Palette
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            draggable
            onDragStart={(e) => onDragStart(e, node.type)}
            style={{
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${node.color}33`,
              borderRadius: 8,
              cursor: 'grab',
              transition: 'all 150ms ease',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${node.color}15`;
              e.currentTarget.style.borderColor = `${node.color}66`;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.borderColor = `${node.color}33`;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 28, height: 28, borderRadius: 6,
                background: `${node.color}20`,
                border: `1px solid ${node.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12,
              }}>
                {node.icon}
              </span>
              <div>
                <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 12 }}>{node.label}</div>
                <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>{node.desc}</div>
              </div>
            </div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 6, textAlign: 'center' }}>
              Drag to canvas
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 16, padding: 10,
        background: 'rgba(99,102,241,0.06)',
        border: '1px solid rgba(99,102,241,0.12)',
        borderRadius: 8,
      }}>
        <h4 style={{ fontSize: 11, marginTop: 0, color: '#818cf8', fontWeight: 600 }}>Tips</h4>
        <ul style={{ fontSize: 10, color: '#64748b', paddingLeft: 16, margin: 0, lineHeight: 1.6 }}>
          <li>Drag nodes to canvas</li>
          <li>Connect bottom → top handles</li>
          <li>Click Execute to run</li>
          <li>Start → Process → Output</li>
        </ul>
      </div>
    </div>
  );
};

export default NodePalette;
