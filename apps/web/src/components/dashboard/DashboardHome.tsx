import React, { useState, useEffect } from 'react';
import { useGenerationStore } from '../../stores/generationStore';
import { Card, Badge, StatCard, EmptyState } from '../ui';

interface DashboardHomeProps {
  onNavigate?: (path: string) => void;
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  status: 'active' | 'beta' | 'new';
  onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, status, onClick }) => {
  const statusVariant = status === 'new' ? 'new' : status === 'beta' ? 'beta' : 'success';
  const statusLabel = status === 'new' ? 'New' : status === 'beta' ? 'Beta' : 'Active';

  return (
    <Card hover onClick={onClick} padding="md" style={{ minHeight: 140, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <Badge variant={statusVariant} size="sm">{statusLabel}</Badge>
      </div>
      <div>
        <div style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{title}</div>
        <div style={{ color: '#64748b', fontSize: 12, lineHeight: 1.5 }}>{description}</div>
      </div>
    </Card>
  );
};

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate }) => {
  const { generations } = useGenerationStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const features = [
    { id: 'generations', title: 'AI Generations', desc: 'Text, image, and multi-modal generation with AI Creative Director', icon: '✦', status: 'active' as const },
    { id: 'workflow', title: 'Visual Workflow', desc: 'Node-based AI pipeline builder with drag-and-drop', icon: '⬡', status: 'active' as const },
    { id: 'world-engine', title: 'World Engine', desc: 'Build consistent story worlds with character tracking', icon: '🌍', status: 'active' as const },
    { id: 'emotion-ai', title: 'Emotion AI', desc: 'Emotion-aware generation with visual parameter mapping', icon: '♥', status: 'active' as const },
    { id: 'style-genome', title: 'Style Genome', desc: 'Your unique style fingerprint with mutation & evolution', icon: '🧬', status: 'active' as const },
    { id: 'render-preview', title: 'Render Preview', desc: 'Real-time render previews with job status tracking', icon: '👁', status: 'active' as const },
    { id: 'asset-management', title: 'Asset Manager', desc: 'Organize, tag, and collect your creative assets', icon: '📁', status: 'active' as const },
    { id: 'prompt-to-product', title: 'Prompt → Product', desc: 'Turn prompts into products with iteration support', icon: '⚡', status: 'active' as const },
    { id: 'multi-modal', title: 'Multi-Modal Fusion', desc: 'Combine text, image, and audio in single jobs', icon: '⊞', status: 'active' as const },
    { id: 'cinematic-ai', title: 'Cinematic AI', desc: 'Camera settings, lighting rigs, and color grading', icon: '🎬', status: 'active' as const },
    { id: 'knowledge-graph', title: 'Knowledge Graph', desc: 'Entity-relation knowledge base with graph viz', icon: '🕸', status: 'active' as const },
    { id: 'generative-ui', title: 'Generative UI', desc: 'AI-generated UI components with marketplace', icon: '◫', status: 'active' as const },
    { id: 'marketplace', title: 'Marketplace', desc: 'Buy and sell AI assets, prompts, and models', icon: '🏪', status: 'beta' as const },
    { id: 'timeline', title: 'Timeline & Versions', desc: 'Project history with version control and changelogs', icon: '⏱', status: 'active' as const },
    { id: 'voice-driven', title: 'Voice Creation', desc: 'Voice-driven AI commands with session tracking', icon: '🎙', status: 'beta' as const },
    { id: 'collaboration', title: 'Collab Studio', desc: 'Real-time collaboration with WebRTC support', icon: '👥', status: 'active' as const },
    { id: 'creative-twin', title: 'AI Creative Twin', desc: 'Your personal AI assistant that learns your style', icon: '🤖', status: 'new' as const },
    { id: 'research', title: 'Research Engine', desc: 'AI research papers and inspiration sources', icon: '🔬', status: 'active' as const },
    { id: 'future', title: 'Future Features', desc: 'Roadmap and expansion plans for the platform', icon: '🚀', status: 'new' as const },
  ];

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? 20 : 32 }}>
        <h1 style={{ color: '#f1f5f9', fontSize: isMobile ? 22 : 28, fontWeight: 700, marginBottom: 8 }}>
          Welcome back, Shawon ◈
        </h1>
        <p style={{ color: '#64748b', fontSize: isMobile ? 13 : 15 }}>
          Your AI creative studio — {features.length} features ready to use
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: isMobile ? 20 : 32, flexWrap: 'wrap' }}>
        <StatCard title="Total Generations" value={generations.length} icon="✦" color="#6366f1" subtitle="All time" />
        <StatCard title="Active Features" value={features.length} icon="◈" color="#10b981" subtitle="All systems operational" />
        <StatCard title="API Mode" value="Mock" icon="⚙" color="#f59e0b" subtitle="CPU mock mode active" />
        <StatCard title="Storage" value="0 MB" icon="💾" color="#8b5cf6" subtitle="No assets uploaded" />
      </div>

      {/* Section label */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ color: '#f1f5f9', fontSize: isMobile ? 16 : 18, fontWeight: 600 }}>All Features</h2>
        <p style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>Click any feature to explore — or press ⌘K to search</p>
      </div>

      {/* Feature grid - responsive: 1 col mobile, 2 col tablet, 3-4 col desktop */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? '1fr'
            : 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 12,
        }}
      >
        {features.map((f) => (
          <FeatureCard
            key={f.id}
            title={f.title}
            description={f.desc}
            icon={f.icon}
            status={f.status}
            onClick={() => {
              if (onNavigate) {
                onNavigate(`/${f.id}`);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardHome;
