import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Navigation,
  BookOpen,
  Bookmark,
  Info,
  Cpu,
  BarChart3,
  Radio,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Train,
} from 'lucide-react';

const sidebarLinks = [
  { to: '/', label: 'Plan Journey', icon: Navigation, exact: true },
  { to: '/history', label: 'My Bookings', icon: BookOpen },
  { to: '/pnr', label: 'Saved / PNR', icon: Bookmark },
  { to: '/live-status', label: 'Train Info', icon: Info },
  { to: '/visualizer', label: 'Algorithms', icon: Cpu, highlight: true },
  { to: '/admin', label: 'Dashboard', icon: BarChart3 },
  { to: '/live-status', label: 'Live Status', icon: Radio },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <aside
      className={`hidden lg:flex flex-col flex-shrink-0 h-full transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-[88px]'
      } bg-[#1c3a2c] text-white relative`}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-[#1c3a2c] border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#264d3a] transition shadow-lg"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      {/* Nav Links */}
      <nav className="flex-1 flex flex-col items-center pt-4 gap-1 px-2 overflow-y-auto">
        {sidebarLinks.map((link, i) => {
          const Icon = link.icon;
          const active = isActive(link.to, link.exact);
          return (
            <Link
              key={`${link.to}-${i}`}
              to={link.to}
              title={link.label}
              className={`w-full flex flex-col items-center justify-center gap-1 py-3 px-1 rounded-xl transition-all duration-200 group ${
                active
                  ? 'bg-white/15 text-white'
                  : link.highlight
                  ? 'text-amber-300 hover:bg-amber-500/10'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition ${
                  active ? 'text-white' : link.highlight ? 'text-amber-300' : 'text-white/60 group-hover:text-white'
                }`}
              />
              {!collapsed && (
                <span className="text-[9px] font-bold tracking-wide leading-tight text-center">
                  {link.label}
                </span>
              )}
              {/* Active indicator line */}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-400 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Eco Banner */}
      <div className="p-3 border-t border-white/10">
        <div className={`flex flex-col items-center gap-2 text-center ${collapsed ? '' : 'p-2'}`}>
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          {!collapsed && (
            <>
              <p className="text-[9px] text-white/50 leading-tight">
                A greener way to explore India
              </p>
              <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-semibold">
                <Train className="w-3 h-3" />
                <span>Rail saves 90% CO₂</span>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
