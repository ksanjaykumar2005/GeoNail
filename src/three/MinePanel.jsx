/**
 * Underground Mine Extraction Zone Component (React Three Fiber)
 * Represents the sub-surface extracted void at -120m depth with technical strata layers.
 * SIH 2026 Problem Statement: PS 26025
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

export function MinePanel({ showLabels = true }) {
  const depthY = -12;
  const panelWidth = 52;
  const panelLength = 38;
  const panelHeight = 2.8;

  // Projection guide lines from surface down to extraction void
  const projectionLines = useMemo(() => {
    const hw = panelWidth / 2;
    const hl = panelLength / 2;
    const corners = [
      [-hw, 0, -hl],
      [hw, 0, -hl],
      [hw, 0, hl],
      [-hw, 0, hl]
    ];

    return corners.map((c, i) => {
      const points = [
        new THREE.Vector3(c[0] + 5, 0, c[2]),
        new THREE.Vector3(c[0] + 5, depthY, c[2])
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      return { id: i, geometry };
    });
  }, [depthY]);

  return (
    <group position={[5, depthY, 0]}>
      {/* Extracted Void Cavity */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[panelWidth, panelHeight, panelLength]} />
        <meshStandardMaterial
          color="#334155"
          roughness={0.7}
          metalness={0.1}
          transparent={true}
          opacity={0.65}
        />
      </mesh>

      {/* Surrounding Strata Geological Layer */}
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[panelWidth + 12, 0.4, panelLength + 12]} />
        <meshStandardMaterial color="#64748B" roughness={0.9} transparent opacity={0.4} />
      </mesh>

      {/* Technical Wireframe Edge Outline */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(panelWidth, panelHeight, panelLength)]} />
        <lineBasicMaterial color="#2563EB" linewidth={1.5} transparent opacity={0.75} />
      </lineSegments>

      {/* Projection Plumb Lines from Surface */}
      {projectionLines.map(line => (
        <primitive
          key={line.id}
          object={new THREE.Line(line.geometry, new THREE.LineDashedMaterial({
            color: 0x94A3B8,
            dashSize: 1,
            gapSize: 0.8
          }))}
          position={[-5, -depthY, 0]}
        />
      ))}

      {/* Technical Annotation Label */}
      {showLabels && (
        <Html position={[0, panelHeight / 2 + 1.2, 0]} center distanceFactor={30} style={{ pointerEvents: 'none' }}>
          <div className="px-2.5 py-1 bg-white/95 border border-slate-300 rounded shadow-md text-[10px] font-mono text-slate-700 whitespace-nowrap text-center">
            <div className="font-bold text-blue-700">UNDERGROUND EXTRACTION ZONE</div>
            <div className="text-slate-500 text-[9px]">Target Seam Depth: -120m</div>
          </div>
        </Html>
      )}
    </group>
  );
}
