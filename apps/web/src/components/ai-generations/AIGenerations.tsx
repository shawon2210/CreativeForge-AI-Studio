import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, TextArea, Select, Input, Tabs, EmptyState } from '../ui';
import { useGenerationStore } from '../../stores/generationStore';

/* ─── Types ─────────────────────────────────────────────────────────────────── */

type GenerationMode = 'text' | 'image' | 'multimodal';
type JobStatus = 'idle' | 'queued' | 'running' | 'success' | 'error';

interface GenerationJob {
  id: string;
  mode: GenerationMode;
  prompt: string;
  result: string;
  imageUrl?: string;
  status: JobStatus;
  error?: string;
  agentAnalysis?: Record<string, unknown>;
  createdAt: string;
  emotion?: string;
  intensity?: number;
}

interface MultiModalInput {
  modality: 'text' | 'image' | 'audio' | 'video';
  data: string;
}

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const EMOTIONS = [
  { value: 'calm', label: 'Calm', icon: '😌' },
  { value: 'creative', label: 'Creative', icon: '🎨' },
  { value: 'dramatic', label: 'Dramatic', icon: '🎭' },
  { value: 'energetic', label: 'Energetic', icon: '⚡' },
  { value: 'melancholic', label: 'Melancholic', icon: '🌧' },
  { value: 'mysterious', label: 'Mysterious', icon: '🔮' },
  { value: 'joyful', label: 'Joyful', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌑' },
];

const MODALITY_OPTIONS = [
  { value: 'text', label: 'Text', icon: '📝' },
  { value: 'image', label: 'Image URL', icon: '🖼' },
  { value: 'audio', label: 'Audio URL', icon: '🔊' },
  { value: 'video', label: 'Video URL', icon: '🎥' },
];

const TABS = [
  { id: 'text' as const, label: 'Text Generation', icon: '✦' },
  { id: 'image' as const, label: 'Image Generation', icon: '🖼' },
  { id: 'multimodal' as const, label: 'Multi-Modal', icon: '⊞' },
];

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

function generateId(): string {
  return `gen_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function formatTime(date: string): string {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/* ─── Main Component ────────────────────────────────────────────────────────── */

const AIGenerations: React.FC = () => {
  const navigate = useNavigate();
  const { generations, addGeneration, updateGeneration } = useGenerationStore();

  // Responsive detection
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsTablet(w >= 768 && w < 1024);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Active tab
  const [activeTab, setActiveTab] = useState<GenerationMode>('text');

  // Text generation state
  const [textPrompt, setTextPrompt] = useState('');
  const [textEmotion, setTextEmotion] = useState('creative');
  const [textIntensity, setTextIntensity] = useState(0.8);
  const [textGenerating, setTextGenerating] = useState(false);

  // Image generation state
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageEmotion, setImageEmotion] = useState('creative');
  const [imageIntensity, setImageIntensity] = useState(0.8);
  const [imageGenerating, setImageGenerating] = useState(false);

  // Multi-modal state
  const [mmPrompt, setMmPrompt] = useState('');
  const [mmInputs, setMmInputs] = useState<MultiModalInput[]>([
    { modality: 'text', data: '' },
  ]);
  const [mmGenerating, setMmGenerating] = useState(false);

  // History filter
  const [historyFilter, setHistoryFilter] = useState<GenerationMode | 'all'>('all');

  // Filtered generations
  const filteredGenerations = generations.filter(
    (g) => historyFilter === 'all' || g.mode === historyFilter
  );

  /* ─── API Calls ─────────────────────────────────────────────────────────── */

  const callGenerationAPI = async (prompt: string, emotion: string, intensity: number) => {
    const response = await fetch('http://localhost:5000/generations/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        user_id: 'mock_user_123',
        emotion,
        intensity,
      }),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP ${response.status}`);
    }
    return response.json();
  };

  const handleTextGenerate = async () => {
    if (!textPrompt.trim()) return;
    setTextGenerating(true);
    const jobId = generateId();
    const job: GenerationJob = {
      id: jobId,
      mode: 'text',
      prompt: textPrompt,
      result: '',
      status: 'running',
      emotion: textEmotion,
      intensity: textIntensity,
      createdAt: new Date().toISOString(),
    };
    addGeneration(job);

    try {
      const data = await callGenerationAPI(textPrompt, textEmotion, textIntensity);
      const output = data.result || data.generated_text || 'Generated successfully';
      updateGeneration(jobId, {
        status: 'success',
        result: output,
        agentAnalysis: data.agent_analysis,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      updateGeneration(jobId, { status: 'error', error: msg });
    } finally {
      setTextGenerating(false);
    }
  };

  const handleImageGenerate = async () => {
    if (!imagePrompt.trim()) return;
    setImageGenerating(true);
    const jobId = generateId();
    const job: GenerationJob = {
      id: jobId,
      mode: 'image',
      prompt: imagePrompt,
      result: '',
      status: 'running',
      emotion: imageEmotion,
      intensity: imageIntensity,
      createdAt: new Date().toISOString(),
    };
    addGeneration(job);

    try {
      const data = await callGenerationAPI(imagePrompt, imageEmotion, imageIntensity);
      const output = data.result || data.final_enhanced_prompt || 'Image generated';
      // Generate a colored placeholder image based on the prompt
      const colors = ['6366f1', 'ec4899', '10b981', 'f59e0b', '8b5cf6', 'ef4444', '3b82f6'];
      const color = colors[Math.abs(imagePrompt.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % colors.length];
      const mockImageUrl = `https://placehold.co/512x512/${color}/ffffff?text=${encodeURIComponent(imagePrompt.substring(0, 30))}`;
      updateGeneration(jobId, {
        status: 'success',
        result: output,
        imageUrl: mockImageUrl,
        agentAnalysis: data.agent_analysis,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      updateGeneration(jobId, { status: 'error', error: msg });
    } finally {
      setImageGenerating(false);
    }
  };

  const handleMultiModalGenerate = async () => {
    if (!mmPrompt.trim() || mmInputs.some((i) => !i.data.trim())) return;
    setMmGenerating(true);
    const jobId = generateId();
    const job: GenerationJob = {
      id: jobId,
      mode: 'multimodal',
      prompt: mmPrompt,
      result: '',
      status: 'running',
      createdAt: new Date().toISOString(),
    };
    addGeneration(job);

    try {
      // Build a combined prompt from all inputs
      const combinedInput = mmInputs
        .map((i) => `[${i.modality.toUpperCase()}] ${i.data}`)
        .join(' | ');
      const fullPrompt = `${mmPrompt}\nInputs: ${combinedInput}`;
      const data = await callGenerationAPI(fullPrompt, 'creative', 0.8);
      const output = data.result || 'Multi-modal fusion complete';
      updateGeneration(jobId, {
        status: 'success',
        result: output,
        agentAnalysis: data.agent_analysis,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      updateGeneration(jobId, { status: 'error', error: msg });
    } finally {
      setMmGenerating(false);
    }
  };

  /* ─── Multi-modal input helpers ─────────────────────────────────────────── */

  const addMmInput = () => {
    setMmInputs([...mmInputs, { modality: 'text', data: '' }]);
  };

  const removeMmInput = (index: number) => {
    if (mmInputs.length > 1) {
      setMmInputs(mmInputs.filter((_, i) => i !== index));
    }
  };

  const updateMmInput = (index: number, field: 'modality' | 'data', value: string) => {
    const updated = [...mmInputs];
    if (field === 'modality') {
      updated[index] = { ...updated[index], modality: value as MultiModalInput['modality'] };
    } else {
      updated[index] = { ...updated[index], data: value };
    }
    setMmInputs(updated);
  };

  /* ─── Render ─────────────────────────────────────────────────────────────── */

  const getStatusBadge = (status: JobStatus) => {
    const map: Record<JobStatus, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; label: string }> = {
      idle: { variant: 'neutral', label: 'Idle' },
      queued: { variant: 'info', label: 'Queued' },
      running: { variant: 'warning', label: 'Running' },
      success: { variant: 'success', label: 'Done' },
      error: { variant: 'error', label: 'Error' },
    };
    const { variant, label } = map[status];
    return <Badge variant={variant} size="sm">{label}</Badge>;
  };

  const getModeIcon = (mode: GenerationMode) => {
    const map = { text: '✦', image: '🖼', multimodal: '⊞' };
    return map[mode];
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? 12 : 24 }}>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'transparent', border: 'none', color: '#6366f1',
            cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 8,
          }}
        >
          ← Back to Dashboard
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1 style={{ color: '#f1f5f9', fontSize: isMobile ? 20 : 28, fontWeight: 700, margin: 0 }}>
            AI Generations
          </h1>
          <Badge variant="success" size="sm">Active</Badge>
        </div>
        <p style={{ color: '#64748b', fontSize: isMobile ? 12 : 14, marginTop: 6 }}>
          Text, image, and multi-modal generation with AI Creative Director
        </p>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: 8, marginBottom: isMobile ? 16 : 24,
      }}>
        <Card padding="sm" style={{ textAlign: 'center' }}>
          <div style={{ color: '#f1f5f9', fontSize: isMobile ? 18 : 24, fontWeight: 700 }}>{generations.length}</div>
          <div style={{ color: '#64748b', fontSize: 11 }}>Total</div>
        </Card>
        <Card padding="sm" style={{ textAlign: 'center' }}>
          <div style={{ color: '#10b981', fontSize: isMobile ? 18 : 24, fontWeight: 700 }}>
            {generations.filter((g) => g.status === 'success').length}
          </div>
          <div style={{ color: '#64748b', fontSize: 11 }}>Successful</div>
        </Card>
        <Card padding="sm" style={{ textAlign: 'center' }}>
          <div style={{ color: '#f59e0b', fontSize: isMobile ? 18 : 24, fontWeight: 700 }}>
            {generations.filter((g) => g.status === 'running').length}
          </div>
          <div style={{ color: '#64748b', fontSize: 11 }}>Running</div>
        </Card>
        <Card padding="sm" style={{ textAlign: 'center' }}>
          <div style={{ color: '#ef4444', fontSize: isMobile ? 18 : 24, fontWeight: 700 }}>
            {generations.filter((g) => g.status === 'error').length}
          </div>
          <div style={{ color: '#64748b', fontSize: 11 }}>Errors</div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={TABS}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as GenerationMode)}
      />

      {/* Tab content */}
      <div style={{ marginTop: 20 }}>
        {/* ─── TEXT GENERATION ─────────────────────────────────────────── */}
        {activeTab === 'text' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 16,
          }}>
            {/* Input panel */}
            <Card padding="lg">
              <h3 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                ✦ Text Generation
              </h3>

              <div style={{ marginBottom: 16 }}>
                <TextArea
                  label="Prompt"
                  rows={isMobile ? 4 : 5}
                  value={textPrompt}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTextPrompt(e.target.value)}
                  placeholder="Describe what you want to generate... e.g., 'A cinematic scene of a neon-lit city at night with rain'"
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: 12, marginBottom: 16,
              }}>
                <Select
                  label="Emotion"
                  options={EMOTIONS.map((e) => ({ value: e.value, label: `${e.icon} ${e.label}` }))}
                  value={textEmotion}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTextEmotion(e.target.value)}
                />
                <div>
                  <label style={{ color: '#94a3b8', fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>
                    Intensity: {textIntensity.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={textIntensity}
                    onChange={(e) => setTextIntensity(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#6366f1' }}
                  />
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                loading={textGenerating}
                disabled={!textPrompt.trim() || textGenerating}
                onClick={handleTextGenerate}
                style={{ width: '100%' }}
              >
                {textGenerating ? '◌ Generating...' : '✦ Generate Text'}
              </Button>
            </Card>

            {/* Live preview / latest result */}
            <Card padding="lg">
              <h3 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                AI Creative Director Output
              </h3>
              {generations.filter((g) => g.mode === 'text').length === 0 ? (
                <EmptyState
                  icon="✦"
                  title="No text generations yet"
                  description="Enter a prompt and click Generate to see the AI Creative Director in action."
                />
              ) : (
                <LatestResult job={generations.filter((g) => g.mode === 'text')[0]} isMobile={isMobile} />
              )}
            </Card>
          </div>
        )}

        {/* ─── IMAGE GENERATION ────────────────────────────────────────── */}
        {activeTab === 'image' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 16,
          }}>
            {/* Input panel */}
            <Card padding="lg">
              <h3 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                🖼 Image Generation
              </h3>

              <div style={{ marginBottom: 16 }}>
                <TextArea
                  label="Image Prompt"
                  rows={isMobile ? 4 : 5}
                  value={imagePrompt}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setImagePrompt(e.target.value)}
                  placeholder="Describe the image you want... e.g., 'A futuristic cyberpunk cityscape with neon lights and flying cars'"
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: 12, marginBottom: 16,
              }}>
                <Select
                  label="Emotion"
                  options={EMOTIONS.map((e) => ({ value: e.value, label: `${e.icon} ${e.label}` }))}
                  value={imageEmotion}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setImageEmotion(e.target.value)}
                />
                <div>
                  <label style={{ color: '#94a3b8', fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>
                    Intensity: {imageIntensity.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={imageIntensity}
                    onChange={(e) => setImageIntensity(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#6366f1' }}
                  />
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                loading={imageGenerating}
                disabled={!imagePrompt.trim() || imageGenerating}
                onClick={handleImageGenerate}
                style={{ width: '100%', background: '#ec4899', borderColor: '#ec4899' }}
              >
                {imageGenerating ? '◌ Generating...' : '🖼 Generate Image'}
              </Button>
            </Card>

            {/* Image preview */}
            <Card padding="lg">
              <h3 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                Generated Image
              </h3>
              {generations.filter((g) => g.mode === 'image').length === 0 ? (
                <EmptyState
                  icon="🖼"
                  title="No images generated yet"
                  description="Enter an image prompt and click Generate to create visuals."
                />
              ) : (
                <LatestImageResult job={generations.filter((g) => g.mode === 'image')[0]} isMobile={isMobile} />
              )}
            </Card>
          </div>
        )}

        {/* ─── MULTI-MODAL ─────────────────────────────────────────────── */}
        {activeTab === 'multimodal' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 16,
          }}>
            {/* Input panel */}
            <Card padding="lg">
              <h3 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                ⊞ Multi-Modal Fusion
              </h3>

              <div style={{ marginBottom: 16 }}>
                <TextArea
                  label="Fusion Prompt"
                  rows={3}
                  value={mmPrompt}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMmPrompt(e.target.value)}
                  placeholder="Describe what you want to create from the combined inputs..."
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ color: '#94a3b8', fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 8 }}>
                  Inputs ({mmInputs.length})
                </label>
                {mmInputs.map((input, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex', gap: 8, marginBottom: 8,
                      flexDirection: isMobile ? 'column' : 'row',
                    }}
                  >
                    <select
                      value={input.modality}
                      onChange={(e) => updateMmInput(idx, 'modality', e.target.value)}
                      style={{
                        padding: '8px 10px', background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
                        color: '#f1f5f9', fontSize: 12, minWidth: 100,
                      }}
                    >
                      {MODALITY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} style={{ background: '#12121a' }}>
                          {opt.icon} {opt.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={input.data}
                      onChange={(e) => updateMmInput(idx, 'data', e.target.value)}
                      placeholder={`${input.modality === 'text' ? 'Enter text...' : `${input.modality} URL...`}`}
                      style={{
                        flex: 1, padding: '8px 10px', background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
                        color: '#f1f5f9', fontSize: 12,
                      }}
                    />
                    {mmInputs.length > 1 && (
                      <button
                        onClick={() => removeMmInput(idx)}
                        style={{
                          background: 'transparent', border: 'none', color: '#ef4444',
                          cursor: 'pointer', fontSize: 12, padding: '0 4px',
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addMmInput}
                  style={{
                    background: 'transparent', border: '1px dashed rgba(99,102,241,0.4)',
                    color: '#6366f1', cursor: 'pointer', fontSize: 12,
                    padding: '6px 12px', borderRadius: 6, width: '100%',
                  }}
                >
                  + Add Input
                </button>
              </div>

              <Button
                variant="primary"
                size="lg"
                loading={mmGenerating}
                disabled={!mmPrompt.trim() || mmInputs.some((i) => !i.data.trim()) || mmGenerating}
                onClick={handleMultiModalGenerate}
                style={{ width: '100%', background: '#8b5cf6', borderColor: '#8b5cf6' }}
              >
                {mmGenerating ? '◌ Fusing...' : '⊞ Fuse & Generate'}
              </Button>
            </Card>

            {/* Result */}
            <Card padding="lg">
              <h3 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                Fusion Result
              </h3>
              {generations.filter((g) => g.mode === 'multimodal').length === 0 ? (
                <EmptyState
                  icon="⊞"
                  title="No multi-modal generations yet"
                  description="Add inputs from different modalities and fuse them into a single generation."
                />
              ) : (
                <LatestResult job={generations.filter((g) => g.mode === 'multimodal')[0]} isMobile={isMobile} />
              )}
            </Card>
          </div>
        )}
      </div>

      {/* ─── HISTORY ──────────────────────────────────────────────────────── */}
      <div style={{ marginTop: 32 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16, flexWrap: 'wrap', gap: 8,
        }}>
          <h2 style={{ color: '#f1f5f9', fontSize: isMobile ? 16 : 18, fontWeight: 600, margin: 0 }}>
            Generation History
          </h2>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['all', 'text', 'image', 'multimodal'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setHistoryFilter(f)}
                style={{
                  padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                  background: historyFilter === f ? 'rgba(99,102,241,0.2)' : 'transparent',
                  border: `1px solid ${historyFilter === f ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: historyFilter === f ? '#818cf8' : '#64748b',
                  cursor: 'pointer', textTransform: 'capitalize',
                }}
              >
                {f === 'all' ? 'All' : f === 'multimodal' ? 'Multi-Modal' : f}
              </button>
            ))}
          </div>
        </div>

        {filteredGenerations.length === 0 ? (
          <Card padding="lg">
            <EmptyState
              icon="📋"
              title="No generations yet"
              description="Your generation history will appear here. Start by creating something above!"
            />
          </Card>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3, 1fr)',
            gap: 12,
          }}>
            {filteredGenerations.slice(0, 30).map((job) => (
              <HistoryCard key={job.id} job={job} getStatusBadge={getStatusBadge} getModeIcon={getModeIcon} isMobile={isMobile} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Sub-components ────────────────────────────────────────────────────────── */

const LatestResult: React.FC<{ job: GenerationJob; isMobile: boolean }> = ({ job, isMobile }) => {
  const [expanded, setExpanded] = useState(false);

  if (job.status === 'running') {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>◌</div>
        <div style={{ color: '#f59e0b', fontSize: 14, fontWeight: 500 }}>Generating...</div>
        <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>AI Creative Director is working</div>
      </div>
    );
  }

  if (job.status === 'error') {
    return (
      <div style={{
        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 8, padding: 16,
      }}>
        <div style={{ color: '#ef4444', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Generation Failed</div>
        <div style={{ color: '#94a3b8', fontSize: 12 }}>{job.error || 'Unknown error'}</div>
      </div>
    );
  }

  if (job.status === 'success') {
    const agentData = job.agentAnalysis as Record<string, unknown> | undefined;
    const enhanced = agentData?.enhanced_prompt as string | undefined;
    const emotion = agentData?.emotion as Record<string, unknown> | undefined;
    const multiAgent = agentData?.multi_agent as Record<string, unknown> | undefined;

    return (
      <div>
        {/* Result */}
        <div style={{
          background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
          borderRadius: 8, padding: 16, marginBottom: 12,
        }}>
          <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
            Result
          </div>
          <div style={{ color: '#f1f5f9', fontSize: 13, lineHeight: 1.6 }}>{job.result}</div>
        </div>

        {/* Enhanced prompt */}
        {enhanced && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Enhanced Prompt
            </div>
            <div style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.5 }}>{enhanced}</div>
          </div>
        )}

        {/* Emotion params */}
        {emotion && (
          <div style={{
            display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12,
          }}>
            <Badge variant="info" size="sm">Emotion: {String(emotion.emotion)}</Badge>
            <Badge variant="warning" size="sm">Intensity: {String(emotion.intensity)}</Badge>
          </div>
        )}

        {/* Multi-agent details (collapsible) */}
        {multiAgent && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: 'transparent', border: 'none', color: '#6366f1',
                cursor: 'pointer', fontSize: 12, padding: 0, marginBottom: 8,
              }}
            >
              {expanded ? '▾' : '▸'} Multi-Agent Analysis
            </button>
            {expanded && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(multiAgent).map(([key, val]) => (
                  <div key={key} style={{
                    background: 'rgba(255,255,255,0.03)', borderRadius: 4,
                    padding: '6px 10px', fontSize: 11, color: '#94a3b8',
                  }}>
                    <span style={{ color: '#6366f1', fontWeight: 600 }}>{key}:</span>{' '}
                    {typeof val === 'object' ? JSON.stringify(val).substring(0, 80) : String(val).substring(0, 80)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
};

const LatestImageResult: React.FC<{ job: GenerationJob; isMobile: boolean }> = ({ job, isMobile }) => {
  if (job.status === 'running') {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>◌</div>
        <div style={{ color: '#f59e0b', fontSize: 14, fontWeight: 500 }}>Generating image...</div>
      </div>
    );
  }

  if (job.status === 'error') {
    return (
      <div style={{
        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 8, padding: 16,
      }}>
        <div style={{ color: '#ef4444', fontSize: 14, fontWeight: 500 }}>Generation Failed</div>
        <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>{job.error || 'Unknown error'}</div>
      </div>
    );
  }

  if (job.status === 'success') {
    return (
      <div>
        {job.imageUrl && (
          <div style={{ marginBottom: 12, textAlign: 'center' }}>
            <img
              src={job.imageUrl}
              alt={job.prompt}
              style={{
                maxWidth: '100%', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        <div style={{
          background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.15)',
          borderRadius: 8, padding: 12,
        }}>
          <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
            AI Analysis
          </div>
          <div style={{ color: '#f1f5f9', fontSize: 12, lineHeight: 1.5 }}>{job.result}</div>
        </div>
      </div>
    );
  }

  return null;
};

const HistoryCard: React.FC<{
  job: GenerationJob;
  getStatusBadge: (s: JobStatus) => React.ReactNode;
  getModeIcon: (m: GenerationMode) => string;
  isMobile: boolean;
}> = ({ job, getStatusBadge, getModeIcon, isMobile }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      padding="md"
      hover
      onClick={() => setExpanded(!expanded)}
      style={{ cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>{getModeIcon(job.mode)}</span>
          <span style={{ color: '#f1f5f9', fontSize: 12, fontWeight: 500, textTransform: 'capitalize' }}>
            {job.mode === 'multimodal' ? 'Multi-Modal' : job.mode}
          </span>
        </div>
        {getStatusBadge(job.status)}
      </div>

      <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4, lineHeight: 1.4 }}>
        {job.prompt.substring(0, isMobile ? 60 : 80)}{job.prompt.length > (isMobile ? 60 : 80) ? '...' : ''}
      </div>

      {job.status === 'success' && job.result && expanded && (
        <div style={{
          marginTop: 8, padding: 8, background: 'rgba(255,255,255,0.03)',
          borderRadius: 6, fontSize: 11, color: '#94a3b8', lineHeight: 1.5,
          maxHeight: 120, overflowY: 'auto',
        }}>
          {job.imageUrl && (
            <img src={job.imageUrl} alt="" style={{ maxWidth: '100%', borderRadius: 4, marginBottom: 6 }} />
          )}
          {job.result}
        </div>
      )}

      {job.status === 'error' && expanded && job.error && (
        <div style={{ marginTop: 8, fontSize: 11, color: '#ef4444' }}>
          Error: {job.error}
        </div>
      )}

      <div style={{ color: '#475569', fontSize: 10, marginTop: 6 }}>
        {formatTime(job.createdAt)}
        {job.emotion && ` · ${job.emotion}`}
      </div>
    </Card>
  );
};

export default AIGenerations;
