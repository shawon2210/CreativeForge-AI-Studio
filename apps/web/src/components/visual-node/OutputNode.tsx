import React from 'react';
import { Handle, Position } from 'reactflow';

interface OutputNodeProps {
  data: {
    label?: string;
    input?: string;
    result?: string;
    type?: 'text' | 'image';
    status?: string;
  };
}

const OutputNode: React.FC<OutputNodeProps> = ({ data }) => {
  return (
    <div style={{
      padding: '12px',
      background: 'rgba(14,14,24,0.95)',
      border: '1px solid rgba(16,185,129,0.3)',
      borderRadius: 8,
      minWidth: 200,
      maxWidth: 260,
      fontSize: 12,
      boxShadow: '0 2px 8px rgba(16,185,129,0.1)',
    }}>
      <Handle type="target" position={Position.Top} style={{ background: '#10b981', width: 8, height: 8 }} />

      <div style={{ fontWeight: 600, marginBottom: 8, color: '#f1f5f9', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#10b981' }}>💾</span>
        {data.label || 'Output'}
      </div>

      {data.type === 'image' && data.result && (
        <div style={{ marginTop: 6, textAlign: 'center' }}>
          <img
            src={data.result}
            alt="Output"
            style={{
              maxWidth: '100%', borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}

      {data.type === 'text' && data.result && (
        <div style={{
          marginTop: 6, padding: 8,
          background: 'rgba(16,185,129,0.06)',
          border: '1px solid rgba(16,185,129,0.12)',
          borderRadius: 4, fontSize: 11, color: '#e2e8f0',
          maxHeight: 80, overflowY: 'auto', lineHeight: 1.5,
        }}>
          {data.result}
        </div>
      )}

      {!data.result && (
        <div style={{
          padding: 16, textAlign: 'center',
          fontStyle: 'italic', fontSize: 11,
          color: '#475569',
        }}>
          Waiting for input...
        </div>
      )}
    </div>
  );
};

export default OutputNode;
