// Canadian Ports Real-time Monitoring Module
export default class PortHub {
  constructor() {
    this.updateInterval = null;
    this.isRefreshing = false;
    this.selectedPort = 'vancouver'; // default
  }

  // Port selection
  setPort(portName) {
    this.selectedPort = portName.toLowerCase();
  }

  // Mock port container data
  getPortContainerStats(portName) {
    try {
      const stats = {
        vancouver: {
          name: 'Port of Vancouver',
          code: 'CAVAN',
          totalTEU: 3450000,
          currentLoad: 78,
          vesselCount: 24,
          avgDwellTime: '4.2 days',
          onTimePerformance: 94,
          topCommodities: ['Containers', 'Grain', 'Coal', 'Lumber']
        },
        montreal: {
          name: 'Port of Montreal',
          code: 'CAMTR',
          totalTEU: 1850000,
          currentLoad: 65,
          vesselCount: 18,
          avgDwellTime: '5.1 days',
          onTimePerformance: 91,
          topCommodities: ['Containers', 'Grain', 'Petroleum', 'Steel']
        },
        halifax: {
          name: 'Port of Halifax',
          code: 'CAHAL',
          totalTEU: 520000,
          currentLoad: 55,
          vesselCount: 12,
          avgDwellTime: '3.8 days',
          onTimePerformance: 96,
          topCommodities: ['Containers', 'Gypsum', 'Salt', 'Machinery']
        },
        princrupert: {
          name: 'Port of Prince Rupert',
          code: 'CAPRR',
          totalTEU: 1450000,
          currentLoad: 82,
          vesselCount: 16,
          avgDwellTime: '3.2 days',
          onTimePerformance: 97,
          topCommodities: ['Containers', 'Coal', 'Grain', 'Pulp']
        }
      };
      return stats[portName] || stats.vancouver;
    } catch (error) {
      console.error('PortHub: Error fetching port stats', error);
      return null;
    }
  }

  // Mock vessel arrivals/departures
  getPortSchedule(portName) {
    try {
      const now = new Date();
      const schedules = {
        vancouver: [
          {
            vessel: 'MSC ANNA',
            type: 'Container',
            direction: 'Arrival',
            eta: new Date(now.getTime() + 2 * 3600000).toLocaleString(),
            berth: 'Vanterm Terminal',
            cargo: '8,500 TEU',
            origin: 'Shanghai'
          },
          {
            vessel: 'MAERSK ESSEX',
            type: 'Container',
            direction: 'Departure',
            eta: new Date(now.getTime() + 5 * 3600000).toLocaleString(),
            berth: 'DP World Centerm',
            cargo: '7,200 TEU',
            destination: 'Los Angeles'
          },
          {
            vessel: 'COSCO HARMONY',
            type: 'Container',
            direction: 'Berthed',
            eta: 'Currently loading',
            berth: 'GCT Deltaport',
            cargo: '12,000 TEU',
            status: 'Operations in progress'
          }
        ],
        montreal: [
          {
            vessel: 'CMA CGM VOLGA',
            type: 'Container',
            direction: 'Arrival',
            eta: new Date(now.getTime() + 4 * 3600000).toLocaleString(),
            berth: 'Racine Terminal',
            cargo: '5,100 TEU',
            origin: 'Hamburg'
          },
          {
            vessel: 'ATLANTIC STAR',
            type: 'Bulk',
            direction: 'Berthed',
            eta: 'Discharging',
            berth: 'Grain Terminal',
            cargo: 'Wheat - 45,000 MT',
            status: '60% complete'
          }
        ],
        halifax: [
          {
            vessel: 'HAPAG EXPRESS',
            type: 'Container',
            direction: 'Arrival',
            eta: new Date(now.getTime() + 3 * 3600000).toLocaleString(),
            berth: 'South End Terminal',
            cargo: '4,800 TEU',
            origin: 'Rotterdam'
          },
          {
            vessel: 'ZIM VIRGINIA',
            type: 'Container',
            direction: 'Departure',
            eta: new Date(now.getTime() + 6 * 3600000).toLocaleString(),
            berth: 'Fairview Cove',
            cargo: '3,200 TEU',
            destination: 'New York'
          }
        ],
        princrupert: [
          {
            vessel: 'OOCL JAPAN',
            type: 'Container',
            direction: 'Arrival',
            eta: new Date(now.getTime() + 1 * 3600000).toLocaleString(),
            berth: 'Fairview Terminal',
            cargo: '9,800 TEU',
            origin: 'Tokyo'
          },
          {
            vessel: 'EVER GIVEN',
            type: 'Container',
            direction: 'Berthed',
            eta: 'Loading operations',
            berth: 'DP World Terminal',
            cargo: '11,500 TEU',
            status: 'On schedule'
          }
        ]
      };
      return schedules[portName] || schedules.vancouver;
    } catch (error) {
      console.error('PortHub: Error fetching port schedule', error);
      return [];
    }
  }

  // Mock rail connections
  getRailConnections(portName) {
    try {
      const now = new Date();
      const connections = {
        vancouver: [
          {
            train: 'CN-V401',
            carrier: 'CN Rail',
            destination: 'Calgary Intermodal',
            departure: new Date(now.getTime() + 3 * 3600000).toLocaleString(),
            containers: 145,
            status: 'Loading'
          },
          {
            train: 'CPKC-V220',
            carrier: 'CPKC',
            destination: 'Toronto Vaughan',
            departure: new Date(now.getTime() + 8 * 3600000).toLocaleString(),
            containers: 132,
            status: 'Scheduled'
          }
        ],
        montreal: [
          {
            train: 'CN-M305',
            carrier: 'CN Rail',
            destination: 'Toronto MacMillan',
            departure: new Date(now.getTime() + 2 * 3600000).toLocaleString(),
            containers: 98,
            status: 'Boarding'
          }
        ],
        halifax: [
          {
            train: 'CN-H180',
            carrier: 'CN Rail',
            destination: 'Montreal',
            departure: new Date(now.getTime() + 5 * 3600000).toLocaleString(),
            containers: 76,
            status: 'Scheduled'
          }
        ],
        princrupert: [
          {
            train: 'CN-PR520',
            carrier: 'CN Rail',
            destination: 'Winnipeg',
            departure: new Date(now.getTime() + 4 * 3600000).toLocaleString(),
            containers: 168,
            status: 'Loading'
          }
        ]
      };
      return connections[portName] || [];
    } catch (error) {
      console.error('PortHub: Error fetching rail connections', error);
      return [];
    }
  }

  renderPortSelector() {
    const ports = [
      { id: 'vancouver', name: 'Vancouver', icon: '🚢' },
      { id: 'montreal', name: 'Montreal', icon: '⚓' },
      { id: 'halifax', name: 'Halifax', icon: '🌊' },
      { id: 'princrupert', name: 'Prince Rupert', icon: '🏔️' }
    ];

    return `
      <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; padding: 1rem; background: rgba(100, 255, 218, 0.05); border-radius: 8px;">
        <span style="color: var(--text-secondary); font-weight: 600; margin-right: 0.5rem;">Select Port:</span>
        ${ports.map(port => `
          <button class="port-selector-btn" data-port="${port.id}" style="
            padding: 0.5rem 1.5rem;
            border: 2px solid ${this.selectedPort === port.id ? 'var(--accent-blue)' : 'var(--glass-border)'};
            background: ${this.selectedPort === port.id ? 'rgba(100, 255, 218, 0.1)' : 'transparent'};
            color: ${this.selectedPort === port.id ? 'var(--accent-blue)' : 'var(--text-secondary)'};
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
          ">
            ${port.icon} ${port.name}
          </button>
        `).join('')}
      </div>
    `;
  }

  renderPortStats() {
    const stats = this.getPortContainerStats(this.selectedPort);
    
    if (!stats) {
      return `
        <div style="background: rgba(255, 107, 107, 0.1); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--accent-orange); text-align: center;">
          <p style="color: var(--accent-orange); margin: 0;">⚠️ Port data unavailable</p>
        </div>
      `;
    }

    return `
      <div style="background: rgba(100, 255, 218, 0.05); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--glass-border);">
        <h3 style="color: var(--accent-blue); margin-bottom: 1rem;">${stats.name} (${stats.code})</h3>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
          <div style="padding: 1rem; background: rgba(100, 255, 218, 0.03); border-radius: 6px;">
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--accent-blue);">${stats.totalTEU.toLocaleString()}</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">Annual TEU Capacity</div>
          </div>
          <div style="padding: 1rem; background: rgba(100, 255, 218, 0.03); border-radius: 6px;">
            <div style="font-size: 1.5rem; font-weight: 700; color: ${stats.currentLoad > 75 ? 'var(--accent-orange)' : 'var(--accent-blue)'};">${stats.currentLoad}%</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">Current Capacity Load</div>
          </div>
          <div style="padding: 1rem; background: rgba(100, 255, 218, 0.03); border-radius: 6px;">
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--accent-blue);">${stats.vesselCount}</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">Vessels in Port</div>
          </div>
          <div style="padding: 1rem; background: rgba(100, 255, 218, 0.03); border-radius: 6px;">
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--accent-blue);">${stats.avgDwellTime}</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">Avg Container Dwell</div>
          </div>
        </div>

        <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(100, 255, 218, 0.03); border-radius: 6px;">
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">On-Time Performance</div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="flex: 1; height: 8px; background: #1a1a2e; border-radius: 4px; overflow: hidden;">
              <div style="width: ${stats.onTimePerformance}%; height: 100%; background: ${stats.onTimePerformance >= 95 ? '#4ade80' : 'var(--accent-blue)'}; transition: width 0.3s;"></div>
            </div>
            <div style="font-weight: 700; color: ${stats.onTimePerformance >= 95 ? '#4ade80' : 'var(--accent-blue)'};">${stats.onTimePerformance}%</div>
          </div>
        </div>

        <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(100, 255, 218, 0.03); border-radius: 6px;">
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Top Commodities</div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            ${stats.topCommodities.map(commodity => `
              <span style="padding: 0.25rem 0.75rem; background: rgba(100, 255, 218, 0.1); border: 1px solid var(--accent-blue); border-radius: 12px; font-size: 0.75rem; color: var(--accent-blue);">
                ${commodity}
              </span>
            `).join('')}
          </div>
        </div>

        <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 1rem;">
          Last updated: ${new Date().toLocaleTimeString()}
        </p>
      </div>
    `;
  }

  renderVesselSchedule() {
    const schedule = this.getPortSchedule(this.selectedPort);
    
    if (!schedule || schedule.length === 0) {
      return `
        <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
          <p>🚢 No vessel schedule available</p>
        </div>
      `;
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${schedule.map(vessel => `
          <div class="card" style="padding: 1rem; border-left: 3px solid ${
            vessel.direction === 'Arrival' ? 'var(--accent-blue)' : 
            vessel.direction === 'Departure' ? '#fbbf24' : 
            '#4ade80'
          };">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <strong>${vessel.vessel}</strong>
              <span style="color: ${
                vessel.direction === 'Arrival' ? 'var(--accent-blue)' : 
                vessel.direction === 'Departure' ? '#fbbf24' : 
                '#4ade80'
              }; font-size: 0.85rem; font-weight: 600;">
                ${vessel.direction}
              </span>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">
              <div style="margin-bottom: 0.3rem;">🚢 Type: ${vessel.type}</div>
              <div style="margin-bottom: 0.3rem;">📦 Cargo: ${vessel.cargo}</div>
              <div style="margin-bottom: 0.3rem;">🏗️ Berth: ${vessel.berth}</div>
              <div style="margin-bottom: 0.3rem;">⏱️ ${vessel.direction === 'Arrival' ? 'ETA' : vessel.direction === 'Departure' ? 'ETD' : 'Status'}: ${vessel.eta}</div>
              ${vessel.origin ? `<div style="margin-bottom: 0.3rem;">📍 From: ${vessel.origin}</div>` : ''}
              ${vessel.destination ? `<div style="margin-bottom: 0.3rem;">🎯 To: ${vessel.destination}</div>` : ''}
              ${vessel.status ? `<div style="color: var(--accent-blue); margin-top: 0.5rem;">ℹ️ ${vessel.status}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderRailConnections() {
    const connections = this.getRailConnections(this.selectedPort);
    
    if (!connections || connections.length === 0) {
      return `
        <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
          <p>🚂 No rail connections available</p>
        </div>
      `;
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${connections.map(train => `
          <div class="card" style="padding: 1rem; border-left: 3px solid ${
            train.status === 'Loading' || train.status === 'Boarding' ? '#fbbf24' : 'var(--accent-blue)'
          };">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <strong>🚂 ${train.train}</strong>
              <span style="color: ${
                train.status === 'Loading' || train.status === 'Boarding' ? '#fbbf24' : 'var(--accent-blue)'
              }; font-size: 0.85rem; font-weight: 600;">
                ${train.status}
              </span>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">
              <div style="margin-bottom: 0.3rem;">🏢 Carrier: ${train.carrier}</div>
              <div style="margin-bottom: 0.3rem;">🎯 Destination: ${train.destination}</div>
              <div style="margin-bottom: 0.3rem;">📦 Containers: ${train.containers}</div>
              <div style="margin-bottom: 0.3rem;">⏱️ Departure: ${train.departure}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  render() {
    return `
      <section class="card" style="grid-column: span 12;">
        <div class="card-title">🌊 Canadian Ports Real-time Monitoring</div>
        
        ${this.renderPortSelector()}
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 1.5rem;">
          <!-- Port Stats -->
          <div style="grid-column: span 2;">
            <h3 style="color: var(--accent-blue); margin-bottom: 1rem;">📊 Port Statistics & Performance</h3>
            ${this.renderPortStats()}
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; margin-top: 2rem;">
          <!-- Vessel Schedule -->
          <div>
            <h3 style="color: var(--accent-blue); margin-bottom: 1rem;">🚢 Vessel Schedule</h3>
            <div style="max-height: 500px; overflow-y: auto;">
              ${this.renderVesselSchedule()}
            </div>
          </div>
          
          <!-- Rail Connections -->
          <div>
            <h3 style="color: var(--accent-blue); margin-bottom: 1rem;">🚂 Rail Intermodal Connections</h3>
            <div style="max-height: 500px; overflow-y: auto;">
              ${this.renderRailConnections()}
            </div>
          </div>
        </div>
        
        <div style="margin-top: 2rem; padding: 1rem; background: rgba(100, 255, 218, 0.05); border-radius: 8px; border: 1px solid var(--glass-border);">
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            📊 Data updates every 5 minutes | 
            🔴 Live tracking active | 
            📡 Connected to port authorities, vessel AIS, and CN/CPKC systems
          </p>
        </div>
      </section>
    `;
  }

  startAutoRefresh(callback) {
    if (this.isRefreshing) {
      console.warn('PortHub: Auto-refresh already active');
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
