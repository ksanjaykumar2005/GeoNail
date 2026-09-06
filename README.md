# GeoNail | Mine Safety Monitoring System

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH%202026-PS%2026025-00E5FF.svg)](https://sih.gov.in)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-339933.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL%203D%20Twin-000000.svg)](https://threejs.org)

**Real-Time Mine Subsidence Monitoring, 3D Digital Twin, and Early Warning System**  
*Problem Statement: SIH 2026 PS 26025*

---

## 📌 Project Overview

Underground mining extraction creates subsurface void cavities that cause strata displacement and surface subsidence bowls. **GeoNail** is an industrial geotechnical SCADA platform designed for mining engineers, safety officers, and DGMS regulators to monitor surface deformation, visualize interactive 3D digital twins, compute spatial risk heatmaps, and dispatch automated early warning alerts.

```
                  PHYSICAL SENSOR
                        │
                      ESP32
                        │
                      LoRa (865.2 MHz)
                        │
                        ▼
                   GW-01 GATEWAY
                        │
                        ▼
                 BACKEND / REST / WS
                        │
           ┌────────────┴────────────┐
           ▼                         ▼
        DATABASE                LIVE STREAM
           │                         │
           └────────────┬────────────┘
                        ▼
                     GeoNail
                        │
      ┌─────────────────┼─────────────────┐
      ▼                 ▼                 ▼
 Telemetry         Risk Engine       Digital Twin
                                          │
                                          ▼
                                       Heatmap
                                          │
                                          ▼
                                        Alert
                                          │
                                 Email / Notification
```

---

## 🌟 Key Architecture & Capabilities

### 1. Dual Operational Modes (Strict Separation)
- **HARDWARE Mode**: Consumes real physical sensor telemetry from `/api/telemetry/latest` and `/ws`.
  - When disconnected ($>45$s heartbeat timeout): Displays `--` across all metrics with clear `NO LIVE SENSOR DATA` status (no fake telemetry generated).
- **DEMO SIMULATION Mode**: Deterministic mathematical multi-node subsidence evolution:
  $$\text{NORMAL} \longrightarrow \text{WATCH} \longrightarrow \text{WARNING} \longrightarrow \text{CRITICAL}$$

### 2. Interactive 3D Digital Twin
- **Procedural Surface Terrain**: Natural topography ground mesh.
- **Dynamic Subsidence Depression Bowl**: Vertex deformation using Peck's Gaussian equation:
  $$Z(x,y) = -A \cdot \exp\left(-\frac{(x - x_0)^2}{2\sigma_x^2} - \frac{(y - y_0)^2}{2\sigma_y^2}\right)$$
- **Underground Extraction Zone**: Visible cutaway geometry at $-120$m sub-surface depth.
- **Physical Sensor Stakes**: Instrument stakes (N01–N08) with status LEDs and telemetry tags.
- **View Presets**: *Top View*, *Isometric*, and *Cross Section*.

### 3. Dynamic Spatial Heatmap
- Continuous surface risk interpolation (Green $\to$ Yellow $\to$ Orange $\to$ Red) tightly coupled with node risk scores and 3D deformation.

### 4. Emergency Alert & Notification Engine
- **[ DEMO ALERT ]** triggers critical event for Station N06 ($0.91$ risk, $5.21$ mm displacement).
- Backend email dispatch via Nodemailer targeting `phoenix.team0091@gmail.com`.
- Truthful delivery reporting (`EMAIL SENT`, `EMAIL NOT CONFIGURED`, `EMAIL FAILED`).

### 5. Regulatory CSV Export
- Single-click CSV export on Live Telemetry and Data Export pages for audit and compliance.

---

## 🚀 Local Development & Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Backend & Frontend Concurrently
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend REST API**: [http://localhost:3001/api](http://localhost:3001/api)
- **WebSocket Gateway**: `ws://localhost:3001/ws`
- **Health Endpoint**: [http://localhost:3001/api/health](http://localhost:3001/api/health)

---

## ☁️ Public Deployment Guide

### A. Backend Deployment on Render (Web Service)

1. Sign in to [Render](https://render.com) and click **New +** → **Web Service**.
2. Connect your GitHub repository: `https://github.com/ksanjaykumar2005/GeoNail`.
3. Configure the service settings:
   - **Name**: `geonail-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start` (or `node server/index.js`)
   - **Instance Type**: Free or Starter
4. Add the following **Environment Variables** in Render Dashboard:
   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `3001` | Server port (Render sets this automatically) |
   | `HOST` | `0.0.0.0` | Host binding |
   | `FRONTEND_URL` | `https://geonail.vercel.app` | Deployed Vercel frontend URL |
   | `ALLOWED_ORIGINS` | `https://geonail.vercel.app,http://localhost:5173` | Allowed CORS origins |
   | `ALERT_EMAIL_TO` | `phoenix.team0091@gmail.com` | Emergency alert email recipient |
   | `SMTP_HOST` | `smtp.gmail.com` | (Optional) SMTP Server |
   | `SMTP_PORT` | `587` | (Optional) SMTP Port |
   | `SMTP_USER` | `your_email@gmail.com` | (Optional) SMTP Username |
   | `SMTP_PASS` | `your_app_password` | (Optional) SMTP App Password |
   | `DATABASE_URL` | *(Optional)* | PostgreSQL / TimescaleDB connection URI |
5. Click **Create Web Service**. Your backend URL will be:
   `https://geonail-backend.onrender.com`

---

### B. Frontend Deployment on Vercel

1. Sign in to [Vercel](https://vercel.com) and click **Add New...** → **Project**.
2. Import the `GeoNail` repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add the **Environment Variables** in Vercel Dashboard:
   | Key | Value | Description |
   |---|---|---|
   | `VITE_API_URL` | `https://geonail-backend.onrender.com` | Render backend URL |
5. Click **Deploy**. Vercel will deploy the application with HTTPS and automatic SPA routing via `vercel.json`.

---

## 🏆 SIH Live Demonstration Script (2–4 Minutes)

1. **Step 1 — Hardware Mode (Honest Telemetry)**:
   - Select **[ HARDWARE ]** mode in the header.
   - When no physical hardware is connected, all sensor values display `--` and status displays `NO LIVE SENSOR DATA`.
   - *Key takeaway: The system never fabricates sensor data.*

2. **Step 2 — Switch to Demo Simulation**:
   - Select **[ DEMO SIMULATION ]** in the header.
   - The scene starts at baseline **Normal** ($T0$).

3. **Step 3 — Run Subsidence Progression**:
   - Click **START SIMULATION**.
   - Watch the multi-station deformation evolve:
     - $T1\text{--}T4$ (Watch): Tilt and velocity inflection at N04 and N06.
     - $T5\text{--}T6$ (Warning): Synchronized cross-node strain correlation ($>0.75$).
     - $T7\text{--}T11$ (Critical): N06 reaches $5.21$ mm displacement, $0.62^\circ$ tilt, $0.74$ g vibration, $0.91$ risk.

4. **Step 4 — 3D Digital Twin & Subsidence Bowl**:
   - Open **Digital Twin** in the sidebar.
   - View the 3D terrain surface sinking into a Gaussian subsidence depression bowl.
   - Observe the dynamic risk heatmap transitioning from Green $\to$ Yellow $\to$ Orange $\to$ Red.
   - Inspect the sub-surface extraction void at $-120$m depth.

5. **Step 5 — Emergency Demo Alert**:
   - Click **[ DEMO ALERT ]**.
   - Critical alert banner displays dispatch status.
   - Open **Alerts & Events** to view the forensic record.

6. **Step 6 — Regulatory CSV Export**:
   - Open **Data Export**, select date range, and click **DOWNLOAD CSV**.
