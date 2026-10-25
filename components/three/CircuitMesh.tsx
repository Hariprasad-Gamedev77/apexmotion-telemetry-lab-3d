'use client';

// APEX TELEMETRY 3D — Multi-Circuit 3D Mesh (Light Atmosphere Setup)

import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { GeneratedCircuit } from '@/lib/simulation/trackGenerator';
import { useApexStore } from '@/lib/store';

interface CircuitMeshProps {
  circuit: GeneratedCircuit;
}

export function CircuitMesh({ circuit }: CircuitMeshProps) {
  const { trackSettings } = useApexStore();
  const {
    trackWidth,
    trackRotation,
    trackElevationScale,
    surfaceColorMode,
    showTurnNumbers,
    showApexSpeeds,
    showDrsZones,
    showSectorGates,
    showKerbs,
    wireframe,
  } = trackSettings;

  const { trackGeometry, leftCurbGeometry, rightCurbGeometry, linePositions } = useMemo(() => {
    const waypoints = circuit.waypoints;
    const count = waypoints.length;
    if (count < 3) {
      return {
        trackGeometry: new THREE.BufferGeometry(),
        leftCurbGeometry: new THREE.BufferGeometry(),
        rightCurbGeometry: new THREE.BufferGeometry(),
        linePositions: new Float32Array(),
      };
    }

    const halfWidth = trackWidth / 2;
    const curbWidth = 1.3;

    const vertices: number[] = [];
    const colors: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const leftCurbVertices: number[] = [];
    const leftCurbIndices: number[] = [];
    const leftCurbColors: number[] = [];

    const rightCurbVertices: number[] = [];
    const rightCurbIndices: number[] = [];
    const rightCurbColors: number[] = [];

    const centerLineArr: number[] = [];

    for (let i = 0; i < count; i++) {
      const wp = waypoints[i];
      const yVal = wp.y * trackElevationScale;
      centerLineArr.push(wp.x, yVal + 0.08, wp.z);

      const nx = -Math.cos(wp.heading);
      const nz = Math.sin(wp.heading);

      const lx = wp.x + nx * halfWidth;
      const ly = yVal + 0.02;
      const lz = wp.z + nz * halfWidth;

      const rx = wp.x - nx * halfWidth;
      const ry = yVal + 0.02;
      const rz = wp.z - nz * halfWidth;

      vertices.push(lx, ly, lz);
      vertices.push(rx, ry, rz);

      let cR = 0.16, cG = 0.19, cB = 0.24; // Premium dark slate tarmac

      if (surfaceColorMode === 'speed_heatmap') {
        const speedNorm = Math.max(0, Math.min(1, (wp.speedLimitKph - 80) / 240));
        if (speedNorm < 0.25) {
          cR = 0.01; cG = 0.52; cB = 0.78; // Blue
        } else if (speedNorm < 0.5) {
          cR = 0.06; cG = 0.72; cB = 0.51; // Green
        } else if (speedNorm < 0.75) {
          cR = 0.96; cG = 0.62; cB = 0.04; // Amber
        } else {
          cR = 0.94; cG = 0.27; cB = 0.27; // Red
        }
      } else if (surfaceColorMode === 'braking_zones') {
        const nextWp = waypoints[(i + 1) % count];
        const isBraking = nextWp.speedLimitKph < wp.speedLimitKph - 0.5;
        if (isBraking) {
          cR = 0.94; cG = 0.27; cB = 0.27;
        } else if (wp.speedLimitKph > 280) {
          cR = 0.06; cG = 0.72; cB = 0.51;
        }
      }

      colors.push(cR, cG, cB, cR, cG, cB);

      const u = wp.distance / 20;
      uvs.push(0, u, 1, u);

      if (showKerbs && wp.curvature > 0.0028) {
        const isRed = Math.floor(wp.distance / 2.5) % 2 === 0;
        const curbCol = isRed ? [0.94, 0.2, 0.2] : [0.98, 0.98, 0.98];

        const clx = wp.x + nx * (halfWidth + curbWidth);
        const cly = yVal + 0.08;
        const clz = wp.z + nz * (halfWidth + curbWidth);

        const lIdx = leftCurbVertices.length / 3;
        leftCurbVertices.push(lx, ly, lz, clx, cly, clz);
        leftCurbColors.push(...curbCol, ...curbCol);

        if (i > 0 && lIdx >= 2) {
          leftCurbIndices.push(lIdx - 2, lIdx - 1, lIdx);
          leftCurbIndices.push(lIdx - 1, lIdx + 1, lIdx);
        }

        const crx = wp.x - nx * (halfWidth + curbWidth);
        const cry = yVal + 0.08;
        const crz = wp.z - nz * (halfWidth + curbWidth);

        const rIdx = rightCurbVertices.length / 3;
        rightCurbVertices.push(rx, ry, rz, crx, cry, crz);
        rightCurbColors.push(...curbCol, ...curbCol);

        if (i > 0 && rIdx >= 2) {
          rightCurbIndices.push(rIdx - 2, rIdx - 1, rIdx);
          rightCurbIndices.push(rIdx - 1, rIdx + 1, rIdx);
        }
      }
    }

    for (let i = 0; i < count; i++) {
      const next = (i + 1) % count;
      const i0 = i * 2;
      const i1 = i * 2 + 1;
      const i2 = next * 2;
      const i3 = next * 2 + 1;

      indices.push(i0, i1, i2);
      indices.push(i1, i3, i2);
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    const leftGeom = new THREE.BufferGeometry();
    leftGeom.setAttribute('position', new THREE.Float32BufferAttribute(leftCurbVertices, 3));
    leftGeom.setAttribute('color', new THREE.Float32BufferAttribute(leftCurbColors, 3));
    if (leftCurbIndices.length > 0) leftGeom.setIndex(leftCurbIndices);
    leftGeom.computeVertexNormals();

    const rightGeom = new THREE.BufferGeometry();
    rightGeom.setAttribute('position', new THREE.Float32BufferAttribute(rightCurbVertices, 3));
    rightGeom.setAttribute('color', new THREE.Float32BufferAttribute(rightCurbColors, 3));
    if (rightCurbIndices.length > 0) rightGeom.setIndex(rightCurbIndices);
    rightGeom.computeVertexNormals();

    return {
      trackGeometry: geom,
      leftCurbGeometry: leftGeom,
      rightCurbGeometry: rightGeom,
      linePositions: new Float32Array(centerLineArr),
    };
  }, [circuit, trackWidth, trackElevationScale, surfaceColorMode, showKerbs]);

  const startFinish = circuit.startFinishLine;
  const rotationRad = (trackRotation * Math.PI) / 180;

  return (
    <group rotation={[0, rotationRad, 0]}>
      {/* Asphalt Ribbon */}
      <mesh geometry={trackGeometry} receiveShadow>
        {surfaceColorMode === 'asphalt' ? (
          <meshStandardMaterial
            color="#222834"
            roughness={0.9}
            metalness={0.1}
            side={THREE.DoubleSide}
            wireframe={wireframe}
          />
        ) : (
          <meshBasicMaterial vertexColors side={THREE.DoubleSide} wireframe={wireframe} />
        )}
      </mesh>

      {/* Red & White Kerbs */}
      {showKerbs && leftCurbGeometry.attributes.position && (
        <mesh geometry={leftCurbGeometry}>
          <meshBasicMaterial vertexColors side={THREE.DoubleSide} />
        </mesh>
      )}
      {showKerbs && rightCurbGeometry.attributes.position && (
        <mesh geometry={rightCurbGeometry}>
          <meshBasicMaterial vertexColors side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Racing Line Ribbon */}
      {trackSettings.showRacingLine && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[linePositions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#0284C7" transparent opacity={0.65} />
        </line>
      )}

      {/* Start / Finish Checkered Grid & Gantry */}
      <group
        position={[startFinish.position[0], startFinish.position[1] * trackElevationScale, startFinish.position[2]]}
        rotation={[0, startFinish.heading, 0]}
      >
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[trackWidth, 2.8]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
        </mesh>
        {[-4, -2, 0, 2, 4].map((offset, idx) => (
          <mesh key={idx} position={[offset, 0.055, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.2, 1.2]} />
            <meshBasicMaterial color="#1E293B" />
          </mesh>
        ))}

        {/* Start/Finish Overhead Gantry */}
        <group position={[0, 0, 0]}>
          <mesh position={[-trackWidth / 2 - 1.5, 3.8, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.25, 7.6, 8]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[trackWidth / 2 + 1.5, 3.8, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.25, 7.6, 8]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 7.4, 0]}>
            <boxGeometry args={[trackWidth + 3.4, 0.65, 0.65]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 6.7, 0.35]}>
            <planeGeometry args={[Math.min(10, trackWidth), 1.1]} />
            <meshBasicMaterial color="#0F172A" />
          </mesh>
          {[-2, -1, 0, 1, 2].map((xOffset, idx) => (
            <mesh key={idx} position={[xOffset, 5.8, 0.38]}>
              <sphereGeometry args={[0.2, 12, 12]} />
              <meshBasicMaterial color="#EF4444" />
            </mesh>
          ))}
        </group>
      </group>

      {/* Turn Markers (T1-T19) */}
      {showTurnNumbers &&
        circuit.turns &&
        circuit.turns.map((turn) => {
          const yPos = turn.position[1] * trackElevationScale;
          return (
            <group
              key={turn.number}
              position={[turn.position[0], yPos + 3.5, turn.position[2]]}
            >
              <mesh position={[0, -1.8, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 3.2, 6]} />
                <meshBasicMaterial color="#0284C7" transparent opacity={0.6} />
              </mesh>
              <mesh>
                <boxGeometry args={[2.2, 1.1, 0.2]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
              </mesh>
              <mesh position={[0, 0, 0.12]}>
                <planeGeometry args={[2.0, 0.9]} />
                <meshBasicMaterial color="#0284C7" />
              </mesh>
              <mesh position={[0, 0, 0.13]}>
                <planeGeometry args={[1.8, 0.7]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
            </group>
          );
        })}

      {/* DRS Zones */}
      {showDrsZones &&
        circuit.drsZones &&
        circuit.drsZones.map((drs) => {
          const startWp = circuit.waypoints.find((w) => w.distance >= drs.startDistance) || circuit.waypoints[0];
          const endWp = circuit.waypoints.find((w) => w.distance >= drs.endDistance) || circuit.waypoints[circuit.waypoints.length - 1];
          const midX = (startWp.x + endWp.x) / 2;
          const midY = ((startWp.y + endWp.y) / 2) * trackElevationScale + 0.12;
          const midZ = (startWp.z + endWp.z) / 2;

          return (
            <group key={drs.number} position={[midX, midY, midZ]}>
              <mesh position={[0, 1.5, 0]}>
                <boxGeometry args={[4.0, 0.9, 0.2]} />
                <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.6} />
              </mesh>
            </group>
          );
        })}

      {/* Sector Gates */}
      {showSectorGates && circuit.waypoints.length > 0 && (
        <>
          <group
            position={[
              circuit.waypoints[Math.floor(circuit.waypoints.length * 0.33)].x,
              circuit.waypoints[Math.floor(circuit.waypoints.length * 0.33)].y * trackElevationScale,
              circuit.waypoints[Math.floor(circuit.waypoints.length * 0.33)].z,
            ]}
          >
            <mesh position={[0, 4.0, 0]}>
              <torusGeometry args={[trackWidth / 2 + 1.2, 0.25, 8, 24, Math.PI]} />
              <meshStandardMaterial color="#0284C7" emissive="#0284C7" emissiveIntensity={0.6} />
            </mesh>
          </group>

          <group
            position={[
              circuit.waypoints[Math.floor(circuit.waypoints.length * 0.67)].x,
              circuit.waypoints[Math.floor(circuit.waypoints.length * 0.67)].y * trackElevationScale,
              circuit.waypoints[Math.floor(circuit.waypoints.length * 0.67)].z,
            ]}
          >
            <mesh position={[0, 4.0, 0]}>
              <torusGeometry args={[trackWidth / 2 + 1.2, 0.25, 8, 24, Math.PI]} />
              <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.6} />
            </mesh>
          </group>
        </>
      )}

      {/* Ground Terrain */}
      <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5000, 5000]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.95} metalness={0.02} />
      </mesh>
      <gridHelper args={[4000, 160, '#CBD5E1', '#E2E8F0']} position={[0, -0.03, 0]} />
    </group>
  );
}
