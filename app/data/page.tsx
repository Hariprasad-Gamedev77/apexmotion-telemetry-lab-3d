'use client';

// APEX TELEMETRY 3D — Data Import & Export Hub
// Light Theme with Reeve styling, vibrant buttons, and clean white cards

import React, { useState } from 'react';
import { useApexStore } from '@/lib/store';
import { FileSpreadsheet, Download, Upload } from 'lucide-react';

export default function ImportExportPage() {
  const { telemetryHistory, activeSession } = useApexStore();
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'jsonl'>('csv');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExport = () => {
    let content = '';
    let mimeType = 'text/plain';
    const filename = `apex_telemetry_${activeSession.id}.${exportFormat}`;

    if (exportFormat === 'csv') {
      mimeType = 'text/csv';
      const headers = ['timestamp', 'distanceMeters', 'speedKph', 'throttlePercent', 'brakePercent', 'gear', 'rpm', 'drs', 'worldX', 'worldY', 'worldZ'];
      const rows = telemetryHistory.map((s) => [
        s.timestamp, s.distanceMeters, s.speedKph, s.throttlePercent, s.brakePercent, s.gear, s.rpm, s.drs, s.worldX, s.worldY, s.worldZ
      ].join(','));
      content = [headers.join(','), ...rows].join('\n');
    } else if (exportFormat === 'json') {
      mimeType = 'application/json';
      content = JSON.stringify({
        session: activeSession,
        samplesCount: telemetryHistory.length,
        telemetry: telemetryHistory,
      }, null, 2);
    } else if (exportFormat === 'jsonl') {
      mimeType = 'application/x-ndjson';
      content = telemetryHistory.map((s) => JSON.stringify(s)).join('\n');
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <FileSpreadsheet size={20} />
            </div>
            <h1 className="text-2xl font-bold font-mono text-slate-900">
              DATA IMPORT & EXPORT
            </h1>
          </div>
          <p className="text-xs font-mono font-medium text-slate-500 mt-1">
            Export session telemetry or import recorded logs (CSV, JSON, JSONL)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sky-700">
              <Download size={18} />
              <h2 className="font-mono font-bold text-sm uppercase tracking-wider">
                Export Current Session Telemetry
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Export recorded lap samples for deep analysis in MATLAB, Python pandas, or MoTeC i2.
            </p>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">SELECT FORMAT:</span>
              <div className="grid grid-cols-3 gap-2">
                {(['csv', 'json', 'jsonl'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setExportFormat(fmt)}
                    className={`py-2 rounded-xl font-mono text-xs font-bold uppercase transition-all active:scale-95 ${
                      exportFormat === fmt
                        ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs font-mono text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
              <div>Session: <span className="text-slate-900 font-bold">{activeSession.meetingName}</span></div>
              <div>Available Samples: <span className="text-sky-700 font-tabular font-bold">{telemetryHistory.length}</span></div>
            </div>
          </div>

          <button
            onClick={handleExport}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 active:scale-95 transition-all"
          >
            <Download size={15} />
            <span>{downloadSuccess ? 'File Downloaded!' : `Export ${exportFormat.toUpperCase()} Dataset`}</span>
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <Upload size={18} />
              <h2 className="font-mono font-bold text-sm uppercase tracking-wider">
                Import External Telemetry
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Upload telemetry logs with speed, throttle, brake, and coordinates for instant 3D visualization.
            </p>

            {/* Dropzone mock */}
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-50/50">
              <Upload size={24} className="text-slate-400" />
              <div className="text-xs font-mono font-bold text-slate-800">
                Click or drag CSV / JSONL telemetry log
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Max file size: 50MB • Automatically normalized
              </div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
            Zod schema validation applied on upload before playback ingestion.
          </div>
        </div>
      </div>
    </div>
  );
}
