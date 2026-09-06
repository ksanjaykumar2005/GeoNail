# MineGuard | Surface Subsidence Monitoring System

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH%202026-PS%2026025-00E5FF.svg)](https://sih.gov.in)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-339933.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL%203D%20Twin-000000.svg)](https://threejs.org)

**Real-Time Mine Subsidence Monitoring, 3D Digital Twin, and Early Warning System**  
*Deployment Site: Jharia Coalfield, Panel A-17 (Seam VII Depth: -120m)*

---

## 📌 Problem Statement (SIH 2026 PS 26025)

Underground coal extraction creates subsurface voids (goaf) that cause progressive ground movement and surface subsidence bowls. **MineGuard** provides an industrial SCADA platform for mine engineers, safety officers, and DGMS regulators to monitor surface deformation, visualize 3D geotechnical digital twins, and trigger automated early warning alerts.

```
 Physical Phenomenon (Strata Flexure & Subsidence)
           ↓
 Measurement (Distributed Sensor Nodes N01-N08)
           ↓
 Wireless Mesh (ESP32 + LoRa @ 865.2 MHz)
           ↓
 Gateway Ingestion (GW-01 -> REST / WebSocket)
           ↓
 Real-Time Isolation (Hardware Mode vs Demo Simulation)
           ↓
 3D Digital Twin (Procedural Subsidence Bowl + Risk Heatmap)
           ↓
 Early Warning (Automated Email + SMS + Siren)
           ↓
 Regulatory Audit (DGMS Date-Filtered CSV Export)
```

---

## 🌟 Key Subsystems & Design Philosophy

### 1. Dual Mode Architecture (Strict Separation)
- **Hardware Mode**: Connects directly to backend hardware endpoints (`/api/telemetry/latest`, `/api/telemetry/history`, `POST /api/telemetry`). When disconnected, all values honestly display `--` (no fabricated data).
- **Demo Simulation Mode**: Generates a physical subsidence event scenario:
  $$\text{Normal} \longrightarrow \text{Watch} \longrightarrow \text{Warning (correlated multi-node)} \longrightarrow \text{Critical}$$

### 2. 3D WebGL Digital Twin
- **Surface Terrain**: Natural topography ground surface above the extraction panel.
- **Subsidence Depression Bowl**: Dynamic vertex deformation using Peck's Gaussian formula:
  $$Z(x,y) = -A \cdot \exp\left(-\frac{(x - x_0)^2}{2\sigma_x^2} - \frac{(y - y_0)^2}{2\sigma_y^2}\right)$$
- **Underground Seam Panel**: Semitransparent coal void block at $-120$m depth with depth projection lines.
- **Sensor Stakes**: Physical field instrument stakes with LED status dots and clean labels.
- **Camera Presets**: *Top View*, *Isometric*, and *Cross Section*.
- **Timeline Evolution**: 24h timeline scrubbing bar.

### 3. 2D Technical GIS Map
- Smooth spatial interpolation between node risk scores (Green $\to$ Yellow $\to$ Orange $\to$ Red).
- Displays mine lease boundary, Panel A-17 extraction boundary, haul roads, and sensor stations.

### 4. Unit Standardization
- **Tilt Angle**: $^\circ$
- **Displacement**: $\text{mm}$ ($\text{mm/hr}$ for velocity)
- **Vibration RMS**: Acceleration strictly in $g$
- **Crack Width**: $\text{mm}$

### 5. Early Warning & Audit Export
- Alerts table with incident forensic inspection drawer.
- Transparent Nodemailer (Email) & Twilio (SMS) status reporting (`SENT` or `NOT CONFIGURED`).
- Date-range filtered CSV exports (`mineguard-alerts-YYYY-MM-DD-to-YYYY-MM-DD.csv`).
- Telemetry Test Input tool for testing hardware packet ingestion.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Application
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend REST API**: [http://localhost:3001/api](http://localhost:3001/api)
- **WebSocket Gateway**: `ws://localhost:3001/ws`

---

## 🏆 SIH Live Demonstration Flow

1. **Step 1 — Hardware Mode (Honest Null State)**:
   - Select **[ HARDWARE ]** mode in the header.
   - When no hardware is attached, all telemetry cards, node list items, and risk panels display `--`.
   - Demonstrates that real hardware data is never fabricated.

2. **Step 2 — Switch to Demo Simulation**:
   - Select **[ DEMO SIMULATION ]** in the header.
   - The system begins at baseline **Normal** state.

3. **Step 3 — Start Correlated Simulation**:
   - Click **START SIMULATION**.
   - Watch the progressive deformation:
     - Node N04 enters **Watch** state.
     - Central node N06 displacement begins accelerating.
     - Southern node N07 demonstrates correlated movement.
     - Risk level escalates to **Warning** and then **Critical (0.91)** on Node N06.

4. **Step 4 — 3D Digital Twin & Heatmap Evolution**:
   - Open **Digital Twin** in the sidebar.
   - Observe the 3D ground surface dynamically sinking to form a Gaussian subsidence depression bowl.
   - Observe the risk heatmap expanding outward from high-risk nodes (N06, N07).
   - Test camera view presets (*Top View*, *Isometric*, *Cross Section*) and scrub the 24h timeline.

5. **Step 5 — Early Warning Notification**:
   - Critical alert notification slides in showing automated dispatch verification (Email, SMS, Siren).

6. **Step 6 — Alerts & Events Log**:
   - Open **Alerts & Events** in the sidebar.
   - Click on an alert row to inspect forensic incident telemetry in the side drawer.

7. **Step 7 — Date-Range Regulatory Export**:
   - Open **Data Export** in the sidebar.
   - Select a date range and click **DOWNLOAD CSV** to receive the official 14-column compliance audit report.
