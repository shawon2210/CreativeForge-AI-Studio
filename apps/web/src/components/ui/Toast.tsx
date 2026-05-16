import React, { useEffect } from 'react';
import { useNotificationStore } from '../../stores/notificationStore';

const ToastItem: React.FC<{ id: string; type: 'success' | 'error' | 'warning' | 'info'; message: string; onRemove: (id: string) => void }> = ({ id, type, message, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onRemove]);

  const colors: Record<string, { bg: string; border: string; icon: string }> = {
    success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', icon: '✓' },
    error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', icon: '✕' },
    warning: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', icon: '⚠' },
    info: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', icon: 'ℹ' },
  };

  const c = colors[type];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 16px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 8,
        minWidth: 280,
        maxWidth: 400,
        animation: 'fadeIn 200ms ease',
        backdropFilter: 'blur(8px)',
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 700 }}>{c.icon}</span>
      <span style={{ color: '#f1f5f9', fontSize: 13, flex: 1 }}>{message}</span>
      <button
        onClick={() => onRemove(id)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#64748b',
          cursor: 'pointer',
          fontSize: 14,
          padding: 2,
        }}
      >
        ✕
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotificationStore();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 10000,
      }}
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
