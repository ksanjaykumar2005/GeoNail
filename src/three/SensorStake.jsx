/**
 * Physical Monitoring Sensor Stake (Three.js / React Three Fiber)
 * Clean physical instrument stake representation with light-themed status indicators.
 * SIH 2026 Problem Statement: PS 26025
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { getStatusColor, formatDecimal } from '../utils/formatters';

export function SensorStake({ node, telemetry, isSelected, onClick, showLabels = true }) {
  const haloRef = useRef();

  const hasData = telemetry && telemetry.displacement !== null && telemetry.displacement !== undefined;
  const status = hasData ? node.status : 'NO DATA';
  const colorInfo = getStatusColor(status);
  const isCritical = status === 'CRITICAL';
  const isWarning = status === 'WARNING';

  const posX = node.surface_x * 0.5;
  const posZ = node.surface_y * 0.5;
  const posY = 0.5;

  useFrame(({ clock }) => {
    if (haloRef.current && (isCritical || isWarning)) {
      const t = clock.getElapsedTime();
      const scale = 1.0 + Math.sin(t * 3.5) * 0.18;
      haloRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={[posX, posY, posZ]} onClick={(e) => { e.stopPropagation(); onClick(node.node_id); }}>
      {/* Physical Steel Stake Mast */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.11, 1.8, 12]} />
        <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Sensor Enclosure Box */}
      <mesh position={[0, 1.9, 0]} castShadow>
        <boxGeometry args={[0.48, 0.38, 0.32]} />
        <meshStandardMaterial
          color={isSelected ? '#2563EB' : '#FFFFFF'}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Sensor Enclosure Border Trim */}
      <mesh position={[0, 1.9, 0]}>
        <boxGeometry args={[0.5, 0.4, 0.34]} />
        <meshStandardMaterial
          color={isSelected ? '#1D4ED8' : '#CBD5E1'}
          wireframe={true}
        />
      </mesh>

      {/* Status LED Indicator Light */}
      <mesh position={[0, 1.9, 0.19]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color={colorInfo.hex} />
      </mesh>

      {/* Selection Base Ring */}
      {isSelected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 0.95, 28]} />
          <meshBasicMaterial color="#2563EB" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Warning/Critical Animated Alert Ring */}
      {(isCritical || isWarning) && (
        <mesh ref={haloRef} position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 1.3, 28]} />
          <meshBasicMaterial color={colorInfo.hex} transparent opacity={0.45} />
        </mesh>
      )}

      {/* Clean Light Floating Tag Label */}
      {showLabels && (
        <Html position={[0, 2.7, 0]} center distanceFactor={30} style={{ pointerEvents: 'none' }}>
          <div className={`px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1.5 shadow-md border ${
            isSelected
              ? 'bg-white border-blue-600 text-blue-700 font-bold ring-2 ring-blue-500/20'
              : 'bg-white/95 border-slate-300 text-slate-800'
          }`}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorInfo.hex }} />
            <span>{node.node_id}</span>
            {hasData ? (
              <span className="text-slate-500 text-[10px] pl-1 border-l border-slate-300">
                {formatDecimal(telemetry.displacement, 1)}mm
              </span>
            ) : (
              <span className="text-slate-400 text-[10px] pl-1 border-l border-slate-300">
                --
              </span>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
