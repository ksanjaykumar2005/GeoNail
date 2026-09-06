-- ==============================================================================
-- GeoNail - Mine Safety Monitoring Platform
-- PostgreSQL 15+ with TimescaleDB Extension Schema
-- SIH 2026 Problem Statement: PS 26025
-- ==============================================================================

-- 1. Enable TimescaleDB and PostGIS extensions if available
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Nodes Metadata Table
CREATE TABLE IF NOT EXISTS nodes (
    node_id VARCHAR(16) PRIMARY KEY,
    zone_name VARCHAR(64) NOT NULL DEFAULT 'Extraction Zone',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    surface_x DOUBLE PRECISION NOT NULL, -- Local mine coordinate X (m)
    surface_y DOUBLE PRECISION NOT NULL, -- Local mine coordinate Y (m)
    elevation_z DOUBLE PRECISION NOT NULL DEFAULT 185.4, -- Surface elevation (m above MSL)
    status VARCHAR(16) NOT NULL DEFAULT 'NORMAL', -- NORMAL, WATCH, WARNING, CRITICAL, OFFLINE
    battery_mv INTEGER NOT NULL DEFAULT 4120,
    firmware_version VARCHAR(16) DEFAULT 'v2.4.1-esp32',
    lora_frequency_mhz NUMERIC(5,2) DEFAULT 865.20,
    depth_to_seam_m NUMERIC(6,2) DEFAULT 120.0,
    installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Telemetry Time-Series Hypertable
CREATE TABLE IF NOT EXISTS telemetry (
    id BIGSERIAL,
    timestamp TIMESTAMPTZ NOT NULL,
    node_id VARCHAR(16) NOT NULL REFERENCES nodes(node_id) ON DELETE CASCADE,
    tilt_x NUMERIC(6,3) NOT NULL DEFAULT 0.000, -- Degrees (°), Pitch
    tilt_y NUMERIC(6,3) NOT NULL DEFAULT 0.000, -- Degrees (°), Roll
    displacement NUMERIC(7,3) NOT NULL DEFAULT 0.000, -- Accumulated subsidence displacement (mm)
    disp_rate NUMERIC(7,3) NOT NULL DEFAULT 0.000, -- Displacement rate (mm/hr)
    vibration_rms NUMERIC(6,3) NOT NULL DEFAULT 0.020, -- Vibration RMS acceleration (g)
    dom_frequency NUMERIC(6,2) DEFAULT 14.50, -- Dominant frequency (Hz)
    crack_width NUMERIC(6,2) DEFAULT 0.00, -- Surface crack opening (mm)
    soil_moisture NUMERIC(5,2) DEFAULT 24.50, -- Volumetric water content (%)
    temperature NUMERIC(5,2) DEFAULT 28.40, -- Temperature (°C)
    neighbor_corr NUMERIC(4,3) DEFAULT 0.120, -- Pearson cross-correlation index (0.000 to 1.000)
    risk_score NUMERIC(4,3) NOT NULL DEFAULT 0.100, -- Synthesized risk (0.000 to 1.000)
    hazard_state SMALLINT NOT NULL DEFAULT 0, -- 0: NORMAL, 1: WATCH, 2: WARNING, 3: CRITICAL
    battery_mv INTEGER NOT NULL DEFAULT 4100,
    rssi SMALLINT NOT NULL DEFAULT -84, -- LoRa RSSI (dBm)
    snr NUMERIC(4,1) NOT NULL DEFAULT 9.5, -- LoRa SNR (dB)
    PRIMARY KEY (timestamp, node_id)
);

-- Convert to TimescaleDB hypertable partitioned on time (chunk interval 7 days)
SELECT create_hypertable('telemetry', 'timestamp', if_not_exists => TRUE, chunk_time_interval => INTERVAL '7 days');

-- 4. Alerts and Incident Logs Table
CREATE TABLE IF NOT EXISTS alerts (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    node_id VARCHAR(16) NOT NULL REFERENCES nodes(node_id),
    zone VARCHAR(64) NOT NULL DEFAULT 'Extraction Zone',
    risk_score NUMERIC(4,3) NOT NULL,
    hazard_state VARCHAR(16) NOT NULL, -- WATCH, WARNING, CRITICAL
    trigger_reason TEXT NOT NULL,
    tilt_deg NUMERIC(6,3),
    displacement_mm NUMERIC(7,3),
    disp_rate_mm_hr NUMERIC(7,3),
    vibration_rms_g NUMERIC(6,3),
    crack_width_mm NUMERIC(6,2),
    neighbor_corr NUMERIC(4,3),
    email_status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- SENT, FAILED, UNCONFIGURED
    sms_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',   -- SENT, FAILED, UNCONFIGURED
    siren_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVATED',
    message TEXT NOT NULL,
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_by VARCHAR(64),
    acknowledged_at TIMESTAMPTZ
);

-- 5. Gateway Health & System Telemetry Table
CREATE TABLE IF NOT EXISTS gateway_health (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    gateway_id VARCHAR(32) NOT NULL DEFAULT 'GW-01',
    status VARCHAR(16) NOT NULL DEFAULT 'ONLINE',
    lora_rx_packets BIGINT DEFAULT 0,
    lora_crc_errors BIGINT DEFAULT 0,
    packet_loss_pct NUMERIC(5,2) DEFAULT 0.00,
    cpu_usage_pct NUMERIC(5,2) DEFAULT 18.5,
    ram_usage_pct NUMERIC(5,2) DEFAULT 32.1,
    cpu_temp_c NUMERIC(5,2) DEFAULT 44.2,
    active_nodes_count SMALLINT DEFAULT 8,
    mqtt_broker_status VARCHAR(16) DEFAULT 'CONNECTED'
);

-- 6. Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_telemetry_node_time ON telemetry (node_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_risk ON telemetry (timestamp DESC, risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_time ON alerts (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_node_state ON alerts (node_id, hazard_state);

-- 7. Seed Initial Sensor Nodes
INSERT INTO nodes (node_id, latitude, longitude, surface_x, surface_y, elevation_z, status, battery_mv)
VALUES
    ('N01', 23.74812, 86.41508, -60.0, -40.0, 186.2, 'NORMAL', 4180),
    ('N02', 23.74850, 86.41570, -20.0, -40.0, 185.9, 'NORMAL', 4140),
    ('N03', 23.74890, 86.41630,  20.0, -40.0, 185.5, 'NORMAL', 4160),
    ('N04', 23.74830, 86.41530, -40.0,   0.0, 185.8, 'WATCH',  4090),
    ('N05', 23.74870, 86.41590,   0.0,   0.0, 185.2, 'NORMAL', 4110),
    ('N06', 23.74910, 86.41650,  40.0,   0.0, 184.8, 'CRITICAL', 3860),
    ('N07', 23.74850, 86.41550, -20.0,  40.0, 185.4, 'WARNING', 4020),
    ('N08', 23.74890, 86.41610,  20.0,  40.0, 185.1, 'NORMAL', 4150)
ON CONFLICT (node_id) DO NOTHING;
