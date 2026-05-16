import React from 'react';
import { Handle, Position } from 'reactflow';

interface Props {
  data: {
    label: string;
    type: 'character' | 'location' | 'event' | 'lore';
    description?: string;
    [key: string]: any;
  };
}

const WorldEntityNode: React.FC<Props> = ({ data }) => {
  const bgColor = {
    character: '#e3f2fd',
    location: '#e8f5e9',
    event: '#fff3e0',
    lore: '#f3e5f5'
  }[data.type] || '#f5f5f5';

  return (
    <div style={{ 
      padding: '10px', 
      border: '1px solid #ccc', 
      borderRadius: '6px', 
      background: bgColor,
      minWidth: '150px',
      fontSize: '0.9em'
    }}>
      <Handle type="target" position={Position.Top} />
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{data.label}</div>
      <div style={{ color: '#666', fontSize: '0.8em' }}>Type: {data.type}</div>
      {data.description && (
        <div style={{ marginTop: '5px', fontSize: '0.8em' }}>{data.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default WorldEntityNode;
