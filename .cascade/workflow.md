# Cascade Workflow - Maritime Logistics Development

## Workflow 1: Adding New Shipping Routes

**Trigger**: User requests support for new origin/destination pairs

**Steps**:
1. **Update TRANSIT_DATA** in `maritime-logistics-dashboard/main.js`
   - Add sea transit time: `"Origin-Port": days`
   - Add land transit time: `"Port-Destination": days`
   
2. **Update Route Options Logic** in `updateResults()`
   - Modify the conditional logic for port options
   - Add new origin to the if-else chain
   
3. **Test Route Calculation**
   - Verify all transport legs are defined
   - Test with Standard, Premium, Safest modes
   - Validate geopolitical penalty application
   
4. **Update UI Options**
   - Add new origins to `<select id="origin">` in index.html
   - Add new destinations to `<select id="destination">`

**Expected Outcome**: New routes calculate correctly with proper transit times and penalties.

---

## Workflow 2: Implementing Real-Time Freight Rates

**Trigger**: User wants live freight rate quotes

**Steps**:
1. **Setup API Credentials**
   - Register with SeaRates/Freightify
   - Store API keys in environment variables (not in code!)
   - Create `.env` file: `VITE_SEARATES_API_KEY=your_key`
   
2. **Create Rate Fetching Module** (`src/api/freightRates.js`)
   ```javascript
   export async function fetchRates(origin, destination, containerType) {
     const response = await fetch('/api/rates', {
       method: 'POST',
       body: JSON.stringify({ origin, destination, containerType })
     });
     return response.json();
   }
   ```
   
3. **Create Backend Proxy** (if needed for CORS)
   - Setup Express.js server in `server/` directory
   - Proxy API calls to avoid exposing keys
   
4. **Implement Rate Display Component**
   - Create new dashboard card for rate results
   - Display multiple carrier options with prices
   - Add sorting by price/transit time
   
5. **Add Historical Rate Tracking**
   - Store fetched rates in localStorage with timestamps
   - Create Chart.js visualization for price trends
   - Implement 30-day rolling average

**Expected Outcome**: Users see real-time carrier rates with historical price context.

---

## Workflow 3: Building Interactive Vessel Tracking Map

**Trigger**: User needs visual tracking of shipments

**Steps**:
1. **Install Dependencies**
   ```bash
   npm install leaflet leaflet-realtime
   ```
   
2. **Create Map Component** (`src/components/TrackingMap.js`)
   - Initialize Leaflet map centered on shipping lanes
   - Add OpenStreetMap tile layer
   - Setup vessel marker icons
   
3. **Integrate AIS Data Source**
   - Register for MarineTraffic or VesselFinder API
   - Create data fetching service
   - Parse vessel position data (lat, lon, heading, speed)
   
4. **Implement Real-Time Updates**
   ```javascript
   const realtimeLayer = L.realtime({
     url: '/api/vessel-positions',
     interval: 60000 // Update every minute
   }).addTo(map);
   ```
   
5. **Add Route Visualization**
   - Draw polylines for planned routes
   - Show port markers with names
   - Display vessel popups with shipment details
   
6. **Integrate with Dashboard**
   - Add map container to dashboard grid
   - Link vessel clicks to shipment details
   - Show ETA calculations

**Expected Outcome**: Interactive map showing real-time vessel positions with route visualization.

---

## Workflow 4: HS Code Lookup Integration

**Trigger**: User needs customs classification for products

**Steps**:
1. **Choose HS Code API**
   - Dutify (UK/US): Best for accuracy
   - Avalara: Enterprise-grade, AI-powered
   - Freightos: Simple, free tier available
   
2. **Create Product Entry Form**
   - Product description textarea
   - Origin country selector
   - Destination country selector
   - Weight/dimensions inputs
   
3. **Implement API Call** (`src/api/hsCodeLookup.js`)
   ```javascript
   export async function lookupHSCode(description, origin, destination) {
     const response = await fetch('/api/hs-lookup', {
       method: 'POST',
       body: JSON.stringify({ description, origin, destination })
     });
     return response.json();
   }
   ```
   
4. **Display Results**
   - Show top 5 matching HS codes
   - Display full hierarchy (Chapter > Heading > Subheading)
   - Include duty rate estimates
   - Allow user to select correct classification
   
5. **Store Product Library**
   - Save product + HS code associations
   - Enable quick lookup for repeat shipments
   - Export to CSV for customs documentation

**Expected Outcome**: Automated HS code classification with product library management.

---

## Workflow 5: Implementing Authentication & Access Control

**Trigger**: Protect freightracing.ca from unauthorized access

**Steps**:
1. **Update Caddyfile for Basic Auth**
   ```
   freightracing.ca {
       basicauth {
           admin $2a$14$...  # bcrypt hashed password
       }
       root * /var/www/maritime-logistics-dashboard/dist
       file_server
       encode gzip
       tls YXJ19980410@GMAIL.COM
   }
   ```
   
2. **Generate Secure Password Hash**
   ```bash
   caddy hash-password --plaintext 'YourSecurePassword123!'
   ```
   
3. **Setup Environment-Based Credentials**
   - Create `.env` file (never commit!)
   - Use strong, unique password
   - Document password storage location securely
   
4. **Test Authentication**
   - Verify browser prompts for credentials
   - Test incorrect password rejection
   - Confirm session persistence
   
5. **Add Session Timeout** (optional)
   - Configure Caddy session duration
   - Implement logout functionality

**Expected Outcome**: Single-user authentication protecting entire application.

---

## Workflow 6: Deployment to Production

**Trigger**: Ready to deploy to freightracing.ca

**Steps**:
1. **Build Production Assets**
   ```bash
   cd /home/kermityuan/frieght-tracing-app/maritime-logistics-dashboard
   npm run build
   ```
   
2. **Update Caddyfile**
   ```
   freightracing.ca {
       root * /home/kermityuan/frieght-tracing-app/maritime-logistics-dashboard/dist
       file_server
       encode gzip
       tls YXR19980410@GMAIL.COM
   }
   ```
   
3. **Configure DNS**
   - Point freightracing.ca A record to server IP
   - Wait for DNS propagation (up to 48 hours)
   
4. **Start Caddy**
   ```bash
   sudo systemctl start caddy
   sudo systemctl enable caddy  # Auto-start on boot
   ```
   
5. **Verify SSL Certificate**
   - Caddy automatically provisions Let's Encrypt cert
   - Check https://freightracing.ca loads with valid SSL
   
6. **Setup Auto-Deployment** (optional)
   - Create deploy script: `./caddy-deploy.sh`
   - Add git hooks for automatic builds

**Expected Outcome**: Live production application at https://freightracing.ca with SSL.

---

## Workflow 7: Performance Optimization

**Trigger**: Application feels slow or data loading is laggy

**Steps**:
1. **Optimize API Calls**
   - Implement request caching (60s TTL for rates)
   - Use AbortController for cancelled requests
   - Batch multiple API calls into single request
   
2. **Code Splitting**
   - Lazy load map components
   - Split chart library into separate bundle
   - Use dynamic imports for heavy modules
   
3. **Asset Optimization**
   - Compress images (ship.png, icons)
   - Minify CSS/JS in production build
   - Enable Caddy gzip compression
   
4. **Database Migration** (if needed)
   - Move from localStorage to IndexedDB for large datasets
   - Implement proper data pagination
   - Add search indexing
   
5. **Monitor Performance**
   - Add Web Vitals tracking
   - Monitor API response times
   - Setup error logging

**Expected Outcome**: Sub-1s page load, smooth interactions, scalable data handling.
