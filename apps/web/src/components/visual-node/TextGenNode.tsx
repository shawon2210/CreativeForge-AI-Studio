import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

interface TextGenNodeProps {
  data: {
    label: string;
    prompt?: string;
    result?: string;
    status?: 'idle' | 'running' | 'success' | 'error';
    error?: string;
  };
}

const TextGenNode: React.FC<TextGenNodeProps> = ({ data }) => {
  const [prompt, setPrompt] = useState(data.prompt || 'Create a cinematic scene description');
  const [result, setResult] = useState(data.result || '');
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>(data.status || 'idle');
  const [error, setError] = useState(data.error || '');

  const handleExecute = async () => {
    setStatus('running');
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/generations/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          user_id: 'mock_user_123',
          emotion: 'creative',
          intensity: 0.8
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const output = data.generated_text || data.result || data.message || 'Text generated successfully';
      
      setResult(output);
      setStatus('success');
      
      // Update node data for downstream nodes
      data.result = output;
      data.status = 'success';
      
    } catch (error: any) {
      console.error('Text generation failed:', error);
      setError(error.message || 'Unknown error');
      setStatus('error');
    }
  };

  return (
    <div style={{
      padding: '15px',
      background: status === 'error' ? '#fee' : status === 'success' ? '#efe' : 'white',
      border: `2px solid ${status === 'error' ? '#f44' : status === 'success' ? '#4a4' : '#2196F3'}`,
      borderRadius: '8px',
      minWidth: '220px',
      fontSize: '0.9em',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <Handle type="target" position={Position.Top} style={{ background: '#2196F3' }} />
      
      <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#2196F3' }}>
        {data.label || 'Text Generation'}
      </div>
      
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter prompt..."
        style={{
          width: '100%',
          height: '60px',
          padding: '5px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '0.85em',
          resize: 'vertical'
        }}
      />
      
      <button
        onClick={handleExecute}
        disabled={status === 'running'}
        style={{
          marginTop: '8px',
          width: '100%',
          padding: '6px 12px',
          background: status === 'running' ? '#ccc' : '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: status === 'running' ? 'not-allowed' : 'pointer',
          fontSize: '0.85em'
        }}
      >
        {status === 'running' ? 'Generating...' : 'Generate Text'}
      </button>
      
      {status === 'success' && result && (
        <div style={{
          marginTop: '8px',
          padding: '8px',
          background: '#f5f5f5',
          borderRadius: '4px',
          fontSize: '0.8em',
          maxHeight: '80px',
          overflowY: 'auto'
        }}>
          <strong>Result:</strong> {result.substring(0, 100)}{result.length > 100 ? '...' : ''}
        </div>
      )}
      
      {status === 'error' && (
        <div style={{ color: '#f44', fontSize: '0.8em', marginTop: '5px' }}>
          ✗ Failed: {error || 'Check console'}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} style={{ background: '#2196F3' }} />
    </div>
  );
};

export default TextGenNode;
