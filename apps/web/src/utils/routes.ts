import type { ComponentType } from 'react';

export interface RouteConfig {
  path: string;
  component: ComponentType;
  title: string;
}

// Lazy-load feature components
const DashboardHome = () => import('../components/dashboard/DashboardHome').then((m) => ({ default: m.default }));
const WorldDashboard = () => import('../components/world-engine/WorldDashboard').then((m) => ({ default: m.default }));
const EmotionSliders = () => import('../components/emotion-ai/EmotionSliders').then((m) => ({ default: m.default }));
const StyleGenomeDashboard = () => import('../components/style-genome/StyleGenomeDashboard').then((m) => ({ default: m.default }));
const RenderPreview = () => import('../components/render-preview/RenderPreview').then((m) => ({ default: m.default }));
const AssetManagement = () => import('../components/asset-management/AssetManagement').then((m) => ({ default: m.default }));
const PromptToProduct = () => import('../components/prompt-to-product/PromptToProduct').then((m) => ({ default: m.default }));
const MultiModalFusion = () => import('../components/multi-modal-fusion/MultiModalFusion').then((m) => ({ default: m.default }));
const CinematicAI = () => import('../components/cinematic-ai/CinematicAI').then((m) => ({ default: m.default }));
const KnowledgeGraph = () => import('../components/knowledge-graph/KnowledgeGraph').then((m) => ({ default: m.default }));
const GenerativeUI = () => import('../components/generative-ui/GenerativeUI').then((m) => ({ default: m.default }));
const Marketplace = () => import('../components/marketplace/Marketplace').then((m) => ({ default: m.default }));
const TimelineVersioning = () => import('../components/timeline-versioning/TimelineVersioning').then((m) => ({ default: m.default }));
const VoiceDriven = () => import('../components/voice-driven/VoiceDriven').then((m) => ({ default: m.default }));
const CollaborativeStudio = () => import('../components/collaborative-studio/CollaborativeStudio').then((m) => ({ default: m.default }));
const CreativeTwin = () => import('../components/creative-twin/CreativeTwin').then((m) => ({ default: m.default }));
const ResearchInspiration = () => import('../components/research-inspiration/ResearchInspiration').then((m) => ({ default: m.default }));
const FutureReady = () => import('../components/future-ready/FutureReady').then((m) => ({ default: m.default }));

export const routes: RouteConfig[] = [
  { path: '/', component: DashboardHome as unknown as ComponentType, title: 'Dashboard' },
  { path: '/generations', component: DashboardHome as unknown as ComponentType, title: 'Generations' },
  { path: '/world-engine', component: WorldDashboard as unknown as ComponentType, title: 'World Engine' },
  { path: '/emotion-ai', component: EmotionSliders as unknown as ComponentType, title: 'Emotion AI' },
  { path: '/style-genome', component: StyleGenomeDashboard as unknown as ComponentType, title: 'Style Genome' },
  { path: '/render-preview', component: RenderPreview as unknown as ComponentType, title: 'Render Preview' },
  { path: '/asset-management', component: AssetManagement as unknown as ComponentType, title: 'Asset Management' },
  { path: '/prompt-to-product', component: PromptToProduct as unknown as ComponentType, title: 'Prompt to Product' },
  { path: '/multi-modal', component: MultiModalFusion as unknown as ComponentType, title: 'Multi-Modal Fusion' },
  { path: '/cinematic-ai', component: CinematicAI as unknown as ComponentType, title: 'Cinematic AI' },
  { path: '/knowledge-graph', component: KnowledgeGraph as unknown as ComponentType, title: 'Knowledge Graph' },
  { path: '/generative-ui', component: GenerativeUI as unknown as ComponentType, title: 'Generative UI' },
  { path: '/marketplace', component: Marketplace as unknown as ComponentType, title: 'Marketplace' },
  { path: '/timeline', component: TimelineVersioning as unknown as ComponentType, title: 'Timeline & Versioning' },
  { path: '/voice-driven', component: VoiceDriven as unknown as ComponentType, title: 'Voice Driven' },
  { path: '/collaboration', component: CollaborativeStudio as unknown as ComponentType, title: 'Collaborative Studio' },
  { path: '/creative-twin', component: CreativeTwin as unknown as ComponentType, title: 'Creative Twin' },
  { path: '/research', component: ResearchInspiration as unknown as ComponentType, title: 'Research & Inspiration' },
  { path: '/future', component: FutureReady as unknown as ComponentType, title: 'Future Ready' },
];

export default routes;
