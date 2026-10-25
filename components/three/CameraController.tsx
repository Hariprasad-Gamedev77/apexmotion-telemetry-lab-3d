'use client';

// APEX TELEMETRY 3D — Multi-Mode Dynamic Camera System

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { CAMERA_MODES, type CameraMode } from '@/lib/constants';

interface CameraControllerProps {
  mode: CameraMode;
  targetPosition: [number, number, number];
  targetHeading: number;
}

export function CameraController({
  mode,
  targetPosition,
  targetHeading,
}: CameraControllerProps) {
  const { camera } = useThree();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const currentPos = useRef(new THREE.Vector3(...targetPosition));
  const currentLookAt = useRef(new THREE.Vector3(...targetPosition));

  useFrame((_, delta) => {
    const tx = targetPosition[0];
    const ty = targetPosition[1];
    const tz = targetPosition[2];

    if (mode === CAMERA_MODES.FREE) {
      if (controlsRef.current) {
        controlsRef.current.target.set(tx, ty, tz);
        controlsRef.current.update();
      }
      return;
    }

    const lerpFactor = Math.min(1, delta * 5.5);

    switch (mode) {
      case CAMERA_MODES.CHASE: {
        // Behind and above along the vehicle's heading
        const dist = 12.0;
        const height = 4.2;
        const desiredX = tx - Math.sin(targetHeading) * dist;
        const desiredY = ty + height;
        const desiredZ = tz - Math.cos(targetHeading) * dist;

        currentPos.current.lerp(new THREE.Vector3(desiredX, desiredY, desiredZ), lerpFactor);
        const lookTarget = new THREE.Vector3(
          tx + Math.sin(targetHeading) * 8.0,
          ty + 1.2,
          tz + Math.cos(targetHeading) * 8.0
        );
        currentLookAt.current.lerp(lookTarget, lerpFactor);

        camera.position.copy(currentPos.current);
        camera.lookAt(currentLookAt.current);
        break;
      }

      case CAMERA_MODES.DRIVER: {
        // Cockpit view just above halo
        const desiredX = tx + Math.sin(targetHeading) * 0.4;
        const desiredY = ty + 0.95;
        const desiredZ = tz + Math.cos(targetHeading) * 0.4;

        currentPos.current.set(desiredX, desiredY, desiredZ);
        const lookTarget = new THREE.Vector3(
          tx + Math.sin(targetHeading) * 45.0,
          ty + 0.9,
          tz + Math.cos(targetHeading) * 45.0
        );

        camera.position.copy(currentPos.current);
        camera.lookAt(lookTarget);
        break;
      }

      case CAMERA_MODES.HELICOPTER: {
        // High angle birds-eye trailing
        const dist = 32.0;
        const height = 28.0;
        const desiredX = tx - Math.sin(targetHeading) * dist;
        const desiredY = ty + height;
        const desiredZ = tz - Math.cos(targetHeading) * dist;

        currentPos.current.lerp(new THREE.Vector3(desiredX, desiredY, desiredZ), lerpFactor * 0.6);
        camera.position.copy(currentPos.current);
        camera.lookAt(tx, ty, tz);
        break;
      }

      case CAMERA_MODES.TRACKSIDE: {
        // Position on the side of the track nearest to car
        const sideOffset = 18.0;
        const desiredX = tx + Math.cos(targetHeading) * sideOffset;
        const desiredY = ty + 3.0;
        const desiredZ = tz - Math.sin(targetHeading) * sideOffset;

        currentPos.current.lerp(new THREE.Vector3(desiredX, desiredY, desiredZ), lerpFactor * 0.25);
        camera.position.copy(currentPos.current);
        camera.lookAt(tx, ty + 0.8, tz);
        break;
      }

      case CAMERA_MODES.OVERVIEW: {
        // Full circuit top-down view centered on origin
        const desiredX = 0;
        const desiredY = 900;
        const desiredZ = 0;

        currentPos.current.lerp(new THREE.Vector3(desiredX, desiredY, desiredZ), lerpFactor);
        camera.position.copy(currentPos.current);
        camera.lookAt(0, 0, 0);
        break;
      }
    }
  });

  return (
    <>
      {mode === CAMERA_MODES.FREE && (
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          maxDistance={1200}
          minDistance={3}
        />
      )}
    </>
  );
}
