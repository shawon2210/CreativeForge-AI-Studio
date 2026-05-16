import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface VersionRecord {
  id: string;
  version_number: string;
  version_type: string;
  is_current: boolean;
}

interface TimelineEvent {
  id: string;
  user_id: string;
  project_id: string;
  event_type: string;
  event_name: string;
  description: string;
  version_records: VersionRecord[];
}

const TimelineVersioning: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState('mock_user_123');
  const [projectId, setProjectId] = useState('project_001');

  // Event creation
  const [eventType, setEventType] = useState('creation');
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');

  // Filters
  const [filterType, setFilterType] = useState('');

  // Version creation
  const [versionNumber, setVersionNumber] = useState('');
  const [versionType, setVersionType] = useState('minor');

  const fetchTimeline = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `http://localhost:5000/timeline/events/?project_id=${projectId}${filterType ? `&event_type=${filterType}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch timeline');
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    if (!eventName || !projectId) {
      alert('Event name and project ID are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/timeline/events/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          project_id: projectId,
          event_type: eventType,
          event_name: eventName,
          description
        })
      });
      if (!response.ok) throw new Error('Failed to create event');
      const newEvent = await response.json();
      setEvents([newEvent, ...events]);
      setEventName('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createVersion = async (eventId: string) => {
    if (!versionNumber) {
      alert('Version number is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/timeline/versions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeline_event_id: eventId,
          version_number: versionNumber,
          version_type: versionType
        })
      });
      if (!response.ok) throw new Error('Failed to create version');
      alert('Version created!');
      setVersionNumber('');
      fetchTimeline(); // Refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchTimeline();
  }, [projectId]);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
  };

  const getEventTypeStyle = (type: string): React.CSSProperties => {
    switch (type) {
      case 'creation':
        return { background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' };
      case 'edit':
        return { background: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.25)' };
      case 'delete':
        return { background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' };
      default:
        return { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' };
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1152, margin: '0 auto' }}>
      <h1 style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        AI Timeline & Versioning
      </h1>
      <Link
        to="/"
        style={{ color: '#6366f1', fontSize: 13, textDecoration: 'none', display: 'block', marginBottom: 24 }}
      >
        ← Back to Home
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {/* Create Event */}
        <div style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Create Event</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="text"
              style={inputStyle}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="Project ID..."
            />
            <select
              style={selectStyle}
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            >
              <option value="creation" style={{ background: '#12121a', color: '#f1f5f9' }}>Creation</option>
              <option value="edit" style={{ background: '#12121a', color: '#f1f5f9' }}>Edit</option>
              <option value="delete" style={{ background: '#12121a', color: '#f1f5f9' }}>Delete</option>
              <option value="restore" style={{ background: '#12121a', color: '#f1f5f9' }}>Restore</option>
              <option value="branch" style={{ background: '#12121a', color: '#f1f5f9' }}>Branch</option>
            </select>
            <input
              type="text"
              style={inputStyle}
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Event name..."
            />
            <textarea
              style={{ ...inputStyle, resize: 'vertical' }}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description..."
            />
            <button
              style={{
                width: '100%',
                padding: '10px 16px',
                background: loading || !eventName ? 'rgba(99,102,241,0.3)' : '#6366f1',
                color: '#ffffff',
                border: '1px solid #6366f1',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: loading || !eventName ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
              onClick={createEvent}
              disabled={loading || !eventName}
            >
              Create Event
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Filters</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <select
              style={selectStyle}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="" style={{ background: '#12121a', color: '#f1f5f9' }}>All Types</option>
              <option value="creation" style={{ background: '#12121a', color: '#f1f5f9' }}>Creation</option>
              <option value="edit" style={{ background: '#12121a', color: '#f1f5f9' }}>Edit</option>
              <option value="delete" style={{ background: '#12121a', color: '#f1f5f9' }}>Delete</option>
              <option value="restore" style={{ background: '#12121a', color: '#f1f5f9' }}>Restore</option>
            </select>
            <button
              style={{
                width: '100%',
                padding: '10px 16px',
                background: '#10b981',
                color: '#ffffff',
                border: '1px solid #10b981',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
              onClick={fetchTimeline}
            >
              Apply Filter
            </button>
          </div>
        </div>

        {/* Quick Version */}
        <div style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Quick Version</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="text"
              style={inputStyle}
              value={versionNumber}
              onChange={(e) => setVersionNumber(e.target.value)}
              placeholder="e.g., 1.0.0..."
            />
            <select
              style={selectStyle}
              value={versionType}
              onChange={(e) => setVersionType(e.target.value)}
            >
              <option value="major" style={{ background: '#12121a', color: '#f1f5f9' }}>Major</option>
              <option value="minor" style={{ background: '#12121a', color: '#f1f5f9' }}>Minor</option>
              <option value="patch" style={{ background: '#12121a', color: '#f1f5f9' }}>Patch</option>
            </select>
            <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Click "Add Version" on any event below</p>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.12)',
          border: '1px solid rgba(239,68,68,0.3)',
          color: '#ef4444',
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {/* Timeline Events */}
      <div style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
        <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
          Timeline Events ({events.length})
        </h2>
        {loading && events.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: 13 }}>Loading timeline...</p>
        ) : events.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: 13 }}>No events yet. Create one above!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {events.map(event => (
              <div key={event.id} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <h3 style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600, margin: 0 }}>{event.event_name}</h3>
                    <p style={{ color: '#94a3b8', fontSize: 13, margin: '4px 0' }}>{event.description}</p>
                    <p style={{ color: '#64748b', fontSize: 11, margin: 0 }}>Project: {event.project_id}</p>
                  </div>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    ...getEventTypeStyle(event.event_type),
                  }}>
                    {event.event_type}
                  </span>
                </div>

                {/* Version History */}
                {event.version_records && event.version_records.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8, marginTop: 8 }}>
                    <h4 style={{ color: '#f1f5f9', fontSize: 12, fontWeight: 600, margin: '0 0 6px 0' }}>
                      Versions ({event.version_records.length})
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {event.version_records.map((ver, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: ver.is_current ? 700 : 400,
                            background: ver.is_current ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.05)',
                            color: ver.is_current ? '#f59e0b' : '#94a3b8',
                            border: ver.is_current ? '1px solid rgba(245,158,11,0.25)' : '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          v{ver.version_number} ({ver.version_type})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Version */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8, marginTop: 8 }}>
                  <button
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: !versionNumber ? '#475569' : '#6366f1',
                      cursor: !versionNumber ? 'not-allowed' : 'pointer',
                      fontSize: 13,
                      padding: 0,
                      fontFamily: 'inherit',
                    }}
                    onClick={() => createVersion(event.id)}
                    disabled={!versionNumber}
                  >
                    Add Version (set version above)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineVersioning;
