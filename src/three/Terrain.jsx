/**
 * GeoNail 3D Terrain, Gaussian Subsidence Bowl & Spatial Risk Heatmap
 * Implements concentric topographic contours, geological strata depth, and IDW spatial risk interpolation.
 * Visual design inspired by GroundTruth geotechnical digital twins.
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
  showContours = true,
  isHardware = false
}) {
  const meshRef = useRef();
  const wireframeRef = useRef();
  const strataRef = useRef();

  const width = 120;
  const length = 100;
  const segmentsX = 96;
  const segmentsY = 96;

  // Primary subsidence bowl epicenter (above central extraction panel)
  const x0 = 12.0;
  const y0 = 0.0;
  const sigmaX = 22.0;
  const sigmaY = 16.0;

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(width, length, segmentsX, segmentsY);
  }, [width, length, segmentsX, segmentsY]);

  // High-resolution procedural texture for spatial risk heatmap & contour rings
  const heatmapTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = 8;
    return tex;
  }, []);

  const hasData = Object.keys(activeTelemetryMap).length > 0 &&
    Object.values(activeTelemetryMap).some(t => t && t.displacement != null);

  // Render high-precision spatial risk interpolation & topographic contour rings
  useEffect(() => {
    const canvas = heatmapTexture.image;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cw = 1024;
    const ch = 1024;

    // 1. Dark Engineering Terrain Base
    ctx.fillStyle = '#0F172A'; // Dark slate base
    ctx.fillRect(0, 0, cw, ch);

    // 2. Sub-surface Structural Engineering Grid
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    for (let i = 0; i <= cw; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, ch);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(cw, i);
      ctx.stroke();
    }

    // 3. Dynamic Spatial Risk Heatmap (Inverse Distance Weighting / Gaussian RBF)
    if (showRiskHeatmap && hasData && (!isHardware || hasData)) {
      // Draw subtle ambient base field
      const baseGrad = ctx.createRadialGradient(cw / 2, ch / 2, 50, cw / 2, ch / 2, cw * 0.6);
      baseGrad.addColorStop(0, 'rgba(16, 185, 129, 0.08)');
      baseGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, cw, ch);

      // Interpolate thermal risk diffusion fields for each node
      nodes.forEach(n => {
        const t = activeTelemetryMap[n.node_id];
        const risk = t && t.risk_score != null ? t.risk_score : 0.10;

        // Map local coordinates (-60..60, -50..50) to canvas (0..1024)
        const u = ((n.surface_x * 0.5 + width / 2) / width) * cw;
        const v = ((n.surface_y * 0.5 + length / 2) / length) * ch;

        const radius = 90 + risk * 160;
        const radGrad = ctx.createRadialGradient(u, v, 6, u, v, radius);

        if (risk >= 0.80) {
          // CRITICAL: Vibrant crimson/red thermal plume
          radGrad.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
          radGrad.addColorStop(0.35, 'rgba(249, 115, 22, 0.60)');
          radGrad.addColorStop(0.65, 'rgba(234, 179, 8, 0.30)');
          radGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        } else if (risk >= 0.55) {
          // WARNING: Orange/amber diffusion
          radGrad.addColorStop(0, 'rgba(249, 115, 22, 0.70)');
          radGrad.addColorStop(0.45, 'rgba(234, 179, 8, 0.35)');
          radGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        } else if (risk >= 0.30) {
          // WATCH: Amber/yellow hotspot
          radGrad.addColorStop(0, 'rgba(234, 179, 8, 0.55)');
          radGrad.addColorStop(0.60, 'rgba(16, 185, 129, 0.20)');
          radGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        } else {
          // NORMAL: Deep emerald glow
          radGrad.addColorStop(0, 'rgba(16, 185, 129, 0.30)');
          radGrad.addColorStop(0.70, 'rgba(16, 185, 129, 0.08)');
          radGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        }

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(u, v, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 4. Concentric Topographic Subsidence Contour Rings (GroundTruth Reference Style)
    if (showContours) {
      const u0 = ((x0 + width / 2) / width) * cw;
      const v0 = ((y0 + length / 2) / length) * ch;

      const numContours = 8;
      for (let c = 1; c <= numContours; c++) {
        const rx = c * 38;
        const ry = c * 28;
        ctx.beginPath();
        ctx.ellipse(u0, v0, rx, ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = c <= 3 ? 'rgba(248, 113, 113, 0.35)' : 'rgba(56, 189, 248, 0.22)';
        ctx.lineWidth = c % 2 === 0 ? 1.8 : 1.0;
        if (c % 2 !== 0) ctx.setLineDash([6, 4]);
        else ctx.setLineDash([]);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // 5. Border Trim
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, cw - 2, ch - 2);

    heatmapTexture.needsUpdate = true;
  }, [nodes, activeTelemetryMap, showRiskHeatmap, showContours, hasData, isHardware, heatmapTexture, width, length, x0, y0]);

  // Real-time vertex deformation using Peck's Gaussian Subsidence Bowl:
  // Z(x,y) = -A * exp( -((x - x0)^2)/(2*sigmaX^2) - ((y - y0)^2)/(2*sigmaY^2) )
  useFrame(() => {
    if (!meshRef.current) return;
    const geom = meshRef.current.geometry;
    const pos = geom.attributes.position;

    // Amplitude in 3D units (scaled for visualization impact: 0 to 4.2 units)
    const A = showSubsidenceBowl && hasData && (!isHardware || hasData)
      ? subsidenceSeverity * 0.65
      : 0.0;

    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i);
      const py = pos.getY(i);

      // Gaussian depression
      const dx = px - x0;
      const dy = py - y0;
      const exponent = -((dx * dx) / (2 * sigmaX * sigmaX) + (dy * dy) / (2 * sigmaY * sigmaY));
      const deformationZ = -A * Math.exp(exponent);

      // Natural topography gentle undulating elevation
      const topo = Math.sin(px * 0.05) * Math.cos(py * 0.05) * 0.45;

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
      {/* 1. Main Ground Surface Mesh */}
      <mesh ref={meshRef} geometry={geometry} receiveShadow castShadow>
        <meshStandardMaterial
          map={heatmapTexture}
          roughness={0.65}
          metalness={0.15}
          bumpScale={0.05}
        />
      </mesh>

      {/* 2. Structural Wireframe Accent Overlay */}
      <mesh ref={wireframeRef} geometry={geometry}>
        <meshBasicMaterial
          color="#38BDF8"
          wireframe={true}
          transparent={true}
          opacity={0.15}
        />
      </mesh>

      {/* 3. 3D Geological Strata Skirt / Block Depth Walls (Down to -12m) */}
      <group position={[0, 0, -6]}>
        {/* Front Wall */}
        <mesh position={[0, -length / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width, 12]} />
          <meshStandardMaterial color="#080E1A" roughness={0.9} />
        </mesh>
        {/* Back Wall */}
        <mesh position={[0, length / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width, 12]} />
          <meshStandardMaterial color="#080E1A" roughness={0.9} />
        </mesh>
        {/* Left Wall */}
        <mesh position={[-width / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[length, 12]} />
          <meshStandardMaterial color="#060A13" roughness={0.9} />
        </mesh>
        {/* Right Wall */}
        <mesh position={[width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[length, 12]} />
          <meshStandardMaterial color="#060A13" roughness={0.9} />
        </mesh>
        {/* Base Strata Floor Plate */}
        <mesh position={[0, 0, -6]}>
          <planeGeometry args={[width, length]} />
          <meshBasicMaterial color="#04070D" />
        </mesh>
      </group>

      {/* 4. Outer Boundary Frame */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(width, length)]} />
        <lineBasicMaterial color="#38BDF8" linewidth={2} />
      </lineSegments>
    </group>
  );
}
