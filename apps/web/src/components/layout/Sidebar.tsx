import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  section?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '◈', path: '/' },
  { id: 'generations', label: 'Generations', icon: '✦', path: '/generations', section: 'create' },
  { id: 'workflow', label: 'Workflow', icon: '⬡', path: '/workflow', section: 'create' },
  { id: 'world-engine', label: 'World Engine', icon: '🌍', path: '/world-engine', section: 'create' },
  { id: 'emotion-ai', label: 'Emotion AI', icon: '♥', path: '/emotion-ai', section: 'create' },
  { id: 'style-genome', label: 'Style Genome', icon: '🧬', path: '/style-genome', section: 'create' },
  { id: 'render-preview', label: 'Render Preview', icon: '👁', path: '/render-preview', section: 'create' },
  { id: 'asset-management', label: 'Assets', icon: '📁', path: '/asset-management', section: 'manage' },
  { id: 'prompt-to-product', label: 'Prompt→Product', icon: '⚡', path: '/prompt-to-product', section: 'create' },
  { id: 'multi-modal', label: 'Multi-Modal', icon: '⊞', path: '/multi-modal', section: 'create' },
  { id: 'cinematic-ai', label: 'Cinematic AI', icon: '🎬', path: '/cinematic-ai', section: 'create' },
  { id: 'knowledge-graph', label: 'Knowledge', icon: '🕸', path: '/knowledge-graph', section: 'manage' },
  { id: 'generative-ui', label: 'Gen UI', icon: '◫', path: '/generative-ui', section: 'create' },
  { id: 'marketplace', label: 'Marketplace', icon: '🏪', path: '/marketplace', section: 'manage' },
  { id: 'timeline', label: 'Timeline', icon: '⏱', path: '/timeline', section: 'manage' },
  { id: 'voice-driven', label: 'Voice', icon: '🎙', path: '/voice-driven', section: 'create' },
  { id: 'collaboration', label: 'Collab', icon: '👥', path: '/collaboration', section: 'team' },
  { id: 'creative-twin', label: 'AI Twin', icon: '🤖', path: '/creative-twin', section: 'team' },
  { id: 'research', label: 'Research', icon: '🔬', path: '/research', section: 'discover' },
  { id: 'future', label: 'Future', icon: '🚀', path: '/future', section: 'discover' },
];

const sections = [
  { id: 'create', label: 'Create' },
  { id: 'manage', label: 'Manage' },
  { id: 'team', label: 'Team' },
  { id: 'discover', label: 'Discover' },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div
      style={{
        width: collapsed ? 64 : 240,
        height: '100vh',
        background: '#12121a',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          ◈
        </div>
        {!collapsed && (
          <span
            style={{
              color: '#f1f5f9',
              fontWeight: 700,
              fontSize: 16,
              whiteSpace: 'nowrap',
            }}
          >
            CreativeForge
          </span>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          margin: '8px 12px',
          padding: 8,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 6,
          color: '#94a3b8',
          cursor: 'pointer',
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {collapsed ? '→' : '← Collapse'}
      </button>

      {/* Navigation */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        {/* Dashboard */}
        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: location.pathname === '/' ? 'rgba(99,102,241,0.15)' : 'transparent',
            border: 'none',
            borderRadius: 8,
            color: location.pathname === '/' ? '#818cf8' : '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            fontWeight: location.pathname === '/' ? 600 : 400,
            textAlign: 'left',
            minHeight: 40,
          }}
        >
          <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>◈</span>
          {!collapsed && <span>Dashboard</span>}
        </button>

        {sections.map((section) => {
          const sectionItems = navItems.filter((item) => item.section === section.id);
          if (sectionItems.length === 0) return null;
          return (
            <div key={section.id} style={{ marginTop: 16 }}>
              {!collapsed && (
                <div
                  style={{
                    padding: '0 12px',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}
                >
                  {section.label}
                </div>
              )}
              {sectionItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: location.pathname === item.path ? 'rgba(99,102,241,0.15)' : 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    color: location.pathname === item.path ? '#818cf8' : '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 13,
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    textAlign: 'left',
                    minHeight: 36,
                  }}
                >
                  <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </button>
              ))}
            </div>
          );
        })}
      </div>

      {/* User section at bottom */}
      <div
        style={{
          padding: 12,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 13,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          S
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
              Shawon Admin
            </div>
            <div style={{ color: '#64748b', fontSize: 11 }}>Pro Plan</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
