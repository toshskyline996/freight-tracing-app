-- Initialize database for freight automation workflows
-- This script runs automatically when PostgreSQL container starts

-- Create n8n schema
CREATE SCHEMA IF NOT EXISTS n8n;

-- Create Dify schema
CREATE SCHEMA IF NOT EXISTS dify;

-- Create freight data schema
CREATE SCHEMA IF NOT EXISTS freight_data;

-- Freight tracking table
CREATE TABLE IF NOT EXISTS freight_data.vessel_tracking (
    id SERIAL PRIMARY KEY,
    vessel_id VARCHAR(50) NOT NULL,
    vessel_name VARCHAR(255) NOT NULL,
    vessel_type VARCHAR(50),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    speed DECIMAL(5, 2),
    heading INTEGER,
    status VARCHAR(50),
    eta TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vessel_id)
);

-- Port statistics table
CREATE TABLE IF NOT EXISTS freight_data.port_stats (
    id SERIAL PRIMARY KEY,
    port_code VARCHAR(10) NOT NULL,
    port_name VARCHAR(255) NOT NULL,
    current_load INTEGER,
    vessel_count INTEGER,
    avg_dwell_time_hours DECIMAL(5, 2),
    on_time_performance INTEGER,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(port_code)
);

-- Rail freight tracking table
CREATE TABLE IF NOT EXISTS freight_data.rail_tracking (
    id SERIAL PRIMARY KEY,
    train_id VARCHAR(50) NOT NULL,
    carrier VARCHAR(50),
    origin VARCHAR(255),
    destination VARCHAR(255),
    current_location VARCHAR(255),
    container_count INTEGER,
    status VARCHAR(50),
    eta TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(train_id)
);

-- HS Code cache table
CREATE TABLE IF NOT EXISTS freight_data.hs_code_cache (
    id SERIAL PRIMARY KEY,
    hs_code VARCHAR(20) NOT NULL,
    description TEXT,
    duty_rate VARCHAR(20),
    chapter INTEGER,
    source VARCHAR(50),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hs_code)
);

-- Workflow execution log
CREATE TABLE IF NOT EXISTS freight_data.workflow_logs (
    id SERIAL PRIMARY KEY,
    workflow_name VARCHAR(255) NOT NULL,
    execution_id VARCHAR(100),
    status VARCHAR(50),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    error_message TEXT,
    metadata JSONB
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vessel_tracking_updated ON freight_data.vessel_tracking(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_port_stats_updated ON freight_data.port_stats(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_rail_tracking_updated ON freight_data.rail_tracking(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_status ON freight_data.workflow_logs(status, start_time DESC);

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA freight_data TO freight;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA freight_data TO freight;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA freight_data TO freight;

-- Insert sample data for testing
INSERT INTO freight_data.port_stats (port_code, port_name, current_load, vessel_count, avg_dwell_time_hours, on_time_performance)
VALUES 
    ('CAVAN', 'Port of Vancouver', 78, 24, 100.8, 94),
    ('CAMTR', 'Port of Montreal', 65, 18, 122.4, 91),
    ('CAHAL', 'Port of Halifax', 55, 12, 91.2, 96),
    ('CAPRR', 'Port of Prince Rupert', 82, 16, 76.8, 97)
ON CONFLICT (port_code) DO NOTHING;

-- Create function to clean old logs (keep last 30 days)
CREATE OR REPLACE FUNCTION freight_data.cleanup_old_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM freight_data.workflow_logs
    WHERE start_time < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Log successful initialization
INSERT INTO freight_data.workflow_logs (workflow_name, status, start_time, end_time, metadata)
VALUES ('database_initialization', 'success', NOW(), NOW(), '{"version": "1.0", "initialized_at": "' || NOW() || '"}');
