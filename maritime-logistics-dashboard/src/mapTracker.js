// Maritime Vessel Tracking Map Module
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

// Simulated vessel data (in production, fetch from AIS API)
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
    eta: '2026-01-20T14:30:00Z',
    cargo: '12,000 TEU'
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
    eta: '2026-01-18T08:00:00Z',
    cargo: '8,500 TEU'
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
    eta: '2026-01-19T06:00:00Z',
    cargo: '21,400 TEU'
  }
]

class MaritimeTracker {
  constructor(containerId) {
    this.containerId = containerId
    this.map = null
    this.vesselMarkers = new Map()
    this.routeLines = new Map()
    this.portMarkers = new Map()
    this.updateInterval = null
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

    // Add dark mode tile layer (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map)

    // Add ports
    this.renderPorts()

    // Add vessels
    this.renderVessels()

    // Add routes
    this.renderRoutes()

    // Setup auto-refresh (every 60 seconds)
    this.updateInterval = setInterval(() => this.updateVesselPositions(), 60000)
  }

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
    // Create custom ship icon based on status
    const statusColor = vessel.status === 'In Transit' ? '#64ffda' : '#ff6b6b'
    
    const vesselIcon = L.divIcon({
      className: 'vessel-marker',
      html: `
        <div style="
          transform: rotate(${vessel.heading}deg);
          position: relative;
        ">
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
          ">${vessel.name}</div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })

    const marker = L.marker([vessel.position.lat, vessel.position.lng], { 
      icon: vesselIcon,
      rotationAngle: vessel.heading
    })
      .bindPopup(this.createVesselPopup(vessel))
      .addTo(this.map)

    this.vesselMarkers.set(vessel.id, { marker, data: vessel })
  }

  createVesselPopup(vessel) {
    const eta = new Date(vessel.eta)
    return `
      <div style="color: #0a192f; font-family: 'Inter', sans-serif; min-width: 200px;">
        <strong style="color: #020c1b; font-size: 1rem;">${vessel.name}</strong>
        <div style="margin-top: 8px; font-size: 0.8rem;">
          <div style="margin-bottom: 4px;">
            <strong>Status:</strong> 
            <span style="color: ${vessel.status === 'In Transit' ? '#059669' : '#dc2626'}">
              ${vessel.status}
            </span>
          </div>
          <div style="margin-bottom: 4px;">
            <strong>Speed:</strong> ${vessel.speed} knots
          </div>
          <div style="margin-bottom: 4px;">
            <strong>Heading:</strong> ${vessel.heading}°
          </div>
          <div style="margin-bottom: 4px;">
            <strong>Cargo:</strong> ${vessel.cargo}
          </div>
          <div style="margin-bottom: 4px;">
            <strong>Route:</strong> ${vessel.route.from} → ${vessel.route.to}
          </div>
          <div style="margin-bottom: 4px;">
            <strong>ETA:</strong> ${eta.toLocaleString()}
          </div>
        </div>
      </div>
    `
  }

  renderRoutes() {
    MOCK_VESSELS.forEach(vessel => {
      if (PORTS[vessel.route.from] && PORTS[vessel.route.to]) {
        const from = PORTS[vessel.route.from]
        const to = PORTS[vessel.route.to]
        
        // Draw great circle route
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
    // Simulate vessel movement (in production, fetch from AIS API)
    MOCK_VESSELS.forEach(vessel => {
      if (vessel.status === 'In Transit') {
        // Simulate westward movement for Pacific routes
        vessel.position.lng -= 0.5
        if (vessel.position.lng < -180) vessel.position.lng += 360
        
        const markerData = this.vesselMarkers.get(vessel.id)
        if (markerData) {
          markerData.marker.setLatLng([vessel.position.lat, vessel.position.lng])
          markerData.marker.setPopupContent(this.createVesselPopup(vessel))
          
          // Update route line
          const routeLine = this.routeLines.get(vessel.id)
          if (routeLine && PORTS[vessel.route.from] && PORTS[vessel.route.to]) {
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
