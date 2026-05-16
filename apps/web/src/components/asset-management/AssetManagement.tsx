import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Badge, EmptyState, PageHeader, Skeleton } from '../ui';

interface Asset {
  id: string;
  user_id: string;
  filename: string;
  file_url: string;
  file_type: string;
  file_size: number;
  metadata: Record<string, any>;
  tags: Array<{id: string, tag: string}>;
  created_at: string;
}

const AssetManagement: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState('mock_user_123');
  const [filename, setFilename] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('image');
  const [tag, setTag] = useState('');

  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/asset-management/assets/?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch assets');
      const data = await response.json();
      setAssets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const uploadAsset = async () => {
    if (!filename || !fileUrl) {
      alert('Filename and file URL are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/asset-management/assets/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          filename,
          file_url: fileUrl,
          file_type: fileType,
          file_size: 1024,
          metadata: {}
        })
      });
      if (!response.ok) throw new Error('Failed to upload asset');
      const newAsset = await response.json();
      setAssets([newAsset, ...assets]);
      setFilename('');
      setFileUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const addTag = async (assetId: string) => {
    if (!tag) return;
    try {
      const response = await fetch(`http://localhost:5000/asset-management/assets/${assetId}/tags/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({tag})
      });
      if (!response.ok) throw new Error('Failed to add tag');
      fetchAssets();
      setTag('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  return (
    <div style={{ maxWidth: 960 }}>
      <PageHeader title="Asset Management" subtitle="Organize, tag, and collect your creative assets" />

      {/* Upload Section */}
      <Card padding="md" style={{ marginBottom: 24 }}>
        <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Upload New Asset</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
          <Input label="Filename" value={filename} onChange={(e) => setFilename(e.target.value)} placeholder="my-image.png" />
          <Input label="File URL" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." />
          <Select
            label="File Type"
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            options={[
              { value: 'image', label: 'Image' },
              { value: 'video', label: 'Video' },
              { value: 'audio', label: 'Audio' },
              { value: '3d_model', label: '3D Model' },
            ]}
          />
        </div>
        <Button onClick={uploadAsset} disabled={loading || !filename || !fileUrl}>
          {loading ? 'Uploading...' : 'Upload Asset'}
        </Button>
      </Card>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Assets List */}
      <Card padding="md">
        <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Your Assets</h2>
        {loading && assets.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map(i => <Skeleton key={i} height={80} />)}
          </div>
        ) : assets.length === 0 ? (
          <EmptyState icon="📁" title="No assets yet" description="Upload your first asset above to get started." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {assets.map(asset => (
              <div key={asset.id} style={{ background: '#1a1a25', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <h3 style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600 }}>{asset.filename}</h3>
                  <Badge variant="info" size="sm">{asset.file_type}</Badge>
                </div>
                <p style={{ color: '#64748b', fontSize: 12, marginBottom: 8, wordBreak: 'break-all' }}>{asset.file_url}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {asset.tags.map(t => (
                    <span key={t.id} style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{t.tag}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Add tag..."
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag(asset.id)}
                    style={{ flex: 1, minWidth: 120, padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#f1f5f9', fontSize: 12, outline: 'none' }}
                  />
                  <Button variant="secondary" size="sm" onClick={() => addTag(asset.id)} disabled={!tag}>Add Tag</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AssetManagement;
