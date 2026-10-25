// APEX TELEMETRY 3D — Multi-Circuit Procedural Track Generator & Spline Geometry
// Supports Singapore Marina Bay, Silverstone, Spa-Francorchamps, Monza, and Apex International Raceway.

import type { TrackWaypoint, TrackTurn, TrackDrsZone } from '../types';

export interface GeneratedCircuit {
  id: string;
  name: string;
  country: string;
  lengthMeters: number;
  waypoints: TrackWaypoint[];
  curvePoints: Array<[number, number, number]>;
  turns: TrackTurn[];
  drsZones: TrackDrsZone[];
  sectors: {
    sector1EndDist: number;
    sector2EndDist: number;
    sector3EndDist: number;
  };
  startFinishLine: {
    position: [number, number, number];
    heading: number;
    normal: [number, number, number];
  };
}

interface ControlPointDef {
  x: number;
  y: number;
  z: number;
  turn?: {
    number: number;
    name?: string;
    apexSpeedKph: number;
    gear: number;
  };
}

/**
 * Builds a deterministic closed-loop 3D Catmull-Rom circuit from control anchors
 */
function buildCircuitFromControlPoints(
  id: string,
  name: string,
  country: string,
  controlPoints: ControlPointDef[],
  pointCount: number = 600,
  drsZones: TrackDrsZone[] = []
): GeneratedCircuit {
  const N = controlPoints.length;
  const rawPoints: Array<{ x: number; y: number; z: number }> = [];
  const turnMap: Array<{ index: number; turn: ControlPointDef['turn'] }> = [];

  for (let i = 0; i < N; i++) {
    const p0 = controlPoints[(i - 1 + N) % N];
    const p1 = controlPoints[i];
    const p2 = controlPoints[(i + 1) % N];
    const p3 = controlPoints[(i + 2) % N];

    if (p1.turn) {
      turnMap.push({ index: rawPoints.length, turn: p1.turn });
    }

    const stepsPerSegment = Math.max(1, Math.floor(pointCount / N));
    for (let s = 0; s < stepsPerSegment; s++) {
      const t = s / stepsPerSegment;
      const t2 = t * t;
      const t3 = t2 * t;

      // Catmull-Rom spline interpolation
      const x = 0.5 * (
        (2 * p1.x) +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
      );
      const y = 0.5 * (
        (2 * p1.y) +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
      );
      const z = 0.5 * (
        (2 * p1.z) +
        (-p0.z + p2.z) * t +
        (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 +
        (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3
      );

      rawPoints.push({ x, y, z });
    }
  }

  // Cumulative distance calculation
  const totalRaw = rawPoints.length;
  let cumulativeDist = 0;
  const distances: number[] = [0];

  for (let i = 1; i < totalRaw; i++) {
    const dx = rawPoints[i].x - rawPoints[i - 1].x;
    const dy = rawPoints[i].y - rawPoints[i - 1].y;
    const dz = rawPoints[i].z - rawPoints[i - 1].z;
    cumulativeDist += Math.sqrt(dx * dx + dy * dy + dz * dz);
    distances.push(cumulativeDist);
  }
  const lastDx = rawPoints[0].x - rawPoints[totalRaw - 1].x;
  const lastDy = rawPoints[0].y - rawPoints[totalRaw - 1].y;
  const lastDz = rawPoints[0].z - rawPoints[totalRaw - 1].z;
  const circuitLength = cumulativeDist + Math.sqrt(lastDx * lastDx + lastDy * lastDy + lastDz * lastDz);

  const sector1EndDist = circuitLength * 0.33;
  const sector2EndDist = circuitLength * 0.67;

  // Build waypoints with heading, curvature, and physics speed limits
  const waypoints: TrackWaypoint[] = [];

  for (let i = 0; i < totalRaw; i++) {
    const prev = rawPoints[(i - 1 + totalRaw) % totalRaw];
    const curr = rawPoints[i];
    const next = rawPoints[(i + 1) % totalRaw];

    const heading = Math.atan2(next.x - prev.x, next.z - prev.z);

    const distDelta = Math.max(0.1, (distances[(i + 1) % totalRaw] || circuitLength) - (distances[(i - 1 + totalRaw) % totalRaw] || 0));
    const h1 = Math.atan2(curr.x - prev.x, curr.z - prev.z);
    const h2 = Math.atan2(next.x - curr.x, next.z - curr.z);
    let dHeading = h2 - h1;
    while (dHeading > Math.PI) dHeading -= 2 * Math.PI;
    while (dHeading < -Math.PI) dHeading += 2 * Math.PI;
    const curvature = Math.abs(dHeading) / (distDelta + 1e-4);

    const maxLatG = 3.8 * 9.81;
    let speedLimitMs = Math.sqrt(maxLatG / Math.max(curvature, 0.001));
    let speedLimitKph = Math.min(345, Math.max(78, speedLimitMs * 3.6));

    const dist = distances[i];
    let sector: 1 | 2 | 3 = 1;
    if (dist > sector2EndDist) sector = 3;
    else if (dist > sector1EndDist) sector = 2;

    waypoints.push({
      x: curr.x,
      y: curr.y,
      z: curr.z,
      distance: dist,
      heading,
      curvature,
      speedLimitKph,
      elevation: curr.y,
      sector,
    });
  }

  // Smooth braking zones backwards
  const maxBrakingDecel = 4.4 * 9.81;
  for (let pass = 0; pass < 3; pass++) {
    for (let i = totalRaw - 1; i >= 0; i--) {
      const nextIdx = (i + 1) % totalRaw;
      const dDist = (waypoints[nextIdx].distance - waypoints[i].distance + circuitLength) % circuitLength;
      const maxNextSpeedMs = waypoints[nextIdx].speedLimitKph / 3.6;
      const allowedEntryMs = Math.sqrt(maxNextSpeedMs * maxNextSpeedMs + 2 * maxBrakingDecel * dDist);
      if (waypoints[i].speedLimitKph > allowedEntryMs * 3.6) {
        waypoints[i].speedLimitKph = allowedEntryMs * 3.6;
      }
    }
  }

  // Build turns
  const turns: TrackTurn[] = turnMap.map((tm) => {
    const wp = waypoints[tm.index] || waypoints[0];
    return {
      number: tm.turn!.number,
      name: tm.turn!.name,
      distance: Math.round(wp.distance),
      position: [wp.x, wp.y, wp.z],
      apexSpeedKph: tm.turn!.apexSpeedKph,
      gear: tm.turn!.gear,
    };
  });

  const curvePoints: Array<[number, number, number]> = waypoints.map((w) => [w.x, w.y, w.z]);

  return {
    id,
    name,
    country,
    lengthMeters: Math.round(circuitLength),
    waypoints,
    curvePoints,
    turns,
    drsZones,
    sectors: {
      sector1EndDist: Math.round(sector1EndDist),
      sector2EndDist: Math.round(sector2EndDist),
      sector3EndDist: Math.round(circuitLength),
    },
    startFinishLine: {
      position: [waypoints[0].x, waypoints[0].y, waypoints[0].z],
      heading: waypoints[0].heading,
      normal: [Math.cos(waypoints[0].heading), 0, -Math.sin(waypoints[0].heading)],
    },
  };
}

/**
 * 1. Singapore Marina Bay Street Circuit (4,940m, 19 Turns)
 * Reference: https://formula-telemetry.com/sessions/2026/singapore/race?tab=track-visualization
 */
export function generateSingaporeCircuit(): GeneratedCircuit {
  const anchors: ControlPointDef[] = [
    { x: 0, y: 0, z: 0 }, // Pit Straight / Start-Finish
    { x: 260, y: 0.5, z: 0, turn: { number: 1, name: 'Sheares (T1)', apexSpeedKph: 115, gear: 3 } },
    { x: 330, y: 1.0, z: 50, turn: { number: 2, name: 'T2', apexSpeedKph: 98, gear: 2 } },
    { x: 280, y: 1.0, z: 140, turn: { number: 3, name: 'T3', apexSpeedKph: 88, gear: 2 } },
    { x: 160, y: 0.5, z: 170, turn: { number: 4, name: 'Republic Blvd (T4)', apexSpeedKph: 175, gear: 4 } },
    { x: 90, y: 0, z: 240, turn: { number: 5, name: 'T5', apexSpeedKph: 130, gear: 3 } },
    { x: 120, y: 0, z: 580 }, // Raffles Boulevard (DRS Zone 1, top speed ~312 km/h)
    { x: 130, y: 0, z: 820 },
    { x: 100, y: 0, z: 980, turn: { number: 7, name: 'Memorial (T7)', apexSpeedKph: 110, gear: 3 } },
    { x: -140, y: 0, z: 950, turn: { number: 8, name: 'Stamford (T8)', apexSpeedKph: 118, gear: 3 } },
    { x: -180, y: 0, z: 820, turn: { number: 9, name: 'Padang (T9)', apexSpeedKph: 122, gear: 3 } },
    { x: -280, y: 0, z: 700 }, // St Andrew's Road (DRS Zone 2)
    { x: -390, y: 0, z: 540, turn: { number: 10, name: 'T10', apexSpeedKph: 160, gear: 4 } },
    { x: -440, y: 1.5, z: 420, turn: { number: 11, name: 'Fullerton Hairpin (T11)', apexSpeedKph: 105, gear: 3 } },
    { x: -470, y: 3.5, z: 320, turn: { number: 12, name: 'Anderson Bridge (T12)', apexSpeedKph: 115, gear: 3 } },
    { x: -450, y: 1.0, z: 180, turn: { number: 13, name: 'Esplanade (T13)', apexSpeedKph: 85, gear: 2 } },
    { x: -320, y: 0, z: 160 }, // Raffles Avenue (DRS Zone 3)
    { x: -150, y: 0, z: 140, turn: { number: 14, name: 'Raffles Ave (T14)', apexSpeedKph: 92, gear: 2 } },
    { x: -120, y: 0, z: 40, turn: { number: 15, name: 'T15', apexSpeedKph: 180, gear: 4 } },
    { x: -240, y: 0, z: -120 }, // New Straight Section
    { x: -320, y: 0, z: -260, turn: { number: 16, name: 'New Chicane Left (T16)', apexSpeedKph: 135, gear: 3 } },
    { x: -260, y: 0, z: -340, turn: { number: 17, name: 'New Chicane Right (T17)', apexSpeedKph: 140, gear: 4 } },
    { x: -140, y: 0, z: -280, turn: { number: 18, name: 'T18', apexSpeedKph: 165, gear: 4 } },
    { x: -50, y: 0, z: -150, turn: { number: 19, name: 'T19 Onto Main Straight', apexSpeedKph: 185, gear: 5 } },
  ];

  const drsZones: TrackDrsZone[] = [
    { number: 1, name: 'Raffles Boulevard DRS', startDistance: 450, endDistance: 1350 },
    { number: 2, name: "St Andrew's Road DRS", startDistance: 1900, endDistance: 2450 },
    { number: 3, name: 'Bayfront Straight DRS', startDistance: 3100, endDistance: 3750 },
    { number: 4, name: 'Pit Straight DRS', startDistance: 4400, endDistance: 4940 },
  ];

  return buildCircuitFromControlPoints(
    'singapore',
    'Marina Bay Street Circuit',
    'Singapore',
    anchors,
    550,
    drsZones
  );
}

/**
 * 2. Silverstone Circuit (5,891m)
 */
export function generateSilverstoneCircuit(): GeneratedCircuit {
  const anchors: ControlPointDef[] = [
    { x: 0, y: 0, z: 0 },
    { x: 280, y: 1.0, z: 10, turn: { number: 1, name: 'Abbey (T1)', apexSpeedKph: 260, gear: 7 } },
    { x: 420, y: 1.5, z: 120, turn: { number: 2, name: 'Farm (T2)', apexSpeedKph: 285, gear: 7 } },
    { x: 380, y: 0.5, z: 280, turn: { number: 3, name: 'Village (T3)', apexSpeedKph: 105, gear: 3 } },
    { x: 240, y: 0, z: 320, turn: { number: 4, name: 'The Loop (T4)', apexSpeedKph: 88, gear: 2 } },
    { x: 120, y: 0, z: 250, turn: { number: 5, name: 'Aintree (T5)', apexSpeedKph: 195, gear: 5 } },
    { x: -150, y: 0, z: 180 }, // Wellington Straight (DRS 1)
    { x: -420, y: 0, z: 110, turn: { number: 6, name: 'Brooklands (T6)', apexSpeedKph: 155, gear: 4 } },
    { x: -520, y: 0, z: 220, turn: { number: 7, name: 'Luffield (T7)', apexSpeedKph: 112, gear: 3 } },
    { x: -500, y: 0, z: 380, turn: { number: 8, name: 'Woodcote (T8)', apexSpeedKph: 240, gear: 6 } },
    { x: -420, y: 0, z: 650, turn: { number: 9, name: 'Copse (T9)', apexSpeedKph: 275, gear: 7 } },
    { x: -280, y: 0, z: 920, turn: { number: 10, name: 'Maggotts (T10)', apexSpeedKph: 295, gear: 8 } },
    { x: -160, y: 0, z: 1020, turn: { number: 11, name: 'Becketts (T11)', apexSpeedKph: 235, gear: 6 } },
    { x: -40, y: 0, z: 1080, turn: { number: 12, name: 'Chapel (T12)', apexSpeedKph: 255, gear: 7 } },
    { x: 320, y: 0, z: 980 }, // Hangar Straight (DRS 2)
    { x: 650, y: 0, z: 820, turn: { number: 15, name: 'Stowe (T15)', apexSpeedKph: 210, gear: 5 } },
    { x: 550, y: 0, z: 520, turn: { number: 16, name: 'Vale (T16)', apexSpeedKph: 115, gear: 3 } },
    { x: 380, y: 0, z: 380, turn: { number: 17, name: 'Club (T17)', apexSpeedKph: 145, gear: 4 } },
    { x: 150, y: 0, z: 120 },
  ];

  const drsZones: TrackDrsZone[] = [
    { number: 1, name: 'Wellington Straight DRS', startDistance: 950, endDistance: 1750 },
    { number: 2, name: 'Hangar Straight DRS', startDistance: 3200, endDistance: 4100 },
  ];

  return buildCircuitFromControlPoints(
    'silverstone',
    'Silverstone Circuit',
    'United Kingdom',
    anchors,
    550,
    drsZones
  );
}

/**
 * 3. Circuit de Spa-Francorchamps (7,004m)
 */
export function generateSpaCircuit(): GeneratedCircuit {
  const anchors: ControlPointDef[] = [
    { x: 0, y: 0, z: 0 },
    { x: 120, y: 0, z: 80, turn: { number: 1, name: 'La Source (T1)', apexSpeedKph: 78, gear: 2 } },
    { x: 350, y: -8, z: 180 }, // Downhill to Eau Rouge
    { x: 520, y: 4, z: 320, turn: { number: 2, name: 'Eau Rouge (T2)', apexSpeedKph: 305, gear: 8 } },
    { x: 580, y: 22, z: 460, turn: { number: 3, name: 'Raidillon (T3)', apexSpeedKph: 310, gear: 8 } },
    { x: 620, y: 24, z: 980 }, // Kemmel Straight (DRS 1)
    { x: 540, y: 22, z: 1280, turn: { number: 5, name: 'Les Combes (T5)', apexSpeedKph: 140, gear: 4 } },
    { x: 420, y: 20, z: 1350, turn: { number: 6, name: 'Malmedy (T6)', apexSpeedKph: 175, gear: 5 } },
    { x: 260, y: 14, z: 1300, turn: { number: 7, name: 'Rivage (T7)', apexSpeedKph: 110, gear: 3 } },
    { x: 140, y: 6, z: 1220, turn: { number: 8, name: 'Bruxelles (T8)', apexSpeedKph: 165, gear: 4 } },
    { x: -80, y: 2, z: 1100, turn: { number: 9, name: 'Speaker Corner (T9)', apexSpeedKph: 180, gear: 5 } },
    { x: -280, y: -2, z: 950, turn: { number: 10, name: 'Pouhon (T10)', apexSpeedKph: 285, gear: 7 } },
    { x: -440, y: -6, z: 720, turn: { number: 12, name: 'Fagnes (T12)', apexSpeedKph: 170, gear: 4 } },
    { x: -520, y: -4, z: 540, turn: { number: 14, name: 'Campus (T14)', apexSpeedKph: 150, gear: 4 } },
    { x: -580, y: -2, z: 320, turn: { number: 15, name: 'Paul Frere (T15)', apexSpeedKph: 240, gear: 6 } },
    { x: -520, y: 0, z: 80, turn: { number: 16, name: 'Blanchimont (T16)', apexSpeedKph: 315, gear: 8 } },
    { x: -350, y: 0, z: -80, turn: { number: 18, name: 'Bus Stop Chicane (T18)', apexSpeedKph: 85, gear: 2 } },
    { x: -160, y: 0, z: -50 },
  ];

  const drsZones: TrackDrsZone[] = [
    { number: 1, name: 'Kemmel Straight DRS', startDistance: 1100, endDistance: 2200 },
    { number: 2, name: 'Pit Straight DRS', startDistance: 6400, endDistance: 7004 },
  ];

  return buildCircuitFromControlPoints(
    'spa',
    'Circuit de Spa-Francorchamps',
    'Belgium',
    anchors,
    550,
    drsZones
  );
}

/**
 * 4. Autodromo Nazionale Monza (5,793m)
 */
export function generateMonzaCircuit(): GeneratedCircuit {
  const anchors: ControlPointDef[] = [
    { x: 0, y: 0, z: 0 },
    { x: 550, y: 0, z: 0, turn: { number: 1, name: 'Variante del Rettifilo (T1)', apexSpeedKph: 75, gear: 2 } },
    { x: 620, y: 0, z: 80, turn: { number: 2, name: 'T2', apexSpeedKph: 85, gear: 2 } },
    { x: 650, y: 0, z: 380, turn: { number: 3, name: 'Curva Grande (T3)', apexSpeedKph: 295, gear: 8 } },
    { x: 580, y: 0, z: 680, turn: { number: 4, name: 'Variante della Roggia (T4)', apexSpeedKph: 120, gear: 3 } },
    { x: 480, y: 0, z: 750, turn: { number: 5, name: 'T5', apexSpeedKph: 130, gear: 3 } },
    { x: 320, y: 0, z: 820, turn: { number: 6, name: 'Curva di Lesmo 1 (T6)', apexSpeedKph: 190, gear: 5 } },
    { x: 180, y: 0, z: 900, turn: { number: 7, name: 'Curva di Lesmo 2 (T7)', apexSpeedKph: 175, gear: 4 } },
    { x: -120, y: 0, z: 850 }, // Serraglio Straight (DRS 1)
    { x: -380, y: 0, z: 680, turn: { number: 8, name: 'Variante Ascari (T8)', apexSpeedKph: 170, gear: 4 } },
    { x: -440, y: 0, z: 540, turn: { number: 9, name: 'Ascari Exit (T9)', apexSpeedKph: 220, gear: 5 } },
    { x: -480, y: 0, z: 220 }, // Rettifilo Centrale (DRS 2)
    { x: -420, y: 0, z: -80, turn: { number: 11, name: 'Curva Parabolica (T11)', apexSpeedKph: 215, gear: 5 } },
    { x: -220, y: 0, z: -120 },
  ];

  const drsZones: TrackDrsZone[] = [
    { number: 1, name: 'Main Pit Straight DRS', startDistance: 4800, endDistance: 5793 },
    { number: 2, name: 'Serraglio Straight DRS', startDistance: 2400, endDistance: 3100 },
  ];

  return buildCircuitFromControlPoints(
    'monza',
    'Autodromo Nazionale Monza',
    'Italy',
    anchors,
    550,
    drsZones
  );
}

/**
 * 5. Apex International Raceway (Original Procedural 5,300m)
 */
export function generateSyntheticCircuit(pointCount: number = 600): GeneratedCircuit {
  const anchors: ControlPointDef[] = [
    { x: 0, y: 0, z: 0 },
    { x: 350, y: 2, z: 0, turn: { number: 1, name: 'Turn 1 Sweeper', apexSpeedKph: 230, gear: 6 } },
    { x: 550, y: 6, z: 80, turn: { number: 2, name: 'Turn 2 Apex', apexSpeedKph: 185, gear: 5 } },
    { x: 620, y: 10, z: 240 },
    { x: 500, y: 12, z: 420, turn: { number: 3, name: 'Turn 3 Tightening', apexSpeedKph: 140, gear: 4 } },
    { x: 280, y: 8, z: 530 },
    { x: 120, y: 4, z: 590, turn: { number: 4, name: 'Turn 4 Hairpin', apexSpeedKph: 88, gear: 2 } },
    { x: -50, y: 2, z: 500 },
    { x: -220, y: 5, z: 380, turn: { number: 5, name: 'Esses Left (T5)', apexSpeedKph: 220, gear: 5 } },
    { x: -350, y: 12, z: 440, turn: { number: 6, name: 'Esses Crest (T6)', apexSpeedKph: 240, gear: 6 } },
    { x: -520, y: 8, z: 320, turn: { number: 7, name: 'Esses Drop (T7)', apexSpeedKph: 215, gear: 5 } },
    { x: -650, y: 3, z: 120 },
    { x: -750, y: 0, z: -150 }, // Back straight
    { x: -800, y: -2, z: -450 },
    { x: -700, y: 2, z: -680, turn: { number: 10, name: 'Chicane Entry (T10)', apexSpeedKph: 125, gear: 3 } },
    { x: -550, y: 5, z: -720, turn: { number: 11, name: 'Chicane Apex (T11)', apexSpeedKph: 135, gear: 3 } },
    { x: -400, y: 4, z: -670 },
    { x: -280, y: 2, z: -550 },
    { x: -150, y: 0, z: -400, turn: { number: 14, name: 'Parabolica Entry (T14)', apexSpeedKph: 210, gear: 5 } },
    { x: -80, y: 0, z: -250, turn: { number: 15, name: 'Parabolica Apex (T15)', apexSpeedKph: 195, gear: 5 } },
    { x: -20, y: 0, z: -100 },
  ];

  const drsZones: TrackDrsZone[] = [
    { number: 1, name: 'Pit Straight DRS', startDistance: 100, endDistance: 450 },
    { number: 2, name: 'Back Straight DRS', startDistance: 2800, endDistance: 3700 },
  ];

  return buildCircuitFromControlPoints(
    'apex',
    'Apex International Raceway',
    'United Kingdom',
    anchors,
    pointCount,
    drsZones
  );
}

export const CIRCUITS_REGISTRY: Record<string, () => GeneratedCircuit> = {
  singapore: generateSingaporeCircuit,
  silverstone: generateSilverstoneCircuit,
  spa: generateSpaCircuit,
  monza: generateMonzaCircuit,
  apex: generateSyntheticCircuit,
};
