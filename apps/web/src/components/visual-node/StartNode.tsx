import React from 'react';
import { Handle, Position } from 'reactflow';

interface StartNodeProps {
  data: {
    label: string;
    onExecute?: () => void;
    isRunning?: boolean;
  };
}

const StartNode: React.FC<StartNodeProps> = ({ data }) => {
  return (
    <div style={{
      padding: '12px 20px',
      background: 'rgba(14,14,24,0.95)',
      border: '1px solid rgba(99,102,241,0.35)',
      borderRadius: 8,
      fontWeight: 600,
      fontSize: 12,
      minWidth: 120,
      textAlign: 'center',
      cursor: 'pointer',
      color: '#c7d2fe',
      boxShadow: '0 2px 8px rgba(99,102,241,0.15)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    }}>
      <Handle type="source" position={Position.Bottom} style={{ background: '#6366f1', width: 8, height: 8 }} />
      <span style={{ fontSize: 16 }}>▶</span>
      <span>{data.label || 'Start'}</span>
      {data.isRunning && (
        <span style={{ fontSize: 10, color: '#818cf8', fontWeight: 400 }}>Running...</span>
      )}
    </div>
  );
};

export default StartNode;
