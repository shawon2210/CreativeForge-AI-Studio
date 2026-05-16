import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'

interface GenerationNodeData {
  label: string
  prompt: string
  status: 'pending' | 'processing' | 'complete' | 'failed'
  resultUrl?: string
}

function GenerationNode({ data }: NodeProps<GenerationNodeData>) {
  return (
    <div style={{
      padding: '10px 16px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      background: data.status === 'complete' ? '#e6f7e9' : data.status === 'failed' ? '#ffebee' : '#fff',
      minWidth: '150px'
    }}>
      <Handle type="target" position={Position.Top} />
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{data.label}</div>
      <div style={{ fontSize: '12px', color: '#666' }}>{data.prompt}</div>
      {data.status === 'pending' && <div style={{ fontSize: '11px', color: '#999' }}>Pending...</div>}
      {data.status === 'processing' && <div style={{ fontSize: '11px', color: '#1890ff' }}>Processing...</div>}
      {data.status === 'complete' && data.resultUrl && (
        <img src={data.resultUrl} alt={data.label} style={{ maxWidth: '200px', marginTop: '8px' }} />
      )}
      {data.status === 'failed' && <div style={{ fontSize: '11px', color: '#ff4d4f' }}>Failed</div>}
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

export default memo(GenerationNode)
