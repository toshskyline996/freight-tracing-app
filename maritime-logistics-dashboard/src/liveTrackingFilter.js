// Live Tracking with Type Filter Module
export default class LiveTrackingFilter {
  constructor() {
    this.activeFilters = new Set(['sea', 'air', 'rail']); // All enabled by default
  }

  toggleFilter(type) {
    if (this.activeFilters.has(type)) {
      this.activeFilters.delete(type);
    } else {
      this.activeFilters.add(type);
    }
  }

  isFilterActive(type) {
    return this.activeFilters.has(type);
  }

  getFilteredVessels() {
    const allVessels = this.getAllVessels();
    return allVessels.filter(v => this.activeFilters.has(v.type));
  }

  getAllVessels() {
    const now = new Date();
    return [
      // Sea vessels
      {
        id: 'MSC-OSCAR-001',
        type: 'sea',
        name: 'MSC OSCAR',
        cargo: 'Containers (TEU)',
        quantity: '19,224 TEU',
        status: 'In Transit',
        speed: '18.5 knots',
        eta: 'Vancouver - Jan 20, 2026',
        origin: 'Shanghai, China',
        destination: 'Vancouver, BC',
        position: { lat: 42.5, lng: -165.0 },
        heading: 45,
        cargoDetails: 'Electronics, Textiles, Machinery'
      },
      {
        id: 'MAERSK-ESSEN-002',
        type: 'sea',
        name: 'MAERSK ESSEN',
        cargo: 'Containers (TEU)',
        quantity: '15,550 TEU',
        status: 'Port Delay',
        speed: '2.1 knots',
        eta: 'Los Angeles - Jan 18, 2026',
        origin: 'Ningbo, China',
        destination: 'Los Angeles, CA',
        position: { lat: 35.8, lng: -140.2 },
        heading: 80,
        cargoDetails: 'Consumer goods, Automotive parts'
      },
      {
        id: 'OOCL-HONGKONG-003',
        type: 'sea',
        name: 'OOCL HONG KONG',
        cargo: 'Containers (TEU)',
        quantity: '21,413 TEU',
        status: 'In Transit',
        speed: '21.3 knots',
        eta: 'Prince Rupert - Jan 19, 2026',
        origin: 'Hong Kong',
        destination: 'Prince Rupert, BC',
        position: { lat: 48.2, lng: -155.5 },
        heading: 50,
        cargoDetails: 'Mixed containerized cargo'
      },
      // Air cargo
      {
        id: 'AC8945-AIR',
        type: 'air',
        name: 'AC8945 (Air Canada Cargo)',
        cargo: 'Air Freight',
        quantity: '28.5 tonnes',
        status: 'In Flight',
        speed: '850 km/h',
        eta: 'Toronto YYZ - Today 18:30',
        origin: 'Shanghai (PVG)',
        destination: 'Toronto (YYZ)',
        position: { lat: 55.0, lng: -100.0 },
        heading: 290,
        cargoDetails: 'Electronics, Temperature-controlled goods'
      },
      {
        id: 'FX5102-AIR',
        type: 'air',
        name: 'FX5102 (FedEx)',
        cargo: 'Express Parcels',
        quantity: '19.3 tonnes',
        status: 'In Flight',
        speed: '900 km/h',
        eta: 'Toronto YYZ - Today 14:45',
        origin: 'Memphis (MEM)',
        destination: 'Toronto (YYZ)',
        position: { lat: 42.5, lng: -82.0 },
        heading: 45,
        cargoDetails: 'Priority delivery packages'
      },
      {
        id: 'LH8505-AIR',
        type: 'air',
        name: 'LH8505 (Lufthansa Cargo)',
        cargo: 'Air Freight',
        quantity: '25.8 tonnes',
        status: 'Landed',
        speed: '0 km/h',
        eta: 'Toronto YYZ - Arrived',
        origin: 'Frankfurt (FRA)',
        destination: 'Toronto (YYZ)',
        position: { lat: 43.6777, lng: -79.6248 },
        heading: 0,
        cargoDetails: 'Automotive parts, Pharmaceuticals'
      },
      // Rail cargo
      {
        id: 'CN-308-RAIL',
        type: 'rail',
        name: 'CN-308 Intermodal',
        cargo: 'Containers',
        quantity: '145 containers',
        status: 'In Transit',
        speed: '85 km/h',
        eta: 'Toronto Brampton IMS - Jan 17, 18:00',
        origin: 'Vancouver, BC',
        destination: 'Toronto (Brampton IMS)',
        position: { lat: 49.9, lng: -97.1 },
        heading: 90,
        cargoDetails: 'Asia import containers'
      },
      {
        id: 'CPKC-140-RAIL',
        type: 'rail',
        name: 'CPKC-140 Intermodal',
        cargo: 'Containers',
        quantity: '132 containers',
        status: 'In Transit',
        speed: '78 km/h',
        eta: 'Toronto Vaughan IMS - Jan 17, 20:00',
        origin: 'Calgary, AB',
        destination: 'Toronto (Vaughan IMS)',
        position: { lat: 48.4, lng: -89.2 },
        heading: 120,
        cargoDetails: 'Domestic intermodal freight'
      },
      {
        id: 'CN-198-RAIL',
        type: 'rail',
        name: 'CN-198 Bulk Freight',
        cargo: 'Grain',
        quantity: '82 cars',
        status: 'Approaching',
        speed: '65 km/h',
        eta: 'Toronto MacMillan Yard - Today 14:30',
        origin: 'Montreal, QC',
        destination: 'Toronto (MacMillan Yard)',
        position: { lat: 43.8, lng: -78.9 },
        heading: 270,
        cargoDetails: 'Agricultural products'
      }
    ];
  }

  renderFilterButtons() {
    return `
      <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; padding: 1rem; background: rgba(100, 255, 218, 0.05); border-radius: 8px;">
        <span style="color: var(--text-secondary); font-weight: 600; margin-right: 0.5rem;">Filter by Type:</span>
        <button class="filter-btn" data-type="sea" style="
          padding: 0.5rem 1.5rem;
          border: 2px solid ${this.isFilterActive('sea') ? 'var(--accent-blue)' : 'var(--glass-border)'};
          background: ${this.isFilterActive('sea') ? 'rgba(100, 255, 218, 0.1)' : 'transparent'};
          color: ${this.isFilterActive('sea') ? 'var(--accent-blue)' : 'var(--text-secondary)'};
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        ">
          🚢 Sea (${this.getAllVessels().filter(v => v.type === 'sea').length})
        </button>
        <button class="filter-btn" data-type="air" style="
          padding: 0.5rem 1.5rem;
          border: 2px solid ${this.isFilterActive('air') ? 'var(--accent-blue)' : 'var(--glass-border)'};
          background: ${this.isFilterActive('air') ? 'rgba(100, 255, 218, 0.1)' : 'transparent'};
          color: ${this.isFilterActive('air') ? 'var(--accent-blue)' : 'var(--text-secondary)'};
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        ">
          ✈️ Air (${this.getAllVessels().filter(v => v.type === 'air').length})
        </button>
        <button class="filter-btn" data-type="rail" style="
          padding: 0.5rem 1.5rem;
          border: 2px solid ${this.isFilterActive('rail') ? 'var(--accent-blue)' : 'var(--glass-border)'};
          background: ${this.isFilterActive('rail') ? 'rgba(100, 255, 218, 0.1)' : 'transparent'};
          color: ${this.isFilterActive('rail') ? 'var(--accent-blue)' : 'var(--text-secondary)'};
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        ">
          🚂 Rail (${this.getAllVessels().filter(v => v.type === 'rail').length})
        </button>
      </div>
    `;
  }

  renderVesselCards() {
    const vessels = this.getFilteredVessels();
    
    if (vessels.length === 0) {
      return `
        <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
          <p style="font-size: 1.2rem;">No vehicles match your filter criteria</p>
          <p style="font-size: 0.9rem; margin-top: 0.5rem;">Please select at least one transportation type</p>
        </div>
      `;
    }

    return `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
        ${vessels.map(vessel => `
          <div class="fleet-status-card" data-vessel="${vessel.id}" data-type="${vessel.type}" style="
            border-left: 4px solid ${
              vessel.type === 'sea' ? 'var(--accent-blue)' : 
              vessel.type === 'air' ? '#fbbf24' : 
              '#8b5cf6'
            };
          ">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
              <strong>${vessel.name}</strong>
              <span style="font-size: 1.5rem;">
                ${vessel.type === 'sea' ? '🚢' : vessel.type === 'air' ? '✈️' : '🚂'}
              </span>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem;">
              <div style="margin-bottom: 0.3rem;">
                Status: <span style="color: ${
                  vessel.status === 'In Transit' || vessel.status === 'In Flight' ? 'var(--accent-blue)' : 
                  vessel.status === 'Landed' || vessel.status === 'Arrived' ? '#4ade80' :
                  'var(--accent-orange)'
                }">${vessel.status}</span>
              </div>
              <div style="margin-bottom: 0.3rem;">Speed: ${vessel.speed}</div>
              <div style="margin-bottom: 0.3rem;">📦 ${vessel.cargo}: ${vessel.quantity}</div>
              <div style="margin-bottom: 0.3rem;">🎯 ${vessel.eta}</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--glass-border);">
                ${vessel.origin} → ${vessel.destination}
              </div>
            </div>
            <button class="focus-vessel-btn" style="
              margin-top: 0.75rem;
              width: 100%;
              padding: 0.5rem;
              font-size: 0.75rem;
              background: rgba(100, 255, 218, 0.1);
              border: 1px solid var(--accent-blue);
              color: var(--accent-blue);
              border-radius: 6px;
              cursor: pointer;
              transition: all 0.3s;
            " onmouseover="this.style.background='rgba(100, 255, 218, 0.2)'" onmouseout="this.style.background='rgba(100, 255, 218, 0.1)'">
              📍 Track on Map
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }
}
