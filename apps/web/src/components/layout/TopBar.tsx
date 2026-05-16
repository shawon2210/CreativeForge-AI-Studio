import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import CommandPalette from '../ui/CommandPalette';

export const TopBar: React.FC = () => {
  const { user } = useAuthStore();
  const { unreadCount, addToast } = useNotificationStore();
  const [searchFocused, setSearchFocused] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global Cmd+K / Ctrl+K handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setCommandPaletteOpen(prev => !prev);
    }
    if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <div
        style={{
          height: 56,
          background: '#12121a',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 12,
          flexShrink: 0,
        }}
      >
        {/* Search */}
        <div
          style={{
            flex: 1,
            maxWidth: 480,
            position: 'relative',
          }}
        >
          <div
            onClick={() => setCommandPaletteOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: searchFocused ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${searchFocused ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 8,
              padding: '8px 12px',
              gap: 8,
              transition: 'all 150ms ease',
              cursor: 'pointer',
            }}
          >
            <span style={{ color: '#64748b', fontSize: 14 }}>⌕</span>
            <span style={{ flex: 1, color: '#64748b', fontSize: 13 }}>
              Search features, assets, prompts...
            </span>
            <span
              style={{
                color: '#64748b',
                fontSize: 11,
                padding: '2px 6px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.08)',
                fontFamily: 'monospace',
              }}
            >
              ⌘K
            </span>
          </div>
        </div>

        {/* Status indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            background: 'rgba(16,185,129,0.1)',
            borderRadius: 6,
            border: '1px solid rgba(16,185,129,0.2)',
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              background: '#10b981',
            }}
          />
          <span style={{ color: '#10b981', fontSize: 12, fontWeight: 500 }}>Mock</span>
        </div>

        {/* Notifications */}
        <button
          onClick={() => addToast({ type: 'info', message: 'No new notifications' })}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            position: 'relative',
          }}
        >
          ◔
          {unreadCount > 0 && (
            <div
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 16,
                height: 16,
                borderRadius: 8,
                background: '#ef4444',
                color: 'white',
                fontSize: 10,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {unreadCount}
            </div>
          )}
        </button>

        {/* User avatar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 8px',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {user?.name?.charAt(0) || 'U'}
          </div>
          <span style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 500 }}>
            {user?.name || 'User'}
          </span>
        </div>
      </div>

      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </>
  );
};

export default TopBar;
