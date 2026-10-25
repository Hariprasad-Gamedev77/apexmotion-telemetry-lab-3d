import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

export const metadata: Metadata = {
  title: 'APEX TELEMETRY 3D — Motorsport Engineering Workbench',
  description: 'Browser-based motorsport engineering workbench connecting racing simulator telemetry, historical Formula 1 datasets, synchronized 3D replay, and vehicle performance analysis.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A]">
        {/* Collapsible Clean Light Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#F8FAFC]">
          <TopBar />
          <main className="flex-1 min-w-0 overflow-y-auto bg-[#F8FAFC] text-[#0F172A]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
