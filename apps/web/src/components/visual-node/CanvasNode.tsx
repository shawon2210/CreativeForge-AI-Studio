import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

interface CanvasNodeProps {
  data: {
    label: string;
    inputText?: string;
    inputImage?: string;
    output?: string;
    status?: 'idle' | 'processing' | 'success' | 'error';
    result?: string;
  };
}

const CanvasNode: React.FC<CanvasNodeProps> = ({ data }) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>(data.status || 'idle');

  const processContent = async () => {
    setStatus('processing');
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const borderColor = status === 'error' ? '#ef4444' : status === 'success' ? '#10b981' : status === 'processing' ? '#f59e0b' : '#8b5cf6';
  const bgColor = status === 'error' ? 'rgba(239,68,68,0.06)' : status === 'success' ? 'rgba(16,185,129,0.06)' : 'rgba(14,14,24,0.95)';

  return (
    <div style={{
      padding: '12px',
      background: bgColor,
      border: `1px solid ${borderColor}44`,
      borderRadius: 8,
      minWidth: 180,
      maxWidth: 240,
      fontSize: 12,
      boxShadow: `0 2px 8px ${borderColor}15`,
    }}>
      <Handle type="target" position={Position.Top} style={{ background: borderColor, width: 8, height: 8 }} />

      <div style={{ fontWeight: 600, marginBottom: 8, color: '#f1f5f9', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#8b5cf6' }}>🎨</span>
        {data.label || 'CreativeForge Canvas'}
      </div>

      {data.inputText && (
        <div style={{
          padding: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 4,
          fontSize: 10, marginBottom: 6, maxHeight: 50, overflowY: 'auto',
          color: '#94a3b8',
        }}>
          <span style={{ color: '#8b5cf6' }}>Input:</span> {(data.inputText as string).substring(0, 60)}...
        </div>
      )}

      <button
        onClick={processContent}
        disabled={status === 'processing'}
        style={{
          width: '100%', padding: '5px 10px',
          background: status === 'processing' ? 'rgba(245,158,11,0.2)' : 'rgba(139,92,246,0.12)',
          color: status === 'processing' ? '#fbbf24' : '#a78bfa',
          border: `1px solid ${status === 'processing' ? 'rgba(245,158,11,0.3)' : 'rgba(139,92,246,0.25)'}`,
          borderRadius: 4, cursor: status === 'processing' ? 'not-allowed' : 'pointer',
          fontSize: 11, fontWeight: 600,
        }}
      >
        {status === 'processing' ? '◌ Processing...' : '🎨 Process'}
      </button>

      {status === 'success' && (
        <div style={{ color: '#10b981', fontSize: 10, marginTop: 4 }}>✓ Processed</div>
      )}
      {status === 'error' && (
        <div style={{ color: '#ef4444', fontSize: 10, marginTop: 4 }}>✗ Failed</div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: borderColor, width: 8, height: 8 }} />
    </div>
  );
};

export default CanvasNode;
