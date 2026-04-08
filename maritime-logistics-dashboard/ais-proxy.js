/**
 * AISStream WebSocket Proxy Server
 *
 * AISStream.io does not support browser CORS / direct browser WebSocket.
 * This lightweight proxy sits between your frontend and AISStream:
 *
 *   Browser  ──ws://localhost:3001──▶  This Proxy  ──wss://stream.aisstream.io──▶  AISStream
 *
 * Usage:
 *   node ais-proxy.js
 *
 * Environment:
 *   AISSTREAM_API_KEY  — your AISStream API key (falls back to VITE_AISSTREAM_API_KEY)
 *   AIS_PROXY_PORT     — listen port (default 3001)
 */

import { WebSocketServer, WebSocket } from 'ws'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── Config ──────────────────────────────────────────────────────────────────

function loadApiKey() {
  // 1. From env
  if (process.env.AISSTREAM_API_KEY) return process.env.AISSTREAM_API_KEY
  if (process.env.VITE_AISSTREAM_API_KEY) return process.env.VITE_AISSTREAM_API_KEY

  // 2. From .env file
  try {
    const envContent = readFileSync(resolve(__dirname, '.env'), 'utf-8')
    const match = envContent.match(/^VITE_AISSTREAM_API_KEY=(.+)$/m)
    if (match) return match[1].trim()
  } catch { /* ignore */ }

  return null
}

const API_KEY = loadApiKey()
const PORT = parseInt(process.env.AIS_PROXY_PORT || '3099', 10)
const AISSTREAM_URL = 'wss://stream.aisstream.io/v0/stream'

if (!API_KEY) {
  console.error('❌ No API key found. Set AISSTREAM_API_KEY or create .env with VITE_AISSTREAM_API_KEY')
  process.exit(1)
}

console.log(`🚀 AIS Proxy starting on port ${PORT}`)
console.log(`   API Key: ${API_KEY.slice(0, 8)}...${API_KEY.slice(-4)}`)

// ─── Upstream AISStream connection (shared singleton) ────────────────────────

let upstream = null
let upstreamReady = false
const clients = new Set()
let reconnectTimer = null
let reconnectAttempts = 0
const MAX_RECONNECT = 10
const RECONNECT_DELAY = 5000

function connectUpstream() {
  if (upstream && (upstream.readyState === WebSocket.CONNECTING || upstream.readyState === WebSocket.OPEN)) {
    return
  }

  console.log('📡 Connecting to AISStream.io...')
  upstream = new WebSocket(AISSTREAM_URL)

  const connectTimeout = setTimeout(() => {
    if (upstream && upstream.readyState !== WebSocket.OPEN) {
      console.warn('⏱️ AISStream connection timeout')
      upstream.terminate()
    }
  }, 10000)

  upstream.on('open', () => {
    clearTimeout(connectTimeout)
    reconnectAttempts = 0
    console.log('✅ Connected to AISStream.io')

    // Send subscription with correct field name
    const subscription = {
      APIKey: API_KEY,
      BoundingBoxes: [
        [[-60, -180], [70, -60]],   // Americas
        [[0, 100], [70, 180]]       // Asia-Pacific
      ],
      FilterMessageTypes: ['PositionReport']
    }
    upstream.send(JSON.stringify(subscription))
    upstreamReady = true
    console.log('📨 Subscription sent')
  })

  upstream.on('message', (data) => {
    // Broadcast to all connected browser clients
    const msg = data.toString()
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg)
      }
    }
  })

  upstream.on('error', (err) => {
    clearTimeout(connectTimeout)
    console.error('❌ AISStream error:', err.message)
  })

  upstream.on('close', (code) => {
    clearTimeout(connectTimeout)
    upstreamReady = false
    console.warn(`🔌 AISStream closed (code: ${code})`)

    if (clients.size > 0 && reconnectAttempts < MAX_RECONNECT) {
      reconnectAttempts++
      console.log(`🔄 Reconnecting in ${RECONNECT_DELAY / 1000}s (attempt ${reconnectAttempts}/${MAX_RECONNECT})...`)
      reconnectTimer = setTimeout(connectUpstream, RECONNECT_DELAY)
    }
  })
}

// ─── Local WebSocket Server (for browser clients) ────────────────────────────

const wss = new WebSocketServer({ port: PORT })

wss.on('listening', () => {
  console.log(`✅ AIS Proxy listening on ws://localhost:${PORT}`)
  console.log(`   Frontend should connect to: ws://localhost:${PORT}`)
})

wss.on('connection', (ws, req) => {
  const origin = req.headers.origin || 'unknown'
  console.log(`👤 Client connected (origin: ${origin}, total: ${clients.size + 1})`)
  clients.add(ws)

  // Connect upstream if not already
  if (!upstreamReady) {
    connectUpstream()
  }

  // Client can optionally send custom subscription (BoundingBoxes override)
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString())
      // If client sends BoundingBoxes, re-subscribe upstream
      if (msg.BoundingBoxes && upstream && upstream.readyState === WebSocket.OPEN) {
        const newSub = {
          APIKey: API_KEY,
          BoundingBoxes: msg.BoundingBoxes,
          FilterMessageTypes: msg.FilterMessageTypes || ['PositionReport'],
          ...(msg.FiltersShipMMSI ? { FiltersShipMMSI: msg.FiltersShipMMSI } : {})
        }
        upstream.send(JSON.stringify(newSub))
        console.log('📨 Re-subscribed with client BoundingBoxes')
      }
    } catch { /* ignore non-JSON */ }
  })

  ws.on('close', () => {
    clients.delete(ws)
    console.log(`👤 Client disconnected (remaining: ${clients.size})`)

    // If no clients, close upstream after a grace period
    if (clients.size === 0) {
      setTimeout(() => {
        if (clients.size === 0 && upstream) {
          console.log('💤 No clients — closing upstream connection')
          clearTimeout(reconnectTimer)
          upstream.close()
          upstream = null
          upstreamReady = false
        }
      }, 30000)
    }
  })

  ws.on('error', (err) => {
    console.error('Client WS error:', err.message)
    clients.delete(ws)
  })
})

// ─── Graceful shutdown ───────────────────────────────────────────────────────

function shutdown() {
  console.log('\n🛑 Shutting down...')
  clearTimeout(reconnectTimer)
  if (upstream) upstream.close()
  wss.close()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
