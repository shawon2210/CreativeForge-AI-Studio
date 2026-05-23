import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';

// ---------------------------------------------------------------------------
// Status colour map
// ---------------------------------------------------------------------------
type EdgeStatus = 'idle' | 'running' | 'success' | 'error';

const statusColors: Record<EdgeStatus, { stroke: string; glow: string }> = {
  idle:    { stroke: '#6366f1', glow: '#818cf8' },   // indigo
  running: { stroke: '#f59e0b', glow: '#fbbf24' },   // amber
  success: { stroke: '#22c55e', glow: '#4ade80' },   // green
  error:   { stroke: '#ef4444', glow: '#f87171' },   // red
};

// ---------------------------------------------------------------------------
// Arrow marker (arrowhead)
// ---------------------------------------------------------------------------
const ArrowMarker = ({ id, color }: { id: string; color: string }) => (
  <marker
    id={id}
    viewBox="0 0 10 10"
    refX="9"
    refY="5"
    markerWidth="8"
    markerHeight="6"
    orient="auto"
    markerUnits="userSpaceOnUse"
  >
    <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
  </marker>
);

// ---------------------------------------------------------------------------
// Gradient definition
// ---------------------------------------------------------------------------
const EdgeGradient = ({
  id,
  color,
}: {
  id: string;
  color: { stroke: string; glow: string };
}) => (
  <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stopColor={color.glow} stopOpacity="0.4" />
    <stop offset="50%" stopColor={color.stroke} stopOpacity="1" />
    <stop offset="100%" stopColor={color.glow} stopOpacity="0.4" />
  </linearGradient>
);

// ---------------------------------------------------------------------------
// Glow filter
// ---------------------------------------------------------------------------
const GlowFilter = ({ id, color }: { id: string; color: string }) => (
  <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={color} floodOpacity="0.7" />
  </filter>
);

// ---------------------------------------------------------------------------
// Main WorkflowEdge component
// ---------------------------------------------------------------------------
function WorkflowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
  label,
}: EdgeProps) {
  const status: EdgeStatus = (data?.status as EdgeStatus) || 'idle';
  const isRunning = status === 'running';

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  const colors = statusColors[status];
  const gradientId = `gradient-${id}`;
  const markerId = `arrow-${id}`;
  const glowId = `glow-${id}`;

  return (
    <>
      <defs>
        <EdgeGradient id={gradientId} color={colors} />
        <ArrowMarker id={markerId} color={colors.stroke} />
        {isRunning && <GlowFilter id={glowId} color={colors.glow} />}
      </defs>

      {/* Base edge with gradient stroke */}
      <BaseEdge
        path={edgePath}
        style={{
          ...style,
          stroke: `url(#${gradientId})`,
          strokeWidth: 2,
          ...(isRunning && { filter: `url(#${glowId})` }),
        }}
        markerEnd={`url(#${markerId})`}
      />

      {/* Animated dashed overlay when running */}
      {isRunning && (
        <path
          d={edgePath}
          fill="none"
          stroke={colors.glow}
          strokeWidth={2}
          strokeDasharray="8 4"
          strokeLinecap="round"
          opacity={0.6}
          style={{
            animation: 'dash-march 1s linear infinite',
          }}
        />
      )}

      {/* Optional label */}
      {label && (
        <text
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontSize: 11,
            fill: '#94a3b8',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {label}
        </text>
      )}

      {/* Inline keyframe for dash animation */}
      <style>{`
        @keyframes dash-march {
          to {
            stroke-dashoffset: -24;
          }
        }
      `}</style>
    </>
  );
}

// ---------------------------------------------------------------------------
// Edge types map
// ---------------------------------------------------------------------------
export const edgeTypes = {
  workflow: WorkflowEdge,
};

export default WorkflowEdge;
