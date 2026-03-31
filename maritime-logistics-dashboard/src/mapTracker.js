// Maritime Vessel Tracking Map Module
// Data source: AISStream.io (free WebSocket API) with Mock fallback
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Port coordinates database
const PORTS = {
  Shanghai: { lat: 31.2304, lng: 121.4737, name: 'Shanghai, China' },
  Mumbai: { lat: 18.9388, lng: 72.8354, name: 'Mumbai, India' },
  Rotterdam: { lat: 51.9225, lng: 4.4792, name: 'Rotterdam, Netherlands' },
  PrinceRupert: { lat: 54.3150, lng: -130.3208, name: 'Prince Rupert, Canada' },
  Vancouver: { lat: 49.2827, lng: -123.1207, name: 'Vancouver, Canada' },
  LA: { lat: 33.7405, lng: -118.2713, name: 'Los Angeles, USA' },
  Halifax: { lat: 44.6488, lng: -63.5752, name: 'Halifax, Canada' },
  Montreal: { lat: 45.5017, lng: -73.5673, name: 'Montreal, Canada' },
  Toronto: { lat: 43.6532, lng: -79.3832, name: 'Toronto, Canada' },
  Chicago: { lat: 41.8781, lng: -87.6298, name: 'Chicago, USA' },
  Memphis: { lat: 35.1495, lng: -90.0490, name: 'Memphis, USA' }
}

// Fallback mock data (used when API key not configured)
const MOCK_VESSELS = [
  {
    id: 'MSC-OSCAR-001',
    name: 'MSC OSCAR',
    type: 'container',
    position: { lat: 35.5, lng: -145.2 },
    heading: 270,
    speed: 18.5,
    status: 'In Transit',
    route: { from: 'Shanghai', to: 'Vancouver', via: 'Pacific' },
    eta: '2026-04-20T14:30:00Z',
    cargo: '12,000 TEU',
    source: 'mock'
  },
  {
    id: 'MAERSK-ESSEN-002',
    name: 'MAERSK ESSEN',
    type: 'container',
    position: { lat: 49.1, lng: -123.5 },
    heading: 90,
    speed: 2.1,
    status: 'Port Delay',
    route: { from: 'Shanghai', to: 'LA', via: 'Vancouver' },
    eta: '2026-04-18T08:00:00Z',
    cargo: '8,500 TEU',
    source: 'mock'
  },
  {
    id: 'OOCL-HONGKONG-003',
    name: 'OOCL HONG KONG',
    type: 'container',
    position: { lat: 40.2, lng: 160.8 },
    heading: 285,
    speed: 21.3,
    status: 'In Transit',
    route: { from: 'Shanghai', to: 'PrinceRupert', via: 'Pacific' },
    eta: '2026-04-19T06:00:00Z',
    cargo: '21,400 TEU',
    source: 'mock'
  }
]

const AISSTREAM_WS_URL = 'wss://stream.aisstream.io/v0/stream'
const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAY_MS = 3000
const MAX_AIS_VESSELS = 50 // limit markers on map

class MaritimeTracker {
  constructor(containerId) {
    this.containerId = containerId
    this.map = null
    this.vesselMarkers = new Map()
    this.routeLines = new Map()
    this.portMarkers = new Map()
    this.updateInterval = null
    this.ws = null
    this.wsReconnectCount = 0
    this.usingRealData = false
    this.statusBadge = null
  }

  initialize() {
    const container = document.getElementById(this.containerId)
    if (!container) {
      console.error(`Container ${this.containerId} not found`)
      return
    }

    // Initialize Leaflet map centered on Pacific Ocean
    this.map = L.map(this.containerId, {
      center: [35, -140],
      zoom: 3,
      minZoom: 2,
      maxZoom: 10,
      zoomControl: true
    })

    // Dark mode tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map)

    this._addStatusBadge()
    this.renderPorts()

    const apiKey = this._getApiKey()
    if (apiKey) {
      this._connectAISStream(apiKey)
    } else {
      console.warn('MapTracker: VITE_AISSTREAM_API_KEY not set — using mock data')
      this._showMockBadge()
      this.renderVessels()
      this.renderRoutes()
      this.updateInterval = setInterval(() => this.updateVesselPositions(), 60000)
    }
  }

  _getApiKey() {
    try {
      // Vite injects import.meta.env at build time
      return import.meta.env.VITE_AISSTREAM_API_KEY || null
    } catch {
      return null
    }
  }

  _addStatusBadge() {
    const badge = document.createElement('div')
    badge.id = 'ais-status-badge'
    badge.style.cssText = `
      position: absolute;
      bottom: 8px;
      right: 8px;
      z-index: 1000;
      background: rgba(10,25,47,0.85);
      border: 1px solid #64ffda;
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 11px;
      color: #64ffda;
      font-family: monospace;
      pointer-events: none;
    `
    badge.textContent = '⏳ Connecting...'
    const mapEl = document.getElementById(this.containerId)
    if (mapEl) {
      mapEl.style.position = 'relative'
      mapEl.appendChild(badge)
    }
    this.statusBadge = badge
  }

  _setStatus(text, color = '#64ffda') {
    if (this.statusBadge) {
      this.statusBadge.textContent = text
      this.statusBadge.style.borderColor = color
      this.statusBadge.style.color = color
    }
  }

  _showMockBadge() {
    this._setStatus('⚠️ Demo Mode (no API key)', '#fbbf24')
  }

  // ─── AISStream WebSocket ───────────────────────────────────────────────────

  _connectAISStream(apiKey) {
    try {
      console.log('AISStream: connecting to', AISSTREAM_WS_URL)
      this._setStatus('⏳ Connecting to AISStream...', '#fbbf24')
      this.ws = new WebSocket(AISSTREAM_WS_URL)

      // Connection timeout: if not open within 8s, fall back
      const connectTimeout = setTimeout(() => {
        if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
          console.warn('AISStream: connection timeout, falling back to mock')
          this.ws.close()
          this._fallbackToMock()
        }
      }, 8000)

      this.ws.onopen = () => {
        clearTimeout(connectTimeout)
        console.log('AISStream: connected ✓')
        this.wsReconnectCount = 0
        this._setStatus('🟢 AISStream.io — Live', '#64ffda')
        this.usingRealData = true

        // AISStream BoundingBoxes: array of [[minLat, minLng], [maxLat, maxLng]]
        const subscriptionMsg = {
          Apikey: apiKey,
          BoundingBoxes: [
            [[-60, -180], [70, -60]],
            [[0, 100], [70, 180]]
          ],
          FilterMessageTypes: ['PositionReport']
        }
        this.ws.send(JSON.stringify(subscriptionMsg))
        console.log('AISStream: subscription sent')
      }

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          this._handleAISMessage(msg)
        } catch (err) {
          console.warn('AISStream: parse error', err)
        }
      }

      this.ws.onerror = (err) => {
        clearTimeout(connectTimeout)
        console.error('AISStream: WebSocket error', err)
        this._setStatus('🔴 AIS Connection Failed', '#ef4444')
        // onerror is always followed by onclose, so let onclose handle retry
      }

      this.ws.onclose = (event) => {
        clearTimeout(connectTimeout)
        console.warn(`AISStream: closed code=${event.code} wasClean=${event.wasClean}`)

        if (this.wsReconnectCount >= MAX_RECONNECT_ATTEMPTS) {
          this._fallbackToMock()
        } else {
          this._setStatus('🟡 Reconnecting...', '#fbbf24')
          this._scheduleReconnect(apiKey)
        }
      }
    } catch (err) {
      console.error('AISStream: exception creating WebSocket', err)
      this._fallbackToMock()
    }
  }

  _scheduleReconnect(apiKey) {
    this.wsReconnectCount++
    console.log(`AISStream: reconnect attempt ${this.wsReconnectCount}/${MAX_RECONNECT_ATTEMPTS} in ${RECONNECT_DELAY_MS}ms`)
    setTimeout(() => this._connectAISStream(apiKey), RECONNECT_DELAY_MS)
  }

  _fallbackToMock() {
    this._showMockBadge()
    if (this.vesselMarkers.size === 0) {
      this.renderVessels()
      this.renderRoutes()
    }
    this.updateInterval = setInterval(() => this.updateVesselPositions(), 60000)
  }

  _handleAISMessage(msg) {
    const msgType = msg.MessageType
    if (!msgType) return

    if (msgType === 'PositionReport') {
      const report = msg.Message?.PositionReport
      if (!report) return

      const vessel = {
        id: `ais-${report.UserID}`,
        mmsi: report.UserID,
        name: msg.MetaData?.ShipName?.trim() || `MMSI:${report.UserID}`,
        type: 'container',
        position: {
          lat: report.Latitude,
          lng: report.Longitude
        },
        heading: report.TrueHeading !== 511 ? report.TrueHeading : (report.Cog || 0),
        speed: (report.Sog || 0).toFixed(1),
        status: this._decodeNavStatus(report.NavigationalStatus),
        cargo: 'AIS Live Data',
        source: 'aisstream'
      }

      // Only show vessels that are moving (speed > 3 knots) or at anchor
      if (report.Sog < 0.5) return
      if (this.vesselMarkers.size >= MAX_AIS_VESSELS) return

      this._upsertVesselMarker(vessel)
    }
  }

  _decodeNavStatus(code) {
    const statuses = {
      0: 'Under Way',
      1: 'At Anchor',
      2: 'Not Under Command',
      3: 'Restricted Maneuverability',
      5: 'Moored',
      8: 'Under Way Sailing',
      15: 'Unknown'
    }
    return statuses[code] || 'In Transit'
  }

  _upsertVesselMarker(vessel) {
    if (this.vesselMarkers.has(vessel.id)) {
      // Update existing marker
      const existing = this.vesselMarkers.get(vessel.id)
      existing.marker.setLatLng([vessel.position.lat, vessel.position.lng])
      existing.marker.setPopupContent(this.createVesselPopup(vessel))
      existing.data = vessel
    } else {
      // Add new marker
      this.addVesselMarker(vessel)
    }
  }

  // ─── Rendering ────────────────────────────────────────────────────────────

  renderPorts() {
    Object.entries(PORTS).forEach(([key, port]) => {
      const portIcon = L.divIcon({
        className: 'port-marker',
        html: `
          <div style="
            background: rgba(100, 255, 218, 0.2);
            border: 2px solid #64ffda;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              background: #64ffda;
              border-radius: 50%;
              width: 8px;
              height: 8px;
            "></div>
          </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })

      const marker = L.marker([port.lat, port.lng], { icon: portIcon })
        .bindPopup(`
          <div style="color: #0a192f; font-family: 'Inter', sans-serif;">
            <strong style="color: #020c1b; font-size: 0.9rem;">${port.name}</strong>
            <br/>
            <span style="font-size: 0.75rem; color: #112240;">Major Port</span>
          </div>
        `)
        .addTo(this.map)

      this.portMarkers.set(key, marker)
    })
  }

  renderVessels() {
    MOCK_VESSELS.forEach(vessel => {
      this.addVesselMarker(vessel)
    })
  }

  addVesselMarker(vessel) {
    const statusColor = (vessel.status === 'In Transit' || vessel.status === 'Under Way') ? '#64ffda' : '#ff6b6b'
    const isMock = vessel.source === 'mock'

    const vesselIcon = L.divIcon({
      className: 'vessel-marker',
      html: `
        <div style="transform: rotate(${vessel.heading}deg); position: relative;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L20 22H4L12 2Z" fill="${statusColor}" stroke="${statusColor}" stroke-width="2"/>
          </svg>
          <div style="
            position: absolute;
            top: -8px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(10, 25, 47, 0.9);
            color: ${statusColor};
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            white-space: nowrap;
            border: 1px solid ${statusColor};
          ">${vessel.name}${isMock ? ' ⚠️' : ''}</div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })

    const marker = L.marker([vessel.position.lat, vessel.position.lng], { icon: vesselIcon })
      .bindPopup(this.createVesselPopup(vessel))
      .addTo(this.map)

    this.vesselMarkers.set(vessel.id, { marker, data: vessel })
  }

  createVesselPopup(vessel) {
    const isMock = vessel.source === 'mock'
    const etaStr = vessel.eta ? new Date(vessel.eta).toLocaleString() : 'N/A'
    return `
      <div style="color: #0a192f; font-family: 'Inter', sans-serif; min-width: 200px;">
        <strong style="color: #020c1b; font-size: 1rem;">${vessel.name}</strong>
        ${isMock ? '<div style="font-size:10px;color:#f59e0b;margin-top:2px;">⚠️ Demo Data</div>' : '<div style="font-size:10px;color:#059669;margin-top:2px;">🟢 AISStream.io Live</div>'}
        <div style="margin-top: 8px; font-size: 0.8rem;">
          <div style="margin-bottom: 4px;">
            <strong>Status:</strong>
            <span style="color: ${(vessel.status === 'In Transit' || vessel.status === 'Under Way') ? '#059669' : '#dc2626'}">
              ${vessel.status}
            </span>
          </div>
          <div style="margin-bottom: 4px;"><strong>Speed:</strong> ${vessel.speed} knots</div>
          <div style="margin-bottom: 4px;"><strong>Heading:</strong> ${vessel.heading}°</div>
          <div style="margin-bottom: 4px;"><strong>Cargo:</strong> ${vessel.cargo}</div>
          ${vessel.route ? `<div style="margin-bottom: 4px;"><strong>Route:</strong> ${vessel.route.from} → ${vessel.route.to}</div>` : ''}
          ${vessel.mmsi ? `<div style="margin-bottom: 4px;"><strong>MMSI:</strong> ${vessel.mmsi}</div>` : ''}
          ${vessel.eta ? `<div style="margin-bottom: 4px;"><strong>ETA:</strong> ${etaStr}</div>` : ''}
        </div>
      </div>
    `
  }

  renderRoutes() {
    MOCK_VESSELS.forEach(vessel => {
      if (PORTS[vessel.route?.from] && PORTS[vessel.route?.to]) {
        const from = PORTS[vessel.route.from]
        const to = PORTS[vessel.route.to]

        const route = L.polyline([
          [from.lat, from.lng],
          [vessel.position.lat, vessel.position.lng],
          [to.lat, to.lng]
        ], {
          color: vessel.status === 'In Transit' ? '#64ffda' : '#ff6b6b',
          weight: 2,
          opacity: 0.3,
          dashArray: '5, 10'
        }).addTo(this.map)

        this.routeLines.set(vessel.id, route)
      }
    })
  }

  updateVesselPositions() {
    // Only animate mock vessels; real AIS data is updated via WebSocket
    MOCK_VESSELS.forEach(vessel => {
      if (vessel.status === 'In Transit') {
        vessel.position.lng -= 0.5
        if (vessel.position.lng < -180) vessel.position.lng += 360

        const markerData = this.vesselMarkers.get(vessel.id)
        if (markerData) {
          markerData.marker.setLatLng([vessel.position.lat, vessel.position.lng])
          markerData.marker.setPopupContent(this.createVesselPopup(vessel))

          const routeLine = this.routeLines.get(vessel.id)
          if (routeLine && PORTS[vessel.route?.from] && PORTS[vessel.route?.to]) {
            const from = PORTS[vessel.route.from]
            const to = PORTS[vessel.route.to]
            routeLine.setLatLngs([
              [from.lat, from.lng],
              [vessel.position.lat, vessel.position.lng],
              [to.lat, to.lng]
            ])
          }
        }
      }
    })
  }

  focusOnVessel(vesselId) {
    const vesselData = this.vesselMarkers.get(vesselId)
    if (vesselData) {
      this.map.setView([vesselData.data.position.lat, vesselData.data.position.lng], 5)
      vesselData.marker.openPopup()
    }
  }

  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
    if (this.ws) {
      this.ws.onclose = null // prevent reconnect on intentional close
      this.ws.close()
      this.ws = null
    }
    if (this.map) {
      this.map.remove()
      this.map = null
    }
    this.vesselMarkers.clear()
    this.routeLines.clear()
    this.portMarkers.clear()
  }
}

export default MaritimeTracker
