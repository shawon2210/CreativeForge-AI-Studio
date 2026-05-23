/**
 * UnifiedDashboard — Responsive single-page view of all 23 integrated features.
 * Shows real-time pipeline output, feature status, and combined results.
 * Mobile-first: 360px / 768px / 1024px+ breakpoints.
 */
import React, { useState, useCallback, useEffect } from 'react';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── Feature metadata ──────────────────────────────────────────────
const FEATURES = [
  { key: 'prompt_analysis', label: 'Prompt Analysis', icon: '🔍', color: '#6366f1', desc: 'Quality scoring & weakness detection' },
  { key: 'emotion', label: 'Emotion AI', icon: '🎭', color: '#ec4899', desc: 'Emotional tone & visual params' },
  { key: 'style_dna', label: 'Style Genome', icon: '🧬', color: '#8b5cf6', desc: 'User style fingerprint' },
  { key: 'multi_agent', label: 'Multi-Agent', icon: '🤖', color: '#06b6d4', desc: 'Director, Writer, Visual, Lighting' },
  { key: 'knowledge_graph', label: 'Knowledge Graph', icon: '🔗', color: '#10b981', desc: 'Entity-relation context' },
  { key: 'research', label: 'Research', icon: '📚', color: '#f59e0b', desc: 'Papers & inspiration sources' },
  { key: 'creative_twin', label: 'Creative Twin', icon: '👤', color: '#ef4444', desc: 'Personal AI assistant' },
  { key: 'co_creation', label: 'Co-Creation', icon: '✨', color: '#a855f7', desc: 'Live preview & intent prediction' },
  { key: 'cinematic', label: 'Cinematic AI', icon: '🎬', color: '#f97316', desc: 'Camera, lighting, color grading' },
  { key: 'world_engine', label: 'World Engine', icon: '🌍', color: '#14b8a6', desc: 'World/character/lore context' },
  { key: 'generative_ui', label: 'Generative UI', icon: '🎨', color: '#3b82f6', desc: 'AI-generated UI components' },
  { key: 'multi_modal', label: 'Multi-Modal', icon: '🔄', color: '#6366f1', desc: 'Text + image + audio fusion' },
  { key: 'render', label: 'Render Preview', icon: '🖼️', color: '#8b5cf6', desc: 'Render job monitoring' },
  { key: 'assets', label: 'Assets', icon: '📁', color: '#10b981', desc: 'Asset organization & tagging' },
  { key: 'prompt_to_product', label: 'Prompt→Product', icon: '📦', color: '#f59e0b', desc: 'Template-based generation' },
  { key: 'marketplace', label: 'Marketplace', icon: '🏪', color: '#ec4899', desc: 'Buy & sell AI assets' },
  { key: 'timeline', label: 'Timeline', icon: '📅', color: '#06b6d4', desc: 'Version tracking & history' },
  { key: 'voice', label: 'Voice', icon: '🎤', color: '#ef4444', desc: 'Voice-driven commands' },
  { key: 'collaboration', label: 'Collaboration', icon: '👥', color: '#a855f7', desc: 'Real-time collaboration' },
  { key: 'future_ready', label: 'Future Ready', icon: '🚀', color: '#3b82f6', desc: 'Roadmap & expansion plans' },
  { key: 'os_core', label: 'OS Core', icon: '⚙️', color: '#6b7280', desc: 'Module management & memory' },
  { key: 'relationships', label: 'Relationships', icon: '🔗', color: '#14b8a6', desc: 'Cross-asset relationships' },
  { key: 'shared_memory', label: 'Shared Memory', icon: '💾', color: '#f97316', desc: 'Cross-feature memory store' },
];

// ── Styles ────────────────────────────────────────────────────────
const S = {
  page: { minHeight: '100vh', background: '#0a0a0f', color: '#e2e8f0', fontFamily: "'Inter', system-ui, sans-serif" },
  header: { padding: '16px 20px', borderBottom: '1px solid #1e1e2e', background: '#0f0f1a', position: 'sticky' as const, top: 0, zIndex: 10 },
  headerInner: { maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 12 },
  logo: { fontSize: 20, fontWeight: 700, background: 'linear-gradient(135deg, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  badge: { background: '#1e1e2e', padding: '4px 12px', borderRadius: 20, fontSize: 12, color: '#94a3b8' },
  main: { maxWidth: 1400, margin: '0 auto', padding: '20px' },
  inputGroup: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' as const },
  input: { flex: 1, minWidth: 200, padding: '12px 16px', borderRadius: 12, border: '1px solid #1e1e2e', background: '#0f0f1a', color: '#e2e8f0', fontSize: 14, outline: 'none' as const },
  btn: { padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' as const },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' as const },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 },
  statCard: { background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: 12, padding: 16, textAlign: 'center' as const },
  statVal: { fontSize: 28, fontWeight: 700, marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#94a3b8' },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 24 },
  featureCard: (active: boolean) => ({
    background: active ? '#1a1a2e' : '#0f0f1a',
    border: `1px solid ${active ? '#6366f1' : '#1e1e2e'}`,
    borderRadius: 12,
    padding: 16,
    transition: 'all 0.2s',
    opacity: active ? 1 : 0.6,
  }),
  featureHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  featureIcon: { fontSize: 20 },
  featureLabel: { fontSize: 13, fontWeight: 600 },
  featureDesc: { fontSize: 11, color: '#64748b' },
  outputBox: { background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: 12, padding: 16, marginBottom: 24 },
  outputLabel: { fontSize: 11, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 8 },
  outputText: { fontSize: 14, lineHeight: 1.6, color: '#e2e8f0', wordBreak: 'break-word' as const },
  errorBox: { background: '#1a0f0f', border: '1px solid #7f1d1d', borderRadius: 12, padding: 12, marginTop: 12 },
  errorText: { fontSize: 12, color: '#fca5a5' },
  progressBar: { height: 4, background: '#1e1e2e', borderRadius: 2, overflow: 'hidden' as const, marginTop: 8 },
  progressFill: (pct: number) => ({ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #6366f1, #ec4899)', borderRadius: 2, transition: 'width 0.3s' }),
};

// ── Component ─────────────────────────────────────────────────────
export default function UnifiedDashboard() {
  const [prompt, setPrompt] = useState('A cyberpunk warrior standing in neon rain at night');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const runPipeline = useCallback(async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`${BASE}/pipeline/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, user_id: 'mock_user_123' }),
      });
      const data = await res.json();
      if (res.ok) setResult(data);
      else setError(data.detail || 'Pipeline failed');
    } catch (e: any) {
      setError(e.message || 'Connection failed');
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  const features = result?.features || {};
  const combined = result?.combined_output || {};
  const errors = result?.errors || [];
  const activeKeys = Object.keys(features);

  return (
    <div style={S.page}>
      {/* Header */}
      <header style={S.header}>
        <div style={S.headerInner}>
          <div style={S.logo}>CreativeForge AI Studio</div>
          <div style={S.badge}>23 Features Integrated • Unified Pipeline</div>
        </div>
      </header>

      <main style={S.main}>
        {/* Input */}
        <div style={S.inputGroup}>
          <input
            style={S.input}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your creative prompt..."
            onKeyDown={(e) => e.key === 'Enter' && runPipeline()}
          />
          <button
            style={{ ...S.btn, ...(loading ? S.btnDisabled : {}) }}
            onClick={runPipeline}
            disabled={loading}
          >
            {loading ? '⏳ Running...' : '🚀 Run Pipeline'}
          </button>
        </div>

        {/* Error */}
        {error && <div style={S.errorBox}><div style={S.errorText}>❌ {error}</div></div>}

        {/* Results */}
        {result && (
          <>
            {/* Stats */}
            <div style={S.statsRow}>
              <div style={S.statCard}>
                <div style={{ ...S.statVal, color: '#6366f1' }}>{combined.features_contributed}</div>
                <div style={S.statLabel}>Features Active</div>
              </div>
              <div style={S.statCard}>
                <div style={{ ...S.statVal, color: '#10b981' }}>{combined.coverage_percent}%</div>
                <div style={S.statLabel}>Coverage</div>
              </div>
              <div style={S.statCard}>
                <div style={{ ...S.statVal, color: '#ec4899' }}>{combined.processing_time_ms}ms</div>
                <div style={S.statLabel}>Process Time</div>
              </div>
              <div style={S.statCard}>
                <div style={{ ...S.statVal, color: errors.length > 0 ? '#ef4444' : '#10b981' }}>{errors.length}</div>
                <div style={S.statLabel}>Errors</div>
              </div>
            </div>

            {/* Enhanced Prompt Output */}
            <div style={S.outputBox}>
              <div style={S.outputLabel}>✨ Combined Enhanced Prompt</div>
              <div style={S.outputText}>{combined.enhanced_prompt}</div>
              <div style={S.progressBar}>
                <div style={S.progressFill(combined.coverage_percent)} />
              </div>
            </div>

            {/* Feature Grid */}
            <div style={S.sectionTitle}>🧩 Feature Contributions</div>
            <div style={S.featureGrid}>
              {FEATURES.map((f) => {
                const active = activeKeys.includes(f.key);
                const data = features[f.key];
                return (
                  <div key={f.key} style={S.featureCard(active)}>
                    <div style={S.featureHeader}>
                      <span style={S.featureIcon}>{f.icon}</span>
                      <span style={S.featureLabel}>{f.label}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 10, color: active ? '#10b981' : '#475569', fontWeight: 600 }}>
                        {active ? '● ACTIVE' : '○ IDLE'}
                      </span>
                    </div>
                    <div style={S.featureDesc}>{f.desc}</div>
                    {active && data && (
                      <div style={{ marginTop: 8, fontSize: 11, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {typeof data === 'object' ? JSON.stringify(data).slice(0, 80) + '...' : String(data).slice(0, 80)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div style={S.errorBox}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#fca5a5', marginBottom: 4 }}>⚠️ Non-critical errors:</div>
                {errors.map((e: string, i: number) => (
                  <div key={i} style={S.errorText}>• {e}</div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div style={{ textAlign: 'center', padding: 60, color: '#475569' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Unified Pipeline</div>
            <div style={{ fontSize: 14 }}>Enter a prompt and click "Run Pipeline" to see all 23 features work together</div>
          </div>
        )}
      </main>
    </div>
  );
}
