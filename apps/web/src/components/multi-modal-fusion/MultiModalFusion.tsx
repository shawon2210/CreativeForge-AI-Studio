import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, TextArea, Select, Input, Divider } from '../ui';

interface FusionJob {
  id: string;
  user_id: string;
  prompt: string;
  status: string;
  fusion_type: string;
  inputs: Array<{
    id: string;
    modality_type: string;
    input_data: string;
  }>;
  outputs: Array<{
    id: string;
    output_type: string;
    output_url: string;
  }>;
  created_at: string;
  updated_at: string;
}

const MultiModalFusion: React.FC = () => {
  const [jobs, setJobs] = useState<FusionJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState('mock_user_123');
  
  // Fusion job creation
  const [prompt, setPrompt] = useState('');
  const [fusionType, setFusionType] = useState('default');
  const [inputs, setInputs] = useState<Array<{modality_type: string, input_data: string}>>([
    { modality_type: 'text', input_data: '' }
  ]);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/multi-modal-fusion/jobs/?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const addInput = () => {
    setInputs([...inputs, { modality_type: 'text', input_data: '' }]);
  };

  const removeInput = (index: number) => {
    setInputs(inputs.filter((_, i) => i !== index));
  };

  const updateInput = (index: number, field: string, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = { ...newInputs[index], [field]: value };
    setInputs(newInputs);
  };

  const createFusionJob = async () => {
    if (!prompt || inputs.some(inp => !inp.input_data)) {
      alert('Prompt and all input data are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/multi-modal-fusion/jobs/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          prompt,
          inputs: inputs.map(({ modality_type, input_data }) => ({ modality_type, input_data })),
          fusion_type: fusionType
        })
      });
      if (!response.ok) throw new Error('Failed to create fusion job');
      const newJob = await response.json();
      setJobs([newJob, ...jobs]);
      setPrompt('');
      setInputs([{ modality_type: 'text', input_data: '' }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getJobStatus = async (jobId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/multi-modal-fusion/jobs/${jobId}`);
      if (!response.ok) throw new Error('Failed to get job status');
      const updatedJob = await response.json();
      setJobs(jobs.map(j => j.id === jobId ? updatedJob : j));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' => {
    if (status === 'completed') return 'success';
    if (status === 'processing') return 'warning';
    return 'error';
  };

  const fusionTypeOptions = [
    { value: 'default', label: 'Default' },
    { value: 'creative', label: 'Creative' },
    { value: 'technical', label: 'Technical' },
  ];

  const modalityOptions = [
    { value: 'text', label: 'Text' },
    { value: 'image', label: 'Image URL' },
    { value: 'video', label: 'Video URL' },
    { value: 'audio', label: 'Audio URL' },
  ];

  const getPlaceholder = (modality: string) => {
    switch (modality) {
      case 'text': return 'Enter text...';
      case 'image': return 'Image URL...';
      case 'video': return 'Video URL...';
      case 'audio': return 'Audio URL...';
      default: return 'Enter value...';
    }
  };

  const pageStyle: React.CSSProperties = {
    padding: 24,
    maxWidth: 960,
    margin: '0 auto',
  };

  const headingStyle: React.CSSProperties = {
    color: '#f1f5f9',
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 16,
  };

  const linkStyle: React.CSSProperties = {
    color: '#6366f1',
    fontSize: 13,
    textDecoration: 'none',
    display: 'inline-block',
    marginBottom: 16,
  };

  const sectionTitleStyle: React.CSSProperties = {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 16,
  };

  const labelStyle: React.CSSProperties = {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 500,
    marginBottom: 6,
    display: 'block',
  };

  const errorBannerStyle: React.CSSProperties = {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#ef4444',
    padding: '12px 16px',
    borderRadius: 8,
    marginBottom: 24,
    fontSize: 13,
  };

  const inputCardStyle: React.CSSProperties = {
    background: '#1a1a25',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  };

  const inputHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  };

  const jobCardStyle: React.CSSProperties = {
    background: '#1a1a25',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: 16,
  };

  const jobHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  };

  const badgeContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const emptyTextStyle: React.CSSProperties = {
    color: '#64748b',
    fontSize: 13,
  };

  const inputsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
  };

  return (
    <div style={pageStyle}>
      <h1 style={headingStyle}>Multi-Modal Fusion</h1>
      <Link to="/" style={linkStyle}>Back to Home</Link>
      
      <Card padding="lg" style={{ marginBottom: 24 }}>
        <h2 style={sectionTitleStyle}>Create Fusion Job</h2>
        
        <div style={{ marginBottom: 16 }}>
          <TextArea
            label="Prompt"
            rows={3}
            value={prompt}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
            placeholder="Describe what you want to generate from the fused inputs..."
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Select
            label="Fusion Type"
            options={fusionTypeOptions}
            value={fusionType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFusionType(e.target.value)}
          />
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Inputs:</label>
          {inputs.map((input, index) => (
            <div key={index} style={inputCardStyle}>
              <div style={inputHeaderStyle}>
                <span style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 500 }}>
                  Input {index + 1}
                </span>
                {inputs.length > 1 && (
                  <button
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: 12,
                      padding: 0,
                    }}
                    onClick={() => removeInput(index)}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
                  >
                    Remove
                  </button>
                )}
              </div>
              <div style={inputsGridStyle}>
                <Select
                  options={modalityOptions}
                  value={input.modality_type}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateInput(index, 'modality_type', e.target.value)}
                />
                <Input
                  type="text"
                  placeholder={getPlaceholder(input.modality_type)}
                  value={input.input_data}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateInput(index, 'input_data', e.target.value)}
                />
              </div>
            </div>
          ))}
          <button
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6366f1',
              cursor: 'pointer',
              fontSize: 12,
              padding: 0,
            }}
            onClick={addInput}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#818cf8'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#6366f1'; }}
          >
            + Add Another Input
          </button>
        </div>

        <Button
          variant="primary"
          size="md"
          loading={loading}
          disabled={!prompt || inputs.some(inp => !inp.input_data)}
          onClick={createFusionJob}
        >
          {loading ? 'Creating...' : 'Create Fusion Job'}
        </Button>
      </Card>

      {error && (
        <div style={errorBannerStyle}>{error}</div>
      )}

      <Card padding="lg">
        <h2 style={sectionTitleStyle}>Your Fusion Jobs</h2>
        {loading && jobs.length === 0 ? (
          <p style={emptyTextStyle}>Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p style={emptyTextStyle}>No fusion jobs yet. Create one above!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {jobs.map(job => (
              <div key={job.id} style={jobCardStyle}>
                <div style={jobHeaderStyle}>
                  <div>
                    <h3 style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 500 }}>
                      Job {job.id.substring(0, 8)}...
                    </h3>
                    <p style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{job.prompt}</p>
                  </div>
                  <div style={badgeContainerStyle}>
                    <Badge variant={getStatusVariant(job.status)} size="sm">
                      {job.status}
                    </Badge>
                    <Badge variant="neutral" size="sm">
                      {job.fusion_type}
                    </Badge>
                  </div>
                </div>
                
                <div style={{ marginBottom: 12 }}>
                  <h4 style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                    Inputs ({job.inputs.length}):
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {job.inputs.map((input, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: 'rgba(59,130,246,0.1)',
                          color: '#3b82f6',
                          border: '1px solid rgba(59,130,246,0.2)',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                        }}
                      >
                        {input.modality_type}: {input.input_data.substring(0, 30)}...
                      </span>
                    ))}
                  </div>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                {job.status === 'processing' && (
                  <div style={{ marginBottom: 8 }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => getJobStatus(job.id)}
                    >
                      Check Status
                    </Button>
                  </div>
                )}

                {job.outputs.length > 0 && (
                  <div>
                    <h4 style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                      Outputs ({job.outputs.length}):
                    </h4>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {job.outputs.map((output, idx) => (
                        <Button
                          key={idx}
                          variant="secondary"
                          size="sm"
                          onClick={() => window.open(output.output_url, '_blank')}
                        >
                          View Output {idx + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default MultiModalFusion;
