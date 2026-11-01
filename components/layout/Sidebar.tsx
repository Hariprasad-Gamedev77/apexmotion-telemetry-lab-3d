'use client';

// APEX TELEMETRY 3D — Professional Motorsport Engineering Navigation Sidebar
// Styling: Daylight theme (Background #FFFFFF, Borders #E2E8F0, Active #0284C7, Text #0F172A / #475569)

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
  TrendingUp,
  Sliders,
  Wrench,
  CircleDot,
  RotateCw,
  Database,
  Trophy,
  MapPin,
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
    title: 'LIVE',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: Gauge, color: 'text-[#0284C7]' },
      { title: 'Live Timing', href: '/timing', icon: Timer, color: 'text-[#10B981]' },
      { title: 'Track Map', href: '/track-map', icon: Compass, color: 'text-[#0284C7]' },
      { title: 'Vehicle Telemetry', href: '/telemetry', icon: Activity, color: 'text-[#EF4444]' },
    ],
  },
  {
    title: 'ANALYSIS',
    items: [
      { title: 'Telemetry Explorer', href: '/explore', icon: LineChart, color: 'text-[#0284C7]' },
      { title: 'Lap Analysis', href: '/laps', icon: ListOrdered, color: 'text-[#F59E0B]' },
      { title: 'Lap Comparison', href: '/comparison', icon: GitCompare, color: 'text-[#8B5CF6]' },
      { title: 'Driver Comparison', href: '/drivers', icon: Users, color: 'text-[#10B981]' },
      { title: 'Race Progression', href: '/progression', icon: TrendingUp, color: 'text-[#0284C7]' },
      { title: 'Race Strategy', href: '/strategy', icon: Sliders, color: 'text-[#F59E0B]' },
      { title: 'Pit Stops', href: '/pit-stops', icon: Wrench, color: 'text-[#EF4444]' },
      { title: 'Tyres & Stints', href: '/tyres', icon: CircleDot, color: 'text-[#EA580C]' },
      { title: 'Track Replay', href: '/replay', icon: RotateCw, color: 'text-[#0284C7]' },
    ],
  },
  {
    title: 'DATA',
    items: [
      { title: 'Circuit Explorer', href: '/circuits', icon: MapPin, color: 'text-[#0284C7]' },
      { title: 'Historical Explorer', href: '/historical', icon: Database, color: 'text-[#F59E0B]' },
      { title: 'Championship Stats', href: '/stats', icon: Trophy, color: 'text-[#F59E0B]' },
      { title: 'Import & Export', href: '/data', icon: FileSpreadsheet, color: 'text-[#10B981]' },
      { title: 'Packet Inspector', href: '/packets', icon: Binary, color: 'text-[#8B5CF6]' },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { title: 'Connection Setup', href: '/connection', icon: Wifi, color: 'text-[#10B981]' },
      { title: 'Diagnostics', href: '/diagnostics', icon: Cpu, color: 'text-[#0284C7]' },
      { title: 'About APEX', href: '/about', icon: Info, color: 'text-[#475569]' },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`relative flex flex-col h-screen bg-white border-r border-[#E2E8F0] shadow-sm transition-all duration-200 select-none z-40 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0284C7] via-[#2563EB] to-[#8B5CF6] flex items-center justify-center font-black text-white text-sm shadow-sm shadow-[#0284C7]/20">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-mono font-black text-xs tracking-wider text-[#0F172A] group-hover:text-[#0284C7] transition-colors">
                APEX TELEMETRY
              </span>
              <span className="text-[9px] font-mono text-[#64748B] tracking-tight">
                MOTORSPORT ENGINEERING
              </span>
            </div>
          </Link>
        )}

        {collapsed && (
          <Link href="/" className="mx-auto">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0284C7] via-[#2563EB] to-[#8B5CF6] flex items-center justify-center font-black text-white text-sm shadow-sm">
              A
            </div>
          </Link>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors ${
            collapsed ? 'mx-auto mt-1' : ''
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4 scrollbar-thin scrollbar-thumb-[#CBD5E1]">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            {!collapsed && (
              <div className="px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider text-[#64748B] uppercase">
                {section.title}
              </div>
            )}

            {section.items.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                    active
                      ? 'bg-[#F1F5F9] text-[#0F172A] font-bold border-l-2 border-[#0284C7] shadow-xs'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon size={17} className={active ? 'text-[#0284C7]' : item.color} />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer System Status */}
      <div className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC]">
        {!collapsed ? (
          <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="font-semibold text-[#0F172A]">ENGINE READY</span>
            </div>
            <span className="text-[#94A3B8]">v2.4.0</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          </div>
        )}
      </div>
    </aside>
  );
}
