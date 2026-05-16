import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  user_id: string;
  prompt_used: string;
  product_type: string;
  product_url: string;
  status: string;
  iterations: Array<{
    id: string;
    iteration_number: number;
    prompt_used: string;
    product_url: string;
  }>;
  created_at: string;
}

const PromptToProduct: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState('mock_user_123');
  
  // Template creation
  const [templateName, setTemplateName] = useState('');
  const [templateText, setTemplateText] = useState('');
  
  // Product generation
  const [prompt, setPrompt] = useState('');
  const [productType, setProductType] = useState('image');
  
  // Iteration
  const [iterationPrompt, setIterationPrompt] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/prompt-to-product/products/?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async () => {
    if (!templateName || !templateText) {
      alert('Template name and text are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/prompt-to-product/templates/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          name: templateName,
          template: templateText
        })
      });
      if (!response.ok) throw new Error('Failed to create template');
      alert('Template created successfully!');
      setTemplateName('');
      setTemplateText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const generateProduct = async () => {
    if (!prompt) {
      alert('Prompt is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/prompt-to-product/generate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          prompt,
          product_type: productType
        })
      });
      if (!response.ok) throw new Error('Failed to generate product');
      const newProduct = await response.json();
      setProducts([newProduct, ...products]);
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const iterateProduct = async (productId: string) => {
    if (!iterationPrompt) {
      alert('Iteration prompt is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/prompt-to-product/products/${productId}/iterate/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          new_prompt: iterationPrompt
        })
      });
      if (!response.ok) throw new Error('Failed to iterate product');
      fetchProducts(); // Refresh products
      setIterationPrompt('');
      setSelectedProductId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ─── Styles ──────────────────────────────────────────────────────────────────

  const containerStyle: React.CSSProperties = {
    padding: 24,
    maxWidth: 1152,
    margin: '0 auto',
    fontFamily: 'inherit',
  };

  const headingStyle: React.CSSProperties = {
    color: '#f1f5f9',
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 16,
  };

  const linkStyle: React.CSSProperties = {
    color: '#6366f1',
    textDecoration: 'none',
    display: 'block',
    marginBottom: 16,
    fontSize: 13,
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
    marginBottom: 24,
  };

  const cardStyle: React.CSSProperties = {
    background: '#12121a',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 20,
  };

  const cardTitleStyle: React.CSSProperties = {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 16,
  };

  const labelStyle: React.CSSProperties = {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 500,
    display: 'block',
    marginBottom: 8,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
  };

  const selectOptionStyle: React.CSSProperties = {
    background: '#12121a',
    color: '#f1f5f9',
  };

  const createButtonStyle: React.CSSProperties = {
    background: '#6366f1',
    color: '#ffffff',
    border: '1px solid #6366f1',
    borderRadius: 8,
    padding: '10px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 150ms ease',
  };

  const generateButtonStyle: React.CSSProperties = {
    background: 'rgba(16,185,129,0.15)',
    color: '#10b981',
    border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: 8,
    padding: '10px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 150ms ease',
  };

  const errorBoxStyle: React.CSSProperties = {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.25)',
    color: '#ef4444',
    padding: '12px 16px',
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
  };

  const iterationBoxStyle: React.CSSProperties = {
    background: 'rgba(245,158,11,0.08)',
    border: '1px solid rgba(245,158,11,0.2)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  };

  const iterationHeadingStyle: React.CSSProperties = {
    color: '#f1f5f9',
    fontWeight: 600,
    marginBottom: 8,
    fontSize: 14,
  };

  const iterationInputStyle: React.CSSProperties = {
    flex: 1,
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
  };

  const iterateBtnStyle: React.CSSProperties = {
    background: 'rgba(139,92,246,0.15)',
    color: '#8b5cf6',
    border: '1px solid rgba(139,92,246,0.3)',
    borderRadius: 8,
    padding: '10px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  };

  const cancelBtnStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    color: '#94a3b8',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: '10px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  };

  const productsHeadingStyle: React.CSSProperties = {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 16,
  };

  const emptyTextStyle: React.CSSProperties = {
    color: '#64748b',
    fontSize: 13,
  };

  const productCardStyle: React.CSSProperties = {
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    background: '#12121a',
  };

  const productTitleStyle: React.CSSProperties = {
    color: '#f1f5f9',
    fontWeight: 500,
    fontSize: 14,
  };

  const productPromptStyle: React.CSSProperties = {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  };

  const statusBadgeStyle = (status: string): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    background: status === 'completed' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
    color: status === 'completed' ? '#10b981' : '#f59e0b',
    border: `1px solid ${status === 'completed' ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
  });

  const typeBadgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    background: 'rgba(255,255,255,0.05)',
    color: '#94a3b8',
    border: '1px solid rgba(255,255,255,0.1)',
  };

  const viewBtnStyle: React.CSSProperties = {
    background: 'rgba(99,102,241,0.15)',
    color: '#6366f1',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: 6,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  };

  const iterateSmallBtnStyle: React.CSSProperties = {
    background: 'rgba(139,92,246,0.15)',
    color: '#8b5cf6',
    border: '1px solid rgba(139,92,246,0.3)',
    borderRadius: 6,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  };

  const iterationsHeadingStyle: React.CSSProperties = {
    color: '#f1f5f9',
    fontWeight: 500,
    fontSize: 13,
    marginBottom: 8,
  };

  const iterationItemStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 6,
    padding: '8px 12px',
    fontSize: 12,
    color: '#94a3b8',
  };

  const iterationViewLinkStyle: React.CSSProperties = {
    marginLeft: 8,
    color: '#6366f1',
    textDecoration: 'none',
    fontSize: 12,
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Prompt-to-Product</h1>
      <Link to="/" style={linkStyle}>← Back to Home</Link>
      
      <div style={gridStyle}>
        {/* Create Template */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Create Template</h2>
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Template Name:</label>
              <input
                type="text"
                style={inputStyle}
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Cinematic Portrait"
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
            </div>
            <div>
              <label style={labelStyle}>Template (use {'{variable}'} for placeholders):</label>
              <textarea
                style={textareaStyle}
                rows={4}
                value={templateText}
                onChange={(e) => setTemplateText(e.target.value)}
                placeholder="A {style} portrait of {subject} in {lighting} lighting"
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
            </div>
          </div>
          <button
            style={{
              ...createButtonStyle,
              opacity: loading || !templateName || !templateText ? 0.5 : 1,
              cursor: loading || !templateName || !templateText ? 'not-allowed' : 'pointer',
            }}
            onClick={createTemplate}
            disabled={loading || !templateName || !templateText}
          >
            {loading ? 'Creating...' : 'Create Template'}
          </button>
        </div>

        {/* Generate Product */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Generate Product</h2>
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Prompt:</label>
              <textarea
                style={textareaStyle}
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A cinematic portrait of a warrior in neon lighting"
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
            </div>
            <div>
              <label style={labelStyle}>Product Type:</label>
              <select
                style={selectStyle}
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
              >
                <option value="image" style={selectOptionStyle}>Image</option>
                <option value="video" style={selectOptionStyle}>Video</option>
                <option value="3d_model" style={selectOptionStyle}>3D Model</option>
              </select>
            </div>
          </div>
          <button
            style={{
              ...generateButtonStyle,
              opacity: loading || !prompt ? 0.5 : 1,
              cursor: loading || !prompt ? 'not-allowed' : 'pointer',
            }}
            onClick={generateProduct}
            disabled={loading || !prompt}
          >
            {loading ? 'Generating...' : 'Generate Product'}
          </button>
        </div>
      </div>

      {error && <div style={errorBoxStyle}>{error}</div>}

      {/* Iterate Product */}
      {selectedProductId && (
        <div style={iterationBoxStyle}>
          <h3 style={iterationHeadingStyle}>Iterate on Product</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              style={iterationInputStyle}
              value={iterationPrompt}
              onChange={(e) => setIterationPrompt(e.target.value)}
              placeholder="New prompt for iteration..."
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
            <button
              style={{
                ...iterateBtnStyle,
                opacity: !iterationPrompt ? 0.5 : 1,
                cursor: !iterationPrompt ? 'not-allowed' : 'pointer',
              }}
              onClick={() => iterateProduct(selectedProductId)}
              disabled={!iterationPrompt}
            >
              Iterate
            </button>
            <button
              style={cancelBtnStyle}
              onClick={() => setSelectedProductId(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={cardStyle}>
        <h2 style={productsHeadingStyle}>Your Products</h2>
        {loading && products.length === 0 ? (
          <p style={emptyTextStyle}>Loading products...</p>
        ) : products.length === 0 ? (
          <p style={emptyTextStyle}>No products yet. Generate one above!</p>
        ) : (
          <div>
            {products.map(product => (
              <div key={product.id} style={{ ...productCardStyle, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <h3 style={productTitleStyle}>Product {product.id.substring(0, 8)}...</h3>
                    <p style={productPromptStyle}>{product.prompt_used}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={statusBadgeStyle(product.status)}>
                      {product.status}
                    </span>
                    <span style={typeBadgeStyle}>{product.product_type}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button
                    style={viewBtnStyle}
                    onClick={() => window.open(product.product_url, '_blank')}
                  >
                    View Product
                  </button>
                  <button
                    style={iterateSmallBtnStyle}
                    onClick={() => setSelectedProductId(product.id)}
                  >
                    + Iterate
                  </button>
                </div>
                {product.iterations.length > 0 && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <h4 style={iterationsHeadingStyle}>Iterations ({product.iterations.length})</h4>
                    <div>
                      {product.iterations.map(iter => (
                        <div key={iter.id} style={{ ...iterationItemStyle, marginBottom: 8 }}>
                          <span style={{ color: '#f1f5f9', fontWeight: 500 }}>v{iter.iteration_number}:</span> {iter.prompt_used}
                          <span
                            style={iterationViewLinkStyle}
                            onClick={() => window.open(iter.product_url, '_blank')}
                          >
                            View
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptToProduct;
