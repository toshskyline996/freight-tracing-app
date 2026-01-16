# 🔄 Freight Tracing Workflow Automation

This directory contains the workflow automation infrastructure for the Freight Tracing application using **n8n** and **Dify**.

## 🎯 Overview

- **n8n**: Workflow automation for data pipelines, API integrations, and scheduled tasks
- **Dify**: AI orchestration platform for integrating LLM capabilities (Gemini 2.0 Flash)
- **PostgreSQL**: Shared database for workflows and data storage
- **Redis**: Cache and message broker

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose installed
- At least 4GB RAM available
- Ports 5678, 3000, 5001, 5432, 6379 available

### 1. Setup Environment

```bash
cd workflow
cp .env.example .env
# Edit .env with your credentials
nano .env
```

### 2. Start Services

```bash
docker-compose up -d
```

### 3. Access Interfaces

| Service | URL | Default Credentials |
|---------|-----|---------------------|
| **n8n** | http://localhost:5678 | admin / changeme |
| **Dify Web** | http://localhost:3000 | N/A (create account) |
| **Dify API** | http://localhost:5001 | N/A |
| **PostgreSQL** | localhost:5432 | freight / freight123 |
| **Redis** | localhost:6379 | password: redis123 |

### 4. Verify Installation

```bash
# Check all containers are running
docker-compose ps

# View logs
docker-compose logs -f

# Test database connection
docker-compose exec postgres psql -U freight -d freight_automation -c "\dt freight_data.*"
```

---

## 📚 Use Cases

### 1. **Real-time Data Sync Workflows**

**n8n Workflow**: Sync vessel positions from AIS APIs to frontend

```
Trigger (Cron: Every 5 min)
  → HTTP Request (AIS API)
  → Transform Data (Extract lat/lng)
  → PostgreSQL (Insert/Update vessel_tracking)
  → Webhook (Notify frontend)
```

**Benefits**:
- Automatic data refresh
- Centralized data storage
- Error handling and retry logic

### 2. **AI-Powered Freight Assistant**

**Dify Application**: Answer user queries about shipments

```
User Question: "Where is MSC OSCAR?"
  → Dify (Query PostgreSQL)
  → Gemini 2.0 Flash (Generate natural response)
  → Response: "MSC OSCAR is currently 500 km west of Vancouver, 
              ETA Jan 20 14:30 UTC"
```

**Benefits**:
- Natural language queries
- Context-aware responses
- Multi-turn conversations

### 3. **Automated HS Code Lookup**

**n8n Workflow**: Scrape CBSA website for HS codes

```
Trigger (Manual/Scheduled)
  → HTTP Request (CBSA search)
  → HTML Parse (Extract codes)
  → PostgreSQL (Insert hs_code_cache)
  → Webhook (Update frontend)
```

**Benefits**:
- Automated data collection
- No manual data entry
- Always up-to-date

### 4. **Port Congestion Alerts**

**n8n Workflow**: Monitor port capacity and send alerts

```
Trigger (Cron: Every hour)
  → PostgreSQL (Query port_stats)
  → IF (current_load > 80%)
    → Send Email Alert
    → Update Dashboard Status
```

**Benefits**:
- Proactive monitoring
- Automatic notifications
- Real-time insights

---

## 🛠️ Configuration

### n8n Workflows Location

Store your workflows in `./n8n-workflows/` (auto-mounted to container)

### Database Schema

See `init-db.sql` for the complete schema:
- `freight_data.vessel_tracking` - Real-time vessel positions
- `freight_data.port_stats` - Port statistics
- `freight_data.rail_tracking` - Train tracking
- `freight_data.hs_code_cache` - HS code database
- `freight_data.workflow_logs` - Execution logs

### API Integration Examples

#### Connect to Freight App

```javascript
// n8n HTTP Request Node
{
  "method": "POST",
  "url": "https://freightracing.ca/api/webhook",
  "headers": {
    "Authorization": "Bearer ${FREIGHT_APP_WEBHOOK_SECRET}"
  },
  "body": {
    "vessel_id": "MSC-OSCAR-001",
    "position": { "lat": 35.5, "lng": -145.2 }
  }
}
```

#### Query PostgreSQL from n8n

```sql
-- n8n PostgreSQL Node
SELECT vessel_name, latitude, longitude, eta
FROM freight_data.vessel_tracking
WHERE status = 'In Transit'
ORDER BY eta ASC
LIMIT 10;
```

---

## 🧩 Dify AI Agent Setup

### 1. Create API Key in Dify

1. Access Dify Web: http://localhost:3000
2. Create account (first time only)
3. Go to **Settings** → **API Keys**
4. Create new key, copy it

### 2. Configure Gemini Model

1. Go to **Models** → **Add Model**
2. Select **Google Gemini**
3. Enter your `GEMINI_API_KEY`
4. Choose **Gemini 2.0 Flash**

### 3. Create Freight Assistant Agent

```yaml
Agent Name: Freight Assistant
Model: Gemini 2.0 Flash
System Prompt: |
  You are a freight logistics expert assistant. You help users:
  - Track vessels, trains, and cargo
  - Find optimal shipping routes
  - Look up HS codes and duties
  - Monitor port congestion
  
  You have access to real-time data from PostgreSQL database.
  Always provide accurate, concise, and helpful responses.

Tools:
  - PostgreSQL Query (freight_data schema)
  - Web Search (for current rates)
  - Calculator (for cost estimates)

Memory: Enabled (remember conversation context)
```

### 4. Integrate with Frontend

```javascript
// Add to freight-tracing-app
const DIFY_API_KEY = 'your-dify-api-key';

async function askFreightAssistant(question) {
  const response = await fetch('http://localhost:5001/v1/chat-messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DIFY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: question,
      user: 'user-123',
      conversation_id: null, // or existing conversation ID
      response_mode: 'blocking'
    })
  });
  
  const data = await response.json();
  return data.answer;
}
```

---

## 📊 Monitoring & Maintenance

### Check Service Health

```bash
# n8n
curl http://localhost:5678/healthz

# Dify API
curl http://localhost:5001/health

# PostgreSQL
docker-compose exec postgres pg_isready
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f n8n
docker-compose logs -f dify-api
```

### Backup Database

```bash
# Backup
docker-compose exec postgres pg_dump -U freight freight_automation > backup.sql

# Restore
docker-compose exec -T postgres psql -U freight freight_automation < backup.sql
```

### Clean Old Logs

```bash
docker-compose exec postgres psql -U freight -d freight_automation -c "SELECT freight_data.cleanup_old_logs();"
```

---

## 🔒 Security Recommendations

### Production Deployment

1. **Change all default passwords** in `.env`
2. **Enable HTTPS** with reverse proxy (Nginx/Caddy)
3. **Restrict network access**:
   ```yaml
   # docker-compose.yml
   ports:
     - "127.0.0.1:5678:5678"  # Only localhost
   ```
4. **Set strong encryption keys**
5. **Enable firewall rules**
6. **Regular backups**

### API Key Management

- Store keys in `.env` (never commit to Git)
- Use Docker secrets for production
- Rotate keys regularly
- Use separate keys per environment

---

## 🚨 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs [service-name]

# Restart service
docker-compose restart [service-name]

# Rebuild
docker-compose down
docker-compose up -d --build
```

### Database Connection Errors

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U freight -d freight_automation -c "SELECT 1;"
```

### n8n Workflow Fails

1. Check n8n logs: `docker-compose logs n8n`
2. Verify credentials in n8n UI
3. Test API endpoints manually
4. Check database permissions

### Dify Agent Not Responding

1. Verify Gemini API key is valid
2. Check Dify API logs: `docker-compose logs dify-api`
3. Ensure PostgreSQL and Redis are healthy
4. Test Dify API directly: `curl http://localhost:5001/health`

---

## 📦 Stopping Services

```bash
# Stop (keeps data)
docker-compose stop

# Stop and remove containers (keeps data)
docker-compose down

# Remove everything including data
docker-compose down -v
```

---

## 🎓 Learning Resources

- **n8n Documentation**: https://docs.n8n.io
- **Dify Documentation**: https://docs.dify.ai
- **Docker Compose**: https://docs.docker.com/compose/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Gemini API**: https://ai.google.dev/docs

---

## 🔗 Integration with Freight App

### Webhook Endpoint (n8n → Frontend)

```javascript
// In freight-tracing-app/main.js
async function handleWorkflowUpdate(data) {
  if (data.type === 'vessel_update') {
    // Update vessel position on map
    mapTracker.updateVesselPosition(data.vessel_id, data.position);
  } else if (data.type === 'port_stats') {
    // Refresh port hub
    portHub.render();
  }
}

// Listen for webhook events
const eventSource = new EventSource('http://localhost:5678/webhook/freight-updates');
eventSource.onmessage = (event) => {
  handleWorkflowUpdate(JSON.parse(event.data));
};
```

### Query Workflow Status (Frontend → n8n)

```javascript
async function getWorkflowStatus(workflowId) {
  const response = await fetch(`http://localhost:5678/api/v1/workflows/${workflowId}/executions`, {
    headers: {
      'X-N8N-API-KEY': process.env.N8N_API_KEY
    }
  });
  return await response.json();
}
```

---

**Status**: ✅ Ready for deployment
**Version**: 1.0.0
**Last Updated**: 2026-01-16
