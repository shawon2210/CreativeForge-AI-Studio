import { useEffect, useRef, useState, useCallback } from 'react'
import Peer from 'peerjs'
import { Node, Edge } from 'reactflow'

interface PeerConnection {
  peerId: string
  connection: any
  cursor: { x: number; y: number }
  userName: string
}

interface CollaborationState {
  isConnected: boolean
  peers: PeerConnection[]
  localPeerId: string | null
  userName: string
}

export function useWebRTCCollaboration() {
  const [collabState, setCollabState] = useState<CollaborationState>({
    isConnected: false,
    peers: [],
    localPeerId: null,
    userName: `User-${Math.floor(Math.random() * 1000)}`
  })
  
  const peerRef = useRef<Peer | null>(null)
  const connectionsRef = useRef<Map<string, any>>(new Map())
  
  // Initialize Peer connection
  const initializePeer = useCallback((userName: string) => {
    const peer = new Peer({
      host: 'localhost',
      port: 9000,
      path: '/creativeforge'
    })
    
    peer.on('open', (id) => {
      console.log('My peer ID is:', id)
      setCollabState(prev => ({
        ...prev,
        isConnected: true,
        localPeerId: id,
        userName
      }))
    })
    
    peer.on('connection', (conn) => {
      console.log('Incoming connection from:', conn.peer)
      handleConnection(conn)
    })
    
    peer.on('error', (err) => {
      console.error('Peer error:', err)
    })
    
    peerRef.current = peer
  }, [])
  
  // Handle incoming connection
  const handleConnection = useCallback((conn: any) => {
    conn.on('data', (data: any) => {
      console.log('Received data:', data)
      handleIncomingData(data)
    })
    
    conn.on('close', () => {
      console.log('Connection closed:', conn.peer)
      removePeer(conn.peer)
    })
    
    // Store connection
    connectionsRef.current.set(conn.peer, conn)
    
    setCollabState(prev => ({
      ...prev,
      peers: [...prev.peers, {
        peerId: conn.peer,
        connection: conn,
        cursor: { x: 0, y: 0 },
        userName: `Peer-${conn.peer.slice(0, 4)}`
      }]
    }))
  }, [])
  
  // Handle incoming data
  const handleIncomingData = useCallback((data: any) => {
    switch (data.type) {
      case 'canvas_update':
        // Update local canvas with received nodes/edges
        console.log('Canvas update from peer:', data)
        break
      case 'cursor_move':
        // Update peer cursor position
        updatePeerCursor(data.peerId, data.cursor)
        break
      case 'node_added':
        console.log('Node added by peer:', data.node)
        break
      case 'node_deleted':
        console.log('Node deleted by peer:', data.nodeId)
        break
    }
  }, [])
  
  // Update peer cursor position
  const updatePeerCursor = useCallback((peerId: string, cursor: { x: number; y: number }) => {
    setCollabState(prev => ({
      ...prev,
      peers: prev.peers.map(p => 
        p.peerId === peerId ? { ...p, cursor } : p
      )
    }))
  }, [])
  
  // Remove peer
  const removePeer = useCallback((peerId: string) => {
    connectionsRef.current.delete(peerId)
    setCollabState(prev => ({
      ...prev,
      peers: prev.peers.filter(p => p.peerId !== peerId)
    }))
  }, [])
  
  // Connect to another peer
  const connectToPeer = useCallback((peerId: string) => {
    if (!peerRef.current) return
    
    const conn = peerRef.current.connect(peerId)
    handleConnection(conn)
  }, [handleConnection])
  
  // Broadcast canvas update to all peers
  const broadcastCanvasUpdate = useCallback((nodes: Node[], edges: Edge[]) => {
    const data = {
      type: 'canvas_update',
      nodes,
      edges,
      sender: collabState.localPeerId
    }
    
    connectionsRef.current.forEach((conn) => {
      conn.send(data)
    })
  }, [collabState.localPeerId])
  
  // Broadcast cursor position
  const broadcastCursor = useCallback((x: number, y: number) => {
    const data = {
      type: 'cursor_move',
      cursor: { x, y },
      peerId: collabState.localPeerId
    }
    
    connectionsRef.current.forEach((conn) => {
      conn.send(data)
    })
  }, [collabState.localPeerId])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy()
      }
    }
  }, [])
  
  return {
    collabState,
    initializePeer,
    connectToPeer,
    broadcastCanvasUpdate,
    broadcastCursor
  }
}
