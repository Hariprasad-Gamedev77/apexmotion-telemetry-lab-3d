'use client';

// APEX TELEMETRY 3D — 2D Interactive Track Map & Spatial Position Inspector
// Light Theme with high-contrast tarmac, colorful competitor dots, and Reeve styling

import React, { useMemo } from 'react';
import { useApexStore } from '@/lib/store';
import { computeBoundingBox } from '@/lib/utils';
import { MapPin } from 'lucide-react';

export function TrackMap2D({ width = 320, height = 280 }: { width?: number; height?: number }) {
  const { circuit, currentTelemetry, drivers, selectedDriverNumber, setCurrentTime, duration } = useApexStore();

  const { pathD, startFinishCoord, transformCoord } = useMemo(() => {
    const wps = circuit.waypoints;
    if (wps.length === 0) return { pathD: '', startFinishCoord: { x: 0, y: 0 }, transformCoord: (x: number, z: number) => ({ x: 0, y: 0 }) };

    const bbox = computeBoundingBox(wps);
    const padding = 28;
    const drawW = width - padding * 2;
    const drawH = height - padding * 2;
    const scale = Math.min(drawW / bbox.spanX, drawH / bbox.spanZ);

    const transform = (x: number, z: number) => ({
      x: padding + (x - bbox.minX) * scale,
      y: padding + (z - bbox.minZ) * scale,
    });

    let d = '';
    wps.forEach((wp, idx) => {
      const pt = transform(wp.x, wp.z);
      d += idx === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : ` L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    });
    d += ' Z';

    const sf = transform(wps[0].x, wps[0].z);

    return {
      pathD: d,
      startFinishCoord: sf,
      transformCoord: transform,
    };
  }, [circuit, width, height]);

  const leadCarPos = transformCoord(currentTelemetry.worldX, currentTelemetry.worldZ);

  return (
    <div className="relative flex flex-col bg-white/95 border border-slate-200 p-3.5 rounded-2xl shadow-xl shadow-slate-200/50 backdrop-blur-md select-none">
      <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2 mb-2">
        <span className="font-mono font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
          <MapPin size={13} className="text-sky-600" />
          CIRCUIT MAP (2D)
        </span>
        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
          {circuit.name}
        </span>
      </div>

      <svg
        width={width}
        height={height}
        className="w-full h-auto cursor-pointer rounded-xl bg-slate-50 border border-slate-100"
        viewBox={`0 0 ${width} ${height}`}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const clickY = e.clientY - rect.top;

          // Find closest waypoint to click
          let minDist = Infinity;
          let closestWp = circuit.waypoints[0];
          circuit.waypoints.forEach((wp) => {
            const pt = transformCoord(wp.x, wp.z);
            const dist = (pt.x - clickX) ** 2 + (pt.y - clickY) ** 2;
            if (dist < minDist) {
              minDist = dist;
              closestWp = wp;
            }
          });

          if (closestWp) {
            const targetTime = (closestWp.distance / circuit.lengthMeters) * duration;
            setCurrentTime(targetTime);
          }
        }}
      >
        {/* Track Outline Background Glow / Base */}
        <path
          d={pathD}
          fill="none"
          stroke="#CBD5E1"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Track Surface Ribbon */}
        <path
          d={pathD}
          fill="none"
          stroke="#1E293B"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Start / Finish Checkered Gate Line */}
        <circle
          cx={startFinishCoord.x}
          cy={startFinishCoord.y}
          r="4.5"
          fill="#FFFFFF"
          stroke="#EF4444"
          strokeWidth="2"
        />

        {/* Render Other Competitor Vehicles */}
        {drivers
          .filter((d) => d.driverNumber !== selectedDriverNumber && d.visible)
          .map((drv, idx) => {
            const offsetDist = (currentTelemetry.distanceMeters - (idx + 1) * 75 + circuit.lengthMeters) % circuit.lengthMeters;
            const wpIdx = Math.floor((offsetDist / circuit.lengthMeters) * circuit.waypoints.length) % circuit.waypoints.length;
            const wp = circuit.waypoints[wpIdx];
            if (!wp) return null;
            const pt = transformCoord(wp.x, wp.z);

            return (
              <g key={drv.driverNumber}>
                <circle cx={pt.x} cy={pt.y} r="4" fill={drv.color} stroke="#FFFFFF" strokeWidth="1" />
              </g>
            );
          })}

        {/* Render Active Selected Lead Vehicle with Pulse */}
        <circle
          cx={leadCarPos.x}
          cy={leadCarPos.y}
          r="9"
          fill="#0284C7"
          opacity="0.35"
          className="animate-ping"
        />
        <circle
          cx={leadCarPos.x}
          cy={leadCarPos.y}
          r="5.5"
          fill="#0284C7"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
      </svg>
      <div className="mt-2 text-[10px] font-mono text-slate-400 text-center">
        Click any sector or corner on the circuit to jump playback
      </div>
    </div>
  );
}
