import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface MarketplaceItem {
  id: string;
  seller_id: string;
  item_name: string;
  description: string;
  item_type: string;
  price: number;
  download_url: string;
  preview_url: string;
  status: string;
  reviews: MarketplaceReview[];
}

interface MarketplaceReview {
  id: string;
  item_id: string;
  reviewer_id: string;
  rating: number;
  review_text: string;
}

const Marketplace: React.FC = () => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState('mock_user_123');
  
  // Item creation
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [itemType, setItemType] = useState('model');
  const [price, setPrice] = useState('0');
  
  // Filters
  const [filterType, setFilterType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // Purchase
  const [purchaseAmount, setPurchaseAmount] = useState('');
  
  // Review
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewText, setReviewText] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = 'http://localhost:5000/marketplace/items/?';
      const params = new URLSearchParams();
      if (filterType) params.append('item_type', filterType);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      url += params.toString();
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createItem = async () => {
    if (!itemName || !description || !itemType) {
      alert('Item name, description, and type are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/marketplace/items/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: userId,
          item_name: itemName,
          description,
          item_type: itemType,
          price: parseFloat(price) || 0,
        })
      });
      if (!response.ok) throw new Error('Failed to create item');
      const newItem = await response.json();
      setItems([newItem, ...items]);
      setItemName('');
      setDescription('');
      setPrice('0');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const purchaseItem = async (itemId: string) => {
    if (!purchaseAmount) {
      alert('Please enter purchase amount');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/marketplace/transactions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: itemId,
          buyer_id: userId,
          amount: parseFloat(purchaseAmount)
        })
      });
      if (!response.ok) throw new Error('Failed to purchase item');
      alert('Purchase successful!');
      setPurchaseAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const addReview = async (itemId: string) => {
    if (!reviewRating) {
      alert('Rating is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/marketplace/reviews/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: itemId,
          reviewer_id: userId,
          rating: parseInt(reviewRating),
          review_text: reviewText
        })
      });
      if (!response.ok) throw new Error('Failed to add review');
      alert('Review added!');
      setReviewText('');
      fetchItems(); // Refresh items to show new review
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Shared styles
  const containerStyle: React.CSSProperties = {
    padding: 16,
    maxWidth: 1200,
    margin: '0 auto',
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
    marginBottom: 16,
    display: 'block',
    fontSize: 13,
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 16,
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
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 12,
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
    boxSizing: 'border-box' as const,
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
    boxSizing: 'border-box' as const,
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
    boxSizing: 'border-box' as const,
  };

  const spaceY3: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>AI Marketplace Ecosystem</h1>
      <Link to="/" style={linkStyle}>← Back to Home</Link>
      
      <div style={gridStyle}>
        {/* Create Item */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>List New Item</h2>
          <div style={spaceY3}>
            <input
              type="text"
              style={inputStyle}
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Item name..."
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
            <textarea
              style={textareaStyle}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description..."
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
            <select
              style={selectStyle}
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
            >
              <option value="model" style={{ background: '#12121a', color: '#f1f5f9' }}>AI Model</option>
              <option value="plugin" style={{ background: '#12121a', color: '#f1f5f9' }}>Plugin</option>
              <option value="template" style={{ background: '#12121a', color: '#f1f5f9' }}>Template</option>
              <option value="dataset" style={{ background: '#12121a', color: '#f1f5f9' }}>Dataset</option>
            </select>
            <input
              type="number"
              style={inputStyle}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price (0 = free)..."
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
            <button
              style={{
                width: '100%',
                background: loading || !itemName ? 'rgba(99,102,241,0.4)' : '#6366f1',
                color: '#ffffff',
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #6366f1',
                fontSize: 13,
                fontWeight: 600,
                cursor: loading || !itemName ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                transition: 'all 150ms ease',
              }}
              onClick={createItem}
              disabled={loading || !itemName}
            >
              List Item
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Filters</h2>
          <div style={spaceY3}>
            <select
              style={selectStyle}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="" style={{ background: '#12121a', color: '#f1f5f9' }}>All Types</option>
              <option value="model" style={{ background: '#12121a', color: '#f1f5f9' }}>AI Model</option>
              <option value="plugin" style={{ background: '#12121a', color: '#f1f5f9' }}>Plugin</option>
              <option value="template" style={{ background: '#12121a', color: '#f1f5f9' }}>Template</option>
              <option value="dataset" style={{ background: '#12121a', color: '#f1f5f9' }}>Dataset</option>
            </select>
            <input
              type="number"
              style={inputStyle}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min price..."
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
            <input
              type="number"
              style={inputStyle}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max price..."
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
            <button
              style={{
                width: '100%',
                background: '#10b981',
                color: '#ffffff',
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #10b981',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 150ms ease',
              }}
              onClick={fetchItems}
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Quick Review */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Quick Review</h2>
          <div style={spaceY3}>
            <select
              style={selectStyle}
              value={reviewRating}
              onChange={(e) => setReviewRating(e.target.value)}
            >
              <option value="5" style={{ background: '#12121a', color: '#f1f5f9' }}>5 Stars</option>
              <option value="4" style={{ background: '#12121a', color: '#f1f5f9' }}>4 Stars</option>
              <option value="3" style={{ background: '#12121a', color: '#f1f5f9' }}>3 Stars</option>
              <option value="2" style={{ background: '#12121a', color: '#f1f5f9' }}>2 Stars</option>
              <option value="1" style={{ background: '#12121a', color: '#f1f5f9' }}>1 Star</option>
            </select>
            <textarea
              style={textareaStyle}
              rows={2}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write a review..."
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
            <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Click "Add Review" on any item below</p>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.12)',
          border: '1px solid rgba(239,68,68,0.3)',
          color: '#ef4444',
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {/* Items List */}
      <div style={cardStyle}>
        <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
          Marketplace Items ({items.length})
        </h2>
        {loading && items.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Loading items...</p>
        ) : items.length === 0 ? (
          <p style={{ color: '#64748b' }}>No items yet. List one above!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {items.map(item => (
              <div key={item.id} style={{
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: 16,
                background: 'rgba(255,255,255,0.02)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <h3 style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14, margin: 0 }}>{item.item_name}</h3>
                    <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0 0' }}>{item.description}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 16 }}>
                    <span style={{
                      background: 'rgba(59,130,246,0.12)',
                      color: '#3b82f6',
                      border: '1px solid rgba(59,130,246,0.25)',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}>
                      {item.item_type}
                    </span>
                    <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14 }}>${item.price}</span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      background: item.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)',
                      color: item.status === 'active' ? '#10b981' : '#94a3b8',
                      border: item.status === 'active' ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.1)',
                    }}>
                      {item.status}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  {item.preview_url && (
                    <button
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        color: '#94a3b8',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                      onClick={() => window.open(item.preview_url, '_blank')}
                    >
                      Preview
                    </button>
                  )}
                  {item.download_url && (
                    <button
                      style={{
                        background: 'rgba(139,92,246,0.15)',
                        color: '#a78bfa',
                        border: '1px solid rgba(139,92,246,0.3)',
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                      onClick={() => window.open(item.download_url, '_blank')}
                    >
                      Download
                    </button>
                  )}
                  <button
                    style={{
                      background: 'rgba(16,185,129,0.15)',
                      color: '#10b981',
                      border: '1px solid rgba(16,185,129,0.3)',
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                    onClick={() => purchaseItem(item.id)}
                  >
                    Buy Now
                  </button>
                </div>

                {/* Reviews */}
                {item.reviews && item.reviews.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8, marginTop: 8 }}>
                    <h4 style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, margin: '0 0 4px 0' }}>
                      Reviews ({item.reviews.length})
                    </h4>
                    {item.reviews.map((review, idx) => (
                      <div key={idx} style={{ color: '#64748b', fontSize: 11, marginBottom: 2 }}>
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)} - {review.review_text || 'No comment'}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add Review */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8, marginTop: 8 }}>
                  <button
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#6366f1',
                      cursor: 'pointer',
                      fontSize: 12,
                      padding: 0,
                      fontFamily: 'inherit',
                    }}
                    onClick={() => addReview(item.id)}
                  >
                    Add Review (set rating above)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
