import React, { useRef, useCallback, useState } from 'react';
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
  NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import NodePalette from './NodePalette';
import StartNode from './StartNode';
import TextGenNode from './TextGenNode';
import ImageGenNode from './ImageGenNode';
import CanvasNode from './CanvasNode';
import OutputNode from './OutputNode';

// Register custom node types
const nodeTypes: NodeTypes = {
  start: StartNode,
  text_gen: TextGenNode,
  image_gen: ImageGenNode,
  canvas: CanvasNode,
  output: OutputNode
};

// Initial nodes with proper configuration
const initialNodes: Node[] = [
  {
    id: 'start_1',
    type: 'start',
    position: { x: 250, y: 50 },
    data: { 
      label: 'Start Workflow',
      isRunning: false
    }
  }
];

const initialEdges: Edge[] = [];

const WorkflowCanvas: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const onConnect = useCallback(
    (connection: Connection) => {
      // Validate connection
      if (connection.source === connection.target) {
        addLog('Cannot connect node to itself');
        return;
      }
      
      const newEdge = {
        ...connection,
        id: `${connection.source}-${connection.target}`,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#2196F3', strokeWidth: 2 }
      };
      setEdges((eds) => addEdge(newEdge, eds));
      addLog(`Connected ${connection.source} → ${connection.target}`);
    },
    [setEdges, addLog]
  );

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow-type', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow-type');
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });

      const newNode: Node = {
        id: `${type}_${Date.now()}`,
        type: type,
        position,
        data: { 
          label: getNodeLabel(type),
          status: 'idle',
          prompt: type === 'text_gen' ? 'Enter your prompt here...' : 
                 type === 'image_gen' ? 'Describe the image...' : undefined
        }
      };

      setNodes((nds) => [...nds, newNode]);
      addLog(`Added ${type} node`);
    },
    [reactFlowInstance, setNodes, addLog]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // REAL execution engine
  const executeWorkflow = useCallback(async () => {
    setIsExecuting(true);
    setLogs([]);
    addLog('Starting workflow execution...');

    // Find start node
    const startNode = nodes.find(n => n.type === 'start');
    if (!startNode) {
      addLog('ERROR: No start node found!');
      alert('No start node found! Add a Start node first.');
      setIsExecuting(false);
      return;
    }

    // Build execution order from edges (BFS from start)
    const executionOrder: Node[] = [];
    const visited = new Set<string>();
    const queue: string[] = [startNode.id];
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);
      
      const node = nodes.find(n => n.id === currentId);
      if (node && node.type !== 'start') {
        executionOrder.push(node);
      }
      
      // Find outgoing edges
      const outgoingEdges = edges.filter(e => e.source === currentId);
      for (const edge of outgoingEdges) {
        if (edge.target && !visited.has(edge.target)) {
          queue.push(edge.target);
        }
      }
    }

    addLog(`Found ${executionOrder.length} nodes to execute`);

    // Execute nodes in order
    const nodeResults: Record<string, any> = {};
    
    for (const node of executionOrder) {
      addLog(`Executing: ${node.data.label} (${node.type})`);
      
      // Update node status to running
      setNodes(nds => nds.map(n => 
        n.id === node.id ? { ...n, data: { ...n.data, status: 'running' } } : n
      ));

      try {
        let result;
        
        switch (node.type) {
          case 'text_gen':
            result = await executeTextGenNode(node, nodeResults);
            break;
          case 'image_gen':
            result = await executeImageGenNode(node, nodeResults);
            break;
          case 'canvas':
            result = await executeCanvasNode(node, nodeResults);
            break;
          case 'output':
            result = await executeOutputNode(node, nodeResults);
            break;
          default:
            result = { success: true, message: 'Unknown node type' };
        }
        
        nodeResults[node.id] = result;
        
        // Update node status to success
        setNodes(nds => nds.map(n => 
          n.id === node.id ? { 
            ...n, 
            data: { 
              ...n.data, 
              status: 'success',
              result: (result as any).output || (result as any).message,
              imageUrl: (result as any).imageUrl
            } 
          } : n
        ));
        
        addLog(`✓ ${node.data.label} completed`);
        
      } catch (error: any) {
        addLog(`✗ ${node.data.label} failed: ${error.message}`);
        
        // Update node status to error
        setNodes(nds => nds.map(n => 
          n.id === node.id ? { ...n, data: { ...n.data, status: 'error' } } : n
        ));
      }
      
      // Small delay between nodes
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    addLog('Workflow execution completed!');
    setIsExecuting(false);
    alert('Workflow execution completed! Check logs for details.');
  }, [nodes, edges, setNodes, addLog]);

  // Execute Text Generation Node
  const executeTextGenNode = async (node: Node, results: Record<string, any>) => {
    const prompt = node.data.prompt || 'Default prompt';
    
    // Call backend API
    const response = await fetch('http://localhost:5000/prompt-to-product/generate/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'mock_user_123',
        prompt: prompt,
        product_type: 'text'
      })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return {
      success: true,
      output: data.generated_text || data.message || 'Text generated successfully',
      raw: data
    };
  };

  // Execute Image Generation Node
  const executeImageGenNode = async (node: Node, results: Record<string, any>) => {
    const prompt = node.data.prompt || 'A beautiful image';
    
    const response = await fetch('http://localhost:5000/render-preview/generate/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'mock_user_123',
        prompt: prompt,
        width: 512,
        height: 512,
        style: 'cinematic'
      })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return {
      success: true,
      imageUrl: data.image_url || 'https://via.placeholder.com/200x200?text=Generated',
      output: 'Image generated',
      raw: data
    };
  };

  // Execute Canvas Node
  const executeCanvasNode = async (node: Node, results: Record<string, any>) => {
    // Get input from connected nodes
    const incomingEdges = edges.filter(e => e.target === node.id);
    let inputText = '';
    
    for (const edge of incomingEdges) {
      const sourceResult = results[edge.source];
      if (sourceResult?.output) {
        inputText += sourceResult.output + ' ';
      }
    }
    
    // Simulate canvas processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      output: `Canvas processed: ${inputText || 'No input'}`,
      inputText
    };
  };

  // Execute Output Node
  const executeOutputNode = async (node: Node, results: Record<string, any>) => {
    const incomingEdges = edges.filter(e => e.target === node.id);
    let finalOutput = '';
    let imageUrl = '';
    
    for (const edge of incomingEdges) {
      const sourceResult = results[edge.source];
      if (sourceResult?.output) {
        finalOutput += sourceResult.output + '\n';
      }
      if (sourceResult?.imageUrl) {
        imageUrl = sourceResult.imageUrl;
      }
    }
    
    // Update output node data
    setNodes(nds => nds.map(n => 
      n.id === node.id ? { 
        ...n, 
        data: { 
          ...n.data, 
          result: finalOutput || 'No output',
          type: imageUrl ? 'image' : 'text',
          input: finalOutput
        } 
      } : n
    ));
    
    return {
      success: true,
      output: finalOutput || 'Output displayed',
      imageUrl
    };
  };

  return (
    <div style={{ display: 'flex', height: '700px', border: '2px solid #9C27B0', borderRadius: '10px', overflow: 'hidden' }}>
      <NodePalette onDragStart={onDragStart} />
      
      <div ref={reactFlowWrapper} style={{ flex: 1, height: '100%', position: 'relative' }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
          >
            <Controls />
            <MiniMap 
              nodeColor={(node) => {
                switch(node.type) {
                  case 'start': return '#667eea';
                  case 'text_gen': return '#2196F3';
                  case 'image_gen': return '#FF9800';
                  case 'canvas': return '#9C27B0';
                  case 'output': return '#667eea';
                  default: return '#ccc';
                }
              }}
            />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            
            {/* Execute and Clear Buttons */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              zIndex: 10,
              display: 'flex',
              gap: '10px'
            }}>
              <button
                onClick={() => {
                  if (window.confirm('Clear all nodes except Start?')) {
                    setNodes(initialNodes);
                    setEdges([]);
                    setLogs([]);
                  }
                }}
                style={{
                  padding: '10px 20px',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9em',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                ✕ Clear
              </button>
              
              <button
                onClick={executeWorkflow}
                disabled={isExecuting}
                style={{
                  padding: '10px 20px',
                  background: isExecuting ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isExecuting ? 'not-allowed' : 'pointer',
                  fontSize: '0.9em',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                {isExecuting ? 'Executing...' : '▶ Execute Workflow'}
              </button>
            </div>
            
            {/* Log Panel */}
            {logs.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '300px',
                maxHeight: '200px',
                overflowY: 'auto',
                background: 'rgba(0,0,0,0.8)',
                color: '#0f0',
                padding: '10px',
                borderRadius: '6px',
                fontSize: '0.75em',
                fontFamily: 'monospace',
                zIndex: 10
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Execution Logs:</div>
                {logs.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
              </div>
            )}
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
};

const getNodeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'start': 'Start',
    'text_gen': 'Text Generation',
    'image_gen': 'Image Generation',
    'canvas': 'CreativeForge Canvas',
    'output': 'Output'
  };
  return labels[type] || type;
};

export default WorkflowCanvas;
