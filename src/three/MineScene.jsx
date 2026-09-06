/**
 * GeoNail 3D Mine Digital Twin Scene
 * Dark engineering geotechnical visualizer with atmospheric depth, realistic lighting, and camera presets.
 * Visual styling inspired by GroundTruth geotechnical digital twins.
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
      camera.position.set(0, 85, 0.1);
      camera.lookAt(0, 0, 0);
    } else if (viewMode === 'CROSS_SECTION') {
      // Direct horizontal geotechnical cutaway view
      camera.position.set(0, -4, 78);
      camera.lookAt(0, -6, 0);
    } else {
      // ISOMETRIC (DEFAULT)
      camera.position.set(52, 42, 54);
      camera.lookAt(0, -3, 0);
    }

    if (controlsRef.current) {
      controlsRef.current.update();
    }
  }, [viewMode, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      maxPolarAngle={Math.PI / 2 + 0.04}
      minDistance={12}
      maxDistance={180}
      enableDamping={true}
      dampingFactor={0.06}
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
  showContours = true,
  showPlumbLines = true,
  cameraView = 'ISOMETRIC',
  isHardware = false
}) {
  const hasData = Object.keys(activeTelemetryMap).length > 0 &&
    Object.values(activeTelemetryMap).some(t => t && t.displacement != null);

  return (
    <div className="w-full h-full relative bg-[#080C14] select-none overflow-hidden">
      <ErrorBoundary>
        <Canvas
          shadows
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          onCreated={({ gl, scene }) => {
            gl.setClearColor(new THREE.Color('#080C14'));
            scene.fog = new THREE.Fog('#080C14', 35, 175);
          }}
        >
          <PerspectiveCamera makeDefault position={[52, 42, 54]} fov={42} />
          <CameraController viewMode={cameraView} />

          {/* Studio Dark Engineering Lighting */}
          <ambientLight intensity={0.55} color="#CBD5E1" />
          
          {/* Main Directional Sun */}
          <directionalLight
            position={[45, 65, 40]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            color="#FFFDF7"
          />

          {/* Electric Cyan Rim / Edge Fill */}
          <directionalLight position={[-40, 30, -35]} intensity={0.65} color="#38BDF8" />

          {/* Deep Underground Void Fill Light */}
          <directionalLight position={[0, -25, 25]} intensity={0.4} color="#0284C7" />
          <pointLight position={[6, -11, 0]} intensity={0.8} distance={60} color="#00E5FF" />

          {/* 1. Surface Ground Terrain & Gaussian Subsidence Depression Bowl */}
          <Terrain
            nodes={nodes}
            activeTelemetryMap={activeTelemetryMap}
            subsidenceSeverity={subsidenceSeverity}
            showSubsidenceBowl={true}
            showRiskHeatmap={showHeatmap}
            showContours={showContours}
            isHardware={isHardware}
          />

          {/* 2. Underground Extraction Zone Cavity (-120m) & Support Pillars */}
          <MinePanel showLabels={showLabels} showPlumbLines={showPlumbLines} />

          {/* 3. Physical Field Monitoring Sensor Stakes */}
          {nodes.map(node => (
            <SensorStake
              key={node.node_id}
              node={node}
              telemetry={activeTelemetryMap[node.node_id]}
              isSelected={node.node_id === selectedNodeId}
              onClick={onSelectNode}
              showLabels={showLabels}
              isHardware={isHardware}
            />
          ))}

          {/* 4. Sub-Surface Engineering Grid Reference */}
          <gridHelper
            args={[140, 28, '#0284C7', '#1E293B']}
            position={[0, -15, 0]}
          />
        </Canvas>
      </ErrorBoundary>

      {/* Hardware Disconnected Overlay */}
      {isHardware && !hasData && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs pointer-events-none z-10">
          <div className="p-5 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl text-center max-w-sm backdrop-blur-md">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <span className="font-bold text-white text-xs block mb-1 tracking-wider uppercase">
              NO LIVE SENSOR DATA
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              Hardware telemetry stream is disconnected. Real-time subsidence deformation and spatial heatmaps activate upon LoRa packet arrival.
            </p>
          </div>
        </div>
      )}

      {/* Viewport Info Overlay (Bottom Left) */}
      <div className="absolute bottom-3 left-3 text-[10px] text-slate-400 font-mono pointer-events-none z-10 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
        GeoNail Digital Twin • Scale: 1 unit = 2m • Target Seam: -120m
      </div>
    </div>
  );
}
