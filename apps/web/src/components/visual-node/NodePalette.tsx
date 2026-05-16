import React from 'react';

interface NodePaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

const NodePalette: React.FC<NodePaletteProps> = ({ onDragStart }) => {
  const nodeTypes = [
    { type: 'start', label: 'Start', color: '#667eea', icon: '▶️' },
    { type: 'text_gen', label: 'Text Generation', color: '#2196F3', icon: '📝' },
    { type: 'image_gen', label: 'Image Generation', color: '#FF9800', icon: '🖼️' },
    { type: 'canvas', label: 'CreativeForge Canvas', color: '#9C27B0', icon: '🎨' },
    { type: 'output', label: 'Output', color: '#667eea', icon: '💾' }
  ];

  return (
    <div style={{
      padding: '15px',
      background: 'white',
      borderRight: '1px solid #dee2e6',
      width: '250px',
      height: '100%',
      overflowY: 'auto',
      boxShadow: '2px 0 4px rgba(0,0,0,0.05)'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#495057' }}>Node Palette</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {nodeTypes.map(node => (
          <div
            key={node.type}
            draggable
            onDragStart={(e) => onDragStart(e, node.type)}
            style={{
              padding: '12px',
              background: 'white',
              border: `2px solid ${node.color}`,
              borderRadius: '8px',
              cursor: 'grab',
              transition: 'all 0.2s ease',
              userSelect: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2em' }}>{node.icon}</span>
              <span style={{ fontWeight: 'bold', color: node.color }}>{node.label}</span>
            </div>
            <div style={{ fontSize: '0.8em', color: '#6c757d', marginTop: '5px' }}>
              Drag to canvas
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', padding: '10px', background: '#f8f9fa', borderRadius: '6px' }}>
        <h4 style={{ fontSize: '0.9em', marginTop: 0, color: '#6c757d' }}>Tips</h4>
        <ul style={{ fontSize: '0.8em', color: '#6c757d', paddingLeft: '20px', margin: 0 }}>
          <li>Drag nodes to canvas</li>
          <li>Connect from bottom→top handles</li>
          <li>Click "Execute Workflow" to run</li>
          <li>Start → Process → Output</li>
        </ul>
      </div>
    </div>
  );
};

export default NodePalette;
