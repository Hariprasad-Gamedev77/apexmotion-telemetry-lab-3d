'use client';

// APEX TELEMETRY 3D — Main Three.js Racing Environment Scene (Daylight Motorsport Light Theme)

import React, { Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { CircuitMesh } from './CircuitMesh';
import { VehicleModel } from './VehicleModel';
import { CameraController } from './CameraController';
import { useApexStore } from '@/lib/store';

function SceneContent() {
  const {
    circuit,
    currentTelemetry,
    cameraMode,
    drivers,
    selectedDriverNumber,
    trackSettings,
    tickSimulation,
  } = useApexStore();

  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.05);
    tickSimulation(clampedDelta);
  });

  const rotRad = (trackSettings.trackRotation * Math.PI) / 180;
  const cosR = Math.cos(rotRad);
  const sinR = Math.sin(rotRad);

  const transformPos = (x: number, y: number, z: number, heading: number): { pos: [number, number, number]; heading: number } => {
    const rx = x * cosR + z * sinR;
    const rz = -x * sinR + z * cosR;
    const ry = y * trackSettings.trackElevationScale;
    return {
      pos: [rx, ry, rz],
      heading: heading + rotRad,
    };
  };

  const leadTrans = transformPos(
    currentTelemetry.worldX,
    currentTelemetry.worldY,
    currentTelemetry.worldZ,
    currentTelemetry.heading
  );

  const selectedDriver = drivers.find((d) => d.driverNumber === selectedDriverNumber);

  return (
    <>
      {/* Daylight Motorsport Lighting Architecture */}
      <ambientLight intensity={0.75} color="#FFFFFF" />
      <directionalLight
        position={[300, 450, 180]}
        intensity={1.8}
        color="#FFFDF5"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={10}
        shadow-camera-far={1400}
        shadow-camera-left={-600}
        shadow-camera-right={600}
        shadow-camera-top={600}
        shadow-camera-bottom={-600}
      />
      <directionalLight position={[-250, 150, -250]} intensity={0.5} color="#BAE6FD" />
      <fog attach="fog" args={['#E2E8F0', 250, 2000]} />

      {/* Dynamic Camera following lead car */}
      <CameraController
        mode={cameraMode}
        targetPosition={leadTrans.pos}
        targetHeading={leadTrans.heading}
      />

      {/* Procedural Track Ribbon, Kerbs & Sector Arches */}
      <CircuitMesh circuit={circuit} />

      {/* Render Selected Driver's Vehicle */}
      <VehicleModel
        position={leadTrans.pos}
        heading={leadTrans.heading}
        color={selectedDriver?.color || '#1E40AF'}
        driverNumber={selectedDriverNumber}
        driverCode={selectedDriver?.code || 'VER'}
        speedKph={currentTelemetry.speedKph}
        drsActive={currentTelemetry.drs === 1}
      />

      {/* Render Other Grid Competitor Vehicles */}
      {drivers
        .filter((d) => d.driverNumber !== selectedDriverNumber && d.visible)
        .map((driver, index) => {
          const offsetDist = (currentTelemetry.distanceMeters - (index + 1) * 75 + circuit.lengthMeters) % circuit.lengthMeters;
          const wpIdx = Math.floor((offsetDist / circuit.lengthMeters) * circuit.waypoints.length) % circuit.waypoints.length;
          const wp = circuit.waypoints[wpIdx];
          if (!wp) return null;

          const otherTrans = transformPos(wp.x, wp.y, wp.z, wp.heading);

          return (
            <VehicleModel
              key={driver.driverNumber}
              position={otherTrans.pos}
              heading={otherTrans.heading}
              color={driver.color}
              driverNumber={driver.driverNumber}
              driverCode={driver.code}
              speedKph={currentTelemetry.speedKph * 0.98}
              drsActive={false}
            />
          );
        })}
    </>
  );
}

export default function ApexScene() {
  return (
    <div className="relative w-full h-full bg-[#E2E8F0] overflow-hidden select-none">
      <Canvas
        shadows
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 8, -15], fov: 55, near: 0.1, far: 3000 }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
