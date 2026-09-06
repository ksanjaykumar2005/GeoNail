/**
 * GeoNail 3D Digital Twin Scene
 * Natural, professional Three.js WebGL scene with light industrial styling, realistic lighting, and camera presets.
 * SIH 2026 Problem Statement: PS 26025
 */

import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Terrain } from './Terrain';
import { MinePanel } from './MinePanel';
import { SensorStake } from './SensorStake';
import { ErrorBoundary } from '../components/ErrorBoundary/ErrorBoundary';

function CameraController({ viewMode }) {
  const { camera } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    if (!camera) return;

    if (viewMode === 'TOP') {
      camera.position.set(0, 75, 0.1);
      camera.lookAt(0, 0, 0);
    } else if (viewMode === 'CROSS_SECTION') {
      camera.position.set(0, -3, 70);
      camera.lookAt(0, -6, 0);
    } else {
      // ISOMETRIC (DEFAULT)
      camera.position.set(45, 38, 48);
      camera.lookAt(0, -2, 0);
    }
  }, [viewMode, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      maxPolarAngle={Math.PI / 2 + 0.05}
      minDistance={15}
      maxDistance={150}
      enableDamping={true}
      dampingFactor={0.08}
    />
  );
}

export function MineScene({
  nodes = [],
  activeTelemetryMap = {},
  selectedNodeId = 'N06',
  onSelectNode = () => {},
  subsidenceSeverity = 0.0,
  showLabels = true,
  showHeatmap = true,
  cameraView = 'ISOMETRIC',
  isHardware = false
}) {
  const hasData = Object.keys(activeTelemetryMap).length > 0 &&
    Object.values(activeTelemetryMap).some(t => t && t.displacement != null);

  return (
    <div className="w-full h-full relative bg-[#F1F5F9] select-none overflow-hidden">
      <ErrorBoundary>
        <Canvas
          shadows
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.setClearColor(new THREE.Color('#F1F5F9'));
          }}
        >
          <PerspectiveCamera makeDefault position={[45, 38, 48]} fov={45} />
          <CameraController viewMode={cameraView} />

          {/* Natural Studio Lighting Setup */}
          <ambientLight intensity={0.85} color="#FFFFFF" />
          <directionalLight
            position={[40, 60, 35]}
            intensity={1.1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            color="#FFFDF7"
          />
          <directionalLight position={[-30, 25, -30]} intensity={0.45} color="#CBD5E1" />
          <directionalLight position={[0, -20, 20]} intensity={0.25} color="#E2E8F0" />

          {/* Surface Ground & Procedural Subsidence Bowl */}
          <Terrain
            nodes={nodes}
            activeTelemetryMap={activeTelemetryMap}
            subsidenceSeverity={subsidenceSeverity}
            showSubsidenceBowl={true}
            showRiskHeatmap={showHeatmap}
            isHardware={isHardware}
          />

          {/* Underground Extraction Zone Cutaway (-120m) */}
          <MinePanel showLabels={showLabels} />

          {/* Physical Sensor Stakes */}
          {nodes.map(node => (
            <SensorStake
              key={node.node_id}
              node={node}
              telemetry={activeTelemetryMap[node.node_id]}
              isSelected={node.node_id === selectedNodeId}
              onClick={onSelectNode}
              showLabels={showLabels}
            />
          ))}

          {/* Sub-Surface Reference Grid */}
          <gridHelper
            args={[120, 24, '#94A3B8', '#CBD5E1']}
            position={[0, -13.5, 0]}
          />
        </Canvas>
      </ErrorBoundary>

      {/* Hardware Disconnected Overlay */}
      {isHardware && !hasData && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px] pointer-events-none z-10">
          <div className="p-4 bg-white border border-slate-300 rounded-lg shadow-xl text-center max-w-sm">
            <span className="font-bold text-slate-800 text-xs block mb-1">
              NO LIVE SENSOR DATA
            </span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Hardware telemetry stream is currently disconnected. Telemetry values and terrain heatmap will activate upon live LoRa packet ingestion.
            </p>
          </div>
        </div>
      )}

      {/* Note in Bottom-Left */}
      <div className="absolute bottom-2 left-3 text-[10px] text-slate-500 font-mono pointer-events-none z-10">
        Monitored Surface Deformation • Scale: 1 unit = 2m
      </div>
    </div>
  );
}
