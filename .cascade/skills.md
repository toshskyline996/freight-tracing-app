# Cascade Skills - Maritime Logistics Dashboard

## Skill 1: Route Optimization Analysis
**Purpose**: Analyze and calculate optimal multi-modal shipping routes considering geopolitical risks, transit times, and service modes.

**Context**: 
- Main logic in `maritime-logistics-dashboard/main.js`
- Uses TRANSIT_DATA object for sea and land transit times
- Implements geopolitical penalty system for risky routes (e.g., Bab-el-Mandeb)
- Supports Standard, Premium, and Safest service modes

**Key Functions**:
- `calculateRoute()`: Core route calculation engine
- `updateResults()`: Orchestrates route comparison and ranking
- Applies dynamic penalties based on origin and service mode

**Usage**: When user needs to add new routes, modify transit times, or adjust geopolitical risk factors.

---

## Skill 2: Real-Time Fleet Tracking Simulation
**Purpose**: Simulate and display live vessel tracking updates in the dashboard.

**Context**:
- Located in `maritime-logistics-dashboard/main.js`
- Function `addTrackingRow()` dynamically adds tracking entries
- Uses setTimeout for simulated live data arrival
- Status pills show vessel states (In Transit, Port Delay, En Route)

**Key Functions**:
- `addTrackingRow(id, status, type)`: Adds new tracking entry to table
- Integration point for real vessel tracking APIs (AIS data)

**Usage**: When implementing real AIS vessel tracking or expanding simulated fleet data.

---

## Skill 3: History & Persistence Management
**Purpose**: Maintain localStorage-backed calculation history with UI rendering.

**Context**:
- Uses browser localStorage for data persistence
- Stores up to 10 most recent route calculations
- Key: `maritime_history`
- Includes timestamp, route details, and total transit time

**Key Functions**:
- `saveToHistory(route)`: Persists route calculation
- `updateHistoryUI()`: Renders history panel with clear functionality
- Automatic cleanup (maintains 10-item limit)

**Usage**: When extending persistence to include saved shipments, favorite routes, or export functionality.

---

## Skill 4: Toronto Hub Regional View
**Purpose**: Display Toronto-specific logistics intelligence including highway traffic and terminal status.

**Context**:
- Dynamic content replacement for Toronto Hub navigation
- Monitors 400-series highways (401, 407 ETR)
- Tracks intermodal terminal utilization (CN Brampton, CPKC Vaughan)
- Uses percentage-based visual indicators

**Key Functions**:
- Navigation event handler for Toronto link
- Dynamic HTML injection for regional view
- Real-time status indicators for traffic and terminals

**Usage**: When adding new regional hubs (Vancouver, Montreal) or expanding terminal tracking.

---

## Skill 5: Dashboard Navigation & State Management
**Purpose**: Handle SPA-style navigation without page reloads, maintaining application state.

**Context**:
- Caches original dashboard HTML in `DASHBOARD_HTML`
- Manages active navigation link styling
- Rebinds event handlers after innerHTML replacement
- Maintains calculation state across views

**Key Functions**:
- Dashboard link click handler: Restores main view
- Active class management for navigation highlighting
- Event handler rebinding after dynamic content updates

**Usage**: When adding new navigation sections or implementing proper routing with hash navigation.

---

## Skill 6: HS Code Lookup Integration (Future)
**Purpose**: Integrate harmonized tariff code lookup for customs compliance.

**Recommended APIs**:
- Dutify Tariff Search API (UK/US)
- Avalara Tariff Code Classification
- Freightos HS Code Lookup

**Implementation Strategy**:
1. Create product input form with description
2. Call HS code API with product details
3. Display multiple potential matches with descriptions
4. Allow user selection and storage
5. Link HS codes to shipment records

**Usage**: For customs documentation automation and duty calculation.

---

## Skill 7: Freight Rate API Integration (Future)
**Purpose**: Real-time freight rate procurement from ocean carriers.

**Recommended APIs**:
- SeaRates Logistics Explorer API
- Freightify Rate Procurement API
- Individual carrier APIs (Maersk, CMA CGM, etc.)

**Implementation Strategy**:
1. Create rate request form (origin, destination, container type, weight)
2. Poll multiple carrier APIs in parallel
3. Store historical rates in localStorage/database
4. Display rate comparison with charts
5. Implement rate alerts for favorable pricing

**Usage**: For automated quote generation and rate analytics.

---

## Skill 8: Map-Based Vessel Tracking (Future)
**Purpose**: Display real-time vessel positions on interactive map.

**Recommended Stack**:
- Leaflet.js + OpenStreetMap (free, open-source)
- Leaflet Realtime plugin for live data updates
- AIS data sources: MarineTraffic API, VesselFinder API

**Implementation Strategy**:
1. Add Leaflet map container to dashboard
2. Initialize map with ocean/port markers
3. Fetch vessel positions via AIS API
4. Use Leaflet Realtime to update markers
5. Add vessel info popups with ETA, speed, status
6. Draw route lines showing voyage trajectory

**Usage**: Core feature for shipment visibility and ETA tracking.
