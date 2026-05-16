import React, { useState } from 'react';
import { StyleDNA as StyleDNAType, StyleMutation as StyleMutationType } from './types';

const StyleGenomeVisualizer: React.FC = () => {
  const [dna, setDna] = useState<StyleDNAType>({
    id: 1,
    user_id: 'user_123',
    style_fingerprint: {
      color_palette: ['#ff0000', '#00ff00', '#0000ff'],
      brush_behavior: 'smooth',
      composition_rhythm: 'balanced',
      texture_preference: 'soft'
    },
    created_at: new Date(),
    updated_at: new Date()
  });
  
  const [mutations] = useState<StyleMutationType[]>([
    { 
      id: 1, user_id: 'user_123', 
      original_dna: { brush_behavior: 'smooth' }, 
      mutated_dna: { brush_behavior: 'textured' }, 
      mutation_type: 'random',
      created_at: new Date()
    }
  ]);

  const [newTrait, setNewTrait] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAddTrait = () => {
    if (!newTrait || !newValue) return;
    const updatedFingerprint = { ...dna.style_fingerprint, [newTrait]: newValue };
    setDna({ ...dna, style_fingerprint: updatedFingerprint });
    setNewTrait('');
    setNewValue('');
  };

  const handleMutate = (type: string) => {
    alert(`Mock: Triggering ${type} mutation on style DNA`);
    // In production: call POST /style-genome/mutate/ endpoint
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Style Genome Visualizer</h2>
      
      {/* Current DNA Display */}
      <div style={{ 
        padding: '20px', 
        border: '2px solid #6f42c1', 
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#6f42c1', marginTop: 0 }}>Your Style DNA</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          {Object.entries(dna.style_fingerprint).map(([key, value]) => (
            <div key={key} style={{ 
              padding: '15px', 
              background: 'white', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontWeight: 'bold', color: '#495057', marginBottom: '5px' }}>{key}</div>
              <div style={{ color: '#6c757d' }}>
                {Array.isArray(value) ? (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {value.map((v: string, i: number) => (
                      <div key={i} style={{ 
                        width: '20px', 
                        height: '20px', 
                        background: v, 
                        borderRadius: '4px',
                        border: '1px solid #dee2e6'
                      }} />
                    ))}
                  </div>
                ) : (
                  <span>{String(value)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Trait */}
      <div style={{ 
        padding: '15px', 
        border: '1px solid #dee2e6', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h4>Add New Style Trait</h4>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Trait name (e.g., lighting_style)"
            value={newTrait}
            onChange={(e) => setNewTrait(e.target.value)}
            style={{ padding: '8px', flex: 1 }}
          />
          <input
            type="text"
            placeholder="Value (e.g., cinematic)"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            style={{ padding: '8px', flex: 1 }}
          />
          <button 
            onClick={handleAddTrait}
            style={{ 
              padding: '8px 16px', 
              background: '#6f42c1', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add Trait
          </button>
        </div>
      </div>

      {/* Mutation Controls */}
      <div style={{ 
        padding: '15px', 
        border: '1px solid #dee2e6', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h4>Style Mutations</h4>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => handleMutate('random')}
            style={{ 
              padding: '10px 20px', 
              background: '#fd7e14', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🎲 Random Mutation
          </button>
          <button 
            onClick={() => handleMutate('blend')}
            style={{ 
              padding: '10px 20px', 
              background: '#20c997', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🎨 Blend Styles
          </button>
          <button 
            onClick={() => handleMutate('evolve')}
            style={{ 
              padding: '10px 20px', 
              background: '#e83e8c', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🧬 Evolve Style
          </button>
        </div>
      </div>

      {/* Mutation History */}
      <div style={{ 
        padding: '15px', 
        border: '1px solid #dee2e6', 
        borderRadius: '8px'
      }}>
        <h4>Mutation History</h4>
        {mutations.length === 0 ? (
          <p style={{ color: '#6c757d' }}>No mutations yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {mutations.map(m => (
              <div key={m.id} style={{ 
                padding: '10px', 
                background: '#f8f9fa', 
                borderRadius: '6px',
                borderLeft: '4px solid #6f42c1'
              }}>
                <div style={{ fontWeight: 'bold' }}>Type: {m.mutation_type}</div>
                <div style={{ fontSize: '0.9em', color: '#495057', marginTop: '5px' }}>
                  Changed: {JSON.stringify(m.mutated_dna)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StyleGenomeVisualizer;
