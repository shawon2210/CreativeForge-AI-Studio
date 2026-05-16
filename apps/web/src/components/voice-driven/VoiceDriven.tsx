import React, { useState } from 'react';
import { Card, Button, Input, TextArea, Select, Badge, EmptyState, PageHeader, Skeleton } from '../ui';

interface VoiceCommand { id: string; command_text: string; command_type: string; confidence_score: number; executed: boolean; result: string; }
interface VoiceTranscript { id: string; transcript_text: string; language: string; duration_seconds: number; }
interface VoiceSession { id: string; user_id: string; session_name: string; status: string; commands: VoiceCommand[]; transcripts: VoiceTranscript[]; }

const VoiceDriven: React.FC = () => {
  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState('mock_user_123');
  const [sessionId, setSessionId] = useState('');
  const [sessionName, setSessionName] = useState('My Voice Session');
  const [commandText, setCommandText] = useState('');
  const [confidenceScore, setConfidenceScore] = useState('1.0');
  const [transcriptText, setTranscriptText] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [duration, setDuration] = useState('0');

  const fetchSession = async (sessId: string) => {
    if (!sessId) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`http://localhost:5000/voice-driven/sessions/${sessId}/`);
      if (!res.ok) throw new Error('Failed to fetch session');
      setSessions([await res.json()]);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unknown error'); }
    finally { setLoading(false); }
  };

  const createSession = async () => {
    if (!sessionName) { alert('Session name is required'); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch('http://localhost:5000/voice-driven/sessions/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, session_name: sessionName })
      });
      if (!res.ok) throw new Error('Failed to create session');
      const newSess = await res.json();
      setSessions([newSess]); setSessionId(newSess.id); setSessionName('');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unknown error'); }
    finally { setLoading(false); }
  };

  const processCommand = async () => {
    if (!sessionId || !commandText) { alert('Session ID and command text are required'); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch('http://localhost:5000/voice-driven/commands/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, user_id: userId, command_text: commandText, confidence_score: parseFloat(confidenceScore) || 1.0 })
      });
      if (!res.ok) throw new Error('Failed to process command');
      setCommandText(''); fetchSession(sessionId);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unknown error'); }
    finally { setLoading(false); }
  };

  const createTranscript = async () => {
    if (!sessionId || !transcriptText) { alert('Session ID and transcript text are required'); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch('http://localhost:5000/voice-driven/transcripts/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, transcript_text: transcriptText, language, duration_seconds: parseFloat(duration) || 0.0 })
      });
      if (!res.ok) throw new Error('Failed to create transcript');
      setTranscriptText(''); fetchSession(sessionId);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unknown error'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 960 }}>
      <PageHeader title="Voice Creation" subtitle="Voice-driven AI commands with session tracking" badge={{ text: 'Beta', variant: 'beta' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        <Card padding="md">
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Create Session</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Session Name" value={sessionName} onChange={(e) => setSessionName(e.target.value)} placeholder="Session name..." />
            <Button onClick={createSession} disabled={loading || !sessionName}>Create Session</Button>
          </div>
        </Card>

        <Card padding="md">
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Process Command</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Session ID" value={sessionId} onChange={(e) => setSessionId(e.target.value)} placeholder="Session ID..." />
            <Input label="Command Text" value={commandText} onChange={(e) => setCommandText(e.target.value)} placeholder="e.g., 'Create a new scene'..." />
            <Input label="Confidence Score" type="number" value={confidenceScore} onChange={(e) => setConfidenceScore(e.target.value)} placeholder="0-1" min="0" max="1" step="0.1" />
            <Button variant="secondary" onClick={processCommand} disabled={loading || !sessionId || !commandText}>Process Command</Button>
          </div>
        </Card>

        <Card padding="md">
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Create Transcript</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <TextArea label="Transcript Text" value={transcriptText} onChange={(e) => setTranscriptText(e.target.value)} rows={3} placeholder="Transcript text..." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Input label="Language" value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="en-US" />
              <Input label="Duration (s)" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="0" step="0.1" />
            </div>
            <Button variant="ghost" onClick={createTranscript} disabled={loading || !sessionId || !transcriptText}>Create Transcript</Button>
          </div>
        </Card>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

      <Card padding="md">
        <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Session History</h2>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[1,2].map(i => <Skeleton key={i} height={100} />)}</div>
        ) : sessions.length === 0 ? (
          <EmptyState icon="🎙" title="No sessions yet" description="Create your first voice session above." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sessions.map(session => (
              <div key={session.id} style={{ background: '#1a1a25', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h3 style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 600 }}>{session.session_name}</h3>
                    <p style={{ color: '#475569', fontSize: 11 }}>ID: {session.id}</p>
                  </div>
                  <Badge variant={session.status === 'active' ? 'success' : 'neutral'} size="sm">{session.status}</Badge>
                </div>
                {session.commands && session.commands.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8, marginTop: 8 }}>
                    <h4 style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Commands ({session.commands.length})</h4>
                    {session.commands.map((cmd, idx) => (
                      <div key={idx} style={{ color: '#64748b', fontSize: 11, marginBottom: 2 }}>
                        <span style={{ color: '#94a3b8' }}>{cmd.command_type}:</span> {cmd.command_text}
                        {cmd.executed && <span style={{ color: '#10b981', marginLeft: 4 }}>✓</span>}
                      </div>
                    ))}
                  </div>
                )}
                {session.transcripts && session.transcripts.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8, marginTop: 8 }}>
                    <h4 style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Transcripts ({session.transcripts.length})</h4>
                    {session.transcripts.map((t, idx) => (
                      <div key={idx} style={{ color: '#64748b', fontSize: 11, marginBottom: 2 }}>
                        <span style={{ color: '#94a3b8' }}>{t.language}:</span> {t.transcript_text.substring(0, 50)}...
                        {t.duration_seconds > 0 && <span style={{ color: '#475569', marginLeft: 4 }}>({t.duration_seconds}s)</span>}
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

export default VoiceDriven;
