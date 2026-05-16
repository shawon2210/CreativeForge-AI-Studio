import React, { useState } from 'react';
import { Character } from './types';

interface Props {
  worldId: number;
}

const CharacterManager: React.FC<Props> = ({ worldId }) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [newCharName, setNewCharName] = useState('');
  const [newCharDesc, setNewCharDesc] = useState('');
  const [newCharTraits, setNewCharTraits] = useState('{}');
  const [userId] = useState('user_123');

  // Mock fetch characters
  useState(() => {
    setCharacters([
      { id: 1, name: 'Neo', description: 'Protagonist', traits: { hair: 'black', eyes: 'blue' }, world_id: worldId, user_id: userId, created_at: new Date(), updated_at: new Date() }
    ]);
  });

  const handleAddCharacter = () => {
    if (!newCharName) return;
    let traits = {};
    try {
      traits = JSON.parse(newCharTraits);
    } catch (e) {
      alert('Invalid JSON for traits');
      return;
    }
    const newChar: Character = {
      id: characters.length + 1,
      name: newCharName,
      description: newCharDesc,
      traits,
      world_id: worldId,
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date()
    };
    setCharacters([...characters, newChar]);
    setNewCharName('');
    setNewCharDesc('');
    setNewCharTraits('{}');
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginTop: '20px' }}>
      <h3>Character Manager (World ID: {worldId})</h3>
      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Character Name"
          value={newCharName}
          onChange={(e) => setNewCharName(e.target.value)}
          style={{ padding: '8px', marginRight: '10px', width: '150px' }}
        />
        <input
          type="text"
          placeholder="Description"
          value={newCharDesc}
          onChange={(e) => setNewCharDesc(e.target.value)}
          style={{ padding: '8px', marginRight: '10px', width: '250px' }}
        />
        <input
          type="text"
          placeholder='Traits (JSON e.g. {"hair": "black"})'
          value={newCharTraits}
          onChange={(e) => setNewCharTraits(e.target.value)}
          style={{ padding: '8px', marginRight: '10px', width: '300px' }}
        />
        <button onClick={handleAddCharacter} style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
          Add Character
        </button>
      </div>

      <h4>Characters</h4>
      <div style={{ display: 'grid', gap: '10px' }}>
        {characters.map(char => (
          <div key={char.id} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
            <strong>{char.name}</strong> - {char.description}
            <div style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
              Traits: {JSON.stringify(char.traits)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterManager;
