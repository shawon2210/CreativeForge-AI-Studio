/**
 * WorkflowCanvas — Production-grade visual AI workflow builder
 *
 * Features:
 * - Drag-and-drop node palette
 * - React Flow canvas with custom edges
 * - Node configuration sidebar
 * - Execution visualization with real-time status
 * - Bottom logs panel
 * - Keyboard shortcuts
 * - Save/load/export/import
 * - Snap-to-grid, zoom, pan
 * - Minimap with custom styling
 * - Dark futuristic UI theme
 */

import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  Connection,
  NodeTypes,
  EdgeTypes,
  Panel,
  SelectionMode,
  useReactFlow,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Workflow System Imports ─────────────────────────────────────────────────
import { useWorkflowStore } from '../../workflow/stores/workflowStore'
import { useWorkflowExecution, useWorkflowKeyboard, useAutoSave } from '../../workflow/hooks/useWorkflowExecution'
import { NODE_TEMPLATES } from '../../workflow/utils/nodeTemplates'
import { validateWorkflow } from '../../workflow/utils/validation'
import { downloadWorkflow, uploadWorkflow } from '../../workflow/utils/exportImport'
import type { WorkflowNode, WorkflowEdge, WorkflowNodeType, NodeStatus } from '../../workflow/types'

// ─── Components ──────────────────────────────────────────────────────────────
import { NodePalette } from '../../workflow/nodes/NodePalette'
import { ConfigPanel } from '../../workflow/panels/ConfigPanel'
import { LogsPanel } from '../../workflow/panels/LogsPanel'
import WorkflowEdgeComponent from '../../workflow/edges/WorkflowEdge'

// ─── Custom Node Components ──────────────────────────────────────────────────
import { StartNode } from '../../workflow/nodes/StartNode'
import { TextGenNode } from '../../workflow/nodes/TextGenNode'
import { ImageGenNode } from '../../workflow/nodes/ImageGenNode'
import { CanvasNodeComponent } from '../../workflow/nodes/CanvasNode'
import { OutputNodeComponent } from '../../workflow/nodes/OutputNode'
import { AgentNode } from '../../workflow/nodes/AgentNode'
import { ConditionNode } from '../../workflow/nodes/ConditionNode'
import { LoopNode } from '../../workflow/nodes/LoopNode'
import { MemoryNode } from '../../workflow/nodes/MemoryNode'
import { WebhookNode } from '../../workflow/nodes/WebhookNode'
import { SubflowNode } from '../../workflow/nodes/SubflowNode'

// ─── Node & Edge Type Registries ────────────────────────────────────────────
const nodeTypes: NodeTypes = {
  start: StartNode,
  text_gen: TextGenNode,
  image_gen: ImageGenNode,
  canvas: CanvasNodeComponent,
  output: OutputNodeComponent,
  agent: AgentNode,
  condition: ConditionNode,
  loop: LoopNode,
  memory: MemoryNode,
  webhook: WebhookNode,
  subflow: SubflowNode,
}

const edgeTypes: EdgeTypes = {
  workflow: WorkflowEdgeComponent,
}

// ─── Initial State ───────────────────────────────────────────────────────────
const createInitialNodes = (): WorkflowNode[] => [
  {
    id: 'start_1',
    type: 'start' as WorkflowNodeType,
    position: { x: 400, y: 50 },
    data: {
      label: 'Start',
      status: 'idle' as NodeStatus,
      description: 'Workflow entry point',
      icon: '▶',
      color: '#6366f1',
      triggerMode: 'manual',
    },
  },
]

// ─── Status Color Map ────────────────────────────────────────────────────────
const statusColors: Record<NodeStatus, string> = {
  idle: '#6366f1',
  running: '#f59e0b',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f97316',
  cancelled: '#64748b',
}

// ─── Inner Canvas (needs ReactFlow context) ─────────────────────────────────
const WorkflowCanvasInner: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(createInitialNodes())
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  const { project, fitView, setViewport } = useReactFlow()

  // ─── Store & Hooks ──────────────────────────────────────────────────────
  const store = useWorkflowStore()
  const { executeWorkflow, cancelExecution, isExecuting, executionLogs, clearResults } = useWorkflowExecution()
  useWorkflowKeyboard()
  const { saveIndicator } = useAutoSave()

  // ─── UI State ───────────────────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(true)
  const [configPanelOpen, setConfigPanelOpen] = useState(false)
  const [logsPanelOpen, setLogsPanelOpen] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // ─── Responsive ─────────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      setIsMobile(w < 768)
      setIsTablet(w >= 768 && w < 1024)
      if (w < 768) setPaletteOpen(false)
      if (w >= 1024) setPaletteOpen(true)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ─── Connections ────────────────────────────────────────────────────────
  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source === connection.target) return
      const newEdge: WorkflowEdge = {
        ...connection,
        id: `edge_${connection.source}_${connection.target}_${Date.now()}`,
        type: 'workflow',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
        data: { connectionType: 'data' },
      } as WorkflowEdge
      setEdges((eds) => addEdge(newEdge, eds))
    },
    [setEdges]
  )

  // ─── Drag & Drop ────────────────────────────────────────────────────────
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow-type', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const type = event.dataTransfer.getData('application/reactflow-type') as WorkflowNodeType
      if (!type || !reactFlowInstance) return

      const position = project({
        x: event.clientX - reactFlowWrapper.current!.getBoundingClientRect().left,
        y: event.clientY - reactFlowWrapper.current!.getBoundingClientRect().top,
      })

      const template = NODE_TEMPLATES.find((t) => t.type === type)
      const newNode: WorkflowNode = {
        id: `${type}_${Date.now()}`,
        type,
        position,
        data: {
          label: template?.label || type,
          status: 'idle',
          description: template?.description,
          icon: template?.icon,
          color: template?.color,
          ...template?.defaultData,
        } as any,
      }

      setNodes((nds) => [...nds, newNode])
      if (isMobile) setPaletteOpen(false)
    },
    [reactFlowInstance, setNodes, project, isMobile]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  // ─── Node Selection ─────────────────────────────────────────────────────
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id)
    setConfigPanelOpen(true)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null)
    setConfigPanelOpen(false)
  }, [])

  // ─── Clear Workflow ─────────────────────────────────────────────────────
  const clearWorkflow = useCallback(() => {
    setNodes(createInitialNodes())
    setEdges([])
    clearResults()
    setSelectedNodeId(null)
    setConfigPanelOpen(false)
  }, [setNodes, setEdges, clearResults])

  // ─── Save / Load ────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    const workflow = {
      id: store.workflowId || `wf_${Date.now()}`,
      name: store.workflowName || 'Untitled Workflow',
      description: store.workflowDescription || '',
      version: '1.0.0',
      nodes: nodes as any,
      edges: edges as any,
      viewport: reactFlowInstance?.getViewport() || { x: 0, y: 0, zoom: 1 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isTemplate: false,
      tags: [],
      userId: 'current_user',
    }
    store.setWorkflow(workflow)
    store.markSaved()
  }, [nodes, edges, reactFlowInstance, store])

  const handleExport = useCallback(() => {
    const workflow = {
      id: store.workflowId || `wf_${Date.now()}`,
      name: store.workflowName || 'Untitled Workflow',
      description: store.workflowDescription || '',
      version: '1.0.0',
      nodes: nodes as any,
      edges: edges as any,
      viewport: reactFlowInstance?.getViewport() || { x: 0, y: 0, zoom: 1 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isTemplate: false,
      tags: [],
      userId: 'current_user',
    }
    downloadWorkflow(workflow)
  }, [nodes, edges, reactFlowInstance, store])

  const handleImport = useCallback(async () => {
    try {
      const workflow = await uploadWorkflow()
      if (workflow) {
        setNodes(workflow.nodes || [])
        setEdges(workflow.edges || [])
        store.setWorkflow(workflow)
        setTimeout(() => fitView({ padding: 0.2 }), 100)
      }
    } catch (err) {
      console.error('Import failed:', err)
    }
  }, [setNodes, setEdges, store, fitView])

  // ─── Validation ─────────────────────────────────────────────────────────
  const validation = useMemo(() => validateWorkflow(nodes as any, edges as any), [nodes, edges])
  const hasErrors = validation.errors.length > 0

  // ─── Render ─────────────────────────────────────────────────────────────
  const canvasHeight = isMobile ? 'calc(100vh - 140px)' : 'calc(100vh - 160px)'
  const paletteWidth = isMobile ? '100%' : isTablet ? 220 : 260

  return (
    <div style={{ display: 'flex', height: canvasHeight, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', background: '#08080f' }}>

      {/* ─── Node Palette ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {paletteOpen && (
          <motion.div
            initial={{ x: -paletteWidth, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -paletteWidth, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              width: paletteWidth,
              minWidth: paletteWidth,
              position: isMobile ? 'absolute' : 'relative',
              zIndex: isMobile ? 30 : 'auto',
              height: '100%',
              background: '#0a0a14',
              borderRight: '1px solid rgba(255,255,255,0.06)',
              overflowY: 'auto',
            }}
          >
            <NodePalette onDragStart={onDragStart} isMobile={isMobile} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Main Canvas Area ──────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>

        {/* Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
          background: '#0c0c16', borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexWrap: 'wrap',
        }}>
          {/* Mobile palette toggle */}
          {isMobile && (
            <button onClick={() => setPaletteOpen(!paletteOpen)}
              style={toolbarButtonStyle('#6366f1')}>
              {paletteOpen ? '✕' : '☰'}
            </button>
          )}

          {/* Execute / Stop */}
          <button onClick={isExecuting ? cancelExecution : executeWorkflow}
            disabled={hasErrors && !isExecuting}
            style={{
              ...toolbarButtonStyle(isExecuting ? '#ef4444' : '#10b981'),
              opacity: hasErrors && !isExecuting ? 0.5 : 1,
            }}>
            {isExecuting ? '◌ Stop' : '▶ Run'}
          </button>

          {/* Clear */}
          <button onClick={clearWorkflow} disabled={isExecuting}
            style={toolbarButtonStyle('#64748b')}>
            ✕ Clear
          </button>

          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

          {/* Save / Export / Import */}
          <button onClick={handleSave} style={toolbarButtonStyle('#6366f1')}>
            💾 Save
          </button>
          <button onClick={handleExport} style={toolbarButtonStyle('#8b5cf6')}>
            📤 Export
          </button>
          <button onClick={handleImport} style={toolbarButtonStyle('#8b5cf6')}>
            📥 Import
          </button>

          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

          {/* Logs toggle */}
          <button onClick={() => setLogsPanelOpen(!logsPanelOpen)}
            style={toolbarButtonStyle(logsPanelOpen ? '#f59e0b' : '#64748b')}>
            📋 Logs {executionLogs.length > 0 && `(${executionLogs.length})`}
          </button>

          {/* Config panel toggle */}
          <button onClick={() => setConfigPanelOpen(!configPanelOpen)}
            style={toolbarButtonStyle(configPanelOpen ? '#ec4899' : '#64748b')}>
            ⚙ Config
          </button>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Validation status */}
          {hasErrors && (
            <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 600 }}>
              ⚠ {validation.errors.length} error{validation.errors.length > 1 ? 's' : ''}
            </span>
          )}
          {!hasErrors && validation.warnings.length > 0 && (
            <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 600 }}>
              ⚠ {validation.warnings.length} warning{validation.warnings.length > 1 ? 's' : ''}
            </span>
          )}

          {/* Save indicator */}
          {saveIndicator === 'saved' && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ fontSize: 10, color: '#10b981', fontWeight: 600 }}>
              ✓ Saved
            </motion.span>
          )}
          {saveIndicator === 'saving' && (
            <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 600 }}>◌ Saving...</span>
          )}
        </div>

        {/* Canvas + Panels */}
        <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>

          {/* React Flow Canvas */}
          <div ref={reactFlowWrapper} style={{ flex: 1, height: '100%', position: 'relative' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              style={{ background: '#08080f' }}
              proOptions={{ hideAttribution: true }}
              selectionOnDrag={true}
              panOnScroll={false}
              selectionMode={SelectionMode.Partial}
              snapToGrid={true}
              snapGrid={[15, 15]}
              defaultEdgeOptions={{
                type: 'workflow',
                animated: true,
                style: { stroke: '#6366f1', strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
              }}
            >
              <Controls
                style={{
                  background: '#12121a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
                showInteractive={false}
              />
              {!isMobile && (
                <MiniMap
                  nodeColor={(node) => {
                    const status = (node.data?.status as NodeStatus) || 'idle'
                    return statusColors[status] || '#6366f1'
                  }}
                  style={{
                    background: '#0a0a14',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                  }}
                  maskColor="rgba(0,0,0,0.7)"
                  nodeStrokeWidth={2}
                  zoomable
                  pannable
                />
              )}
              <Background
                variant={BackgroundVariant.Dots}
                gap={20}
                size={1}
                color="rgba(255,255,255,0.04)"
              />

              {/* Execution overlay */}
              {isExecuting && (
                <Panel position="top-center">
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    style={{
                      background: 'rgba(245,158,11,0.15)',
                      border: '1px solid rgba(245,158,11,0.3)',
                      borderRadius: 8,
                      padding: '8px 16px',
                      color: '#fbbf24',
                      fontSize: 12,
                      fontWeight: 600,
                      backdropFilter: 'blur(8px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span style={{ animation: 'pulse 1s infinite' }}>◌</span>
                    Executing workflow...
                  </motion.div>
                </Panel>
              )}
            </ReactFlow>
          </div>

          {/* ─── Configuration Panel ──────────────────────────────────── */}
          <AnimatePresence>
            {configPanelOpen && selectedNodeId && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                style={{
                  width: isMobile ? '100%' : 300,
                  position: isMobile ? 'absolute' : 'relative',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  zIndex: 20,
                  background: '#0c0c16',
                  borderLeft: '1px solid rgba(255,255,255,0.06)',
                  overflowY: 'auto',
                }}
              >
                <ConfigPanel
                  nodeId={selectedNodeId}
                  node={nodes.find((n) => n.id === selectedNodeId) as WorkflowNode | undefined}
                  onClose={() => { setConfigPanelOpen(false); setSelectedNodeId(null) }}
                  onUpdate={(data) => {
                    setNodes((nds) =>
                      nds.map((n) => (n.id === selectedNodeId ? { ...n, data: { ...n.data, ...data } } : n))
                    )
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Logs Panel ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {logsPanelOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 200, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                background: '#0a0a14',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                overflow: 'hidden',
              }}
            >
              <LogsPanel logs={executionLogs} onClear={clearResults} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Toolbar Button Style Helper ────────────────────────────────────────────
function toolbarButtonStyle(color: string): React.CSSProperties {
  return {
    padding: '6px 12px',
    background: `${color}15`,
    color: color,
    border: `1px solid ${color}30`,
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 600,
    transition: 'all 150ms ease',
    whiteSpace: 'nowrap' as const,
  }
}

// ─── Exported Wrapper (provides ReactFlowProvider) ──────────────────────────
const WorkflowCanvas: React.FC = () => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner />
    </ReactFlowProvider>
  )
}

export default WorkflowCanvas
