'use client';

// APEX TELEMETRY 3D — Main Three.js Racing Environment Scene (Daylight Motorsport Light Theme)
// Optimized for stable 60+ FPS with throttled store ticks and distinct multi-car spatial lanes.

import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { CircuitMesh } from './CircuitMesh';
import { VehicleModel } from './VehicleModel';
import { CameraController } from './CameraController';
import { useApexStore } from '@/lib/store';

function SceneContent() {
  const circuit = useApexStore((s) => s.circuit);
  const currentTelemetry = useApexStore((s) => s.currentTelemetry);
  const cameraMode = useApexStore((s) => s.cameraMode);
  const drivers = useApexStore((s) => s.drivers);
  const selectedDriverNumber = useApexStore((s) => s.selectedDriverNumber);
  const trackSettings = useApexStore((s) => s.trackSettings);
  const tickSimulation = useApexStore((s) => s.tickSimulation);

  // Store update accumulator: Throttles React state updates to 20Hz (0.05s)
  // This allows Three.js to render WebGL frames at native 60-120 FPS without React reconciliation lag.
  const accumulatorRef = useRef(0);

  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.05);
    accumulatorRef.current += clampedDelta;

    if (accumulatorRef.current >= 0.048) {
      tickSimulation(accumulatorRef.current);
      accumulatorRef.current = 0;
    }
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

  // Other competitor drivers with anti-overlap spacing
  const competitorDrivers = useMemo(() => {
    return drivers.filter((d) => d.driverNumber !== selectedDriverNumber && d.visible);
  }, [drivers, selectedDriverNumber]);

  return (
    <>
      {/* Daylight Motorsport Lighting Architecture */}
      <ambientLight intensity={0.8} color="#FFFFFF" />
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
      <fog attach="fog" args={['#F1F5F9', 300, 2200]} />

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
        color={selectedDriver?.color || '#0284C7'}
        driverNumber={selectedDriverNumber}
        driverCode={selectedDriver?.code || 'VER'}
        speedKph={currentTelemetry.speedKph}
        drsActive={currentTelemetry.drs === 1}
      />

      {/* Render Other Grid Competitor Vehicles with distinct individual positions and lateral lanes */}
      {competitorDrivers.map((driver) => {
        const dTel = driver.telemetry;
        const otherTrans = transformPos(dTel.worldX, dTel.worldY, dTel.worldZ, dTel.heading);

        return (
          <VehicleModel
            key={driver.driverNumber}
            position={otherTrans.pos}
            heading={otherTrans.heading}
            color={driver.color}
            driverNumber={driver.driverNumber}
            driverCode={driver.code}
            speedKph={dTel.speedKph}
            drsActive={dTel.drs === 1}
          />
        );
      })}
    </>
  );
}

export default function ApexScene() {
  return (
    <div className="relative w-full h-full bg-[#F1F5F9] overflow-hidden select-none">
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
