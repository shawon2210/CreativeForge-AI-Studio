import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface UIComponent {
  id: string;
  component_type: string;
  component_name: string;
  properties: Record<string, any>;
  position: Record<string, number>;
}

interface GeneratedUI {
  id: string;
  user_id: string;
  ui_name: string;
  description: string;
  prompt_used: string;
  ui_type: string;
  status: string;
  components: UIComponent[];
  created_at: string;
}

const GenerativeUI: React.FC = () => {
  const [uis, setUis] = useState<GeneratedUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState('mock_user_123');
  
  // UI creation
  const [uiName, setUiName] = useState('');
  const [promptUsed, setPromptUsed] = useState('');
  const [uiType, setUiType] = useState('dashboard');
  const [description, setDescription] = useState('');

  const fetchUis = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/generative-ui/uis/?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch UIs');
      const data = await response.json();
      setUis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createUI = async () => {
    if (!uiName || !promptUsed) {
      alert('UI name and prompt are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/generative-ui/uis/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          ui_name: uiName,
          prompt_used: promptUsed,
          ui_type: uiType,
          description
        })
      });
      if (!response.ok) throw new Error('Failed to create UI');
      const newUI = await response.json();
      setUis([newUI, ...uis]);
      setUiName('');
      setPromptUsed('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (uiId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/generative-ui/uis/${uiId}/status/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_status: 'completed' })
      });
      if (!response.ok) throw new Error('Failed to update status');
      fetchUis(); // Refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    fetchUis();
  }, []);

  const getComponentIcon = (type: string) => {
    const icons: Record<string, string> = {
      'chart': '📊',
      'table': '📋',
      'stat': '📈',
      'card': '🃏',
      'input': '⌨️',
      'button': '🔘',
      'select': '📝',
      'checkbox': '☑️',
      'image': '🖼️',
      'video': '🎬',
      'modal': '🪟',
      'text': '📄',
      'divider': '➖'
    };
    return icons[type] || '📦';
  };

  // Dark theme inline styles
  const styles: Record<string, React.CSSProperties> = {
    container: {
      padding: '16px',
      maxWidth: '1152px',
      margin: '0 auto',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      minHeight: '100vh',
      backgroundColor: '#0f172a',
    },
    heading: {
      fontSize: '24px',
      fontWeight: 700,
      marginBottom: '16px',
      color: '#f1f5f9',
    },
    backLink: {
      color: '#60a5fa',
      textDecoration: 'none',
      display: 'block',
      marginBottom: '16px',
      fontSize: '14px',
    },
    card: {
      backgroundColor: '#1e293b',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px',
      border: '1px solid #334155',
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    },
    cardHeading: {
      fontSize: '20px',
      fontWeight: 600,
      marginBottom: '16px',
      color: '#f1f5f9',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      color: '#94a3b8',
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #475569',
      backgroundColor: '#0f172a',
      color: '#e2e8f0',
      fontSize: '14px',
      boxSizing: 'border-box',
      outline: 'none',
    },
    textarea: {
      width: '100%',
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #475569',
      backgroundColor: '#0f172a',
      color: '#e2e8f0',
      fontSize: '14px',
      boxSizing: 'border-box',
      outline: 'none',
      resize: 'vertical',
      fontFamily: 'inherit',
    },
    select: {
      width: '100%',
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #475569',
      backgroundColor: '#0f172a',
      color: '#e2e8f0',
      fontSize: '14px',
      boxSizing: 'border-box',
      outline: 'none',
    },
    grid2col: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
    },
    button: {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 500,
    },
    buttonDisabled: {
      backgroundColor: '#475569',
      color: '#94a3b8',
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'not-allowed',
      fontSize: '14px',
      fontWeight: 500,
    },
    errorBox: {
      backgroundColor: '#7f1d1d',
      border: '1px solid #dc2626',
      color: '#fca5a5',
      padding: '12px 16px',
      borderRadius: '6px',
      marginBottom: '16px',
      fontSize: '14px',
    },
    emptyText: {
      color: '#64748b',
      fontSize: '14px',
    },
    uiCard: {
      border: '1px solid #334155',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: '#1e293b',
    },
    uiCardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px',
    },
    uiName: {
      fontWeight: 500,
      fontSize: '18px',
      color: '#f1f5f9',
    },
    uiDescription: {
      fontSize: '14px',
      color: '#94a3b8',
    },
    uiPrompt: {
      fontSize: '12px',
      color: '#64748b',
      marginTop: '4px',
    },
    badgeRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    statusBadge: {
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 500,
    },
    typeBadge: {
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 500,
      backgroundColor: '#1e3a5f',
      color: '#93c5fd',
    },
    componentsHeading: {
      fontWeight: 500,
      fontSize: '14px',
      marginBottom: '8px',
      color: '#cbd5e1',
    },
    componentsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      gap: '8px',
      marginBottom: '12px',
    },
    componentCard: {
      border: '1px solid #334155',
      borderRadius: '6px',
      padding: '8px',
      textAlign: 'center',
      backgroundColor: '#0f172a',
      cursor: 'pointer',
      transition: 'background-color 0.15s',
    },
    componentIcon: {
      fontSize: '24px',
      marginBottom: '4px',
    },
    componentName: {
      fontSize: '12px',
      color: '#94a3b8',
    },
    componentType: {
      fontSize: '12px',
      color: '#64748b',
    },
    completeButton: {
      backgroundColor: '#16a34a',
      color: '#ffffff',
      padding: '4px 12px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 500,
    },
    spaceY4: {
      marginBottom: '16px',
    },
  };

  const getStatusStyle = (status: string): React.CSSProperties => {
    switch (status) {
      case 'completed':
        return { ...styles.statusBadge, backgroundColor: '#14532d', color: '#86efac' };
      case 'generating':
        return { ...styles.statusBadge, backgroundColor: '#713f12', color: '#fde047' };
      default:
        return { ...styles.statusBadge, backgroundColor: '#1e293b', color: '#94a3b8' };
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Generative UI</h1>
      <Link to="/" style={styles.backLink}>← Back to Home</Link>
      
      <div style={styles.card}>
        <h2 style={styles.cardHeading}>Generate UI from Prompt</h2>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={styles.label}>UI Name:</label>
            <input
              type="text"
              style={styles.input}
              value={uiName}
              onChange={(e) => setUiName(e.target.value)}
              placeholder="e.g., Analytics Dashboard"
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={styles.label}>Prompt:</label>
            <textarea
              style={styles.textarea}
              rows={3}
              value={promptUsed}
              onChange={(e) => setPromptUsed(e.target.value)}
              placeholder="Describe the UI you want to generate..."
            />
          </div>
          <div style={styles.grid2col}>
            <div>
              <label style={styles.label}>UI Type:</label>
              <select
                style={styles.select}
                value={uiType}
                onChange={(e) => setUiType(e.target.value)}
              >
                <option value="dashboard">Dashboard</option>
                <option value="form">Form</option>
                <option value="gallery">Gallery</option>
                <option value="landing">Landing Page</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Description (optional):</label>
              <input
                type="text"
                style={styles.input}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..."
              />
            </div>
          </div>
        </div>
        <button
          style={loading || !uiName || !promptUsed ? styles.buttonDisabled : styles.button}
          onClick={createUI}
          disabled={loading || !uiName || !promptUsed}
          onMouseEnter={(e) => {
            if (!loading && uiName && promptUsed) {
              (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && uiName && promptUsed) {
              (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
            }
          }}
        >
          {loading ? 'Generating...' : 'Generate UI'}
        </button>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.card}>
        <h2 style={styles.cardHeading}>Your Generated UIs</h2>
        {loading && uis.length === 0 ? (
          <p style={styles.emptyText}>Loading UIs...</p>
        ) : uis.length === 0 ? (
          <p style={styles.emptyText}>No UIs yet. Generate one above!</p>
        ) : (
          <div>
            {uis.map(ui => (
              <div key={ui.id} style={{ ...styles.uiCard, marginBottom: '24px' }}>
                <div style={styles.uiCardHeader}>
                  <div>
                    <h3 style={styles.uiName}>{ui.ui_name}</h3>
                    <p style={styles.uiDescription}>{ui.description}</p>
                    <p style={styles.uiPrompt}>Prompt: {ui.prompt_used}</p>
                  </div>
                  <div style={styles.badgeRow}>
                    <span style={getStatusStyle(ui.status)}>
                      {ui.status}
                    </span>
                    <span style={styles.typeBadge}>{ui.ui_type}</span>
                  </div>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <h4 style={styles.componentsHeading}>Components ({ui.components?.length || 0}):</h4>
                  <div style={styles.componentsGrid}>
                    {ui.components?.map((comp, idx) => (
                      <div
                        key={idx}
                        style={styles.componentCard}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.backgroundColor = '#1e293b';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.backgroundColor = '#0f172a';
                        }}
                      >
                        <div style={styles.componentIcon}>{getComponentIcon(comp.component_type)}</div>
                        <div style={styles.componentName}>{comp.component_name}</div>
                        <div style={styles.componentType}>{comp.component_type}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {ui.status !== 'completed' && (
                  <button
                    style={styles.completeButton}
                    onClick={() => updateStatus(ui.id)}
                    onMouseEnter={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#15803d';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#16a34a';
                    }}
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerativeUI;
