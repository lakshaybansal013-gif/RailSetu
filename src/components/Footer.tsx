import React from 'react';
import { Link } from 'react-router-dom';
import { Train, ShieldCheck, Heart, Sparkles, Code2, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 text-sm mt-20 no-print">
      {/* Top Banner: Algorithm Viva Quick Reference */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">Greedy Algorithms Viva Architecture</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-mono">
                  CS Capstone 2026
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Five pure mathematical greedy strategies implemented with full visual traces &amp; unit tests.
              </p>
            </div>
          </div>

          <Link
            to="/visualizer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 transition shadow-lg shadow-orange-950/50"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Interactive Viva Visualizer</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold">
                <Train className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">RailSetu</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              An intelligent, responsive Indian Railways reservation portal engineered to demonstrate optimal resource allocation using greedy algorithmic paradigms: interval scheduling, min-heaps, and shortest paths.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Full Mock Data Active &bull; Supabase Backend Ready</span>
            </div>
          </div>

          {/* Greedy Algorithms List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Greedy Modules</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/visualizer?tab=berth" className="hover:text-orange-400 transition flex items-center justify-between">
                  <span>Berth Activity Selection</span>
                  <span className="font-mono text-[10px] text-slate-500">O(n log n)</span>
                </Link>
              </li>
              <li>
                <Link to="/visualizer?tab=platform" className="hover:text-orange-400 transition flex items-center justify-between">
                  <span>Platform Min-Heap Partition</span>
                  <span className="font-mono text-[10px] text-slate-500">O(n log k)</span>
                </Link>
              </li>
              <li>
                <Link to="/visualizer?tab=route" className="hover:text-orange-400 transition flex items-center justify-between">
                  <span>Dijkstra Multi-Hop (30m Layover)</span>
                  <span className="font-mono text-[10px] text-slate-500">O(E log V)</span>
                </Link>
              </li>
              <li>
                <Link to="/visualizer?tab=waitlist" className="hover:text-orange-400 transition flex items-center justify-between">
                  <span>Priority Queue Waitlist</span>
                  <span className="font-mono text-[10px] text-slate-500">O(k log n)</span>
                </Link>
              </li>
              <li>
                <Link to="/visualizer?tab=kruskal" className="hover:text-orange-400 transition flex items-center justify-between">
                  <span>Kruskal MST Network</span>
                  <span className="font-mono text-[10px] text-slate-500">O(E log E)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Pages */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/search" className="hover:text-white transition">Book Tickets</Link></li>
              <li><Link to="/pnr" className="hover:text-white transition">PNR Status &amp; Track</Link></li>
              <li><Link to="/admin" className="hover:text-white transition">Admin Station Occupancy</Link></li>
              <li><Link to="/live-status" className="hover:text-white transition">Live Train Running Status</Link></li>
              <li><Link to="/history" className="hover:text-white transition">Booking History &amp; Cancel</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Help &amp; Passenger Support</Link></li>
            </ul>
          </div>

          {/* Hubs / Cities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Major Hubs Connected</h4>
            <div className="flex flex-wrap gap-1.5">
              {['NDLS', 'CSMT', 'HWH', 'MAS', 'SBC', 'HYB', 'ADI', 'JP', 'BSB', 'PNBE', 'LKO', 'PUNE', 'CDG', 'MAO', 'GHY'].map(code => (
                <span key={code} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                  {code}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              15 Indian metropolitan nodes modeled in the MST rail topology.
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} RailSetu Indian Railway Allocation System. Designed for College Academic Viva Demonstration.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for Algorithmic Excellence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
