import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import 'reactflow/dist/style.css';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardHome from './components/dashboard/DashboardHome';
import { PageHeader, Spinner } from './components/ui';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Lazy-load all feature components
const WorldDashboard = lazy(() => import('./components/world-engine/WorldDashboard'));
const EmotionSliders = lazy(() => import('./components/emotion-ai/EmotionSliders'));
const StyleGenomeDashboard = lazy(() => import('./components/style-genome/StyleGenomeDashboard'));
const RenderPreview = lazy(() => import('./components/render-preview/RenderPreview'));
const AssetManagement = lazy(() => import('./components/asset-management/AssetManagement'));
const PromptToProduct = lazy(() => import('./components/prompt-to-product/PromptToProduct'));
const MultiModalFusion = lazy(() => import('./components/multi-modal-fusion/MultiModalFusion'));
const CinematicAI = lazy(() => import('./components/cinematic-ai/CinematicAI'));
const KnowledgeGraph = lazy(() => import('./components/knowledge-graph/KnowledgeGraph'));
const GenerativeUI = lazy(() => import('./components/generative-ui/GenerativeUI'));
const Marketplace = lazy(() => import('./components/marketplace/Marketplace'));
const TimelineVersioning = lazy(() => import('./components/timeline-versioning/TimelineVersioning'));
const VoiceDriven = lazy(() => import('./components/voice-driven/VoiceDriven'));
const CollaborativeStudio = lazy(() => import('./components/collaborative-studio/CollaborativeStudio'));
const CreativeTwin = lazy(() => import('./components/creative-twin/CreativeTwin'));
const ResearchInspiration = lazy(() => import('./components/research-inspiration/ResearchInspiration'));
const FutureReady = lazy(() => import('./components/future-ready/FutureReady'));
const WorkflowCanvas = lazy(() => import('./components/visual-node/WorkflowCanvas'));

// Skeleton loader for lazy-loaded pages
const PageSkeleton: React.FC = () => (
  <div style={{ padding: 24, maxWidth: 1200 }}>
    <div style={{ background: '#1a1a25', borderRadius: 8, height: 28, width: 200, marginBottom: 24 }} />
    <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ background: '#1a1a25', borderRadius: 12, height: 100, flex: 1 }} />
      ))}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} style={{ background: '#1a1a25', borderRadius: 12, height: 140 }} />
      ))}
    </div>
  </div>
);

// Navigation-aware DashboardHome
const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  return <DashboardHome onNavigate={navigate} />;
};

// Wrapper for features that need props
const EmotionAIWrapper: React.FC = () => {
  const [result, setResult] = useState<string>('');
  return (
    <div>
      <EmotionSliders onApply={(emotion, intensity) => {
        setResult(`Emotion: ${emotion}, Intensity: ${intensity}`);
      }} />
      {result && <p style={{ color: '#94a3b8', marginTop: 16, fontSize: 13 }}>{result}</p>}
    </div>
  );
};

// Feature page with PageHeader
const FeaturePage: React.FC<{ title: string; subtitle?: string; badge?: { text: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'new' | 'beta' }; children: React.ReactNode }> = ({ title, subtitle, badge, children }) => {
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 1200 }}>
      <PageHeader title={title} subtitle={subtitle} badge={badge} onBack={() => navigate('/')} />
      <ErrorBoundary>{children}</ErrorBoundary>
    </div>
  );
};

function AppRoutes() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/generations" element={<DashboardPage />} />
        <Route path="/workflow" element={<FeaturePage title="Visual Workflow" subtitle="Build AI pipelines with drag-and-drop nodes" badge={{ text: 'Active', variant: 'success' }}><WorkflowCanvas /></FeaturePage>} />
        <Route path="/world-engine" element={<FeaturePage title="World Engine" subtitle="Build consistent story worlds" badge={{ text: 'Active', variant: 'success' }}><WorldDashboard /></FeaturePage>} />
        <Route path="/emotion-ai" element={<FeaturePage title="Emotion AI" subtitle="Emotion-aware generation controls" badge={{ text: 'Active', variant: 'success' }}><EmotionAIWrapper /></FeaturePage>} />
        <Route path="/style-genome" element={<FeaturePage title="Style Genome" subtitle="Your unique style fingerprint" badge={{ text: 'Active', variant: 'success' }}><StyleGenomeDashboard /></FeaturePage>} />
        <Route path="/render-preview" element={<FeaturePage title="Render Preview" subtitle="Real-time render job monitoring" badge={{ text: 'Active', variant: 'success' }}><RenderPreview /></FeaturePage>} />
        <Route path="/asset-management" element={<FeaturePage title="Asset Management" subtitle="Organize and tag your creative assets" badge={{ text: 'Active', variant: 'success' }}><AssetManagement /></FeaturePage>} />
        <Route path="/prompt-to-product" element={<FeaturePage title="Prompt → Product" subtitle="Turn prompts into products" badge={{ text: 'Active', variant: 'success' }}><PromptToProduct /></FeaturePage>} />
        <Route path="/multi-modal" element={<FeaturePage title="Multi-Modal Fusion" subtitle="Combine text, image, and audio" badge={{ text: 'Active', variant: 'success' }}><MultiModalFusion /></FeaturePage>} />
        <Route path="/cinematic-ai" element={<FeaturePage title="Cinematic AI" subtitle="Camera, lighting, and color grading" badge={{ text: 'Active', variant: 'success' }}><CinematicAI /></FeaturePage>} />
        <Route path="/knowledge-graph" element={<FeaturePage title="Knowledge Graph" subtitle="Entity-relation knowledge base" badge={{ text: 'Active', variant: 'success' }}><KnowledgeGraph /></FeaturePage>} />
        <Route path="/generative-ui" element={<FeaturePage title="Generative UI" subtitle="AI-generated UI components" badge={{ text: 'Active', variant: 'success' }}><GenerativeUI /></FeaturePage>} />
        <Route path="/marketplace" element={<FeaturePage title="Marketplace" subtitle="Buy and sell AI assets" badge={{ text: 'Beta', variant: 'beta' }}><Marketplace /></FeaturePage>} />
        <Route path="/timeline" element={<FeaturePage title="Timeline & Versioning" subtitle="Project history and version control" badge={{ text: 'Active', variant: 'success' }}><TimelineVersioning /></FeaturePage>} />
        <Route path="/voice-driven" element={<FeaturePage title="Voice Creation" subtitle="Voice-driven AI commands" badge={{ text: 'Beta', variant: 'beta' }}><VoiceDriven /></FeaturePage>} />
        <Route path="/collaboration" element={<FeaturePage title="Collaborative Studio" subtitle="Real-time collaboration" badge={{ text: 'Active', variant: 'success' }}><CollaborativeStudio /></FeaturePage>} />
        <Route path="/creative-twin" element={<FeaturePage title="AI Creative Twin" subtitle="Your personal AI assistant" badge={{ text: 'New', variant: 'new' }}><CreativeTwin /></FeaturePage>} />
        <Route path="/research" element={<FeaturePage title="Research & Inspiration" subtitle="AI research papers and sources" badge={{ text: 'Active', variant: 'success' }}><ResearchInspiration /></FeaturePage>} />
        <Route path="/future" element={<FeaturePage title="Future Ready" subtitle="Roadmap and expansion plans" badge={{ text: 'New', variant: 'new' }}><FutureReady /></FeaturePage>} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <AppRoutes />
      </DashboardLayout>
    </BrowserRouter>
  );
}

export default App;
