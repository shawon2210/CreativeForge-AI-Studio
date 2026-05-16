import React, { useState, useEffect } from 'react';
import { World } from './types';

const WorldDashboard: React.FC = () => {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [newWorldName, setNewWorldName] = useState('');
  const [newWorldDesc, setNewWorldDesc] = useState('');
  const [userId] = useState('user_123'); // Mock user ID

  // Mock fetch for now (replace with real API call when backend is stable)
  useEffect(() => {
    // In production: fetch worlds from backend
    setWorlds([
      { id: 1, name: 'Cyberpunk Neo-Tokyo', description: 'Futuristic metropolis', user_id: userId, created_at: new Date(), updated_at: new Date() }
    ]);
  }, []);

  const handleCreateWorld = async () => {
    if (!newWorldName) return;
    // Mock API call to POST /world-engine/worlds/
    const newWorld: World = {
      id: worlds.length + 1,
      name: newWorldName,
      description: newWorldDesc,
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date()
    };
    setWorlds([...worlds, newWorld]);
    setNewWorldName('');
    setNewWorldDesc('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>World Dashboard</h2>
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Create New World</h3>
        <input
          type="text"
          placeholder="World Name"
          value={newWorldName}
          onChange={(e) => setNewWorldName(e.target.value)}
          style={{ padding: '8px', marginRight: '10px', width: '200px' }}
        />
        <input
          type="text"
          placeholder="Description"
          value={newWorldDesc}
          onChange={(e) => setNewWorldDesc(e.target.value)}
          style={{ padding: '8px', marginRight: '10px', width: '300px' }}
        />
        <button onClick={handleCreateWorld} style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
          Create World
        </button>
      </div>

      <h3>Your Worlds</h3>
      <div style={{ display: 'grid', gap: '15px' }}>
        {worlds.map(world => (
          <div key={world.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
            <h4>{world.name}</h4>
            <p>{world.description}</p>
            <small>Created: {world.created_at.toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorldDashboard;
