import React from 'react';
import { Handle, Position } from 'reactflow';

interface OutputNodeProps {
  data: {
    label?: string;
    input?: string;
    result?: string;
    type?: 'text' | 'image';
  };
}

const OutputNode: React.FC<OutputNodeProps> = ({ data }) => {
  return (
    <div style={{
      padding: '15px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      minWidth: '200px',
      fontSize: '0.9em',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <Handle type="target" position={Position.Top} style={{ background: '#fff' }} />
      
      <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
        {data.label || 'Output'}
      </div>
      
      {data.type === 'image' && data.result && (
        <div style={{ marginTop: '8px', textAlign: 'center' }}>
          <img 
            src={data.result} 
            alt="Output" 
            style={{ 
              maxWidth: '100%', 
              borderRadius: '4px',
              border: '2px solid rgba(255,255,255,0.3)'
            }} 
          />
        </div>
      )}
      
      {data.type === 'text' && data.result && (
        <div style={{
          marginTop: '8px',
          padding: '8px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '4px',
          fontSize: '0.85em',
          maxHeight: '100px',
          overflowY: 'auto'
        }}>
          {data.result}
        </div>
      )}
      
      {!data.result && (
        <div style={{ 
          padding: '20px',
          textAlign: 'center',
          fontStyle: 'italic',
          opacity: 0.8
        }}>
          Waiting for input...
        </div>
      )}
    </div>
  );
};

export default OutputNode;
