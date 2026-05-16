import React, { useState, useEffect } from 'react';
import { Card, Button, Input, TextArea, Select, Badge, EmptyState, PageHeader, Skeleton } from '../ui';

interface Scene {
  id: string;
  user_id: string;
  scene_name: string;
  description: string;
  status: string;
  camera_settings: { shot_type: string; angle: string; movement: string; focal_length: number; };
  lighting_rig: { setup_type: string; key_light_intensity: number; };
  color_grade: { lut_preset: string; contrast: number; };
  created_at: string;
}

const statusColors: Record<string, 'success' | 'warning' | 'neutral'> = {
  completed: 'success',
  rendering: 'warning',
  draft: 'neutral',
};

const CinematicAI: React.FC = () => {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState('mock_user_123');
  const [sceneName, setSceneName] = useState('');
  const [description, setDescription] = useState('');
  const [shotType, setShotType] = useState('wide');
  const [lightingSetup, setLightingSetup] = useState('three_point');
  const [colorGrade, setColorGrade] = useState('neutral');

  const fetchScenes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/cinematic-ai/scenes/?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch scenes');
      const data = await response.json();
      setScenes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createScene = async () => {
    if (!sceneName || !description) { alert('Scene name and description are required'); return; }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/cinematic-ai/scenes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, scene_name: sceneName, description, shot_type: shotType, lighting_setup: lightingSetup, color_grade_preset: colorGrade })
      });
      if (!response.ok) throw new Error('Failed to create scene');
      const newScene = await response.json();
      setScenes([newScene, ...scenes]);
      setSceneName('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (sceneId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:5000/cinematic-ai/scenes/${sceneId}/status/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update status');
      fetchScenes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => { fetchScenes(); }, []);

  return (
    <div style={{ maxWidth: 960 }}>
      <PageHeader title="Cinematic AI Director" subtitle="Camera settings, lighting rigs, and color grading" />

      <Card padding="md" style={{ marginBottom: 24 }}>
        <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Create Cinematic Scene</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
          <Input label="Scene Name" value={sceneName} onChange={(e) => setSceneName(e.target.value)} placeholder="e.g., Opening Shot" />
          <TextArea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the scene..." rows={3} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <Select label="Shot Type" value={shotType} onChange={(e) => setShotType(e.target.value)}
              options={[{value:'wide',label:'Wide Shot'},{value:'close',label:'Close-up'},{value:'medium',label:'Medium Shot'},{value:'dutch',label:'Dutch Angle'}]} />
            <Select label="Lighting" value={lightingSetup} onChange={(e) => setLightingSetup(e.target.value)}
              options={[{value:'three_point',label:'Three Point'},{value:'natural',label:'Natural'},{value:'dramatic',label:'Dramatic'},{value:'rim',label:'Rim Light'}]} />
            <Select label="Color Grade" value={colorGrade} onChange={(e) => setColorGrade(e.target.value)}
              options={[{value:'neutral',label:'Neutral'},{value:'teal_orange',label:'Teal & Orange'},{value:'warm',label:'Warm'},{value:'cool',label:'Cool'}]} />
          </div>
        </div>
        <Button onClick={createScene} disabled={loading || !sceneName || !description}>
          {loading ? 'Creating...' : 'Create Scene'}
        </Button>
      </Card>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

      <Card padding="md">
        <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Your Scenes</h2>
        {loading && scenes.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[1,2,3].map(i => <Skeleton key={i} height={100} />)}</div>
        ) : scenes.length === 0 ? (
          <EmptyState icon="🎬" title="No scenes yet" description="Create your first cinematic scene above." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {scenes.map(scene => (
              <div key={scene.id} style={{ background: '#1a1a25', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h3 style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 600 }}>{scene.scene_name}</h3>
                    <p style={{ color: '#64748b', fontSize: 12 }}>{scene.description}</p>
                  </div>
                  <Badge variant={statusColors[scene.status] || 'neutral'} size="sm">{scene.status}</Badge>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, marginBottom: 12, fontSize: 12, color: '#94a3b8' }}>
                  <div><span style={{ color: '#64748b' }}>Camera:</span> {scene.camera_settings.shot_type} shot, {scene.camera_settings.focal_length}mm</div>
                  <div><span style={{ color: '#64748b' }}>Lighting:</span> {scene.lighting_rig.setup_type}</div>
                  <div><span style={{ color: '#64748b' }}>Color:</span> {scene.color_grade.lut_preset}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {scene.status === 'draft' && (
                    <Button variant="secondary" size="sm" onClick={() => updateStatus(scene.id, 'rendering')}>Start Rendering</Button>
                  )}
                  {scene.status === 'rendering' && (
                    <Button variant="primary" size="sm" onClick={() => updateStatus(scene.id, 'completed')}>Mark Complete</Button>
                  )}
                  {scene.status === 'completed' && (
                    <span style={{ color: '#10b981', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>✓ Ready for production</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CinematicAI;
