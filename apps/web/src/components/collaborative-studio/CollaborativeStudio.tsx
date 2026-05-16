import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Input, Select, TextArea, Badge, Spinner } from '../ui';

interface SessionUpdate {
  id: string;
  user_id: string;
  update_type: string;
  element_id: string;
  changes: any;
}

interface CollaborationUser {
  id: string;
  user_id: string;
  role: string;
  active: boolean;
  last_seen: string;
}

interface CollaborativeSession {
  id: string;
  project_id: string;
  session_name: string;
  status: string;
  users: CollaborationUser[];
  updates: SessionUpdate[];
}

const CollaborativeStudio: React.FC = () => {
  const [sessions, setSessions] = useState<CollaborativeSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState('mock_user_123');
  const [sessionId, setSessionId] = useState('');
  const [projectId, setProjectId] = useState('project_001');

  // Session creation
  const [sessionName, setSessionName] = useState('My Collab Session');

  // Join session
  const [joinRole, setJoinRole] = useState('editor');

  // Record update
  const [updateType, setUpdateType] = useState('edit');
  const [elementId, setElementId] = useState('');
  const [changes, setChanges] = useState('{}');

  const fetchSession = async (sessId: string) => {
    if (!sessId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/collaborative-studio/sessions/${sessId}/`);
      if (!response.ok) throw new Error('Failed to fetch session');
      const data = await response.json();
      setSessions([data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    if (!sessionName || !projectId) {
      alert('Session name and project ID are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/collaborative-studio/sessions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          session_name: sessionName
        })
      });
      if (!response.ok) throw new Error('Failed to create session');
      const newSession = await response.json();
      setSessions([newSession]);
      setSessionId(newSession.id);
      setSessionName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const joinSession = async () => {
    if (!sessionId || !userId) {
      alert('Session ID and user ID are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/collaborative-studio/sessions/join/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: userId,
          role: joinRole
        })
      });
      if (!response.ok) throw new Error('Failed to join session');
      alert('Joined session!');
      fetchSession(sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const recordUpdate = async () => {
    if (!sessionId || !userId) {
      alert('Session ID and user ID are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let changesObj = {};
      try {
        changesObj = JSON.parse(changes);
      } catch {
        alert('Invalid JSON in changes field');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/collaborative-studio/updates/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: userId,
          update_type: updateType,
          element_id: elementId || null,
          changes: changesObj
        })
      });
      if (!response.ok) throw new Error('Failed to record update');
      alert('Update recorded!');
      setElementId('');
      setChanges('{}');
      fetchSession(sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const selectOptions = (opts: { value: string; label: string }[]) =>
    opts.map((o) => ({ value: o.value, label: o.label }));

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link
          to="/"
          style={{
            color: '#6366f1',
            fontSize: 13,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            marginBottom: 8,
          }}
        >
          ← Back to Home
        </Link>
        <h1 style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 700, margin: 0 }}>
          Real-Time Collaborative AI Studio
        </h1>
      </div>

      {/* Three-column action cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Create Session */}
        <Card padding="md">
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            Create Session
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="Project ID..."
            />
            <Input
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Session name..."
            />
            <Button
              variant="primary"
              loading={loading}
              disabled={!sessionName || !projectId}
              onClick={createSession}
            >
              Create Session
            </Button>
          </div>
        </Card>

        {/* Join Session */}
        <Card padding="md">
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            Join Session
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Session ID..."
            />
            <Select
              value={joinRole}
              onChange={(e) => setJoinRole(e.target.value)}
              options={selectOptions([
                { value: 'viewer', label: 'Viewer' },
                { value: 'editor', label: 'Editor' },
                { value: 'admin', label: 'Admin' },
              ])}
            />
            <Button
              variant="primary"
              loading={loading}
              disabled={!sessionId}
              onClick={joinSession}
              style={{ background: '#10b981', border: '1px solid #10b981' }}
            >
              Join Session
            </Button>
          </div>
        </Card>

        {/* Record Update */}
        <Card padding="md">
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            Record Update
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Select
              value={updateType}
              onChange={(e) => setUpdateType(e.target.value)}
              options={selectOptions([
                { value: 'edit', label: 'Edit' },
                { value: 'cursor_move', label: 'Cursor Move' },
                { value: 'chat', label: 'Chat' },
                { value: 'delete', label: 'Delete' },
              ])}
            />
            <Input
              value={elementId}
              onChange={(e) => setElementId(e.target.value)}
              placeholder="Element ID (optional)..."
            />
            <TextArea
              rows={2}
              value={changes}
              onChange={(e) => setChanges(e.target.value)}
              placeholder='Changes (JSON): {"prop": "value"}...'
            />
            <Button
              variant="primary"
              loading={loading}
              disabled={!sessionId}
              onClick={recordUpdate}
              style={{ background: '#8b5cf6', border: '1px solid #8b5cf6' }}
            >
              Record Update
            </Button>
          </div>
        </Card>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.3)',
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

      {/* Session State */}
      <Card padding="lg">
        <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
          Session State
        </h2>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 0' }}>
            <Spinner size={20} />
            <span style={{ color: '#94a3b8', fontSize: 13 }}>Loading sessions...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ color: '#64748b', fontSize: 14 }}>No sessions yet. Create one above!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {sessions.map((session) => (
              <div
                key={session.id}
                style={{
                  background: '#1a1a25',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <h3 style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600, margin: 0 }}>
                      {session.session_name}
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: 12, margin: '4px 0 0 0' }}>
                      Project: {session.project_id}
                    </p>
                    <p style={{ color: '#64748b', fontSize: 11, margin: '2px 0 0 0' }}>
                      Session ID: {session.id}
                    </p>
                  </div>
                  <Badge variant={session.status === 'active' ? 'success' : 'neutral'}>
                    {session.status}
                  </Badge>
                </div>

                {/* Users */}
                {session.users && session.users.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8, marginTop: 8 }}>
                    <h4 style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, margin: '0 0 6px 0' }}>
                      Users ({session.users.length})
                    </h4>
                    {session.users.map((user, idx) => (
                      <div key={idx} style={{ color: '#94a3b8', fontSize: 11, marginBottom: 2 }}>
                        <span style={{ fontWeight: 600 }}>{user.user_id}</span> — {user.role}
                        {user.active && (
                          <span style={{ color: '#10b981', marginLeft: 4 }}>●</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Updates */}
                {session.updates && session.updates.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8, marginTop: 8 }}>
                    <h4 style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, margin: '0 0 6px 0' }}>
                      Updates ({session.updates.length})
                    </h4>
                    {session.updates.map((update, idx) => (
                      <div key={idx} style={{ color: '#94a3b8', fontSize: 11, marginBottom: 2 }}>
                        <span style={{ fontWeight: 600 }}>{update.update_type}:</span>{' '}
                        {update.element_id || 'N/A'}
                        {update.changes && Object.keys(update.changes).length > 0 && (
                          <span style={{ color: '#64748b', marginLeft: 4 }}>
                            — {JSON.stringify(update.changes).substring(0, 30)}...
                          </span>
                        )}
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

export default CollaborativeStudio;
