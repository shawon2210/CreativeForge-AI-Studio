import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, TextArea, PageHeader } from '../ui';

interface StyleDNA {
  user_id: string;
  style_fingerprint: Record<string, number>;
  created_at: string;
  updated_at: string;
}

const StyleGenomeDashboard: React.FC = () => {
  const [styleDNA, setStyleDNA] = useState<StyleDNA | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState('mock_user_123'); // TODO: get from auth context
  const [mutationParams, setMutationParams] = useState('{}');
  const [feedback, setFeedback] = useState('{}');

  const fetchStyleDNA = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/style-genome/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch style DNA');
      const data = await response.json();
      setStyleDNA(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleMutate = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = JSON.parse(mutationParams);
      const response = await fetch('http://localhost:5000/style-genome/mutate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, mutation_params: params })
      });
      if (!response.ok) throw new Error('Mutation failed');
      await fetchStyleDNA(); // Refresh DNA after mutation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleEvolve = async () => {
    setLoading(true);
    setError(null);
    try {
      const feedbackData = JSON.parse(feedback);
      const response = await fetch('http://localhost:5000/style-genome/evolve/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, feedback: feedbackData })
      });
      if (!response.ok) throw new Error('Evolution failed');
      await fetchStyleDNA(); // Refresh DNA after evolution
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStyleDNA();
  }, []);

  if (loading && !styleDNA) {
    return (
      <div style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#94a3b8', fontSize: 15 }}>
          <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span>
          Loading style DNA...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <PageHeader
        title="🧬 Style Genome"
        subtitle="View, mutate, and evolve your unique creative style fingerprint"
        badge={{ text: 'Active', variant: 'success' }}
      />

      {/* Navigation */}
      <Link
        to="/"
        style={{
          color: '#6366f1',
          textDecoration: 'none',
          fontSize: 13,
          marginBottom: 24,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          transition: 'color 150ms ease',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#818cf8'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#6366f1'; }}
      >
        ← Back to Home
      </Link>

      {/* Error display */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 8,
          padding: '12px 16px',
          color: '#fca5a5',
          fontSize: 13,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span>⚠</span> {error}
        </div>
      )}

      {/* Style DNA Card */}
      {styleDNA && (
        <Card padding="lg" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 600, margin: 0 }}>Your Style DNA</h2>
            <Badge variant="info" size="sm">{styleDNA.user_id}</Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>User ID</div>
              <div style={{ color: '#e2e8f0', fontSize: 13 }}>{styleDNA.user_id}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Last Updated</div>
              <div style={{ color: '#e2e8f0', fontSize: 13 }}>{new Date(styleDNA.updated_at).toLocaleString()}</div>
            </div>
          </div>

          <div style={{ marginBottom: 4 }}>
            <h3 style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              Style Fingerprint
            </h3>
            <pre style={{
              background: '#0a0a0f',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: 16,
              color: '#e2e8f0',
              fontSize: 12,
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
              overflow: 'auto',
              margin: 0,
              lineHeight: 1.6,
            }}>
              {JSON.stringify(styleDNA.style_fingerprint, null, 2)}
            </pre>
          </div>
        </Card>
      )}

      {/* Action Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
        {/* Mutate Card */}
        <Card padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 20 }}>🎲</span>
            <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, margin: 0 }}>Mutate Style</h2>
          </div>
          <p style={{ color: '#64748b', fontSize: 12, marginBottom: 16, lineHeight: 1.5 }}>
            Apply random mutations to your style fingerprint. Pass parameters to control mutation behavior.
          </p>
          <div style={{ marginBottom: 16 }}>
            <TextArea
              label="Mutation Parameters (JSON)"
              rows={4}
              value={mutationParams}
              onChange={(e) => setMutationParams(e.target.value)}
              placeholder='{"mutation_rate": 0.1, "target_traits": ["color", "texture"]}'
            />
          </div>
          <Button
            variant="primary"
            loading={loading}
            disabled={loading}
            onClick={handleMutate}
          >
            Mutate Style
          </Button>
        </Card>

        {/* Evolve Card */}
        <Card padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 20 }}>🧬</span>
            <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, margin: 0 }}>Evolve Style</h2>
          </div>
          <p style={{ color: '#64748b', fontSize: 12, marginBottom: 16, lineHeight: 1.5 }}>
            Evolve your style based on feedback. Provide feedback data to guide the evolution process.
          </p>
          <div style={{ marginBottom: 16 }}>
            <TextArea
              label="Feedback (JSON)"
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder='{"liked": ["warm_colors", "soft_edges"], "disliked": ["high_contrast"]}'
            />
          </div>
          <Button
            variant="secondary"
            loading={loading}
            disabled={loading}
            onClick={handleEvolve}
            style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}
          >
            Evolve Style
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default StyleGenomeDashboard;
