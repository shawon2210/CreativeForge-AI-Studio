import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Badge, Input, TextArea } from '../ui';

interface RenderJob {
  id: string;
  user_id: string;
  generation_id: number;
  status: string;
  render_settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface RenderPreview {
  id: string;
  job_id: string;
  preview_url: string;
  thumbnail_url?: string;
  width: number;
  height: number;
  format: string;
}

const statusVariant: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
  done: 'success',
  processing: 'warning',
  failed: 'error',
};

const RenderPreview: React.FC = () => {
  const [jobs, setJobs] = useState<RenderJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState('mock_user_123');
  const [generationId, setGenerationId] = useState('1');
  const [renderSettings, setRenderSettings] = useState('{}');

  const createJob = async () => {
    setLoading(true);
    setError(null);
    try {
      const settings = JSON.parse(renderSettings);
      const response = await fetch('http://localhost:5000/render-preview/jobs/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          generation_id: parseInt(generationId),
          render_settings: settings
        })
      });
      if (!response.ok) throw new Error('Failed to create render job');
      const newJob = await response.json();
      setJobs([newJob, ...jobs]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getPreview = async (jobId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/render-preview/jobs/${jobId}/preview/`);
      if (!response.ok) {
        if (response.status === 404) {
          alert('Preview not available yet. Job status: ' + jobs.find(j => j.id === jobId)?.status);
          return;
        }
        throw new Error('Failed to get preview');
      }
      const preview: RenderPreview = await response.json();
      window.open(preview.preview_url, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 896, margin: '0 auto' }}>
      <h1 style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        Render Preview
      </h1>
      <Link
        to="/"
        style={{ color: '#6366f1', fontSize: 13, textDecoration: 'none', display: 'block', marginBottom: 24 }}
      >
        ← Back to Home
      </Link>

      <Card padding="md" style={{ marginBottom: 24 }}>
        <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
          Create Render Job
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
          <Input
            label="Generation ID"
            type="number"
            value={generationId}
            onChange={(e) => setGenerationId(e.target.value)}
          />
          <TextArea
            label="Render Settings (JSON)"
            rows={4}
            value={renderSettings}
            onChange={(e) => setRenderSettings(e.target.value)}
          />
        </div>
        <Button variant="primary" loading={loading} disabled={loading} onClick={createJob}>
          {loading ? 'Creating...' : 'Create Render Job'}
        </Button>
      </Card>

      {error && (
        <div
          style={{
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.25)',
            color: '#ef4444',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 24,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      <Card padding="md">
        <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
          Your Render Jobs
        </h2>
        {jobs.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: 13 }}>No render jobs yet. Create one above!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {jobs.map(job => (
              <div
                key={job.id}
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <h3 style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 500 }}>
                    Job ID: {job.id.substring(0, 8)}...
                  </h3>
                  <Badge variant={statusVariant[job.status] || 'neutral'}>
                    {job.status}
                  </Badge>
                </div>
                <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 4 }}>
                  <strong style={{ color: '#cbd5e1' }}>Generation ID:</strong> {job.generation_id}
                </p>
                <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>
                  <strong style={{ color: '#cbd5e1' }}>Created:</strong>{' '}
                  {new Date(job.created_at).toLocaleString()}
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => getPreview(job.id)}
                  disabled={job.status !== 'done'}
                >
                  View Preview
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default RenderPreview;
