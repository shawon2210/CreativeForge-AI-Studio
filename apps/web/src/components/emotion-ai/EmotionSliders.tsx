import React, { useState } from 'react';

const EMOTIONS = ['happy', 'sad', 'angry', 'nostalgic', 'fear', 'calm'];

interface Props {
  onApply: (emotion: string, intensity: number) => void;
}

const EmotionSliders: React.FC<Props> = ({ onApply }) => {
  const [intensities, setIntensities] = useState<Record<string, number>>(
    Object.fromEntries(EMOTIONS.map(e => [e, 0.5]))
  );
  const [selectedEmotion, setSelectedEmotion] = useState('happy');

  const handleIntensityChange = (emotion: string, value: number) => {
    setIntensities({ ...intensities, [emotion]: value });
  };

  const handleApply = () => {
    onApply(selectedEmotion, intensities[selectedEmotion]);
  };

  return (
    <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px' }}>
      <h3>Emotion Controls</h3>
      <div style={{ marginBottom: '15px' }}>
        <label>Select Emotion: </label>
        <select 
          value={selectedEmotion} 
          onChange={(e) => setSelectedEmotion(e.target.value)}
          style={{ padding: '5px', width: '100%' }}
        >
          {EMOTIONS.map(e => (
            <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Intensity: {intensities[selectedEmotion].toFixed(2)}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={intensities[selectedEmotion]}
          onChange={(e) => handleIntensityChange(selectedEmotion, parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <button 
        onClick={handleApply}
        style={{ 
          padding: '8px 16px', 
          background: '#dc3545', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          width: '100%'
        }}
      >
        Apply {selectedEmotion} (Intensity: {intensities[selectedEmotion].toFixed(2)})
      </button>

      <div style={{ marginTop: '15px', fontSize: '0.9em', color: '#666' }}>
        <strong>Current Settings:</strong>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify({ emotion: selectedEmotion, intensity: intensities[selectedEmotion] }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default EmotionSliders;
