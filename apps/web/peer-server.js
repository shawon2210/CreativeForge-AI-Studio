const { PeerServer } = require('peer')
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())

// Create PeerJS server
const peerServer = PeerServer({
  port: 9000,
  path: '/creativeforge',
  allow_discovery: true
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'CreativeForge WebRTC Signaling' })
})

// Start server
app.listen(9001, () => {
  console.log('Signaling server health check: http://localhost:9001/health')
})

console.log('PeerJS signaling server running on port 9000')
console.log('WebSocket path: /creativeforge')
