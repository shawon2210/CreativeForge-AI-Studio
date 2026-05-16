import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Input, Select, Badge, Button, PageHeader, EmptyState, Divider } from '../ui';

interface RoadmapItem {
  id: string;
  milestone_name: string;
  target_quarter: string;
  status: string;
}

interface FutureFeature {
  id: string;
  feature_name: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  roadmap_items: RoadmapItem[];
}

interface ExpansionPlan {
  id: string;
  plan_name: string;
  target_market: string;
  strategy: string;
  budget_allocated: number;
  expected_roi: number;
  status: string;
}

const priorityBadgeVariant: Record<string, 'error' | 'warning' | 'info' | 'success'> = {
  critical: 'error',
  high: 'warning',
  medium: 'info',
  low: 'success',
};

const FutureReady: React.FC = () => {
  const [features, setFeatures] = useState<FutureFeature[]>([]);
  const [plans, setPlans] = useState<ExpansionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [featureId, setFeatureId] = useState('');

  // Feature creation
  const [featureName, setFeatureName] = useState('AI-Powered Real-Time Rendering');
  const [category, setCategory] = useState('tech');
  const [priority, setPriority] = useState('high');

  // Roadmap item
  const [milestoneName, setMilestoneName] = useState('');
  const [targetQuarter, setTargetQuarter] = useState('Q3-2026');

  // Expansion plan
  const [planName, setPlanName] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [strategy, setStrategy] = useState('');

  const fetchFeatures = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/future-ready/features/');
      if (!response.ok) throw new Error('Failed to fetch features');
      const data = await response.json();
      setFeatures(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createFeature = async () => {
    if (!featureName) {
      alert('Feature name is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/future-ready/features/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature_name: featureName,
          category,
          priority
        })
      });
      if (!response.ok) throw new Error('Failed to create feature');
      const newFeature = await response.json();
      setFeatures([...features, newFeature]);
      setFeatureId(newFeature.id);
      setFeatureName('');
      alert('Feature created!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const addRoadmapItem = async () => {
    if (!featureId || !milestoneName) {
      alert('Feature ID and milestone name are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/future-ready/roadmap/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature_id: featureId,
          milestone_name: milestoneName,
          target_quarter: targetQuarter
        })
      });
      if (!response.ok) throw new Error('Failed to add roadmap item');
      alert('Roadmap item added!');
      setMilestoneName('');
      fetchFeatures(); // Refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createExpansionPlan = async () => {
    if (!planName || !targetMarket || !strategy) {
      alert('Plan name, target market, and strategy are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/future-ready/expansion-plans/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_name: planName,
          target_market: targetMarket,
          strategy
        })
      });
      if (!response.ok) throw new Error('Failed to create expansion plan');
      const newPlan = await response.json();
      setPlans([...plans, newPlan]);
      setPlanName('');
      setTargetMarket('');
      setStrategy('');
      alert('Expansion plan created!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Link
        to="/"
        style={{
          color: '#6366f1',
          fontSize: 13,
          textDecoration: 'none',
          marginBottom: 16,
          display: 'inline-block',
        }}
      >
        ← Back to Home
      </Link>

      <PageHeader
        title="Future-Ready Expansions"
        subtitle="COMPLETING THE FINAL FEATURE (20/20) OF CREATIVEFORGE AI STUDIO! 🎉"
        badge={{ text: 'FINAL FEATURE', variant: 'new' }}
        onBack={() => {}}
      />

      {/* Error Banner */}
      {error && (
        <div
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 24,
            color: '#ef4444',
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* Three-column form grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Create Feature */}
        <Card padding="md">
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            Create Future Feature
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input
              placeholder="Feature name..."
              value={featureName}
              onChange={(e) => setFeatureName(e.target.value)}
            />
            <Select
              options={[
                { value: 'tech', label: 'Tech' },
                { value: 'platform', label: 'Platform' },
                { value: 'integration', label: 'Integration' },
              ]}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <Select
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' },
              ]}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            />
            <Button
              variant="primary"
              onClick={createFeature}
              disabled={loading || !featureName}
            >
              Create Feature
            </Button>
          </div>
        </Card>

        {/* Add Roadmap Item */}
        <Card padding="md">
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            Add Roadmap Item
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input
              placeholder="Feature ID..."
              value={featureId}
              onChange={(e) => setFeatureId(e.target.value)}
            />
            <Input
              placeholder="Milestone name..."
              value={milestoneName}
              onChange={(e) => setMilestoneName(e.target.value)}
            />
            <Select
              options={[
                { value: 'Q1-2026', label: 'Q1-2026' },
                { value: 'Q2-2026', label: 'Q2-2026' },
                { value: 'Q3-2026', label: 'Q3-2026' },
                { value: 'Q4-2026', label: 'Q4-2026' },
              ]}
              value={targetQuarter}
              onChange={(e) => setTargetQuarter(e.target.value)}
            />
            <Button
              variant="primary"
              onClick={addRoadmapItem}
              disabled={loading || !featureId || !milestoneName}
              style={{ background: '#10b981', border: '1px solid #10b981' }}
            >
              Add Roadmap Item
            </Button>
          </div>
        </Card>

        {/* Create Expansion Plan */}
        <Card padding="md">
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            Create Expansion Plan
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input
              placeholder="Plan name..."
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
            />
            <Input
              placeholder="Target market..."
              value={targetMarket}
              onChange={(e) => setTargetMarket(e.target.value)}
            />
            <Input
              placeholder="Strategy..."
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
            />
            <Button
              variant="primary"
              onClick={createExpansionPlan}
              disabled={loading || !planName || !targetMarket || !strategy}
              style={{ background: '#8b5cf6', border: '1px solid #8b5cf6' }}
            >
              Create Plan
            </Button>
          </div>
        </Card>
      </div>

      {/* Future Features Section */}
      <Card padding="lg" style={{ marginBottom: 24 }}>
        <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
          Future Features ({features.length})
        </h2>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 0' }}>
            <div
              style={{
                width: 20,
                height: 20,
                border: '2px solid rgba(255,255,255,0.1)',
                borderTopColor: '#6366f1',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
              }}
            />
            <span style={{ color: '#94a3b8', fontSize: 14 }}>Loading features...</span>
          </div>
        ) : features.length === 0 ? (
          <EmptyState
            icon="🚀"
            title="No features yet"
            description="Create your first future feature above to get started."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {features.map((feature) => (
              <div
                key={feature.id}
                style={{
                  background: '#1a1a25',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 8,
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  <div>
                    <h3 style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 4 }}>
                      {feature.feature_name}
                    </h3>
                    <p style={{ color: '#64748b', fontSize: 13 }}>{feature.description}</p>
                  </div>
                  <Badge variant={priorityBadgeVariant[feature.priority] || 'neutral'}>
                    {feature.priority}
                  </Badge>
                </div>
                <Badge variant="info" size="sm">{feature.category}</Badge>

                {/* Roadmap Items */}
                {feature.roadmap_items && feature.roadmap_items.length > 0 && (
                  <>
                    <Divider style={{ marginTop: 12, marginBottom: 8 }} />
                    <h4 style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                      Roadmap ({feature.roadmap_items.length})
                    </h4>
                    {feature.roadmap_items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          color: '#64748b',
                          fontSize: 12,
                          marginBottom: 4,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <span style={{ color: '#94a3b8', fontWeight: 500 }}>
                          {item.milestone_name}
                        </span>
                        <span>—</span>
                        <span>{item.target_quarter}</span>
                        <span
                          style={{
                            color: item.status === 'completed' ? '#10b981' : '#64748b',
                            fontSize: 11,
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Expansion Plans Section */}
      <Card padding="lg">
        <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
          Expansion Plans ({plans.length})
        </h2>
        {plans.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No expansion plans yet"
            description="Create your first expansion plan above to get started."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {plans.map((plan) => (
              <div
                key={plan.id}
                style={{
                  background: '#1a1a25',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 8,
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  <div>
                    <h3 style={{ color: '#f1f5f9', fontWeight: 600 }}>{plan.plan_name}</h3>
                    <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
                      Market: {plan.target_market}
                    </p>
                    <p style={{ color: '#64748b', fontSize: 13 }}>
                      Strategy: {plan.strategy}
                    </p>
                  </div>
                  <Badge variant="new" size="sm">{plan.status}</Badge>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                    color: '#64748b',
                    fontSize: 12,
                    marginTop: 8,
                  }}
                >
                  <div>Budget: ${plan.budget_allocated?.toFixed(2) || '0.00'}</div>
                  <div>Expected ROI: {plan.expected_roi?.toFixed(1) || '0.0'}%</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Final celebration banner */}
      <div
        style={{
          marginTop: 24,
          padding: 20,
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 12,
          textAlign: 'center',
        }}
      >
        <p style={{ color: '#10b981', fontWeight: 600, fontSize: 14 }}>
          🎉 COMPLETING THE FINAL FEATURE (20/20) OF CREATIVEFORGE AI STUDIO! 🎉
        </p>
      </div>
    </div>
  );
};

export default FutureReady;
