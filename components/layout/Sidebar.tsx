'use client';

// APEX TELEMETRY 3D — Collapsible Sidebar Navigation (Light Theme with Rich Accents)

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Timer,
  Compass,
  Gauge,
  LineChart,
  ListOrdered,
  GitCompare,
  Users,
  CircleDot,
  RotateCw,
  History,
  Database,
  FileSpreadsheet,
  Binary,
  Wifi,
  Cpu,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Live',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: Gauge, color: 'text-sky-600' },
      { title: 'Live Timing', href: '/timing', icon: Timer, color: 'text-emerald-600' },
      { title: 'Track Map', href: '/track-map', icon: Compass, color: 'text-indigo-600' },
      { title: 'Vehicle Telemetry', href: '/telemetry', icon: Activity, color: 'text-rose-600' },
    ],
  },
  {
    title: 'Analysis',
    items: [
      { title: 'Telemetry Explorer', href: '/explore', icon: LineChart, color: 'text-sky-600' },
      { title: 'Lap Analysis', href: '/laps', icon: ListOrdered, color: 'text-amber-600' },
      { title: 'Lap Comparison', href: '/comparison', icon: GitCompare, color: 'text-violet-600' },
      { title: 'Driver Comparison', href: '/drivers', icon: Users, color: 'text-teal-600' },
      { title: 'Tyres & Stints', href: '/tyres', icon: CircleDot, color: 'text-orange-600' },
      { title: 'Track Replay', href: '/replay', icon: RotateCw, color: 'text-blue-600' },
      { title: 'Session History', href: '/history', icon: History, color: 'text-slate-600' },
    ],
  },
  {
    title: 'Data',
    items: [
      { title: 'Historical Explorer', href: '/historical', icon: Database, color: 'text-amber-600' },
      { title: 'Import & Export', href: '/data', icon: FileSpreadsheet, color: 'text-emerald-600' },
      { title: 'Packet Inspector', href: '/packets', icon: Binary, color: 'text-violet-600' },
    ],
  },
  {
    title: 'System',
    items: [
      { title: 'Connection Setup', href: '/connection', icon: Wifi, color: 'text-emerald-600' },
      { title: 'Diagnostics', href: '/diagnostics', icon: Cpu, color: 'text-sky-600' },
      { title: 'About APEX', href: '/about', icon: Info, color: 'text-slate-600' },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`relative flex flex-col h-screen bg-white border-r border-slate-200 shadow-sm transition-all duration-200 select-none z-40 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-slate-200 bg-slate-50/50">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-violet-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-sky-500/20">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-mono font-black text-xs tracking-wider text-slate-900 group-hover:text-sky-600 transition-colors">
                APEX TELEMETRY
              </span>
              <span className="text-[9px] font-mono font-bold text-sky-600 uppercase tracking-widest -mt-0.5">
                3D WORKBENCH
              </span>
            </div>
          </Link>
        )}

        {collapsed && (
          <Link href="/" className="mx-auto">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-violet-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-sky-500/20">
              A
            </div>
          </Link>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-500 hover:text-slate-900 transition-colors ${
            collapsed ? 'hidden' : 'block'
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Navigation Links Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            {!collapsed && (
              <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                {section.title}
              </div>
            )}

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono font-medium transition-all group ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200/80 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon
                    size={16}
                    className={`shrink-0 transition-colors ${
                      isActive ? 'text-sky-600' : `${item.color} group-hover:scale-110`
                    }`}
                  />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Toggle when collapsed */}
      {collapsed && (
        <div className="p-2 border-t border-slate-200 flex justify-center bg-slate-50/50">
          <button
            onClick={() => setCollapsed(false)}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-900"
            title="Expand sidebar"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </aside>
  );
}
