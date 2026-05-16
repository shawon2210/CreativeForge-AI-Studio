import React, { useState } from 'react';

interface OSModule {
  id: number;
  name: string;
  module_type: string;
  description: string;
  is_enabled: boolean;
}

const OSDashboard: React.FC = () => {
  const [modules, setModules] = useState<OSModule[]>([
    { id: 1, name: 'AI Studio', module_type: 'studio', description: 'Core creative studio', is_enabled: true },
    { id: 2, name: 'AI Chat', module_type: 'chat', description: 'AI chat interface', is_enabled: true },
    { id: 3, name: 'AI Research', module_type: 'research', description: 'Research assistant', is_enabled: false },
    { id: 4, name: 'AI Asset Manager', module_type: 'asset_manager', description: 'Asset management', is_enabled: true },
    { id: 5, name: 'AI Workflow Builder', module_type: 'workflow', description: 'Visual workflow builder', is_enabled: true },
    { id: 6, name: 'AI Story Engine', module_type: 'story', description: 'Story generation', is_enabled: false },
    { id: 7, name: 'AI Team Collaboration', module_type: 'team', description: 'Team tools', is_enabled: true },
    { id: 8, name: 'AI Voice Studio', module_type: 'voice', description: 'Voice generation', is_enabled: false }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [projects] = useState<string[]>(['Project Alpha', 'Project Beta', 'Project Gamma']);

  const handleToggleModule = (moduleId: number) => {
    setModules(modules.map(m => 
      m.id === moduleId ? { ...m, is_enabled: !m.is_enabled } : m
    ));
  };

  const handleSearch = () => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    // Mock search
    setSearchResults([
      `Mock result 1 for "${searchQuery}"`,
      `Mock result 2 for "${searchQuery}"`,
      `Mock result 3 for "${searchQuery}"`
    ]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>🖥️ AI Creative Operating System</h2>
      <p style={{ color: '#6c757d', marginBottom: '30px' }}>
        Unified creative workspace with shared memory, embeddings, and projects across all modules.
      </p>

      {/* Modules Grid */}
      <div style={{ marginBottom: '30px' }}>
        <h3>OS Modules</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '15px' 
        }}>
          {modules.map(module => (
            <div 
              key={module.id}
              style={{
                padding: '20px',
                border: `2px solid ${module.is_enabled ? '#28a745' : '#dc3545'}`,
                borderRadius: '10px',
                background: module.is_enabled ? '#f8f9fa' : '#f8f9fa',
                opacity: module.is_enabled ? 1 : 0.6,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0 }}>{module.name}</h4>
                <div style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  background: module.is_enabled ? '#28a745' : '#dc3545',
                  color: 'white',
                  fontSize: '0.8em',
                  fontWeight: 'bold'
                }}>
                  {module.is_enabled ? 'ENABLED' : 'DISABLED'}
                </div>
              </div>
              <p style={{ fontSize: '0.9em', color: '#6c757d', marginBottom: '15px' }}>
                {module.description}
              </p>
              <button
                onClick={() => handleToggleModule(module.id)}
                style={{
                  padding: '8px 16px',
                  background: module.is_enabled ? '#dc3545' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  width: '100%'
                }}
              >
                {module.is_enabled ? '🔴 Disable' : '🟢 Enable'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Shared Memory Search */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #dee2e6', borderRadius: '10px' }}>
        <h3>🔍 Shared Memory Search</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Search across all modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ced4da' }}
          />
          <button 
            onClick={handleSearch}
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
            Search
          </button>
        </div>
        {searchResults.length > 0 && (
          <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '6px' }}>
            <strong>Results:</strong>
            {searchResults.map((result, i) => (
              <div key={i} style={{ padding: '5px 0', fontSize: '0.9em' }}>{result}</div>
            ))}
          </div>
        )}
      </div>

      {/* Shared Projects */}
      <div style={{ padding: '20px', border: '1px solid #dee2e6', borderRadius: '10px' }}>
        <h3>📁 Shared Projects</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {projects.map((project, i) => (
            <div key={i} style={{
              padding: '10px 15px',
              background: '#e9ecef',
              borderRadius: '6px',
              fontSize: '0.9em',
              fontWeight: 'bold'
            }}>
              📊 {project}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OSDashboard;
