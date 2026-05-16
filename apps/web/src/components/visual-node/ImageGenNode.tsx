import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

interface ImageGenNodeProps {
  data: {
    label: string;
    prompt?: string;
    imageUrl?: string;
    result?: string;
    status?: 'idle' | 'running' | 'success' | 'error';
    error?: string;
  };
}

const ImageGenNode: React.FC<ImageGenNodeProps> = ({ data }) => {
  const [prompt, setPrompt] = useState(data.prompt || 'A cinematic neon-lit cityscape');
  const [imageUrl, setImageUrl] = useState(data.imageUrl || '');
  const [result, setResult] = useState(data.result || '');
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>(data.status || 'idle');
  const [error, setError] = useState(data.error || '');

  const handleExecute = async () => {
    setStatus('running');
    setError('');
    
    try {
      // Use the working /generations/ endpoint
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
      const output = data.result || data.final_enhanced_prompt || 'Image generated';
      
      // Mock an image URL (since mock endpoint doesn't return real images)
      const mockImageUrl = `https://via.placeholder.com/200x200/FF9800/FFFFFF?text=${encodeURIComponent(prompt.substring(0, 20))}`;
      
      setResult(output);
      setImageUrl(mockImageUrl);
      setStatus('success');
      
      // Update node data for downstream nodes
      data.result = output;
      data.imageUrl = mockImageUrl;
      data.status = 'success';
      
    } catch (error: any) {
      console.error('Image generation failed:', error);
      setError(error.message || 'Unknown error');
      setStatus('error');
    }
  };

  return (
    <div style={{
      padding: '15px',
      background: status === 'error' ? '#fee' : status === 'success' ? '#efe' : 'white',
      border: `2px solid ${status === 'error' ? '#f44' : status === 'success' ? '#4a4' : '#FF9800'}`,
      borderRadius: '8px',
      minWidth: '220px',
      fontSize: '0.9em',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <Handle type="target" position={Position.Top} style={{ background: '#FF9800' }} />
      
      <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#FF9800' }}>
        {data.label || 'Image Generation'}
      </div>
      
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Image prompt..."
        style={{
          width: '100%',
          padding: '6px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '0.85em',
          marginBottom: '8px'
        }}
      />
      
      <button
        onClick={handleExecute}
        disabled={status === 'running'}
        style={{
          width: '100%',
          padding: '6px 12px',
          background: status === 'running' ? '#ccc' : '#FF9800',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: status === 'running' ? 'not-allowed' : 'pointer',
          fontSize: '0.85em'
        }}
      >
        {status === 'running' ? 'Generating...' : 'Generate Image'}
      </button>
      
      {imageUrl && status === 'success' && (
        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <img 
            src={imageUrl} 
            alt="Generated" 
            style={{ 
              maxWidth: '100%', 
              borderRadius: '4px',
              border: '1px solid #ddd'
            }} 
          />
        </div>
      )}
      
      {result && status === 'success' && (
        <div style={{
          marginTop: '8px',
          padding: '8px',
          background: '#f5f5f5',
          borderRadius: '4px',
          fontSize: '0.8em',
          maxHeight: '60px',
          overflowY: 'auto'
        }}>
          <strong>Result:</strong> {result.substring(0, 80)}{result.length > 80 ? '...' : ''}
        </div>
      )}
      
      {status === 'error' && (
        <div style={{ color: '#f44', fontSize: '0.8em', marginTop: '5px' }}>
          ✗ Failed: {error || 'Check backend'}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} style={{ background: '#FF9800' }} />
    </div>
  );
};

export default ImageGenNode;
