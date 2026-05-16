import React, { useState } from 'react';

interface Agent {
  id: number;
  name: string;
  agent_type: string;
  capabilities: string[];
  status: string;
}

const AgentDashboard: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([
    { id: 1, name: 'Creative Director', agent_type: 'director', capabilities: ['cinematic_analysis', 'prompt_enhancement'], status: 'idle' },
    { id: 2, name: 'Story Writer', agent_type: 'writer', capabilities: ['storytelling', 'narrative_analysis'], status: 'idle' },
    { id: 3, name: 'Visual Designer', agent_type: 'visual', capabilities: ['color_analysis', 'composition'], status: 'busy' },
    { id: 4, name: 'Lighting Expert', agent_type: 'lighting', capabilities: ['lighting_setup', 'mood_lighting'], status: 'idle' },
    { id: 5, name: 'Consistency Checker', agent_type: 'consistency', capabilities: ['continuity_check', 'style_validation'], status: 'idle' },
    { id: 6, name: 'Prompt Engineer', agent_type: 'prompt_engineer', capabilities: ['prompt_optimization', 'keyword_extraction'], status: 'idle' }
  ]);

  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [taskType, setTaskType] = useState('analyze');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return '#28a745';
      case 'busy': return '#ffc107';
      case 'offline': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const handleSendMessage = () => {
    if (!selectedAgent || !message) return;
    alert(`Mock: Sending message to agent ${selectedAgent}: ${message}`);
    setMessage('');
  };

  const handleCreateTask = () => {
    if (!selectedAgent) return;
    alert(`Mock: Creating ${taskType} task for agent ${selectedAgent}`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>🤖 Multi-Agent Collaboration Dashboard</h2>
      
      {/* Agent Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '15px',
        marginBottom: '30px'
      }}>
        {agents.map(agent => (
          <div 
            key={agent.id}
            onClick={() => setSelectedAgent(agent.id)}
            style={{
              padding: '20px',
              border: selectedAgent === agent.id ? '3px solid #007bff' : '1px solid #dee2e6',
              borderRadius: '10px',
              background: selectedAgent === agent.id ? '#f8f9fa' : 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: selectedAgent === agent.id ? '0 4px 8px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0 }}>{agent.name}</h4>
              <div style={{
                padding: '4px 8px',
                borderRadius: '12px',
                background: getStatusColor(agent.status),
                color: 'white',
                fontSize: '0.8em',
                fontWeight: 'bold'
              }}>
                {agent.status}
              </div>
            </div>
            <div style={{ fontSize: '0.9em', color: '#6c757d' }}>
              <strong>Type:</strong> {agent.agent_type}
            </div>
            <div style={{ marginTop: '10px' }}>
              <strong style={{ fontSize: '0.9em' }}>Capabilities:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                {agent.capabilities.map(cap => (
                  <span key={cap} style={{
                    padding: '3px 8px',
                    background: '#e9ecef',
                    borderRadius: '4px',
                    fontSize: '0.8em'
                  }}>
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interaction Panel */}
      {selectedAgent && (
        <div style={{ 
          padding: '20px', 
          border: '2px solid #007bff', 
          borderRadius: '10px',
          background: '#f8f9fa'
        }}>
          <h3>Agent #{selectedAgent} Interaction</h3>
          
          {/* Send Message */}
          <div style={{ marginBottom: '20px' }}>
            <h4>Send Message</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ced4da' }}
              />
              <button 
                onClick={handleSendMessage}
                style={{
                  padding: '10px 20px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Send Message
              </button>
            </div>
          </div>

          {/* Create Task */}
          <div>
            <h4>Create Task</h4>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label>Task Type:</label>
              <select 
                value={taskType} 
                onChange={(e) => setTaskType(e.target.value)}
                style={{ padding: '8px', borderRadius: '6px' }}
              >
                <option value="analyze">Analyze</option>
                <option value="generate">Generate</option>
                <option value="validate">Validate</option>
                <option value="enhance">Enhance</option>
              </select>
              <button 
                onClick={handleCreateTask}
                style={{
                  padding: '8px 16px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
