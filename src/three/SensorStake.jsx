/**
 * Physical Geotechnical Monitoring Sensor Stake (React Three Fiber)
 * Realistic stainless steel mast, IP67 telemetry box, solar array, and floating engineering HUD cards.
 * Visual styling inspired by GroundTruth geotechnical digital twins.
 * SIH 2026 Problem Statement: PS 26025
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { getStatusColor, formatDecimal } from '../utils/formatters';

export function SensorStake({
  node,
  telemetry,
  isSelected,
  onClick,
  showLabels = true,
  isHardware = false
}) {
  const haloRef = useRef();
  const solarRef = useRef();

  const hasData = telemetry && telemetry.displacement !== null && telemetry.displacement !== undefined;
  const status = hasData ? node.status : (isHardware ? 'NO DATA' : 'NORMAL');
  const colorInfo = getStatusColor(status);
  const isCritical = status === 'CRITICAL';
  const isWarning = status === 'WARNING';

  const posX = node.surface_x * 0.5;
  const posZ = node.surface_y * 0.5;
  const posY = 0.5;

  useFrame(({ clock }) => {
    if (haloRef.current && (isCritical || isWarning)) {
      const t = clock.getElapsedTime();
      const scale = 1.0 + Math.sin(t * 4.0) * 0.25;
      haloRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={[posX, posY, posZ]} onClick={(e) => { e.stopPropagation(); onClick(node.node_id); }}>
      {/* 1. Ground Anchor Foot Collar */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.35, 0.45, 0.1, 16]} />
        <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.5} />
      </mesh>

      {/* 2. Stainless Steel Instrument Mast Post */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.10, 2.2, 16]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.25} metalness={0.85} />
      </mesh>

      {/* 3. IP67 Telemetry / LoRa Transmitter Housing Box */}
      <mesh position={[0, 2.1, 0]} castShadow>
        <boxGeometry args={[0.55, 0.45, 0.36]} />
        <meshStandardMaterial
          color={isSelected ? '#1D4ED8' : '#1E293B'}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>

      {/* 4. Housing Technical Accent Bezel */}
      <mesh position={[0, 2.1, 0]}>
        <boxGeometry args={[0.57, 0.47, 0.38]} />
        <meshStandardMaterial
          color={isSelected ? '#38BDF8' : '#475569'}
          wireframe={true}
        />
      </mesh>

      {/* 5. Angled Solar Photovoltaic / Energy Harvester Module */}
      <mesh ref={solarRef} position={[0, 2.45, 0.05]} rotation={[-Math.PI / 6, 0, 0]} castShadow>
        <boxGeometry args={[0.7, 0.04, 0.5]} />
        <meshStandardMaterial color="#0284C7" roughness={0.15} metalness={0.9} />
      </mesh>

      {/* 6. High-Visibility Omnidirectional Status LED */}
      <mesh position={[0, 2.1, 0.2]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={colorInfo.hex} />
      </mesh>

      {/* 7. Selection Base Ring Indicator */}
      {isSelected && (
        <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 1.2, 32]} />
          <meshBasicMaterial color="#38BDF8" transparent opacity={0.9} />
        </mesh>
      )}

      {/* 8. Warning / Critical Animated Alarm Ring */}
      {(isCritical || isWarning) && (
        <mesh ref={haloRef} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.8, 32]} />
          <meshBasicMaterial color={colorInfo.hex} transparent opacity={0.55} />
        </mesh>
      )}

      {/* 9. Floating Dark-Glass Technical Telemetry HUD Card (GroundTruth Style) */}
      {showLabels && (
        <Html position={[0, 3.2, 0]} center distanceFactor={34} style={{ pointerEvents: 'none' }}>
          <div
            className={`px-3 py-2 rounded-lg font-mono text-xs flex flex-col gap-1 shadow-2xl backdrop-blur-md border transition-all ${
              isSelected
                ? 'bg-slate-900/95 border-cyan-400 ring-2 ring-cyan-400/30 text-white min-w-[170px]'
                : (isCritical
                    ? 'bg-slate-900/95 border-red-500 text-white min-w-[160px]'
                    : 'bg-slate-900/90 border-slate-700/80 text-slate-200 min-w-[140px]')
            }`}
          >
            {/* Header: Node ID & State Badge */}
            <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-700/60">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colorInfo.hex }} />
                <span className="font-bold text-xs tracking-wider text-cyan-400">
                  {node.node_id}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${colorInfo.badge}`}>
                {status}
              </span>
            </div>

            {/* Live Metrics Grid */}
            {hasData ? (
              <div className="grid grid-cols-2 gap-x-2 text-[10px] text-slate-300 pt-0.5 leading-tight">
                <div>
                  <span className="text-slate-500 block text-[9px]">DISP</span>
                  <span className="font-bold text-white text-[11px]">{formatDecimal(telemetry.displacement, 2)} mm</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">RATE</span>
                  <span className="font-semibold text-slate-200">{formatDecimal(telemetry.disp_rate, 2)} mm/h</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">TILT</span>
                  <span className="text-slate-200">{formatDecimal(Math.sqrt(Math.pow(telemetry.tilt_x || 0, 2) + Math.pow(telemetry.tilt_y || 0, 2)), 2)}°</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">RISK</span>
                  <span className="font-bold" style={{ color: colorInfo.hex }}>{formatDecimal(telemetry.risk_score, 2)}</span>
                </div>
              </div>
            ) : (
              <div className="text-[10px] text-slate-500 py-0.5">
                NO LIVE TELEMETRY
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
