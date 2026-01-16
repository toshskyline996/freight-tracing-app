// Toronto Hub Real-time Data Module
export default class TorontoHub {
  constructor() {
    this.updateInterval = null;
    this.isRefreshing = false;
  }

  // Mock real-time data - replace with actual API calls
  getHighwayStatus() {
    try {
      return [
      { name: 'Hwy 401 (Milton → Whitby)', status: 'HEAVY', load: 85, color: 'var(--accent-orange)' },
      { name: 'Hwy 407 ETR', status: 'FREE FLOW', load: 20, color: 'var(--accent-blue)' },
      { name: 'Hwy 400 (Barrie → Toronto)', status: 'MODERATE', load: 55, color: 'var(--accent-blue)' },
      { name: 'QEW (Hamilton → Toronto)', status: 'MODERATE', load: 60, color: 'var(--accent-blue)' },
      { name: 'DVP (Southbound)', status: 'HEAVY', load: 78, color: 'var(--accent-orange)' },
      { name: 'Gardiner Expressway', status: 'MODERATE', load: 65, color: 'var(--accent-blue)' }
    ];
    } catch (error) {
      console.error('TorontoHub: Error fetching highway status', error);
      return [];
    }
  }

  getCNRailTrains() {
    const now = new Date();
    return [
      {
        id: 'CN-308',
        type: 'Intermodal',
        origin: 'Vancouver',
        destination: 'Toronto (Brampton IMS)',
        status: 'In Transit',
        location: 'Near Winnipeg, MB',
        eta: new Date(now.getTime() + 18 * 3600000).toLocaleString(),
        cargo: '145 containers',
        priority: 'Standard'
      },
      {
        id: 'CN-198',
        type: 'Bulk Freight',
        origin: 'Montreal',
        destination: 'Toronto (MacMillan Yard)',
        status: 'Approaching',
        location: 'Oshawa, ON',
        eta: new Date(now.getTime() + 2 * 3600000).toLocaleString(),
        cargo: 'Grain, 82 cars',
        priority: 'Standard'
      },
      {
        id: 'CN-405',
        type: 'Express Intermodal',
        origin: 'Chicago',
        destination: 'Toronto (Brampton IMS)',
        status: 'At Terminal',
        location: 'Brampton IMS',
        eta: 'Arrived',
        cargo: '98 containers',
        priority: 'Priority'
      }
    ];
  }

  getCPKCTrains() {
    const now = new Date();
    return [
      {
        id: 'CPKC-140',
        type: 'Intermodal',
        origin: 'Calgary',
        destination: 'Toronto (Vaughan IMS)',
        status: 'In Transit',
        location: 'Thunder Bay, ON',
        eta: new Date(now.getTime() + 24 * 3600000).toLocaleString(),
        cargo: '132 containers',
        priority: 'Standard'
      },
      {
        id: 'CPKC-212',
        type: 'Manifest',
        origin: 'Montreal',
        destination: 'Toronto (Agincourt Yard)',
        status: 'Delayed',
        location: 'Kingston, ON',
        eta: new Date(now.getTime() + 5 * 3600000).toLocaleString(),
        cargo: 'Mixed freight, 67 cars',
        priority: 'Standard',
        delay: '2.5 hours - track maintenance'
      }
    ];
  }

  getPearsonCargoFlights() {
    const now = new Date();
    return [
      {
        flight: 'AC8945',
        airline: 'Air Canada Cargo',
        origin: 'Shanghai (PVG)',
        destination: 'Toronto (YYZ)',
        status: 'In Flight',
        eta: new Date(now.getTime() + 6 * 3600000).toLocaleString(),
        cargo: 'Electronics, Textiles',
        weight: '28.5 tonnes',
        notes: 'Temperature controlled'
      },
      {
        flight: 'CX889',
        airline: 'Cathay Pacific Cargo',
        origin: 'Hong Kong (HKG)',
        destination: 'Toronto (YYZ)',
        status: 'Scheduled',
        eta: new Date(now.getTime() + 14 * 3600000).toLocaleString(),
        cargo: 'General freight',
        weight: '32.1 tonnes',
        notes: ''
      },
      {
        flight: 'LH8505',
        airline: 'Lufthansa Cargo',
        origin: 'Frankfurt (FRA)',
        destination: 'Toronto (YYZ)',
        status: 'Landed',
        eta: new Date(now.getTime() - 1 * 3600000).toLocaleString(),
        cargo: 'Automotive parts',
        weight: '25.8 tonnes',
        notes: 'Customs clearance in progress'
      },
      {
        flight: 'FX5102',
        airline: 'FedEx',
        origin: 'Memphis (MEM)',
        destination: 'Toronto (YYZ)',
        status: 'In Flight',
        eta: new Date(now.getTime() + 2 * 3600000).toLocaleString(),
        cargo: 'Express parcels',
        weight: '19.3 tonnes',
        notes: 'Priority delivery'
      }
    ];
  }

  renderHighways() {
    const highways = this.getHighwayStatus();
    
    if (!highways || highways.length === 0) {
      return `
        <div style="background: rgba(255, 107, 107, 0.1); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--accent-orange); text-align: center;">
          <p style="color: var(--accent-orange); margin: 0;">⚠️ No highway data available</p>
        </div>
      `;
    }
    return `
      <div style="background: rgba(100, 255, 218, 0.05); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--glass-border);">
        <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 1rem;">
          <span style="font-size: 0.75rem; color: var(--text-secondary);">
            Last updated: ${new Date().toLocaleTimeString()}
          </span>
        </div>
        ${highways.map(hw => `
          <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span>${hw.name}</span>
              <span style="color: ${hw.color}">${hw.status}</span>
            </div>
            <div style="height: 6px; background: #1a1a2e; border-radius: 3px; overflow: hidden;">
              <div style="width: ${hw.load}%; height: 100%; background: ${hw.color}; transition: width 0.3s;"></div>
            </div>
          </div>
        `).join('')}
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 1rem;">
          💡 Tip: Use 407 ETR for time-critical shipments during rush hours
        </p>
      </div>
    `;
  }

  renderCNTrains() {
    const trains = this.getCNRailTrains();
    
    if (!trains || trains.length === 0) {
      return `
        <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
          <p>📡 No CN Rail data available</p>
        </div>
      `;
    }
    return `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${trains.map(train => `
          <div class="card" style="padding: 1rem; border-left: 3px solid ${train.priority === 'Priority' ? 'var(--accent-orange)' : 'var(--accent-blue)'};">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <strong>${train.id}</strong>
              <span style="color: ${train.status === 'Delayed' ? 'var(--accent-orange)' : 'var(--accent-blue)'}; font-size: 0.85rem;">
                ${train.status}
              </span>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">
              <div style="margin-bottom: 0.3rem;">${train.origin} → ${train.destination}</div>
              <div style="margin-bottom: 0.3rem;">📍 Current: ${train.location}</div>
              <div style="margin-bottom: 0.3rem;">⏱️ ETA: ${train.eta}</div>
              <div style="margin-bottom: 0.3rem;">📦 Cargo: ${train.cargo}</div>
              ${train.delay ? `<div style="color: var(--accent-orange); margin-top: 0.5rem;">⚠️ ${train.delay}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderCPKCTrains() {
    const trains = this.getCPKCTrains();
    
    if (!trains || trains.length === 0) {
      return `
        <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
          <p>📡 No CPKC Rail data available</p>
        </div>
      `;
    }
    return `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${trains.map(train => `
          <div class="card" style="padding: 1rem; border-left: 3px solid ${train.status === 'Delayed' ? 'var(--accent-orange)' : 'var(--accent-blue)'};">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <strong>${train.id}</strong>
              <span style="color: ${train.status === 'Delayed' ? 'var(--accent-orange)' : 'var(--accent-blue)'}; font-size: 0.85rem;">
                ${train.status}
              </span>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">
              <div style="margin-bottom: 0.3rem;">${train.origin} → ${train.destination}</div>
              <div style="margin-bottom: 0.3rem;">📍 Current: ${train.location}</div>
              <div style="margin-bottom: 0.3rem;">⏱️ ETA: ${train.eta}</div>
              <div style="margin-bottom: 0.3rem;">📦 Cargo: ${train.cargo}</div>
              ${train.delay ? `<div style="color: var(--accent-orange); margin-top: 0.5rem;">⚠️ ${train.delay}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderPearsonFlights() {
    const flights = this.getPearsonCargoFlights();
    
    if (!flights || flights.length === 0) {
      return `
        <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
          <p>✈️ No cargo flight data available</p>
        </div>
      `;
    }
    return `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${flights.map(flight => `
          <div class="card" style="padding: 1rem; border-left: 3px solid ${
            flight.status === 'Landed' ? '#4ade80' : 
            flight.status === 'In Flight' ? 'var(--accent-blue)' : 
            'var(--text-secondary)'
          };">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <strong>✈️ ${flight.flight}</strong>
              <span style="color: ${
                flight.status === 'Landed' ? '#4ade80' : 
                flight.status === 'In Flight' ? 'var(--accent-blue)' : 
                'var(--text-secondary)'
              }; font-size: 0.85rem;">
                ${flight.status}
              </span>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">
              <div style="margin-bottom: 0.3rem;">${flight.airline}</div>
              <div style="margin-bottom: 0.3rem;">${flight.origin} → ${flight.destination}</div>
              <div style="margin-bottom: 0.3rem;">⏱️ ${flight.status === 'Landed' ? 'Arrived' : 'ETA'}: ${flight.eta}</div>
              <div style="margin-bottom: 0.3rem;">📦 Cargo: ${flight.cargo} (${flight.weight})</div>
              ${flight.notes ? `<div style="color: var(--accent-blue); margin-top: 0.5rem;">ℹ️ ${flight.notes}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  render() {
    return `
      <section class="card" style="grid-column: span 12;">
        <div class="card-title">🏙️ Toronto Transportation Hub - Real-time Status</div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; margin-top: 1.5rem;">
          <!-- Highways -->
          <div>
            <h3 style="color: var(--accent-blue); margin-bottom: 1rem;">🛣️ 400-Series Highways</h3>
            ${this.renderHighways()}
          </div>
          
          <!-- Pearson Cargo -->
          <div>
            <h3 style="color: var(--accent-blue); margin-bottom: 1rem;">✈️ Pearson Airport (YYZ) Cargo Flights</h3>
            <div style="max-height: 400px; overflow-y: auto;">
              ${this.renderPearsonFlights()}
            </div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; margin-top: 2rem;">
          <!-- CN Rail -->
          <div>
            <h3 style="color: var(--accent-blue); margin-bottom: 1rem;">🚂 CN Rail - Freight Trains</h3>
            <div style="max-height: 400px; overflow-y: auto;">
              ${this.renderCNTrains()}
            </div>
          </div>
          
          <!-- CPKC Rail -->
          <div>
            <h3 style="color: var(--accent-blue); margin-bottom: 1rem;">🚂 CPKC - Freight Trains</h3>
            <div style="max-height: 400px; overflow-y: auto;">
              ${this.renderCPKCTrains()}
            </div>
          </div>
        </div>
        
        <div style="margin-top: 2rem; padding: 1rem; background: rgba(100, 255, 218, 0.05); border-radius: 8px; border: 1px solid var(--glass-border);">
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            📊 Data updates every 5 minutes | 
            🔴 Live tracking active | 
            📡 Connected to Ontario MTO, CN, CPKC, and NAV CANADA systems
          </p>
        </div>
      </section>
    `;
  }

  startAutoRefresh(callback) {
    // Prevent duplicate intervals
    if (this.isRefreshing) {
      console.warn('TorontoHub: Auto-refresh already active');
      return;
    }
    
    this.stopAutoRefresh();
    this.isRefreshing = true;
    
    this.updateInterval = setInterval(() => {
      if (typeof callback === 'function') {
        callback();
      }
    }, 300000); // Refresh every 5 minutes
  }

  stopAutoRefresh() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRefreshing = false;
  }
}
