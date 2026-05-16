import { create } from 'zustand'
import { Node, Edge } from 'reactflow'

interface CanvasState {
  nodes: Node[]
  edges: Edge[]
  selectedNodeId: string | null
  canvasView: {
    zoom: number
    position: { x: number; y: number }
  }
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  addNode: (node: Node) => void
  removeNode: (nodeId: string) => void
  setSelectedNode: (nodeId: string | null) => void
  updateCanvasView: (view: Partial<CanvasState['canvasView']>) => void
}

export const useCanvasStore = create<CanvasState>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  canvasView: {
    zoom: 1,
    position: { x: 0, y: 0 }
  },
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  removeNode: (nodeId) => set((state) => ({
    nodes: state.nodes.filter((n) => n.id !== nodeId),
    edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId)
  })),
  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),
  updateCanvasView: (view) => set((state) => ({
    canvasView: { ...state.canvasView, ...view }
  }))
}))
