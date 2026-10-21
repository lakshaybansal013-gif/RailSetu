import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Sparkles,
  Layers,
  Clock,
  Split,
  Zap,
  Coins,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  ArrowRight,
} from 'lucide-react';
import {
  allocateBerthsActivitySelection,
  assignPlatformsGreedy,
  findRoutesDijkstra,
  promoteWaitlistedPassengers,
  kruskalMinimumSpanningTree,
  calculateGreedyRefundDenominations,
  StationSegmentInterval,
  TrainArrivalDeparture,
  WaitlistPriorityItem,
  NetworkEdge,
} from '../algorithms';
import { MOCK_TRAINS } from '../mock/trains';
import { MOCK_NETWORK_EDGES } from '../mock/networkEdges';

export const AlgorithmVisualizerPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'berth';

  const [activeTab, setActiveTab] = useState<string>(currentTab);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 0.5x, 1x, 2x, 4x

  // Sample data for Berth Allocation
  const sampleBerthIntervals: StationSegmentInterval[] = [
    { id: 'p1', passengerName: 'Aarav Sharma', startIdx: 0, endIdx: 2, startStation: 'NDLS', endStation: 'PRYJ' },
    { id: 'p2', passengerName: 'Diya Patel', startIdx: 2, endIdx: 5, startStation: 'PRYJ', endStation: 'HWH' },
    { id: 'p3', passengerName: 'Rohan Mehra', startIdx: 1, endIdx: 4, startStation: 'CNB', endStation: 'PNBE' },
    { id: 'p4', passengerName: 'Sneha Rao', startIdx: 0, endIdx: 1, startStation: 'NDLS', endStation: 'CNB' },
    { id: 'p5', passengerName: 'Kabir Khan', startIdx: 4, endIdx: 5, startStation: 'PNBE', endStation: 'HWH' },
  ];
  const berthResult = allocateBerthsActivitySelection(sampleBerthIntervals);

  // Sample data for Platform Assignment
  const sampleTrains: TrainArrivalDeparture[] = [
    { id: 'T1', trainNumber: '12004', trainName: 'Shatabdi Exp', arrivalMinutes: 360, departureMinutes: 400, arrivalStr: '06:00', departureStr: '06:40' },
    { id: 'T2', trainNumber: '22436', trainName: 'Vande Bharat', arrivalMinutes: 375, departureMinutes: 415, arrivalStr: '06:15', departureStr: '06:55' },
    { id: 'T3', trainNumber: '12952', trainName: 'Tejas Rajdhani', arrivalMinutes: 410, departureMinutes: 450, arrivalStr: '06:50', departureStr: '07:30' },
    { id: 'T4', trainNumber: '12302', trainName: 'Howrah Rajdhani', arrivalMinutes: 430, departureMinutes: 470, arrivalStr: '07:10', departureStr: '07:50' },
    { id: 'T5', trainNumber: '12622', trainName: 'Tamil Nadu Exp', arrivalMinutes: 460, departureMinutes: 520, arrivalStr: '07:40', departureStr: '08:40' },
  ];
  const platformResult = assignPlatformsGreedy(sampleTrains, 5);

  // Dijkstra route result
  const [dijkstraOpt, setDijkstraOpt] = useState<'FASTEST' | 'CHEAPEST'>('FASTEST');
  const dijkstraResult = findRoutesDijkstra('NDLS', 'MAS', MOCK_TRAINS, dijkstraOpt, '3A');

  // Waitlist Priority Queue result
  const sampleWaitlist: WaitlistPriorityItem[] = [
    { id: 'W1', passengerName: 'Kavita Verma', pnr: '2847193021', quota: 'GN', bookingTimestamp: 1771000100000, bookingTimeStr: '08:00 AM', age: 34, priorityScore: 5000000, waitlistPosition: 1 },
    { id: 'W2', passengerName: 'Dr. Ram Swaroop', pnr: '2847193022', quota: 'SS', bookingTimestamp: 1771000200000, bookingTimeStr: '08:15 AM', age: 68, priorityScore: 9000000, waitlistPosition: 2 },
    { id: 'W3', passengerName: 'Anil Kumar', pnr: '2847193023', quota: 'TQ', bookingTimestamp: 1771000300000, bookingTimeStr: '08:30 AM', age: 41, priorityScore: 8000000, waitlistPosition: 3 },
    { id: 'W4', passengerName: 'Sunita Devi', pnr: '2847193024', quota: 'LD', bookingTimestamp: 1771000400000, bookingTimeStr: '08:45 AM', age: 29, priorityScore: 7500000, waitlistPosition: 4 },
    { id: 'W5', passengerName: 'Rajiv Sharma', pnr: '2847193025', quota: 'DP', bookingTimestamp: 1771000500000, bookingTimeStr: '09:00 AM', age: 39, priorityScore: 9500000, waitlistPosition: 5 },
  ];
  const waitlistResult = promoteWaitlistedPassengers(sampleWaitlist, 2);

  // Kruskal & Coin Change results
  const kruskalResult = kruskalMinimumSpanningTree(
    ['NDLS', 'CDG', 'JP', 'ADI', 'CSMT', 'PUNE', 'SBC', 'MAS', 'HYB', 'LKO', 'BSB', 'PNBE', 'HWH'],
    MOCK_NETWORK_EDGES.slice(0, 10)
  );
  const coinChangeResult = calculateGreedyRefundDenominations(1875);

  // Determine current active steps array based on activeTab
  const getActiveSteps = () => {
    switch (activeTab) {
      case 'berth': return berthResult.steps;
      case 'platform': return platformResult.steps;
      case 'route': return dijkstraResult.steps;
      case 'waitlist': return waitlistResult.steps;
      case 'kruskal': return kruskalResult.steps;
      case 'coin': return coinChangeResult.steps;
      default: return berthResult.steps;
    }
  };

  const steps = getActiveSteps();
  const maxSteps = Math.max(1, steps.length);

  // Reset step when changing tabs
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // Playback timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= maxSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1400 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, maxSteps, playbackSpeed]);

  const stepInfo = steps[currentStep] || steps[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Viva Spotlight Header */}
      <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold mb-3 border border-orange-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>College Viva Interactive Demonstration</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Greedy Algorithms Visualizer Suite
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
              Play, pause, inspect variable animation speeds, and step through mathematical proofs of greedy choices across Indian Railways reservation workflows.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-md">
            <Award className="w-8 h-8 text-orange-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-white block">Greedy Choice Criterion</span>
              <span className="text-slate-400">Locally optimal choices &rarr; Global optimum</span>
            </div>
          </div>
        </div>

        {/* Algorithm Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 border-t border-slate-800/80 mt-6 text-xs font-bold scrollbar-none">
          {[
            { id: 'berth', label: '1. Berth Activity Selection', icon: Layers, complexity: 'O(n log n)' },
            { id: 'platform', label: '2. Platform Min-Heap', icon: Clock, complexity: 'O(n log k)' },
            { id: 'route', label: '3. Dijkstra Layover Route', icon: Split, complexity: 'O(E log V)' },
            { id: 'waitlist', label: '4. Waitlist Max-Heap', icon: Zap, complexity: 'O(k log n)' },
            { id: 'kruskal', label: '5. Kruskal MST Network', icon: Sparkles, complexity: 'O(E log E)' },
            { id: 'coin', label: '6. Coin Change Refund', icon: Coins, complexity: 'O(D)' },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30 font-extrabold'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/30 opacity-80">
                  {tab.complexity}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Universal Visualizer Controller Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause' : 'Play Live'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStep(prev => Math.max(0, prev - 1));
            }}
            disabled={currentStep === 0}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 disabled:opacity-40 transition"
            title="Step Back"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStep(prev => Math.min(maxSteps - 1, prev + 1));
            }}
            disabled={currentStep >= maxSteps - 1}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 disabled:opacity-40 transition"
            title="Step Forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStep(0);
            }}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar & Indicator */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-slate-500">
            Step {currentStep + 1} of {maxSteps}
          </span>
          <div className="w-32 sm:w-48 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-orange-600 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / maxSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <span className="text-[10px] text-slate-400 px-2 uppercase">Speed:</span>
          {[0.5, 1, 2, 4].map(speed => (
            <button
              key={speed}
              type="button"
              onClick={() => setPlaybackSpeed(speed)}
              className={`px-2.5 py-1 rounded-lg transition ${
                playbackSpeed === speed
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Main Visual Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: The Visual Diagram / Animation */}
        <div className="lg:col-span-2 bg-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-sm text-white">Live Execution Stage</span>
            </div>
            <span className="text-xs font-mono text-orange-400 font-bold">
              {activeTab.toUpperCase()} ENGINE
            </span>
          </div>

          {/* TAB 1: BERTH ACTIVITY SELECTION VISUALIZER */}
          {activeTab === 'berth' && (
            <div className="space-y-6">
              <div className="text-xs text-slate-300">
                Stations: <strong>NDLS (0) &rarr; CNB (1) &rarr; PRYJ (2) &rarr; DDU (3) &rarr; PNBE (4) &rarr; HWH (5)</strong>
              </div>

              {/* Station axis */}
              <div className="grid grid-cols-6 text-center text-[11px] font-mono font-bold text-slate-400 border-b border-slate-800 pb-2">
                <span>NDLS (0)</span>
                <span>CNB (1)</span>
                <span>PRYJ (2)</span>
                <span>DDU (3)</span>
                <span>PNBE (4)</span>
                <span>HWH (5)</span>
              </div>

              {/* Allocated Berths Tracks */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-orange-400">Allocated Berths Timeline:</div>
                {berthResult.berthAllocations.map(berth => (
                  <div key={berth.berthId} className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-xs font-mono font-bold text-white bg-orange-600 px-2 py-0.5 rounded">
                      Berth B{berth.berthId}
                    </span>
                    <div className="relative h-12 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center">
                      {berth.intervals.map(p => {
                        const leftPct = (p.startIdx / 5) * 100;
                        const widthPct = ((p.endIdx - p.startIdx) / 5) * 100;
                        return (
                          <div
                            key={p.id}
                            className="absolute h-9 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 border border-orange-300 text-white font-bold text-xs flex items-center px-2 shadow-md truncate"
                            style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                          >
                            <span>{p.passengerName} ({p.startStation}&rarr;{p.endStation})</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PLATFORM MIN-HEAP GANTT CHART */}
          {activeTab === 'platform' && (
            <div className="space-y-6">
              <div className="text-xs text-slate-300">
                Minimum platforms calculated: <strong className="text-orange-400 text-sm font-bold">{platformResult.minPlatformsNeeded} Platforms</strong> (Max Overlapping Depth)
              </div>

              {/* Platform Tracks */}
              <div className="space-y-3">
                {platformResult.platformSchedules.map(ps => (
                  <div key={ps.platformId} className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-bold text-orange-400 font-mono">Platform #{ps.platformId}</span>
                      <span className="text-slate-400 font-mono">{ps.trains.length} Trains Handled</span>
                    </div>

                    <div className="relative h-10 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center">
                      {ps.trains.map(t => {
                        const leftPct = Math.max(0, Math.min(100, ((t.arrivalMinutes - 350) / 200) * 100));
                        const widthPct = Math.max(12, ((t.departureMinutes - t.arrivalMinutes) / 200) * 100);
                        return (
                          <div
                            key={t.id}
                            className="absolute h-7 rounded bg-blue-600 border border-blue-400 text-white text-[10px] font-bold flex items-center px-1.5 shadow truncate"
                            style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                          >
                            <span>{t.trainNumber} ({t.arrivalStr}-{t.departureStr})</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DIJKSTRA CONNECTING ROUTE GRAPH */}
          {activeTab === 'route' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs">
                <span>Dijkstra Shortest Path: <strong>NDLS &rarr; MAS</strong></span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDijkstraOpt('FASTEST')}
                    className={`px-2.5 py-1 rounded text-xs font-bold ${dijkstraOpt === 'FASTEST' ? 'bg-orange-600' : 'bg-slate-800'}`}
                  >
                    Fastest
                  </button>
                  <button
                    type="button"
                    onClick={() => setDijkstraOpt('CHEAPEST')}
                    className={`px-2.5 py-1 rounded text-xs font-bold ${dijkstraOpt === 'CHEAPEST' ? 'bg-blue-600' : 'bg-slate-800'}`}
                  >
                    Cheapest
                  </button>
                </div>
              </div>

              {/* Vertex Relaxations */}
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block">
                  Vertex Tentative Distance Table
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs font-mono">
                  {Object.entries((stepInfo as any).tentativeDistances || {}).slice(0, 10).map(([st, dist]) => (
                    <div key={st} className="p-2 rounded bg-slate-950 border border-slate-800 text-center">
                      <span className="text-slate-400 block">{st}</span>
                      <span className="text-white font-bold">{dist === Infinity ? '∞' : String(dist)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 30-min layover callout */}
              <div className="p-3 bg-indigo-950/80 border border-indigo-800 rounded-xl text-xs text-indigo-200">
                <strong>Mandatory Layover Invariant:</strong> The second connecting train departure must be at least 30 minutes after the first leg arrival (transfer &ge; 30 mins).
              </div>
            </div>
          )}

          {/* TAB 4: WAITLIST PRIORITY QUEUE MAX-HEAP */}
          {activeTab === 'waitlist' && (
            <div className="space-y-6">
              <div className="text-xs text-slate-300">
                Max-Heap Priority Hierarchy: <strong>Divyangjan (95) &gt; Senior Citizen (90) &gt; Tatkal (80) &gt; Ladies (75) &gt; General (50)</strong>
              </div>

              {/* Heap Tree / Queue View */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block">
                  Priority Queue State:
                </span>
                <div className="divide-y divide-slate-800 bg-slate-900 rounded-2xl border border-slate-800 p-3 text-xs">
                  {((stepInfo as any).remainingQueue || sampleWaitlist).map((p: any, idx: number) => (
                    <div key={p.id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-orange-600 text-white font-bold text-[10px] flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-white">{p.passengerName}</span>
                          <span className="text-slate-400 text-[11px] block">Quota: {p.quota} &bull; Time: {p.bookingTimeStr}</span>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-orange-400 font-bold">{p.priorityScore?.toLocaleString()} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: KRUSKAL'S MST NETWORK */}
          {activeTab === 'kruskal' && (
            <div className="space-y-6">
              <div className="text-xs text-slate-300">
                Total MST Budget: <strong className="text-orange-400 text-sm font-bold">₹{kruskalResult.totalCostCr} Crores</strong> &bull; Zero Cycles Guaranteed by Disjoint Set Union
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl">
                  <span className="text-emerald-400 font-bold block mb-1">MST Accepted Corridors:</span>
                  <div className="space-y-1 font-mono text-[11px] text-slate-300">
                    {kruskalResult.mstEdges.map(e => (
                      <div key={e.id} className="flex justify-between">
                        <span>{e.source} ↔ {e.destination}</span>
                        <span className="text-emerald-400">₹{e.costInCr} Cr</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl">
                  <span className="text-rose-400 font-bold block mb-1">Cycle-Rejected Corridors:</span>
                  <div className="space-y-1 font-mono text-[11px] text-slate-300">
                    {kruskalResult.rejectedEdges.map(e => (
                      <div key={e.id} className="flex justify-between">
                        <span>{e.source} ↔ {e.destination}</span>
                        <span className="text-rose-400">Cycle Rejected</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: COIN CHANGE REFUND */}
          {activeTab === 'coin' && (
            <div className="space-y-6">
              <div className="text-xs text-slate-300">
                Refunding <strong>₹1875</strong> using canonical Indian denominations: [500, 200, 100, 50, 20, 10, 5, 2, 1]
              </div>

              <div className="grid grid-cols-3 gap-3">
                {coinChangeResult.denominations.map(d => (
                  <div key={d.denomination} className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-base font-black text-amber-400">{d.count}×</span>
                    <span className="text-sm font-bold block text-white">₹{d.denomination} Note</span>
                    <span className="text-[10px] text-slate-400 font-mono">₹{d.totalValue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Step Trace & Mathematical Theorem Card */}
        <div className="space-y-6">
          {/* Active Step Trace Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Algorithm Trace
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                Step #{stepInfo?.stepNumber || currentStep + 1}
              </span>
            </div>

            <h4 className="font-extrabold text-base text-slate-900 leading-snug">
              {(stepInfo as any)?.description || (stepInfo as any)?.action || 'Executing greedy optimization step...'}
            </h4>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
              {stepInfo?.explanation || 'Optimal greedy choice verified.'}
            </div>
          </div>

          {/* College Viva Mathematical Explanation Card */}
          <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center gap-2 text-indigo-300 font-bold">
              <HelpCircle className="w-4 h-4 text-orange-400" />
              <span>Viva Examiner Q&amp;A Notes</span>
            </div>

            <div className="space-y-3 text-slate-300 text-[11px] leading-relaxed">
              <div>
                <strong className="text-white block mb-0.5">Q: Why does Greedy work for this problem?</strong>
                <span>
                  The problem exhibits both <em>Greedy Choice Property</em> (a globally optimal solution can be reached by making a locally optimal choice) and <em>Optimal Substructure</em>.
                </span>
              </div>

              <div>
                <strong className="text-white block mb-0.5">Q: What is the Time &amp; Space Complexity?</strong>
                <span className="font-mono text-orange-400">
                  {activeTab === 'berth' && 'Time: O(n log n) due to sorting by finish time | Space: O(n)'}
                  {activeTab === 'platform' && 'Time: O(n log k) where k is max platforms in min-heap | Space: O(k)'}
                  {activeTab === 'route' && 'Time: O((V + E) log V) via priority queue Dijkstra | Space: O(V)'}
                  {activeTab === 'waitlist' && 'Time: O(k log n) for k promotions on n-node heap | Space: O(n)'}
                  {activeTab === 'kruskal' && 'Time: O(E log E) sorting edges + O(E α(V)) DSU | Space: O(V)'}
                  {activeTab === 'coin' && 'Time: O(D) where D is number of canonical denominations | Space: O(1)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
