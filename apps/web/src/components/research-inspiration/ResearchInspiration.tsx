import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Input, TextArea, Select, Badge } from '../ui';

interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  url: string;
  citation_count: number;
  relevance_score: number;
  read: boolean;
}

interface ResearchTopic {
  id: string;
  user_id: string;
  topic_name: string;
  description: string;
  keywords: string[];
  papers: ResearchPaper[];
}

interface InspirationSource {
  id: string;
  user_id: string;
  source_type: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  rating: number;
}

const selectStyle: React.CSSProperties = {
  padding: '10px 12px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#f1f5f9',
  fontSize: 13,
  fontFamily: 'inherit',
  outline: 'none',
  cursor: 'pointer',
  width: '100%',
};

const ResearchInspiration: React.FC = () => {
  const [topics, setTopics] = useState<ResearchTopic[]>([]);
  const [inspirations, setInspirations] = useState<InspirationSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState('mock_user_123');
  const [topicId, setTopicId] = useState('');

  // Topic creation
  const [topicName, setTopicName] = useState('Cinematic Lighting Techniques');
  const [topicDesc, setTopicDesc] = useState('');
  const [keywords, setKeywords] = useState('lighting, cinematography, color grading');

  // Paper addition
  const [paperTitle, setPaperTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [paperUrl, setPaperUrl] = useState('');

  // Inspiration creation
  const [sourceType, setSourceType] = useState('image');
  const [inspTitle, setInspTitle] = useState('');
  const [inspDesc, setInspDesc] = useState('');
  const [inspUrl, setInspUrl] = useState('');
  const [tags, setTags] = useState('');

  const fetchTopic = async (tpId: string) => {
    if (!tpId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/research/topics/${tpId}/`);
      if (!response.ok) throw new Error('Failed to fetch topic');
      const data = await response.json();
      setTopics([data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchInspirations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/research/inspirations/?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch inspirations');
      const data = await response.json();
      setInspirations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createTopic = async () => {
    if (!topicName) {
      alert('Topic name is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/research/topics/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          topic_name: topicName,
          description: topicDesc,
          keywords: keywords.split(',').map(k => k.trim()).filter(k => k)
        })
      });
      if (!response.ok) throw new Error('Failed to create topic');
      const newTopic = await response.json();
      setTopics([newTopic]);
      setTopicId(newTopic.id);
      setTopicName('');
      setTopicDesc('');
      setKeywords('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const addPaper = async () => {
    if (!topicId || !paperTitle) {
      alert('Topic ID and paper title are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/research/papers/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_id: topicId,
          title: paperTitle,
          authors: authors.split(',').map(a => a.trim()).filter(a => a),
          url: paperUrl
        })
      });
      if (!response.ok) throw new Error('Failed to add paper');
      alert('Paper added!');
      setPaperTitle('');
      setAuthors('');
      setPaperUrl('');
      fetchTopic(topicId); // Refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createInspiration = async () => {
    if (!inspTitle || !sourceType) {
      alert('Title and source type are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/research/inspirations/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          source_type: sourceType,
          title: inspTitle,
          description: inspDesc,
          url: inspUrl,
          tags: tags.split(',').map(t => t.trim()).filter(t => t)
        })
      });
      if (!response.ok) throw new Error('Failed to create inspiration');
      alert('Inspiration source created!');
      setInspTitle('');
      setInspDesc('');
      setInspUrl('');
      setTags('');
      fetchInspirations(); // Refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspirations();
  }, []);

  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        AI Research & Inspiration Engine
      </h1>
      <Link
        to="/"
        style={{ color: '#6366f1', fontSize: 13, textDecoration: 'none', display: 'block', marginBottom: 24 }}
      >
        ← Back to Home
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {/* Create Topic */}
        <Card padding="md">
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            Create Research Topic
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Input
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              placeholder="Topic name..."
            />
            <TextArea
              rows={2}
              value={topicDesc}
              onChange={(e) => setTopicDesc(e.target.value)}
              placeholder="Description..."
            />
            <Input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Keywords (comma-separated)..."
            />
            <Button
              variant="primary"
              onClick={createTopic}
              disabled={loading || !topicName}
              style={{ width: '100%' }}
            >
              Create Topic
            </Button>
          </div>
        </Card>

        {/* Add Paper */}
        <Card padding="md">
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            Add Research Paper
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Input
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              placeholder="Topic ID..."
            />
            <Input
              value={paperTitle}
              onChange={(e) => setPaperTitle(e.target.value)}
              placeholder="Paper title..."
            />
            <Input
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              placeholder="Authors (comma-separated)..."
            />
            <Input
              value={paperUrl}
              onChange={(e) => setPaperUrl(e.target.value)}
              placeholder="URL (optional)..."
            />
            <Button
              variant="primary"
              onClick={addPaper}
              disabled={loading || !topicId || !paperTitle}
              style={{ width: '100%', background: '#10b981', borderColor: '#10b981' }}
            >
              Add Paper
            </Button>
          </div>
        </Card>

        {/* Create Inspiration */}
        <Card padding="md">
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            Create Inspiration Source
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <select
              style={selectStyle}
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
            >
              <option value="image" style={{ background: '#12121a', color: '#f1f5f9' }}>Image</option>
              <option value="video" style={{ background: '#12121a', color: '#f1f5f9' }}>Video</option>
              <option value="article" style={{ background: '#12121a', color: '#f1f5f9' }}>Article</option>
              <option value="quote" style={{ background: '#12121a', color: '#f1f5f9' }}>Quote</option>
            </select>
            <Input
              value={inspTitle}
              onChange={(e) => setInspTitle(e.target.value)}
              placeholder="Title..."
            />
            <TextArea
              rows={2}
              value={inspDesc}
              onChange={(e) => setInspDesc(e.target.value)}
              placeholder="Description..."
            />
            <Input
              value={inspUrl}
              onChange={(e) => setInspUrl(e.target.value)}
              placeholder="URL (optional)..."
            />
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tags (comma-separated)..."
            />
            <Button
              variant="primary"
              onClick={createInspiration}
              disabled={loading || !inspTitle}
              style={{ width: '100%', background: '#8b5cf6', borderColor: '#8b5cf6' }}
            >
              Create Inspiration
            </Button>
          </div>
        </Card>
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#ef4444',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* Research Topics */}
      <Card padding="lg" style={{ marginBottom: 24 }}>
        <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
          Research Topics
        </h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => topicId && fetchTopic(topicId)}
          style={{ marginBottom: 16 }}
        >
          Refresh Topic
        </Button>
        {loading && topics.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Loading topics...</p>
        ) : topics.length === 0 ? (
          <p style={{ color: '#64748b' }}>No topics yet. Create one above!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topics.map(topic => (
              <div
                key={topic.id}
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                <h3 style={{ color: '#f1f5f9', fontWeight: 500, fontSize: 14 }}>{topic.topic_name}</h3>
                <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>{topic.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {topic.keywords?.map((kw, idx) => (
                    <Badge key={idx} variant="info">{kw}</Badge>
                  ))}
                </div>

                {/* Papers */}
                {topic.papers && topic.papers.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8, marginTop: 8 }}>
                    <h4 style={{ color: '#94a3b8', fontSize: 12, fontWeight: 500, marginBottom: 4 }}>
                      Papers ({topic.papers.length})
                    </h4>
                    {topic.papers.map((paper, idx) => (
                      <div key={idx} style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>
                        <span style={{ color: '#94a3b8', fontWeight: 500 }}>{paper.title}</span>
                        {paper.read && (
                          <span style={{ color: '#10b981', marginLeft: 4 }}>✓</span>
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

      {/* Inspiration Sources */}
      <Card padding="lg">
        <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
          Inspiration Sources ({inspirations.length})
        </h2>
        {loading && inspirations.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Loading inspirations...</p>
        ) : inspirations.length === 0 ? (
          <p style={{ color: '#64748b' }}>No inspirations yet. Create one above!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {inspirations.map(source => (
              <div
                key={source.id}
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <h3 style={{ color: '#f1f5f9', fontWeight: 500, fontSize: 14 }}>{source.title}</h3>
                    <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>{source.description}</p>
                  </div>
                  <Badge variant="new">{source.source_type}</Badge>
                </div>
                {source.tags && source.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {source.tags.map((tag, idx) => (
                      <Badge key={idx} variant="neutral">{tag}</Badge>
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

export default ResearchInspiration;
