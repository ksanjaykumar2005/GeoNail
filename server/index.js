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

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach REST API routes
app.use('/api', apiRoutes);

// Initialize WebSocket Gateway
wsGateway.initialize(server);

// MQTT Broker Readiness Hook (Extensible for hardware LoRa RPi gateways)
console.log('[MQTT] Ingestion architecture ready for broker:', process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883');

server.listen(PORT, () => {
  console.log('================================================================');
  console.log(' GEONAIL MINE SAFETY MONITORING SYSTEM - BACKEND READY');
  console.log(' Problem Statement: SIH 2026 PS 26025');
  console.log(` HTTP REST API    : http://localhost:${PORT}/api`);
  console.log(` WebSocket Server : ws://localhost:${PORT}/ws`);
  console.log(' Monitoring Zone  : Monitored Extraction Zone');
  console.log('================================================================');
});
