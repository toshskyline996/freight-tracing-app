// Live Tracking with Type Filter Module
// Flight data: OpenSky Network (free, no auth required)
// Sea data: AISStream.io (via mapTracker.js WebSocket)
// Rail data: Mock (no public API available for CN/CPKC)

const OPENSKY_API = 'https://opensky-network.org/api/states/all'

// Toronto-area bounding box: lat 40-55, lon -95 to -70
const TORONTO_BBOX = { lamin: 40, lomin: -95, lamax: 55, lomax: -70 }

// Fallback mock data for when OpenSky is unavailable
const MOCK_AIR = [
  {
    id: 'AC8945-AIR',
    type: 'air',
    name: 'AC8945 (Air Canada Cargo)',
    cargo: 'Air Freight',
    quantity: '28.5 tonnes',
    status: 'In Flight',
    speed: '850 km/h',
    eta: 'Toronto YYZ — Demo',
    origin: 'Shanghai (PVG)',
    destination: 'Toronto (YYZ)',
    position: { lat: 55.0, lng: -100.0 },
    heading: 290,
    cargoDetails: 'Electronics, Temperature-controlled goods',
    source: 'mock'
  },
  {
    id: 'FX5102-AIR',
    type: 'air',
    name: 'FX5102 (FedEx)',
    cargo: 'Express Parcels',
    quantity: '19.3 tonnes',
    status: 'In Flight',
    speed: '900 km/h',
    eta: 'Toronto YYZ — Demo',
    origin: 'Memphis (MEM)',
    destination: 'Toronto (YYZ)',
    position: { lat: 42.5, lng: -82.0 },
    heading: 45,
    cargoDetails: 'Priority delivery packages',
    source: 'mock'
  },
  {
    id: 'LH8505-AIR',
    type: 'air',
    name: 'LH8505 (Lufthansa Cargo)',
    cargo: 'Air Freight',
    quantity: '25.8 tonnes',
    status: 'Landed',
    speed: '0 km/h',
    eta: 'Toronto YYZ — Arrived',
    origin: 'Frankfurt (FRA)',
    destination: 'Toronto (YYZ)',
    position: { lat: 43.6777, lng: -79.6248 },
    heading: 0,
    cargoDetails: 'Automotive parts, Pharmaceuticals',
    source: 'mock'
  }
]

const MOCK_SEA = [
  {
    id: 'MSC-OSCAR-001',
    type: 'sea',
    name: 'MSC OSCAR',
    cargo: 'Containers (TEU)',
    quantity: '19,224 TEU',
    status: 'In Transit',
    speed: '18.5 knots',
    eta: 'Vancouver — Demo',
    origin: 'Shanghai, China',
    destination: 'Vancouver, BC',
    position: { lat: 42.5, lng: -165.0 },
    heading: 45,
    cargoDetails: 'Electronics, Textiles, Machinery',
    source: 'mock'
  },
  {
    id: 'MAERSK-ESSEN-002',
    type: 'sea',
    name: 'MAERSK ESSEN',
    cargo: 'Containers (TEU)',
    quantity: '15,550 TEU',
    status: 'Port Delay',
    speed: '2.1 knots',
    eta: 'Los Angeles — Demo',
    origin: 'Ningbo, China',
    destination: 'Los Angeles, CA',
    position: { lat: 35.8, lng: -140.2 },
    heading: 80,
    cargoDetails: 'Consumer goods, Automotive parts',
    source: 'mock'
  },
  {
    id: 'OOCL-HONGKONG-003',
    type: 'sea',
    name: 'OOCL HONG KONG',
    cargo: 'Containers (TEU)',
    quantity: '21,413 TEU',
    status: 'In Transit',
    speed: '21.3 knots',
    eta: 'Prince Rupert — Demo',
    origin: 'Hong Kong',
    destination: 'Prince Rupert, BC',
    position: { lat: 48.2, lng: -155.5 },
    heading: 50,
    cargoDetails: 'Mixed containerized cargo',
    source: 'mock'
  }
]

const MOCK_RAIL = [
  {
    id: 'CN-308-RAIL',
    type: 'rail',
    name: 'CN-308 Intermodal',
    cargo: 'Containers',
    quantity: '145 containers',
    status: 'In Transit',
    speed: '85 km/h',
    eta: 'Toronto Brampton IMS',
    origin: 'Vancouver, BC',
    destination: 'Toronto (Brampton IMS)',
    position: { lat: 49.9, lng: -97.1 },
    heading: 90,
    cargoDetails: 'Asia import containers',
    source: 'mock'
  },
  {
    id: 'CPKC-140-RAIL',
    type: 'rail',
    name: 'CPKC-140 Intermodal',
    cargo: 'Containers',
    quantity: '132 containers',
    status: 'In Transit',
    speed: '78 km/h',
    eta: 'Toronto Vaughan IMS',
    origin: 'Calgary, AB',
    destination: 'Toronto (Vaughan IMS)',
    position: { lat: 48.4, lng: -89.2 },
    heading: 120,
    cargoDetails: 'Domestic intermodal freight',
    source: 'mock'
  },
  {
    id: 'CN-198-RAIL',
    type: 'rail',
    name: 'CN-198 Bulk Freight',
    cargo: 'Grain',
    quantity: '82 cars',
    status: 'Approaching',
    speed: '65 km/h',
    eta: 'Toronto MacMillan Yard',
    origin: 'Montreal, QC',
    destination: 'Toronto (MacMillan Yard)',
    position: { lat: 43.8, lng: -78.9 },
    heading: 270,
    cargoDetails: 'Agricultural products',
    source: 'mock'
  }
]

export default class LiveTrackingFilter {
  constructor() {
    this.activeFilters = new Set(['sea', 'air', 'rail'])
    this.liveAirVessels = []   // populated by OpenSky
    this.airDataSource = 'mock' // 'opensky' | 'mock'
    this.refreshInterval = null
  }

  // ─── OpenSky Network Integration ──────────────────────────────────────────

  async fetchLiveFlights() {
    const { lamin, lomin, lamax, lomax } = TORONTO_BBOX
    const url = `${OPENSKY_API}?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
      if (!res.ok) throw new Error(`OpenSky HTTP ${res.status}`)
      const data = await res.json()
      if (!data?.states?.length) return false

      // OpenSky state vector fields:
      // [icao24, callsign, origin_country, time_position, last_contact,
      //  longitude, latitude, baro_altitude, on_ground, velocity,
      //  true_track, vertical_rate, sensors, geo_altitude, squawk, spi, position_source]
      this.liveAirVessels = data.states
        .filter(s => s[8] === false && s[6] != null && s[5] != null) // airborne only
        .slice(0, 20) // max 20 aircraft
        .map((s, i) => ({
          id: `opensky-${s[0]}-${i}`,
          type: 'air',
          name: (s[1]?.trim() || s[0] || 'Unknown').toUpperCase(),
          cargo: 'Air Cargo / Passenger',
          quantity: '—',
          status: 'In Flight',
          speed: s[9] != null ? `${Math.round(s[9] * 3.6)} km/h` : '—',
          eta: '—',
          origin: s[2] || 'Unknown',
          destination: 'Toronto Area',
          position: { lat: s[6], lng: s[5] },
          heading: s[10] || 0,
          altitude: s[7] != null ? `${Math.round(s[7])}m` : '—',
          cargoDetails: `ICAO24: ${s[0]} | Squawk: ${s[14] || 'N/A'}`,
          source: 'opensky'
        }))

      this.airDataSource = 'opensky'
      return true
    } catch (err) {
      console.warn('OpenSky: fetch failed, using mock data', err.message)
      this.airDataSource = 'mock'
      return false
    }
  }

  startAutoRefresh(onRefresh) {
    // Initial fetch
    this.fetchLiveFlights().then(() => onRefresh?.())

    // Refresh every 60 seconds
    this.refreshInterval = setInterval(async () => {
      await this.fetchLiveFlights()
      onRefresh?.()
    }, 60000)
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
    }
  }

  // ─── Filter Logic ─────────────────────────────────────────────────────────

  toggleFilter(type) {
    if (this.activeFilters.has(type)) {
      this.activeFilters.delete(type)
    } else {
      this.activeFilters.add(type)
    }
  }

  isFilterActive(type) {
    return this.activeFilters.has(type)
  }

  getFilteredVessels() {
    return this.getAllVessels().filter(v => this.activeFilters.has(v.type))
  }

  getAllVessels() {
    const airVessels = this.airDataSource === 'opensky' && this.liveAirVessels.length > 0
      ? this.liveAirVessels
      : MOCK_AIR

    return [
      ...MOCK_SEA,
      ...airVessels,
      ...MOCK_RAIL
    ]
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  renderFilterButtons() {
    try {
      const all = this.getAllVessels()
      const airLabel = this.airDataSource === 'opensky' ? '✈️ Air — Live 🟢' : '✈️ Air — Demo ⚠️'

      return `
        <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; padding: 1rem; background: rgba(100, 255, 218, 0.05); border-radius: 8px; align-items: center;">
          <span style="color: var(--text-secondary); font-weight: 600;">Filter by Type:</span>
          <button class="filter-btn" data-type="sea" style="
            padding: 0.5rem 1.5rem;
            border: 2px solid ${this.isFilterActive('sea') ? 'var(--accent-blue)' : 'var(--glass-border)'};
            background: ${this.isFilterActive('sea') ? 'rgba(100, 255, 218, 0.1)' : 'transparent'};
            color: ${this.isFilterActive('sea') ? 'var(--accent-blue)' : 'var(--text-secondary)'};
            border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s;
          ">🚢 Sea (${all.filter(v => v.type === 'sea').length})</button>
          <button class="filter-btn" data-type="air" style="
            padding: 0.5rem 1.5rem;
            border: 2px solid ${this.isFilterActive('air') ? 'var(--accent-blue)' : 'var(--glass-border)'};
            background: ${this.isFilterActive('air') ? 'rgba(100, 255, 218, 0.1)' : 'transparent'};
            color: ${this.isFilterActive('air') ? 'var(--accent-blue)' : 'var(--text-secondary)'};
            border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s;
          ">${airLabel} (${all.filter(v => v.type === 'air').length})</button>
          <button class="filter-btn" data-type="rail" style="
            padding: 0.5rem 1.5rem;
            border: 2px solid ${this.isFilterActive('rail') ? 'var(--accent-blue)' : 'var(--glass-border)'};
            background: ${this.isFilterActive('rail') ? 'rgba(100, 255, 218, 0.1)' : 'transparent'};
            color: ${this.isFilterActive('rail') ? 'var(--accent-blue)' : 'var(--text-secondary)'};
            border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s;
          ">🚂 Rail (${all.filter(v => v.type === 'rail').length})</button>
          <span style="font-size: 0.7rem; color: var(--text-secondary); margin-left: auto;">
            Air: <a href="https://opensky-network.org" target="_blank" style="color:${this.airDataSource === 'opensky' ? '#4ade80' : '#fbbf24'};">${this.airDataSource === 'opensky' ? 'OpenSky Network ↗' : 'Demo Mode'}</a>
            &nbsp;|&nbsp; Sea: <a href="https://aisstream.io" target="_blank" style="color:#64ffda;">AISStream.io ↗</a>
          </span>
        </div>
      `
    } catch (err) {
      console.error('LiveTrackingFilter: renderFilterButtons error', err)
      return '<div style="padding:1rem;color:var(--accent-orange);">⚠️ Filter unavailable</div>'
    }
  }

  renderVesselCards() {
    const vessels = this.getFilteredVessels()

    if (vessels.length === 0) {
      return `
        <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
          <p style="font-size: 1.2rem;">No vehicles match your filter criteria</p>
          <p style="font-size: 0.9rem; margin-top: 0.5rem;">Please select at least one transportation type</p>
        </div>
      `
    }

    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem;">
        ${vessels.map(vessel => this._renderCard(vessel)).join('')}
      </div>
    `
  }

  _renderCard(vessel) {
    const typeColor = vessel.type === 'sea' ? 'var(--accent-blue)' : vessel.type === 'air' ? '#fbbf24' : '#8b5cf6'
    const statusColor = (vessel.status === 'In Transit' || vessel.status === 'In Flight')
      ? 'var(--accent-blue)'
      : vessel.status === 'Landed' || vessel.status === 'Arrived'
        ? '#4ade80'
        : 'var(--accent-orange)'
    const icon = vessel.type === 'sea' ? '🚢' : vessel.type === 'air' ? '✈️' : '🚂'
    const isMock = vessel.source === 'mock'

    return `
      <div class="fleet-status-card" data-vessel="${vessel.id}" data-type="${vessel.type}" style="border-left: 4px solid ${typeColor};">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
          <strong>${vessel.name}</strong>
          <span style="font-size: 1.5rem;">${icon}</span>
        </div>
        ${isMock ? '<div style="font-size:10px;color:#f59e0b;margin-bottom:4px;">⚠️ Demo Data</div>' : '<div style="font-size:10px;color:#4ade80;margin-bottom:4px;">🟢 Live Data</div>'}
        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem;">
          <div style="margin-bottom: 0.3rem;">Status: <span style="color: ${statusColor};">${vessel.status}</span></div>
          <div style="margin-bottom: 0.3rem;">Speed: ${vessel.speed}</div>
          ${vessel.altitude ? `<div style="margin-bottom: 0.3rem;">Altitude: ${vessel.altitude}</div>` : ''}
          <div style="margin-bottom: 0.3rem;">📦 ${vessel.cargo}${vessel.quantity !== '—' ? `: ${vessel.quantity}` : ''}</div>
          <div style="margin-bottom: 0.3rem;">🎯 ${vessel.eta}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--glass-border);">
            ${vessel.origin} → ${vessel.destination}
          </div>
        </div>
        <button class="focus-vessel-btn" style="
          margin-top: 0.75rem; width: 100%; padding: 0.5rem;
          font-size: 0.75rem; background: rgba(100, 255, 218, 0.1);
          border: 1px solid var(--accent-blue); color: var(--accent-blue);
          border-radius: 6px; cursor: pointer; transition: all 0.3s;
        " onmouseover="this.style.background='rgba(100,255,218,0.2)'" onmouseout="this.style.background='rgba(100,255,218,0.1)'">
          📍 Track on Map
        </button>
      </div>
    `
  }
}
