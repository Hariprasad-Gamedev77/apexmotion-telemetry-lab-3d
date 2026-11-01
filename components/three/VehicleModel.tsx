'use client';

// APEX TELEMETRY 3D — Procedural Low-Poly Formula Vehicle Model

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface VehicleModelProps {
  position: [number, number, number];
  heading: number; // Radians
  color?: string;
  driverNumber?: number;
  driverCode?: string;
  speedKph?: number;
  drsActive?: boolean;
}

export const VehicleModel = React.memo(function VehicleModel({
  position,
  heading,
  color = '#3671C6',
  driverCode = 'VER',
  speedKph = 250,
  drsActive = false,
}: VehicleModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const frontLeftWheelRef = useRef<THREE.Mesh>(null);
  const frontRightWheelRef = useRef<THREE.Mesh>(null);
  const rearLeftWheelRef = useRef<THREE.Mesh>(null);
  const rearRightWheelRef = useRef<THREE.Mesh>(null);

  // Wheel rotation based on linear speed
  useFrame((_, delta) => {
    if (speedKph > 0) {
      const angularVel = (speedKph / 3.6) / 0.36; // v / r
      const rotDelta = angularVel * delta;
      if (frontLeftWheelRef.current) frontLeftWheelRef.current.rotation.x += rotDelta;
      if (frontRightWheelRef.current) frontRightWheelRef.current.rotation.x += rotDelta;
      if (rearLeftWheelRef.current) rearLeftWheelRef.current.rotation.x += rotDelta;
      if (rearRightWheelRef.current) rearRightWheelRef.current.rotation.x += rotDelta;
    }
  });

  // Scale: standard F1 car is ~5.6m long, ~2.0m wide, ~0.95m high
  // In 3D units: length 5.0, width 1.9, height 0.95
  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, heading, 0]}
    >
      {/* --- Main Monocoque & Chassis --- */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.75, 0.45, 3.2]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>

      {/* --- Nose Cone (Tapered) --- */}
      <mesh position={[0, 0.34, 1.9]} rotation={[0.08, 0, 0]} castShadow>
        <boxGeometry args={[0.48, 0.28, 1.4]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>

      {/* --- Sidepods (Aerodynamic radiators left & right) --- */}
      <mesh position={[-0.65, 0.36, -0.2]} castShadow>
        <boxGeometry args={[0.55, 0.38, 1.8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0.65, 0.36, -0.2]} castShadow>
        <boxGeometry args={[0.55, 0.38, 1.8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>

      {/* --- Cockpit & Halo Safety Structure --- */}
      {/* Cockpit opening */}
      <mesh position={[0, 0.62, 0.3]}>
        <boxGeometry args={[0.42, 0.12, 0.7]} />
        <meshBasicMaterial color="#050709" />
      </mesh>
      {/* Driver Helmet */}
      <mesh position={[0, 0.72, 0.2]} castShadow>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#FFDD00" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Halo hoop */}
      <mesh position={[0, 0.82, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.26, 0.04, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* Halo front pillar */}
      <mesh position={[0, 0.72, 0.52]} rotation={[-0.35, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.3, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* --- Front Wing Structure --- */}
      {/* Main Plane */}
      <mesh position={[0, 0.18, 2.55]} castShadow>
        <boxGeometry args={[1.9, 0.04, 0.45]} />
        <meshStandardMaterial color="#151719" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Flaps */}
      <mesh position={[0, 0.24, 2.45]} rotation={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[1.85, 0.03, 0.35]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Endplates */}
      <mesh position={[-0.95, 0.28, 2.5]}>
        <boxGeometry args={[0.03, 0.25, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.95, 0.28, 2.5]}>
        <boxGeometry args={[0.03, 0.25, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* --- Rear Wing Structure & DRS --- */}
      {/* Wing Pillars */}
      <mesh position={[-0.2, 0.72, -1.95]}>
        <boxGeometry args={[0.04, 0.65, 0.18]} />
        <meshStandardMaterial color="#151719" />
      </mesh>
      <mesh position={[0.2, 0.72, -1.95]}>
        <boxGeometry args={[0.04, 0.65, 0.18]} />
        <meshStandardMaterial color="#151719" />
      </mesh>
      {/* Lower Beam Wing */}
      <mesh position={[0, 0.45, -1.9]}>
        <boxGeometry args={[1.1, 0.04, 0.25]} />
        <meshStandardMaterial color="#151719" />
      </mesh>
      {/* Main Upper Wing */}
      <mesh position={[0, 1.02, -2.0]} rotation={[0.22, 0, 0]} castShadow>
        <boxGeometry args={[1.25, 0.05, 0.38]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* DRS Flap (Rotates up when active!) */}
      <mesh
        position={[0, 1.15, -2.05]}
        rotation={[drsActive ? -0.15 : 0.35, 0, 0]}
        castShadow
      >
        <boxGeometry args={[1.22, 0.04, 0.26]} />
        <meshStandardMaterial color={drsActive ? '#42D392' : color} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Rear Wing Endplates */}
      <mesh position={[-0.64, 0.95, -2.0]}>
        <boxGeometry args={[0.03, 0.55, 0.6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.64, 0.95, -2.0]}>
        <boxGeometry args={[0.03, 0.55, 0.6]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* --- Engine Cover Fin & Sharkfin --- */}
      <mesh position={[0, 0.88, -0.9]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.04, 0.45, 1.4]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>

      {/* --- 4 Wheels (Tyres + Carbon Rims) --- */}
      {/* Front Left */}
      <group position={[-0.92, 0.34, 1.55]}>
        <mesh ref={frontLeftWheelRef} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.36, 18]} />
          <meshStandardMaterial color="#1c1c1c" roughness={0.8} />
        </mesh>
        {/* Yellow/White Rim stripe */}
        <mesh position={[-0.19, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[0.16, 0.19, 16]} />
          <meshBasicMaterial color="#FFB454" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Front Right */}
      <group position={[0.92, 0.34, 1.55]}>
        <mesh ref={frontRightWheelRef} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.36, 18]} />
          <meshStandardMaterial color="#1c1c1c" roughness={0.8} />
        </mesh>
        <mesh position={[0.19, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[0.16, 0.19, 16]} />
          <meshBasicMaterial color="#FFB454" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Rear Left (Wider F1 rear tire) */}
      <group position={[-0.95, 0.36, -1.45]}>
        <mesh ref={rearLeftWheelRef} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.36, 0.36, 0.45, 18]} />
          <meshStandardMaterial color="#1c1c1c" roughness={0.8} />
        </mesh>
        <mesh position={[-0.24, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[0.17, 0.20, 16]} />
          <meshBasicMaterial color="#FFB454" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Rear Right (Wider F1 rear tire) */}
      <group position={[0.95, 0.36, -1.45]}>
        <mesh ref={rearRightWheelRef} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.36, 0.36, 0.45, 18]} />
          <meshStandardMaterial color="#1c1c1c" roughness={0.8} />
        </mesh>
        <mesh position={[0.24, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[0.17, 0.20, 16]} />
          <meshBasicMaterial color="#FFB454" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* --- Rear Rain / FIA Safety Light --- */}
      <mesh position={[0, 0.26, -2.1]}>
        <boxGeometry args={[0.14, 0.1, 0.05]} />
        <meshBasicMaterial color={drsActive ? '#42D392' : '#FF2400'} />
      </mesh>
    </group>
  );
});

export default VehicleModel;
