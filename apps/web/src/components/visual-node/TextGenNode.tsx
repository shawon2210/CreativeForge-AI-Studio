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
      const output = respData.result || respData.generated_text || 'Text generated successfully';
      setResult(output);
      setStatus('success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      setStatus('error');
    }
  };

  const borderColor = status === 'error' ? '#ef4444' : status === 'success' ? '#10b981' : status === 'running' ? '#f59e0b' : '#3b82f6';
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
        <span style={{ color: '#3b82f6' }}>✦</span>
        {data.label || 'Text Generation'}
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter prompt..."
        style={{
          width: '100%', height: 50, padding: '6px 8px',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
          fontSize: 11, resize: 'vertical', fontFamily: 'inherit',
          background: 'rgba(255,255,255,0.04)', color: '#e2e8f0',
          outline: 'none', boxSizing: 'border-box',
        }}
      />

      <button
        onClick={handleExecute}
        disabled={status === 'running'}
        style={{
          marginTop: 6, width: '100%', padding: '5px 10px',
          background: status === 'running' ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.15)',
          color: status === 'running' ? '#fbbf24' : '#60a5fa',
          border: `1px solid ${status === 'running' ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.3)'}`,
          borderRadius: 4, cursor: status === 'running' ? 'not-allowed' : 'pointer',
          fontSize: 11, fontWeight: 600,
        }}
      >
        {status === 'running' ? '◌ Generating...' : '✦ Generate'}
      </button>

      {status === 'success' && result && (
        <div style={{
          marginTop: 6, padding: 6,
          background: 'rgba(16,185,129,0.08)', borderRadius: 4,
          fontSize: 10, color: '#94a3b8', maxHeight: 60, overflowY: 'auto',
          border: '1px solid rgba(16,185,129,0.15)',
        }}>
          {result.substring(0, 120)}{result.length > 120 ? '...' : ''}
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

export default TextGenNode;
