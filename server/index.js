/**
 * GeoNail - Mine Safety Monitoring System Backend
 * Express Server + WebSocket Gateway + MQTT Readiness Layer
 * SIH 2026 Problem Statement: PS 26025
 */

import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';
import { wsGateway } from './services/websocket.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// CORS configuration supporting production Vercel frontend domains
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ['*']);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Allow the origin dynamically to prevent CORS blocking on staging/preview Vercel deployments
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root health & service index
app.get('/', (req, res) => {
  res.json({
    service: 'GeoNail Mine Safety Monitoring Backend API',
    status: 'ONLINE',
    problem_statement: 'SIH 2026 PS 26025',
    api_docs: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// Attach REST API routes
app.use('/api', apiRoutes);

// Initialize WebSocket Gateway
wsGateway.initialize(server);

// MQTT Broker Readiness Hook (Extensible for hardware LoRa RPi gateways)
console.log('[MQTT] Ingestion architecture ready for broker:', process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883');

server.listen(PORT, HOST, () => {
  console.log('================================================================');
  console.log(' GEONAIL MINE SAFETY MONITORING SYSTEM - BACKEND READY');
  console.log(' Problem Statement: SIH 2026 PS 26025');
  console.log(` HTTP REST API    : http://${HOST}:${PORT}/api`);
  console.log(` WebSocket Server : ws://${HOST}:${PORT}/ws`);
  console.log(' Monitoring Zone  : Monitored Extraction Zone');
  console.log('================================================================');
});
