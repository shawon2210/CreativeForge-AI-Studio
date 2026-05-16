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
      padding: '15px 20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontWeight: 'bold',
      fontSize: '0.9em',
      minWidth: '120px',
      textAlign: 'center',
      cursor: 'pointer',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <Handle type="source" position={Position.Bottom} style={{ background: '#fff' }} />
      <div>{data.label || 'Start'}</div>
      {data.isRunning && <div style={{ fontSize: '0.8em', marginTop: '5px' }}>Running...</div>}
    </div>
  );
};

export default StartNode;
