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
      const response = await fetch('http://localhost:5000/generations/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          user_id: 'mock_user_123',
          emotion: 'creative',
          intensity: 0.8,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const respData = await response.json();
      const output = respData.result || 'Image generated';

      // Generate a colored placeholder
      const colors = ['6366f1', 'ec4899', '10b981', 'f59e0b', '8b5cf6', 'ef4444', '3b82f6'];
      const color = colors[Math.abs(prompt.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % colors.length];
      const mockImageUrl = `https://placehold.co/256x256/${color}/ffffff?text=${encodeURIComponent(prompt.substring(0, 20))}`;

      setResult(output);
      setImageUrl(mockImageUrl);
      setStatus('success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      setStatus('error');
    }
  };

  const borderColor = status === 'error' ? '#ef4444' : status === 'success' ? '#10b981' : status === 'running' ? '#f59e0b' : '#f59e0b';
  const bgColor = status === 'error' ? 'rgba(239,68,68,0.06)' : status === 'success' ? 'rgba(16,185,129,0.06)' : 'rgba(14,14,24,0.95)';

  return (
    <div style={{
      padding: '12px',
      background: bgColor,
      border: `1px solid ${borderColor}44`,
      borderRadius: 8,
      minWidth: 200,
      maxWidth: 260,
      fontSize: 12,
      boxShadow: `0 2px 8px ${borderColor}15`,
    }}>
      <Handle type="target" position={Position.Top} style={{ background: borderColor, width: 8, height: 8 }} />

      <div style={{ fontWeight: 600, marginBottom: 8, color: '#f1f5f9', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#f59e0b' }}>🖼</span>
        {data.label || 'Image Generation'}
      </div>

      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Image prompt..."
        style={{
          width: '100%', padding: '6px 8px',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
          fontSize: 11, marginBottom: 6, fontFamily: 'inherit',
          background: 'rgba(255,255,255,0.04)', color: '#e2e8f0',
          outline: 'none', boxSizing: 'border-box',
        }}
      />

      <button
        onClick={handleExecute}
        disabled={status === 'running'}
        style={{
          width: '100%', padding: '5px 10px',
          background: status === 'running' ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.12)',
          color: status === 'running' ? '#fbbf24' : '#fbbf24',
          border: `1px solid ${status === 'running' ? 'rgba(245,158,11,0.3)' : 'rgba(245,158,11,0.25)'}`,
          borderRadius: 4, cursor: status === 'running' ? 'not-allowed' : 'pointer',
          fontSize: 11, fontWeight: 600,
        }}
      >
        {status === 'running' ? '◌ Generating...' : '🖼 Generate Image'}
      </button>

      {imageUrl && status === 'success' && (
        <div style={{ marginTop: 8, textAlign: 'center' }}>
          <img
            src={imageUrl}
            alt="Generated"
            style={{
              maxWidth: '100%', borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}

      {status === 'success' && result && !imageUrl && (
        <div style={{
          marginTop: 6, padding: 6,
          background: 'rgba(16,185,129,0.08)', borderRadius: 4,
          fontSize: 10, color: '#94a3b8',
        }}>
          {result.substring(0, 100)}
        </div>
      )}

      {status === 'error' && (
        <div style={{ color: '#ef4444', fontSize: 10, marginTop: 4 }}>
          ✗ {error || 'Failed'}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: borderColor, width: 8, height: 8 }} />
    </div>
  );
};

export default ImageGenNode;
