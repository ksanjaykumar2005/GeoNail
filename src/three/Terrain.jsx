/**
 * 3D Terrain, Subsidence Depression Bowl & Surface Risk Heatmap
 * Implements mathematical Gaussian ground deformation and continuous spatial risk color mapping.
 * SIH 2026 Problem Statement: PS 26025
 */

import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export function Terrain({
  nodes = [],
  activeTelemetryMap = {},
  subsidenceSeverity = 0.0,
  showSubsidenceBowl = true,
  showRiskHeatmap = true,
  isHardware = false
}) {
  const meshRef = useRef();
  const wireframeRef = useRef();

  const width = 110;
  const height = 90;
  const segmentsX = 72;
  const segmentsY = 72;

  const x0 = 15.0; // Surface point above primary extraction zone
  const y0 = 0.0;
  const sigmaX = 18.0;
  const sigmaY = 14.0;

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(width, height, segmentsX, segmentsY);
  }, [width, height, segmentsX, segmentsY]);

  // Procedural Canvas Texture for Continuous Spatial Risk Heatmap
  const heatmapTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, []);

  const hasData = Object.keys(activeTelemetryMap).length > 0 &&
    Object.values(activeTelemetryMap).some(t => t && t.displacement != null);

  // Update canvas texture based on continuous spatial interpolation from nodes
  useEffect(() => {
    const canvas = heatmapTexture.image;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Natural light engineering terrain base
    ctx.fillStyle = '#E5E9F0';
    ctx.fillRect(0, 0, 512, 512);

    // Draw subtle terrain grid lines on texture for GIS feel
    ctx.strokeStyle = '#D1D9E6';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 512; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }

    if (showRiskHeatmap && hasData) {
      nodes.forEach(n => {
        const t = activeTelemetryMap[n.node_id];
        const risk = t && t.risk_score != null ? t.risk_score : 0.1;

        // Map local coordinates (-55..55, -45..45) to Canvas (0..512, 0..512)
        const u = ((n.surface_x * 0.5 + width / 2) / width) * 512;
        const v = ((n.surface_y * 0.5 + height / 2) / height) * 512;

        const radius = 45 + risk * 75;
        const radGrad = ctx.createRadialGradient(u, v, 4, u, v, radius);

        if (risk >= 0.80) {
          // Critical - Red/Orange Hotspot
          radGrad.addColorStop(0, 'rgba(220, 38, 38, 0.75)');
          radGrad.addColorStop(0.4, 'rgba(249, 115, 22, 0.50)');
          radGrad.addColorStop(0.7, 'rgba(234, 179, 8, 0.25)');
          radGrad.addColorStop(1, 'rgba(229, 233, 240, 0)');
        } else if (risk >= 0.55) {
          // Warning - Orange/Yellow
          radGrad.addColorStop(0, 'rgba(249, 115, 22, 0.65)');
          radGrad.addColorStop(0.5, 'rgba(234, 179, 8, 0.35)');
          radGrad.addColorStop(1, 'rgba(229, 233, 240, 0)');
        } else if (risk >= 0.30) {
          // Watch - Yellow
          radGrad.addColorStop(0, 'rgba(234, 179, 8, 0.50)');
          radGrad.addColorStop(0.6, 'rgba(22, 163, 74, 0.20)');
          radGrad.addColorStop(1, 'rgba(229, 233, 240, 0)');
        } else {
          // Normal - Subtle Green
          radGrad.addColorStop(0, 'rgba(22, 163, 74, 0.25)');
          radGrad.addColorStop(1, 'rgba(229, 233, 240, 0)');
        }

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(u, v, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    heatmapTexture.needsUpdate = true;
  }, [nodes, activeTelemetryMap, showRiskHeatmap, hasData, heatmapTexture, width, height]);

  // Real-time vertex deformation using Peck's Gaussian Subsidence Depression model:
  // Z(x,y) = -A * exp( -((x - x0)^2)/(2*sigmaX^2) - ((y - y0)^2)/(2*sigmaY^2) )
  useFrame(() => {
    if (!meshRef.current) return;
    const geom = meshRef.current.geometry;
    const pos = geom.attributes.position;

    const A = showSubsidenceBowl && hasData ? subsidenceSeverity * 0.55 : 0.0;

    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i);
      const py = pos.getY(i);

      // Gaussian depression
      const dx = px - x0;
      const dy = py - y0;
      const exponent = -((dx * dx) / (2 * sigmaX * sigmaX) + (dy * dy) / (2 * sigmaY * sigmaY));
      const deformationZ = -A * Math.exp(exponent);

      // Natural topography undulating variation
      const topo = Math.sin(px * 0.04) * Math.cos(py * 0.04) * 0.35;

      pos.setZ(i, deformationZ + topo);
    }

    pos.needsUpdate = true;
    geom.computeVertexNormals();

    if (wireframeRef.current) {
      wireframeRef.current.geometry.attributes.position.copy(pos);
      wireframeRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      {/* Ground Surface Mesh */}
      <mesh ref={meshRef} geometry={geometry} receiveShadow>
        <meshStandardMaterial
          map={heatmapTexture}
          roughness={0.75}
          metalness={0.05}
        />
      </mesh>

      {/* Structural Wireframe Grid */}
      <mesh ref={wireframeRef} geometry={geometry}>
        <meshBasicMaterial
          color="#CBD5E1"
          wireframe={true}
          transparent={true}
          opacity={0.35}
        />
      </mesh>

      {/* Outer Ground Boundary Box */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(width, height)]} />
        <lineBasicMaterial color="#94A3B8" linewidth={1.5} />
      </lineSegments>
    </group>
  );
}
