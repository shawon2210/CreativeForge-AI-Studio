import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Input, Select, Badge } from '../ui';

interface Entity {
  id: string;
  user_id: string;
  entity_name: string;
  entity_type: string;
  description: string;
  properties: Record<string, any>;
  created_at: string;
}

interface Relation {
  id: string;
  source_entity_id: string;
  target_entity_id: string;
  relation_type: string;
  weight: number;
}

interface Graph {
  id: string;
  user_id: string;
  graph_name: string;
  description: string;
  entities: Entity[];
}

const KnowledgeGraph: React.FC = () => {
  const [graphs, setGraphs] = useState<Graph[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState('mock_user_123');
  
  // Entity creation
  const [entityName, setEntityName] = useState('');
  const [entityType, setEntityType] = useState('concept');
  const [entityDesc, setEntityDesc] = useState('');
  
  // Relation creation
  const [sourceEntity, setSourceEntity] = useState('');
  const [targetEntity, setTargetEntity] = useState('');
  const [relationType, setRelationType] = useState('related_to');
  
  // Graph creation
  const [graphName, setGraphName] = useState('');
  const [graphDesc, setGraphDesc] = useState('');

  const fetchGraphs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/knowledge-graph/graphs/?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch graphs');
      const data = await response.json();
      setGraphs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createEntity = async () => {
    if (!entityName || !entityType) {
      alert('Entity name and type are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/knowledge-graph/entities/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          entity_name: entityName,
          entity_type: entityType,
          description: entityDesc,
          properties: {}
        })
      });
      if (!response.ok) throw new Error('Failed to create entity');
      const newEntity = await response.json();
      setEntities([newEntity, ...entities]);
      setEntityName('');
      setEntityDesc('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createRelation = async () => {
    if (!sourceEntity || !targetEntity || !relationType) {
      alert('Source, target, and relation type are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/knowledge-graph/relations/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_entity_id: sourceEntity,
          target_entity_id: targetEntity,
          relation_type: relationType,
          weight: 1.0
        })
      });
      if (!response.ok) throw new Error('Failed to create relation');
      const newRelation = await response.json();
      setRelations([newRelation, ...relations]);
      setSourceEntity('');
      setTargetEntity('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createGraph = async () => {
    if (!graphName) {
      alert('Graph name is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/knowledge-graph/graphs/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          graph_name: graphName,
          description: graphDesc
        })
      });
      if (!response.ok) throw new Error('Failed to create graph');
      const newGraph = await response.json();
      setGraphs([newGraph, ...graphs]);
      setGraphName('');
      setGraphDesc('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphs();
  }, []);

  const entityTypeOptions = [
    { value: 'concept', label: 'Concept' },
    { value: 'tool', label: 'Tool' },
    { value: 'technique', label: 'Technique' },
    { value: 'style', label: 'Style' },
  ];

  const relationTypeOptions = [
    { value: 'related_to', label: 'Related To' },
    { value: 'depends_on', label: 'Depends On' },
    { value: 'similar_to', label: 'Similar To' },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        AI Knowledge Graph
      </h1>
      <Link
        to="/"
        style={{ color: '#6366f1', fontSize: 13, textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}
      >
        ← Back to Home
      </Link>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {/* Create Entity */}
        <Card padding="md">
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            Create Entity
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Input
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              placeholder="Entity name..."
            />
            <Select
              options={entityTypeOptions}
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
            />
            <Input
              value={entityDesc}
              onChange={(e) => setEntityDesc(e.target.value)}
              placeholder="Description..."
            />
            <Button
              variant="primary"
              onClick={createEntity}
              disabled={loading || !entityName}
              style={{ width: '100%' }}
            >
              Add Entity
            </Button>
          </div>
        </Card>

        {/* Create Relation */}
        <Card padding="md">
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            Create Relation
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Input
              value={sourceEntity}
              onChange={(e) => setSourceEntity(e.target.value)}
              placeholder="Source Entity ID..."
            />
            <Input
              value={targetEntity}
              onChange={(e) => setTargetEntity(e.target.value)}
              placeholder="Target Entity ID..."
            />
            <Select
              options={relationTypeOptions}
              value={relationType}
              onChange={(e) => setRelationType(e.target.value)}
            />
            <Button
              variant="primary"
              onClick={createRelation}
              disabled={loading || !sourceEntity || !targetEntity}
              style={{ width: '100%', background: '#10b981', borderColor: '#10b981' }}
            >
              Add Relation
            </Button>
          </div>
        </Card>

        {/* Create Graph */}
        <Card padding="md">
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            Create Graph
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Input
              value={graphName}
              onChange={(e) => setGraphName(e.target.value)}
              placeholder="Graph name..."
            />
            <Input
              value={graphDesc}
              onChange={(e) => setGraphDesc(e.target.value)}
              placeholder="Description..."
            />
            <Button
              variant="primary"
              onClick={createGraph}
              disabled={loading || !graphName}
              style={{ width: '100%', background: '#8b5cf6', borderColor: '#8b5cf6' }}
            >
              Create Graph
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

      {/* Entities List */}
      <Card padding="md" style={{ marginBottom: 16 }}>
        <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
          Entities ({entities.length})
        </h2>
        {entities.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: 13 }}>No entities yet. Create one above!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 192, overflowY: 'auto' }}>
            {entities.map(entity => (
              <div
                key={entity.id}
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: 8,
                  fontSize: 13,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#f1f5f9', fontWeight: 500 }}>{entity.entity_name}</span>
                  <Badge variant="neutral">{entity.entity_type}</Badge>
                </div>
                {entity.description && (
                  <p style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>{entity.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Relations List */}
      <Card padding="md" style={{ marginBottom: 16 }}>
        <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
          Relations ({relations.length})
        </h2>
        {relations.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: 13 }}>No relations yet. Create one above!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 192, overflowY: 'auto' }}>
            {relations.map(rel => (
              <div
                key={rel.id}
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: 8,
                  fontSize: 13,
                }}
              >
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#94a3b8' }}>
                  {rel.source_entity_id.substring(0, 8)}...
                </span>
                <span style={{ margin: '0 8px', color: '#6366f1' }}>→ {rel.relation_type} →</span>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#94a3b8' }}>
                  {rel.target_entity_id.substring(0, 8)}...
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Graphs List */}
      <Card padding="md">
        <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
          Knowledge Graphs ({graphs.length})
        </h2>
        {loading && graphs.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: 13 }}>Loading graphs...</p>
        ) : graphs.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: 13 }}>No graphs yet. Create one above!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {graphs.map(graph => (
              <div
                key={graph.id}
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <h3 style={{ color: '#f1f5f9', fontWeight: 500, fontSize: 14 }}>{graph.graph_name}</h3>
                {graph.description && (
                  <p style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{graph.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default KnowledgeGraph;
