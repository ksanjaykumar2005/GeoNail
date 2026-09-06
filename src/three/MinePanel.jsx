/**
 * Underground Mine Extraction Zone Component (React Three Fiber)
 * Represents the sub-surface void at -120m depth with extraction panels, support pillars, and laser plumb lines.
 * Visual styling inspired by GroundTruth geotechnical digital twins.
 * SIH 2026 Problem Statement: PS 26025
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

export function MinePanel({ showLabels = true, showPlumbLines = true }) {
  const depthY = -12; // Scaled 1:10 for -120m target seam
  const panelWidth = 56;
  const panelLength = 42;
  const panelHeight = 3.2;

  // Projection laser plumb lines linking surface monitoring perimeter down to underground extraction face
  const projectionLines = useMemo(() => {
    const hw = panelWidth / 2;
    const hl = panelLength / 2;
    const corners = [
      [-hw, 0, -hl],
      [hw, 0, -hl],
      [hw, 0, hl],
      [-hw, 0, hl],
      [0, 0, -hl],
      [0, 0, hl]
    ];

    return corners.map((c, i) => {
      const points = [
        new THREE.Vector3(c[0] + 6, 0, c[2]),
        new THREE.Vector3(c[0] + 6, depthY, c[2])
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      return { id: i, geometry };
    });
  }, [depthY]);

  // Coal seam support pillars
  const pillars = useMemo(() => {
    const pList = [];
    for (let x = -20; x <= 20; x += 10) {
      for (let z = -14; z <= 14; z += 14) {
        if (Math.abs(x) > 6 || Math.abs(z) > 4) {
          pList.push({ id: `${x}-${z}`, x, z });
        }
      }
    }
    return pList;
  }, []);

  return (
    <group position={[6, depthY, 0]}>
      {/* 1. Main Extracted Void Cavity (Sub-Surface Goaf) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[panelWidth, panelHeight, panelLength]} />
        <meshStandardMaterial
          color="#0F172A"
          roughness={0.8}
          metalness={0.2}
          transparent={true}
          opacity={0.75}
        />
      </mesh>

      {/* 2. Coal Seam Geological Surrounding Strata */}
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[panelWidth + 16, 0.6, panelLength + 16]} />
        <meshStandardMaterial color="#0A0E17" roughness={0.95} transparent opacity={0.65} />
      </mesh>

      {/* 3. Underground Support Coal Pillars */}
      {pillars.map(p => (
        <mesh key={p.id} position={[p.x, 0, p.z]}>
          <boxGeometry args={[2.5, panelHeight, 2.5]} />
          <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.3} />
        </mesh>
      ))}

      {/* 4. Active Longwall Extraction Face (High-visibility Cyan Boundary) */}
      <mesh position={[panelWidth / 2 - 1.5, 0, 0]}>
        <boxGeometry args={[1.5, panelHeight, panelLength]} />
        <meshBasicMaterial color="#0284C7" transparent opacity={0.6} />
      </mesh>

      {/* 5. Glowing Technical Cyan Wireframe Bounds */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(panelWidth, panelHeight, panelLength)]} />
        <lineBasicMaterial color="#00E5FF" linewidth={2} transparent opacity={0.9} />
      </lineSegments>

      {/* 6. Laser Plumb Lines from Surface */}
      {showPlumbLines && projectionLines.map(line => (
        <primitive
          key={line.id}
          object={new THREE.Line(line.geometry, new THREE.LineDashedMaterial({
            color: 0x38BDF8,
            dashSize: 1.2,
            gapSize: 0.8
          }))}
          position={[-6, -depthY, 0]}
        />
      ))}

      {/* 7. Underground Technical HUD Label */}
      {showLabels && (
        <Html position={[0, panelHeight / 2 + 1.4, 0]} center distanceFactor={32} style={{ pointerEvents: 'none' }}>
          <div className="px-3 py-1.5 bg-slate-900/95 border border-cyan-500/60 rounded-md shadow-2xl text-[10px] font-mono text-cyan-400 whitespace-nowrap text-center backdrop-blur-md">
            <div className="font-bold tracking-wider text-cyan-300">UNDERGROUND EXTRACTION ZONE</div>
            <div className="text-slate-400 text-[9px]">Underground Extraction Depth: -120m • Active Goaf Void</div>
          </div>
        </Html>
      )}
    </group>
  );
}
