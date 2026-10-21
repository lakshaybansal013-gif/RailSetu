import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { stationService } from '../services/stationService';
import { trainService } from '../services/trainService';
import { bookingService } from '../services/bookingService';
import { Station, Train, Booking } from '../types';
import { MOCK_NETWORK_EDGES } from '../mock/networkEdges';
import { kruskalMinimumSpanningTree } from '../algorithms/kruskalMst';
import {
  BarChart3,
  Train as TrainIcon,
  Layers,
  MapPin,
  TrendingUp,
  Cpu,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [trains, setTrains] = useState<Train[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    stationService.getAllStations().then(setStations);
    trainService.getAllTrains().then(setTrains);
    bookingService.getAllBookings().then(setBookings);
  }, []);

  // Run Kruskal MST on Indian cities
  const stationCodes = stations.map(s => s.code);
  const mstResult = kruskalMinimumSpanningTree(stationCodes, MOCK_NETWORK_EDGES);

  // Station Platform Data for Recharts
  const stationPlatformData = stations.slice(0, 10).map(s => ({
    name: s.code,
    city: s.city,
    platforms: s.platformsCount,
    trains: Math.floor(s.platformsCount * 4.2),
  }));

  // Train Occupancy & Punctuality Data for Recharts
  const trainOccupancyData = trains.slice(0, 8).map(t => ({
    train: t.trainName.split(' ')[0],
    trainNo: t.trainNumber,
    punctuality: t.averagePunctuality,
    occupancy: Math.floor(75 + (parseInt(t.trainNumber.slice(-2), 10) % 24)),
  }));

  const totalFullMeshCost = MOCK_NETWORK_EDGES.reduce((acc, e) => acc + e.costInCr, 0);
  const totalFullMeshDist = MOCK_NETWORK_EDGES.reduce((acc, e) => acc + e.distanceKm, 0);
  const savingsCr = totalFullMeshCost - mstResult.totalCostCr;
  const savingsPct = Math.round((savingsCr / totalFullMeshCost) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-mono">
              RAILSETU ADMIN COMMAND
            </span>
            <span className="text-xs text-slate-400">Live Indian Railways Operational Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Railway Operations &amp; Algorithmic Analytics
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All Systems Optimal</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Stations Handled</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{stations.length} Hubs</p>
          <span className="text-[11px] text-slate-500">15 Metropolitan Nodes</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Express Trains</span>
          <p className="text-2xl sm:text-3xl font-black text-orange-600">{trains.length} Trains</p>
          <span className="text-[11px] text-emerald-600 font-semibold">96.2% Avg Punctuality</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Bookings</span>
          <p className="text-2xl sm:text-3xl font-black text-blue-900">{bookings.length} PNRs</p>
          <span className="text-[11px] text-slate-500">Activity Selection Allocation</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">MST Rail Savings</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">₹{savingsCr.toLocaleString()} Cr</p>
          <span className="text-[11px] text-emerald-700 font-bold">{savingsPct}% Budget Optimization</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Platforms and Trains Handled Per Station */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Platforms &amp; Daily Traffic by Station</h3>
              <p className="text-xs text-slate-400">Platform assignment via Interval Partitioning with Min-Heap</p>
            </div>
            <span className="text-xs font-mono text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded">
              Recharts Bar
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stationPlatformData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="platforms" name="Platform Capacity" fill="#ea580c" radius={[4, 4, 0, 0]} />
                <Bar dataKey="trains" name="Daily Trains Handled" fill="#0d3880" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Train Occupancy and Punctuality */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Train Occupancy &amp; Punctuality Rate</h3>
              <p className="text-xs text-slate-400">Activity Selection berth utilization &bull; % Metrics</p>
            </div>
            <span className="text-xs font-mono text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded">
              Recharts Area
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trainOccupancyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPunct" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d3880" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0d3880" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="train" tick={{ fontSize: 11 }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="occupancy" name="Occupancy %" stroke="#ea580c" fillOpacity={1} fill="url(#colorOcc)" strokeWidth={2} />
                <Area type="monotone" dataKey="punctuality" name="On-Time %" stroke="#0d3880" fillOpacity={1} fill="url(#colorPunct)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Kruskal's MST Indian Rail Network Section */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-mono">
                GREEDY KRUSKAL MST
              </span>
              <span className="text-xs text-slate-400">Indian Railway Network Optimization</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Cheapest Connected Railway Grid (Disjoint Set Union)
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Kruskal's algorithm greedily accepts the lowest-budget corridor edges and rejects edges that would form cycles, ensuring all 15 metropolitan centers are connected at minimum capital expenditure.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 p-3 rounded-2xl border border-white/10 text-xs text-right">
            <div>
              <span className="text-slate-400">MST Network Cost</span>
              <p className="text-lg font-black text-orange-400">₹{mstResult.totalCostCr.toLocaleString()} Cr</p>
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <div>
              <span className="text-slate-400">Full Corridors Cost</span>
              <p className="text-lg font-black text-slate-300">₹{totalFullMeshCost.toLocaleString()} Cr</p>
            </div>
          </div>
        </div>

        {/* MST Corridors Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Accepted MST Corridors ({mstResult.mstEdges.length} Edges Spanning 15 Cities)</span>
            <span className="text-orange-400 font-mono">Cycle-Free Spanning Tree</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
            {mstResult.mstEdges.map(edge => (
              <div
                key={edge.id}
                className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between hover:bg-white/10 transition"
              >
                <div>
                  <span className="font-mono font-black text-white text-sm">
                    {edge.source} &harr; {edge.destination}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{edge.distanceKm} km track</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-orange-400 font-mono">₹{edge.costInCr} Cr</span>
                  <span className="text-[9px] text-emerald-400 font-bold block">ACCEPTED</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rejected Edges Callout */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-slate-300">
              <strong>{mstResult.rejectedEdges.length} Candidate Corridors Rejected:</strong> Disjoint Set Union (DSU) detected these corridors would create redundant topological cycles, saving ₹{savingsCr.toLocaleString()} Crores in railway laying budget.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
