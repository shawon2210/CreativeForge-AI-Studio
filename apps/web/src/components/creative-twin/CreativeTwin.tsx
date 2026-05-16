import React, { useState } from 'react';
import { Card, Button, Input, TextArea, Select, Badge, EmptyState, PageHeader, Skeleton } from '../ui';

interface TwinLearning { id: string; learning_type: string; learning_data: any; confidence: number; applied: boolean; }
interface TwinSuggestion { id: string; suggestion_type: string; suggestion_text: string; relevance_score: number; accepted: boolean; }
interface CreativeTwin { id: string; user_id: string; twin_name: string; personality_profile: any; skill_level: string; specialization: string; learnings: TwinLearning[]; suggestions: TwinSuggestion[]; }

const skillColors: Record<string, 'info' | 'success' | 'warning'> = { advanced: 'info', intermediate: 'success', beginner: 'warning' };

const CreativeTwin: React.FC = () => {
  const [twins, setTwins] = useState<CreativeTwin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState('mock_user_123');
  const [twinId, setTwinId] = useState('');
  const [twinName, setTwinName] = useState('My Creative Twin');
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [specialization, setSpecialization] = useState('cinematic');
  const [learningType, setLearningType] = useState('style_preference');
  const [learningData, setLearningData] = useState('{"style": "neon", "preference": "high_contrast"}');
  const [suggestionType, setSuggestionType] = useState('style_suggestion');
  const [suggestionText, setSuggestionText] = useState('');

  const fetchTwin = async (twId: string) => {
    if (!twId) return;
    setLoading(true); setError(null);
    try {
      const response = await fetch(`http://localhost:5000/creative-twin/twins/${twId}/`);
      if (!response.ok) throw new Error('Failed to fetch twin');
      setTwins([await response.json()]);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unknown error'); }
    finally { setLoading(false); }
  };

  const createTwin = async () => {
    if (!twinName) { alert('Twin name is required'); return; }
    setLoading(true); setError(null);
    try {
      const response = await fetch('http://localhost:5000/creative-twin/twins/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, twin_name: twinName, personality_profile: {}, skill_level: skillLevel, specialization })
      });
      if (!response.ok) throw new Error('Failed to create twin');
      const newTwin = await response.json();
      setTwins([newTwin]); setTwinId(newTwin.id); setTwinName('');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unknown error'); }
    finally { setLoading(false); }
  };

  const recordLearning = async () => {
    if (!twinId) { alert('Twin ID is required'); return; }
    try { JSON.parse(learningData); } catch { alert('Invalid JSON in learning data'); return; }
    setLoading(true); setError(null);
    try {
      const response = await fetch('http://localhost:5000/creative-twin/learnings/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twin_id: twinId, learning_type: learningType, learning_data: JSON.parse(learningData), confidence: 0.85 })
      });
      if (!response.ok) throw new Error('Failed to record learning');
      fetchTwin(twinId);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unknown error'); }
    finally { setLoading(false); }
  };

  const generateSuggestion = async () => {
    if (!twinId || !suggestionText) { alert('Twin ID and suggestion text are required'); return; }
    setLoading(true); setError(null);
    try {
      const response = await fetch('http://localhost:5000/creative-twin/suggestions/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twin_id: twinId, suggestion_type: suggestionType, suggestion_text: suggestionText, relevance_score: 0.9 })
      });
      if (!response.ok) throw new Error('Failed to generate suggestion');
      setSuggestionText(''); fetchTwin(twinId);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unknown error'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 960 }}>
      <PageHeader title="AI Creative Twin" subtitle="Your personal AI assistant that learns your style" badge={{ text: 'New', variant: 'new' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        <Card padding="md">
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Create Twin</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Twin Name" value={twinName} onChange={(e) => setTwinName(e.target.value)} placeholder="Twin name..." />
            <Select label="Skill Level" value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}
              options={[{value:'beginner',label:'Beginner'},{value:'intermediate',label:'Intermediate'},{value:'advanced',label:'Advanced'}]} />
            <Input label="Specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g., cinematic" />
            <Button onClick={createTwin} disabled={loading || !twinName}>Create Twin</Button>
          </div>
        </Card>

        <Card padding="md">
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Record Learning</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Twin ID" value={twinId} onChange={(e) => setTwinId(e.target.value)} placeholder="Twin ID..." />
            <Select label="Learning Type" value={learningType} onChange={(e) => setLearningType(e.target.value)}
              options={[{value:'style_preference',label:'Style Preference'},{value:'workflow_pattern',label:'Workflow Pattern'},{value:'tool_usage',label:'Tool Usage'}]} />
            <TextArea label="Learning Data (JSON)" value={learningData} onChange={(e) => setLearningData(e.target.value)} rows={3} placeholder='{"style": "neon"}' />
            <Button variant="secondary" onClick={recordLearning} disabled={loading || !twinId}>Record Learning</Button>
          </div>
        </Card>

        <Card padding="md">
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Generate Suggestion</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Select label="Suggestion Type" value={suggestionType} onChange={(e) => setSuggestionType(e.target.value)}
              options={[{value:'style_suggestion',label:'Style Suggestion'},{value:'tool_recommendation',label:'Tool Recommendation'},{value:'workflow_optimization',label:'Workflow Optimization'}]} />
            <TextArea label="Suggestion Text" value={suggestionText} onChange={(e) => setSuggestionText(e.target.value)} rows={3} placeholder="Suggestion text..." />
            <Button variant="ghost" onClick={generateSuggestion} disabled={loading || !twinId || !suggestionText}>Generate Suggestion</Button>
          </div>
        </Card>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

      <Card padding="md">
        <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Twin Profile</h2>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[1,2].map(i => <Skeleton key={i} height={120} />)}</div>
        ) : twins.length === 0 ? (
          <EmptyState icon="🤖" title="No twins yet" description="Create your first AI Creative Twin above." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {twins.map(twin => (
              <div key={twin.id} style={{ background: '#1a1a25', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h3 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600 }}>{twin.twin_name}</h3>
                    <p style={{ color: '#64748b', fontSize: 12 }}>Specialization: {twin.specialization}</p>
                    <p style={{ color: '#475569', fontSize: 11 }}>ID: {twin.id}</p>
                  </div>
                  <Badge variant={skillColors[twin.skill_level] || 'neutral'} size="sm">{twin.skill_level}</Badge>
                </div>
                {twin.learnings && twin.learnings.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8, marginTop: 8 }}>
                    <h4 style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Learnings ({twin.learnings.length})</h4>
                    {twin.learnings.map((l, idx) => (
                      <div key={idx} style={{ color: '#64748b', fontSize: 11, marginBottom: 2 }}>
                        <span style={{ color: '#94a3b8' }}>{l.learning_type}:</span> {JSON.stringify(l.learning_data).substring(0, 40)}...
                        {l.applied && <span style={{ color: '#10b981', marginLeft: 4 }}>✓</span>}
                      </div>
                    ))}
                  </div>
                )}
                {twin.suggestions && twin.suggestions.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8, marginTop: 8 }}>
                    <h4 style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Suggestions ({twin.suggestions.length})</h4>
                    {twin.suggestions.map((s, idx) => (
                      <div key={idx} style={{ color: '#64748b', fontSize: 11, marginBottom: 2 }}>
                        <span style={{ color: '#94a3b8' }}>{s.suggestion_type}:</span> {s.suggestion_text.substring(0, 50)}...
                        {s.accepted && <span style={{ color: '#10b981', marginLeft: 4 }}>✓</span>}
                      </div>
                    ))}
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

export default CreativeTwin;
