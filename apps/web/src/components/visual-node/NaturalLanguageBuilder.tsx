import React, { useState } from 'react';

const NaturalLanguageBuilder: React.FC<{ onWorkflowGenerated: (data: any) => void }> = ({ onWorkflowGenerated }) => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNodes, setGeneratedNodes] = useState<any[]>([]);
  const [generatedEdges, setGeneratedEdges] = useState<any[]>([]);

  const handleGenerate = () => {
    if (!description) return;
    setIsGenerating(true);
    
    // Mock: Generate nodes based on description
    const lowerDesc = description.toLowerCase();
    const nodes = [];
    const edges = [];
    let nodeId = 1;
    
    if (lowerDesc.includes('prompt') || lowerDesc.includes('text')) {
      nodes.push({
        id: `node_${nodeId}`,
        type: 'prompt',
        position: { x: 100, y: 100 },
        data: { label: 'Prompt Input', config: { prompt: '' } }
      });
      nodeId++;
    }
    
    if (lowerDesc.includes('image') || lowerDesc.includes('gen')) {
      const sourceId = nodes.length > 0 ? nodes[nodes.length - 1].id : null;
      nodes.push({
        id: `node_${nodeId}`,
        type: 'image_gen',
        position: { x: 300, y: 100 },
        data: { label: 'Image Generation', config: { model: 'mock_sd' } }
      });
      if (sourceId) {
        edges.push({
          id: `edge_${edges.length + 1}`,
          source: sourceId,
          target: `node_${nodeId}`,
          sourceHandle: 'output',
          targetHandle: 'input'
        });
      }
      nodeId++;
    }
    
    if (lowerDesc.includes('filter') || lowerDesc.includes('adjust')) {
      const sourceId = nodes.length > 0 ? nodes[nodes.length - 1].id : null;
      nodes.push({
        id: `node_${nodeId}`,
        type: 'filter',
        position: { x: 500, y: 100 },
        data: { label: 'Filter', config: { brightness: 1.0 } }
      });
      if (sourceId) {
        edges.push({
          id: `edge_${edges.length + 1}`,
          source: sourceId,
          target: `node_${nodeId}`,
          sourceHandle: 'output',
          targetHandle: 'input'
        });
      }
      nodeId++;
    }
    
    if (lowerDesc.includes('output') || lowerDesc.includes('save')) {
      const sourceId = nodes.length > 0 ? nodes[nodes.length - 1].id : null;
      nodes.push({
        id: `node_${nodeId}`,
        type: 'output',
        position: { x: 700, y: 100 },
        data: { label: 'Output', config: { format: 'png' } }
      });
      if (sourceId) {
        edges.push({
          id: `edge_${edges.length + 1}`,
          source: sourceId,
          target: `node_${nodeId}`,
          sourceHandle: 'output',
          targetHandle: 'input'
        });
      }
    }
    
    setGeneratedNodes(nodes);
    setGeneratedEdges(edges);
    onWorkflowGenerated({ nodes, edges });
    setIsGenerating(false);
  };

  return (
    <div style={{
      padding: '20px',
      border: '2px solid #9C27B0',
      borderRadius: '10px',
      background: 'white',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h3 style={{ marginTop: 0, color: '#9C27B0' }}>🤖 Natural Language Workflow Builder</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Describe your workflow:
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={"Describe the workflow you want to create...\nExample: 'Create a workflow with prompt input, image generation, filter, and output'"}
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #dee2e6',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={!description || isGenerating}
        style={{
          padding: '10px 20px',
          background: isGenerating ? '#ccc' : '#9C27B0',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: isGenerating ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          fontSize: '16px',
          width: '100%'
        }}
      >
        {isGenerating ? 'Generating...' : '🚀 Generate Workflow'}
      </button>

      {generatedNodes.length > 0 && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#f3e5f5', borderRadius: '8px' }}>
          <h4 style={{ marginTop: 0, color: '#9C27B0' }}>Generated Workflow</h4>
          <div style={{ fontSize: '0.9em' }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>Nodes ({generatedNodes.length}):</strong>
              <div style={{ marginTop: '5px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {generatedNodes.map(node => (
                  <span key={node.id} style={{
                    padding: '4px 8px',
                    background: '#9C27B0',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '0.8em'
                  }}>
                    {node.data.label}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <strong>Connections ({generatedEdges.length}):</strong>
              <div style={{ marginTop: '5px', fontSize: '0.8em', color: '#6c757d' }}>
                {generatedEdges.length > 0 ? `${generatedEdges.length} connection(s) created` : 'No connections'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NaturalLanguageBuilder;
