import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

interface CanvasNodeProps {
  data: {
    label: string;
    inputText?: string;
    inputImage?: string;
    output?: string;
    status?: 'idle' | 'processing' | 'success' | 'error';
  };
}

const CanvasNode: React.FC<CanvasNodeProps> = ({ data }) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>(data.status || 'idle');

  const processContent = async () => {
    setStatus('processing');
    try {
      // Simulate canvas processing - in real app, this would call a backend endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus('success');
    } catch (error) {
      console.error('Canvas processing failed:', error);
      setStatus('error');
    }
  };

  return (
    <div style={{
      padding: '15px',
      background: status === 'error' ? '#fee' : status === 'success' ? '#efe' : '#f3e5f5',
      border: `2px solid ${status === 'error' ? '#f44' : status === 'success' ? '#4a4' : '#9C27B0'}`,
      borderRadius: '8px',
      minWidth: '180px',
      fontSize: '0.9em',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <Handle type="target" position={Position.Top} style={{ background: '#9C27B0' }} />
      
      <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#9C27B0' }}>
        {data.label || 'CreativeForge Canvas'}
      </div>
      
      {data.inputText && (
        <div style={{
          padding: '8px',
          background: '#fff',
          borderRadius: '4px',
          fontSize: '0.8em',
          marginBottom: '8px',
          maxHeight: '60px',
          overflowY: 'auto'
        }}>
          <strong>Input:</strong> {data.inputText.substring(0, 50)}...
        </div>
      )}
      
      <button
        onClick={processContent}
        disabled={status === 'processing'}
        style={{
          width: '100%',
          padding: '6px 12px',
          background: status === 'processing' ? '#ccc' : '#9C27B0',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: status === 'processing' ? 'not-allowed' : 'pointer',
          fontSize: '0.85em'
        }}
      >
        {status === 'processing' ? 'Processing...' : 'Process'}
      </button>
      
      {status === 'success' && (
        <div style={{ color: '#4a4', fontSize: '0.8em', marginTop: '5px' }}>
          ✓ Processed successfully
        </div>
      )}
      
      {status === 'error' && (
        <div style={{ color: '#f44', fontSize: '0.8em', marginTop: '5px' }}>
          Failed!
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} style={{ background: '#9C27B0' }} />
    </div>
  );
};

export default CanvasNode;
