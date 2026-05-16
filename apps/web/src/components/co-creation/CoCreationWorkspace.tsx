import React, { useState, useEffect } from 'react';

const CoCreationWorkspace: React.FC = () => {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [preview, setPreview] = useState<{preview_type: string, preview_url: string} | null>(null);
  const [intent, setIntent] = useState<Record<string, string>>({});
  const [sessionId] = useState(1);

  // Mock live prediction as user types
  useEffect(() => {
    if (text.length === 0) {
      setSuggestions([]);
      setPreview(null);
      setIntent({});
      return;
    }

    // Mock suggestions
    const mockSuggestions: Record<string, string[]> = {
      'cyberpunk': ['with neon lights', 'in dystopian city', 'with high-tech implants'],
      'warrior': ['with glowing sword', 'in battle armor', 'with scarred face'],
      'landscape': ['with mountains', 'at sunset', 'with dramatic clouds']
    };

    const lowerText = text.toLowerCase();
    const newSuggestions: string[] = [];
    Object.entries(mockSuggestions).forEach(([keyword, completions]) => {
      if (lowerText.includes(keyword)) {
        completions.forEach(comp => {
          if (!newSuggestions.includes(text + comp)) {
            newSuggestions.push(text + comp);
          }
        });
      }
    });
    setSuggestions(newSuggestions.slice(0, 5));

    // Mock intent prediction
    const predictedIntent: Record<string, string> = {};
    if (lowerText.includes('cyberpunk')) predictedIntent['genre'] = 'cyberpunk';
    if (lowerText.includes('warrior')) predictedIntent['subject'] = 'warrior';
    if (lowerText.includes('cinematic')) predictedIntent['style'] = 'cinematic';
    setIntent(predictedIntent);

    // Mock live preview
    if (text.length > 10) {
      setPreview({
        preview_type: 'mock_image',
        preview_url: `https://mock.example.com/preview?text=${encodeURIComponent(text.slice(0, 20))}`
      });
    } else {
      setPreview(null);
    }
  }, [text]);

  const handleApplySuggestion = (suggestion: string) => {
    setText(suggestion);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>🎨 Live Co-Creation Workspace</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Left: Input Area */}
        <div>
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start typing your creative prompt... (e.g., 'cyberpunk warrior with...')"
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '15px',
                fontSize: '16px',
                border: '2px solid #007bff',
                borderRadius: '10px',
                resize: 'vertical',
                fontFamily: 'monospace'
              }}
            />
            <div style={{ 
              position: 'absolute', 
              bottom: '10px', 
              right: '15px', 
              fontSize: '0.8em', 
              color: '#6c757d' 
            }}>
              {text.length} characters
            </div>
          </div>

          {/* Live Preview */}
          {preview && (
            <div style={{
              padding: '20px',
              border: '2px solid #28a745',
              borderRadius: '10px',
              background: '#f8f9fa',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#28a745', marginTop: 0 }}>Live Preview</h4>
              <div style={{
                width: '100%',
                height: '200px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.2em',
                fontWeight: 'bold'
              }}>
                [Mock Preview] {text.slice(0, 30)}{text.length > 30 ? '...' : ''}
              </div>
              <div style={{ fontSize: '0.9em', color: '#6c757d', marginTop: '10px' }}>
                Type: {preview.preview_type}
              </div>
            </div>
          )}
        </div>

        {/* Right: Suggestions & Intent */}
        <div>
          {/* Predicted Intent */}
          {Object.keys(intent).length > 0 && (
            <div style={{
              padding: '15px',
              border: '1px solid #ffc107',
              borderRadius: '8px',
              background: '#fff3cd',
              marginBottom: '15px'
            }}>
              <h4 style={{ marginTop: 0, color: '#856404' }}>🎯 Predicted Intent</h4>
              {Object.entries(intent).map(([key, value]) => (
                <div key={key} style={{ marginBottom: '5px' }}>
                  <strong>{key}:</strong> <span style={{ color: '#007bff' }}>{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Live Suggestions */}
          <div style={{
            padding: '15px',
            border: '1px solid #dee2e6',
            borderRadius: '8px'
          }}>
            <h4 style={{ marginTop: 0 }}>💡 Live Suggestions</h4>
            {suggestions.length === 0 ? (
              <p style={{ color: '#6c757d', fontStyle: 'italic' }}>Start typing to see suggestions...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {suggestions.map((sug, i) => (
                  <div
                    key={i}
                    onClick={() => handleApplySuggestion(sug)}
                    style={{
                      padding: '10px',
                      background: '#f8f9fa',
                      border: '1px solid #e9ecef',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '0.9em'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e9ecef';
                      e.currentTarget.style.borderColor = '#007bff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8f9fa';
                      e.currentTarget.style.borderColor = '#e9ecef';
                    }}
                  >
                    {sug}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoCreationWorkspace;
