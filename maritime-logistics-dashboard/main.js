import MaritimeTracker from './src/mapTracker.js'
import ProductManager from './src/productManager.js'
import TorontoHub from './src/torontoHub.js'
import LiveTrackingFilter from './src/liveTrackingFilter.js'
import PortHub from './src/portHub.js'
import AIAssistant from './src/aiAssistant.js'
import ShipmentManager from './src/shipmentManager.js'

let mapTracker = null
let productManager = new ProductManager()
let torontoHub = new TorontoHub()
let trackingFilter = new LiveTrackingFilter()
let portHub = new PortHub()
let aiAssistant = new AIAssistant()
let shipmentManager = new ShipmentManager()

// Load API key from storage on startup
aiAssistant.loadApiKeyFromStorage()

const TRANSIT_DATA = {
  "Shanghai-PrinceRupert": 14,
  "Shanghai-Vancouver": 17,
  "Shanghai-LA": 18,
  "Mumbai-Halifax": 28,
  "Rotterdam-Montreal": 11,
  "Rotterdam-Halifax": 9,
  "PrinceRupert-Chicago": 4,
  "PrinceRupert-Toronto": 5,
  "Vancouver-Chicago": 5,
  "Vancouver-Toronto": 6,
  "Montreal-Toronto": 2,
  "Halifax-Toronto": 3,
  "Chicago-Memphis": 2,
};

let history = JSON.parse(localStorage.getItem('maritime_history')) || [];

function saveToHistory(route) {
  const entry = {
    ...route,
    timestamp: new Date().toISOString()
  };
  history.unshift(entry);
  if (history.length > 10) history.pop();
  localStorage.setItem('maritime_history', JSON.stringify(history));
  updateHistoryUI();
}

function calculateRoute(origin, destination, viaPort, geoPenalty = 0) {
  const seaKey = `${origin}-${viaPort}`;
  const landKey = `${viaPort}-${destination}`;

  const seaTime = TRANSIT_DATA[seaKey];
  const landTime = TRANSIT_DATA[landKey];

  if (seaTime === undefined || landTime === undefined) return null;

  return {
    origin,
    destination,
    via: viaPort,
    sea: seaTime,
    land: landTime,
    penalty: geoPenalty,
    total: seaTime + landTime + geoPenalty
  };
}

function updateResults() {
  const origin = document.getElementById('origin').value;
  const destination = document.getElementById('destination').value;
  const mode = document.getElementById('mode').value;
  const resultsDisplay = document.getElementById('results-display');

  let options = [];
  if (origin === "Shanghai") options = ["PrinceRupert", "Vancouver", "LA"];
  else if (origin === "Mumbai") options = ["Halifax"];
  else if (origin === "Rotterdam") options = ["Montreal", "Halifax"];

  const geoPenalty = (origin === "Mumbai" && mode !== "Safest") ? 12 : 0;

  const results = options
    .map(port => {
      let route = calculateRoute(origin, destination, port, geoPenalty);
      if (!route) return null;
      if (mode === "Premium") {
        route.land = Math.max(1, route.land - 1);
        route.total = route.sea + route.land + route.penalty;
      }
      return route;
    })
    .filter(r => r !== null)
    .sort((a, b) => a.total - b.total);

  if (results.length === 0) {
    resultsDisplay.innerHTML = `<p style="color: var(--accent-orange)">No direct routes found for this pairing.</p>`;
    return;
  }

  let html = `<h3 style="margin-bottom: 1rem;">Optimal Solutions ${geoPenalty > 0 ? '<span style="color: var(--accent-orange); font-size: 0.8rem;">(via Cape of Good Hope)</span>' : ''}</h3>`;
  results.forEach((r, i) => {
    const isBest = i === 0;
    if (isBest) saveToHistory(r);
    html += `
      <div style="background: ${isBest ? 'rgba(100, 255, 218, 0.05)' : 'transparent'}; 
                  padding: 1.2rem; border-radius: 8px; margin-bottom: 1rem; 
                  border: 1px solid ${isBest ? 'var(--accent-blue)' : 'var(--glass-border)'}">
        <div style="display: flex; justify-content: space-between; font-weight: 700; color: ${isBest ? 'var(--accent-blue)' : 'var(--text-primary)'}">
          <span>via ${r.via} ${isBest ? '🏆' : ''}</span>
          <span>${r.total} Days</span>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem; display: flex; justify-content: space-between;">
          <span>Sea Transit: ${r.sea}d | Rail lead: ${r.land}d</span>
          ${r.penalty > 0 ? `<span style="color: var(--accent-orange)">Geopolitical Penalty: +${r.penalty}d</span>` : ''}
        </div>
        <div style="margin-top: 0.75rem; font-size: 0.75rem;">
            <span style="color: var(--accent-blue);">⚡ Priority Handling</span> | 
            <span style="color: var(--text-secondary);">Carbon Impact: Low</span>
        </div>
      </div>
    `;
  });

  resultsDisplay.innerHTML = html;
}

const shipmentManagerLink = document.getElementById('shipment-manager-link');
const torontoLink = document.getElementById('toronto-link');
const portsLink = document.getElementById('ports-link');
const aiAssistantLink = document.getElementById('ai-assistant-link');
const logisticsToolsLink = document.getElementById('logistics-tools-link');
const dashboardLink = document.getElementById('dashboard-link');

const dashboardGrid = document.querySelector('.dashboard-grid');
const navLinks = document.querySelectorAll('.nav-link');

const DASHBOARD_HTML = dashboardGrid.innerHTML;

function clearHubs() {
  if (mapTracker) {
    mapTracker.destroy();
    mapTracker = null;
  }
  torontoHub.stopAutoRefresh();
  portHub.stopAutoRefresh();
  trackingFilter.stopAutoRefresh();
}

dashboardLink.addEventListener('click', () => {
  navLinks.forEach(l => l.classList.remove('active'));
  dashboardLink.classList.add('active');
  
  clearHubs();
  
  dashboardGrid.innerHTML = DASHBOARD_HTML;
  document.getElementById('calculate-btn').addEventListener('click', updateResults);
  updateResults();
});

const liveTrackingLink = document.getElementById('live-tracking-link');

liveTrackingLink.addEventListener('click', () => {
  navLinks.forEach(l => l.classList.remove('active'));
  liveTrackingLink.classList.add('active');
  
  clearHubs();

  const renderTrackingView = () => {
    dashboardGrid.innerHTML = `
      <section class="card" style="grid-column: span 12; height: 800px; padding: 0; overflow: hidden;">
        <div id="vessel-map" style="width: 100%; height: 100%;"></div>
      </section>
      <section class="card" style="grid-column: span 12;">
        <div class="card-title">🌍 Global Fleet Tracking - Real-time Multi-modal</div>
        ${trackingFilter.renderFilterButtons()}
        <div id="vessel-cards-container">
          ${trackingFilter.renderVesselCards()}
        </div>
      </section>
    `;

    // Attach filter button listeners
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = e.target.getAttribute('data-type');
        trackingFilter.toggleFilter(type);
        renderTrackingView();

        // Reinitialize map after filter change
        setTimeout(() => {
          if (mapTracker) {
            mapTracker.destroy();
          }
          mapTracker = new MaritimeTracker('vessel-map');
          mapTracker.initialize();
          attachVesselFocusListeners();
        }, 100);
      });
    });

    // Initialize map
    setTimeout(() => {
      if (mapTracker) {
        mapTracker.destroy();
      }
      mapTracker = new MaritimeTracker('vessel-map');
      mapTracker.initialize();
      attachVesselFocusListeners();
    }, 100);

    // Start OpenSky auto-refresh for live flight data
    trackingFilter.startAutoRefresh(() => {
      const cardsContainer = document.getElementById('vessel-cards-container');
      if (cardsContainer) {
        cardsContainer.innerHTML = trackingFilter.renderVesselCards();
        attachVesselFocusListeners();
      }
      // Re-render filter buttons to update data-source label
      const filterSection = document.querySelector('.card-title + div');
      if (filterSection) {
        filterSection.outerHTML = trackingFilter.renderFilterButtons();
        document.querySelectorAll('.filter-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            trackingFilter.toggleFilter(e.target.getAttribute('data-type'));
            renderTrackingView();
          });
        });
      }
    });
  };

  const attachVesselFocusListeners = () => {
    document.querySelectorAll('.focus-vessel-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.fleet-status-card');
        const vesselId = card.getAttribute('data-vessel');
        mapTracker.focusOnVessel(vesselId);
      });
    });
  };

  renderTrackingView();

});

// Route Planner Link (same as Dashboard for now)
const routePlannerLink = document.getElementById('route-planner-link');

routePlannerLink.addEventListener('click', () => {
  navLinks.forEach(l => l.classList.remove('active'));
  routePlannerLink.classList.add('active');
  
  clearHubs();
  
  dashboardGrid.innerHTML = DASHBOARD_HTML;
  document.getElementById('calculate-btn').addEventListener('click', updateResults);
  updateResults();
});

// Toronto Hub Link
torontoLink.addEventListener('click', () => {
  navLinks.forEach(l => l.classList.remove('active'));
  torontoLink.classList.add('active');
  
  clearHubs();
  
  const renderView = () => {
    dashboardGrid.innerHTML = torontoHub.render();
  };
  
  renderView();
  torontoHub.startAutoRefresh(renderView);
});

// Ports Link
portsLink.addEventListener('click', () => {
  navLinks.forEach(l => l.classList.remove('active'));
  portsLink.classList.add('active');
  
  clearHubs();
  
  const renderView = () => {
    dashboardGrid.innerHTML = portHub.render();
    
    // Attach port selection listeners
    document.querySelectorAll('.port-selector-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const portId = e.currentTarget.getAttribute('data-port');
        portHub.setPort(portId);
        renderView();
      });
    });
  };
  
  renderView();
  portHub.startAutoRefresh(renderView);
});

// AI Assistant Link
aiAssistantLink.addEventListener('click', () => {
  navLinks.forEach(l => l.classList.remove('active'));
  aiAssistantLink.classList.add('active');
  
  clearHubs();
  
  const renderView = () => {
    dashboardGrid.innerHTML = aiAssistant.renderChatInterface();
    aiAssistant.attachEventListeners(renderView);
  };
  
  renderView();
});

// Market Intel Link
const marketIntelLink = document.getElementById('market-intel-link');

marketIntelLink.addEventListener('click', () => {
  navLinks.forEach(l => l.classList.remove('active'));
  marketIntelLink.classList.add('active');
  
  clearHubs();
  
  dashboardGrid.innerHTML = `
    <section class="card" style="grid-column: span 12;">
      <div class="card-title">Market Intelligence Dashboard</div>
      <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
        <h3 style="color: var(--accent-blue); margin-bottom: 1rem;">📈 Real-time Market Analytics</h3>
        <p>Freight rate trends, capacity forecasts, and competitive intelligence coming soon...</p>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 2rem;">
          <div style="padding: 1.5rem; background: rgba(100, 255, 218, 0.05); border-radius: 8px;">
            <div style="font-size: 2rem; color: var(--accent-blue); margin-bottom: 0.5rem;">$2,450</div>
            <div style="font-size: 0.9rem;">Avg. TEU Rate (Shanghai-LA)</div>
            <div style="font-size: 0.75rem; color: var(--accent-blue); margin-top: 0.5rem;">↓ 3.2% vs last week</div>
          </div>
          <div style="padding: 1.5rem; background: rgba(100, 255, 218, 0.05); border-radius: 8px;">
            <div style="font-size: 2rem; color: var(--accent-blue); margin-bottom: 0.5rem;">82%</div>
            <div style="font-size: 0.9rem;">Trans-Pacific Capacity Utilization</div>
            <div style="font-size: 0.75rem; color: #4ade80; margin-top: 0.5rem;">↑ 1.5% stable growth</div>
          </div>
          <div style="padding: 1.5rem; background: rgba(100, 255, 218, 0.05); border-radius: 8px;">
            <div style="font-size: 2rem; color: var(--accent-blue); margin-bottom: 0.5rem;">14.2d</div>
            <div style="font-size: 0.9rem;">Mean Transit Time (Ocean)</div>
            <div style="font-size: 0.75rem; color: var(--accent-orange); margin-top: 0.5rem;">↑ 2.1d delay (Red Sea)</div>
          </div>
        </div>
      </div>
    </section>
  `;
});

// Shipment Manager Link
shipmentManagerLink.addEventListener('click', () => {
  navLinks.forEach(l => l.classList.remove('active'));
  shipmentManagerLink.classList.add('active');
  
  clearHubs();
  
  const renderShipmentView = () => {
    dashboardGrid.innerHTML = shipmentManager.renderView();
    shipmentManager.attachListeners(renderShipmentView);
  };
  
  renderShipmentView();
});

// Logistics Tools / HS Codes Link
logisticsToolsLink.addEventListener('click', () => {
  navLinks.forEach(l => l.classList.remove('active'));
  logisticsToolsLink.classList.add('active');
  
  clearHubs();
  
  const renderView = () => {
    dashboardGrid.innerHTML = productManager.renderProductLibrary();
    productManager.attachEventListeners();
  };
  
  renderView();
});

const trackingTable = document.getElementById('tracking-table');

function addTrackingRow(id, status, type = "online") {
  const row = document.createElement('tr');
  row.innerHTML = `
        <td>${id}</td>
        <td><span class="status-pill status-${type}">${status}</span></td>
    `;
  trackingTable.prepend(row);
}

// Simulate a live data pull
setTimeout(() => {
  addTrackingRow("OOCL HONG KONG", "Arrived Vancouver", "online");
}, 5000);

function updateHistoryUI() {
  const dashboardGrid = document.querySelector('.dashboard-grid');
  if (!dashboardGrid) return;

  let historyPanel = document.querySelector('.history-panel');

  if (!historyPanel) {
    historyPanel = document.createElement('section');
    historyPanel.className = 'card stats-panel history-panel';
    dashboardGrid.appendChild(historyPanel);
  }

  historyPanel.innerHTML = `
        <div class="card-title">Recent Calculations <button id="clear-history" style="width: auto; padding: 2px 8px; margin: 0; font-size: 0.7rem; border: none; background: rgba(255,107,107,0.1); color: var(--accent-orange); border-radius: 4px; cursor: pointer;">Clear</button></div>
        <div id="history-list" style="max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem;">
            ${history.length === 0 ? '<p style="color: var(--text-secondary); font-style: italic; font-size: 0.8rem;">No history yet...</p>' : history.map(h => `
                <div style="border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong style="font-size: 0.85rem;">${h.origin} ➜ ${h.destination}</strong>
                        <span style="color: var(--accent-blue); font-weight: 700;">${h.total}d</span>
                    </div>
                    <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 2px;">
                        via ${h.via} | ${new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            `).join('')}
        </div>
    `;

  document.getElementById('clear-history')?.addEventListener('click', () => {
    history = [];
    localStorage.removeItem('maritime_history');
    updateHistoryUI();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('calculate-btn').addEventListener('click', updateResults);
  updateResults();
  updateHistoryUI();
});
