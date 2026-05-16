import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: string;
  path?: string;
  action?: () => void;
  section: string;
}

const allCommands: CommandItem[] = [
  // Navigation
  { id: 'nav-dashboard', label: 'Go to Dashboard', icon: '◈', path: '/', section: 'Navigation' },
  { id: 'nav-generations', label: 'Go to Generations', icon: '✦', path: '/generations', section: 'Navigation' },
  { id: 'nav-workflow', label: 'Go to Visual Workflow', icon: '⬡', path: '/workflow', section: 'Navigation' },
  { id: 'nav-world', label: 'Go to World Engine', icon: '🌍', path: '/world-engine', section: 'Navigation' },
  { id: 'nav-emotion', label: 'Go to Emotion AI', icon: '♥', path: '/emotion-ai', section: 'Navigation' },
  { id: 'nav-style', label: 'Go to Style Genome', icon: '🧬', path: '/style-genome', section: 'Navigation' },
  { id: 'nav-render', label: 'Go to Render Preview', icon: '👁', path: '/render-preview', section: 'Navigation' },
  { id: 'nav-assets', label: 'Go to Asset Management', icon: '📁', path: '/asset-management', section: 'Navigation' },
  { id: 'nav-prompt', label: 'Go to Prompt → Product', icon: '⚡', path: '/prompt-to-product', section: 'Navigation' },
  { id: 'nav-multimodal', label: 'Go to Multi-Modal Fusion', icon: '⊞', path: '/multi-modal', section: 'Navigation' },
  { id: 'nav-cinematic', label: 'Go to Cinematic AI', icon: '🎬', path: '/cinematic-ai', section: 'Navigation' },
  { id: 'nav-knowledge', label: 'Go to Knowledge Graph', icon: '🕸', path: '/knowledge-graph', section: 'Navigation' },
  { id: 'nav-genui', label: 'Go to Generative UI', icon: '◫', path: '/generative-ui', section: 'Navigation' },
  { id: 'nav-marketplace', label: 'Go to Marketplace', icon: '🏪', path: '/marketplace', section: 'Navigation' },
  { id: 'nav-timeline', label: 'Go to Timeline & Versioning', icon: '⏱', path: '/timeline', section: 'Navigation' },
  { id: 'nav-voice', label: 'Go to Voice Creation', icon: '🎙', path: '/voice-driven', section: 'Navigation' },
  { id: 'nav-collab', label: 'Go to Collaborative Studio', icon: '👥', path: '/collaboration', section: 'Navigation' },
  { id: 'nav-twin', label: 'Go to AI Creative Twin', icon: '🤖', path: '/creative-twin', section: 'Navigation' },
  { id: 'nav-research', label: 'Go to Research Engine', icon: '🔬', path: '/research', section: 'Navigation' },
  { id: 'nav-future', label: 'Go to Future Features', icon: '🚀', path: '/future', section: 'Navigation' },
  // Actions
  { id: 'action-new-gen', label: 'New Generation', description: 'Create a new AI generation', icon: '✦', path: '/generations', section: 'Actions' },
  { id: 'action-new-scene', label: 'New Cinematic Scene', description: 'Create a new cinematic scene', icon: '🎬', path: '/cinematic-ai', section: 'Actions' },
  { id: 'action-new-world', label: 'New World', description: 'Build a new story world', icon: '🌍', path: '/world-engine', section: 'Actions' },
  { id: 'action-new-session', label: 'New Collab Session', description: 'Start a collaborative session', icon: '👥', path: '/collaboration', section: 'Actions' },
  { id: 'action-upload', label: 'Upload Asset', description: 'Upload a creative asset', icon: '📁', path: '/asset-management', section: 'Actions' },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return allCommands;
    const q = query.toLowerCase();
    return allCommands.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.section.toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    for (const item of filtered) {
      if (!groups[item.section]) groups[item.section] = [];
      groups[item.section].push(item);
    }
    return groups;
  }, [filtered]);

  const flatFiltered = useMemo(() => filtered, [filtered]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const executeCommand = useCallback((cmd: CommandItem) => {
    onClose();
    if (cmd.path) navigate(cmd.path);
    if (cmd.action) cmd.action();
  }, [navigate, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, flatFiltered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatFiltered[selectedIndex]) {
        executeCommand(flatFiltered[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [flatFiltered, selectedIndex, executeCommand, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selected) selected.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  let flatIndex = 0;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000 }} onClick={onClose}>
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />

      {/* Palette */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 560,
          background: '#12121a',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ color: '#64748b', fontSize: 18 }}>⌕</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search features, actions..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f1f5f9',
              fontSize: 15,
              fontFamily: 'inherit',
            }}
          />
          <span style={{ color: '#475569', fontSize: 11, padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)' }}>ESC</span>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ maxHeight: 360, overflowY: 'auto', padding: '8px 0' }}>
          {flatFiltered.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
              No results found
            </div>
          ) : (
            Object.entries(grouped).map(([section, items]) => (
              <div key={section}>
                <div style={{ padding: '8px 16px 4px', fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 1 }}>
                  {section}
                </div>
                {items.map((cmd) => {
                  const currentIndex = flatIndex++;
                  const isSelected = currentIndex === selectedIndex;
                  return (
                    <div
                      key={cmd.id}
                      data-index={currentIndex}
                      onClick={() => executeCommand(cmd)}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 16px',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(99,102,241,0.12)' : 'transparent',
                        transition: 'background 100ms ease',
                      }}
                    >
                      <span style={{ fontSize: 16, width: 24, textAlign: 'center', opacity: isSelected ? 1 : 0.7 }}>{cmd.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: isSelected ? '#818cf8' : '#f1f5f9', fontSize: 13, fontWeight: 500 }}>{cmd.label}</div>
                        {cmd.description && (
                          <div style={{ color: '#64748b', fontSize: 11, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cmd.description}</div>
                        )}
                      </div>
                      {isSelected && <span style={{ color: '#475569', fontSize: 10 }}>↵</span>}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
          <span style={{ color: '#475569', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ padding: '1px 4px', background: 'rgba(255,255,255,0.05)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)' }}>↑↓</span> Navigate
          </span>
          <span style={{ color: '#475569', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ padding: '1px 4px', background: 'rgba(255,255,255,0.05)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)' }}>↵</span> Select
          </span>
          <span style={{ color: '#475569', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ padding: '1px 4px', background: 'rgba(255,255,255,0.05)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)' }}>esc</span> Close
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
