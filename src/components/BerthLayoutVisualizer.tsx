import React from 'react';
import { BerthType } from '../types';

interface BerthLayoutVisualizerProps {
  coachClass: string;
  selectedBerth?: number;
  highlightedBerthType?: BerthType;
  coachName?: string;
}

export const BerthLayoutVisualizer: React.FC<BerthLayoutVisualizerProps> = ({
  coachClass,
  selectedBerth = 12,
  highlightedBerthType,
  coachName = 'B1',
}) => {
  // Generate a standard bay (8 berths: 1-6 cabin, 7-8 side)
  // Let's render 3 bays (24 berths total) for a rich interactive visual!
  const bays = [
    { bayNumber: 1, range: [1, 2, 3, 4, 5, 6, 7, 8] },
    { bayNumber: 2, range: [9, 10, 11, 12, 13, 14, 15, 16] },
    { bayNumber: 3, range: [17, 18, 19, 20, 21, 22, 23, 24] },
  ];

  const getBerthType = (num: number): string => {
    const mod = num % 8;
    if (mod === 1 || mod === 4) return 'L';
    if (mod === 2 || mod === 5) return 'M';
    if (mod === 3 || mod === 6) return 'U';
    if (mod === 7) return 'SL';
    return 'SU';
  };

  const getBerthLabel = (type: string): string => {
    switch (type) {
      case 'L': return 'Lower';
      case 'M': return 'Middle';
      case 'U': return 'Upper';
      case 'SL': return 'Side Lower';
      case 'SU': return 'Side Upper';
      default: return 'Berth';
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white">Coach Layout ({coachName})</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono font-bold">
              Class: {coachClass}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Activity Selection dynamic berth packing</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-orange-500 ring-2 ring-orange-300"></span>
            <span className="text-orange-300 font-semibold">Your Allocated Seat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-700"></span>
            <span className="text-slate-400">Other Passengers</span>
          </div>
        </div>
      </div>

      {/* Train Car Frame */}
      <div className="space-y-4">
        {bays.map(bay => (
          <div key={bay.bayNumber} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-bold mb-2 uppercase tracking-wider">
              Bay {bay.bayNumber} (Berths {bay.range[0]} - {bay.range[7]})
            </div>

            <div className="grid grid-cols-8 gap-2 items-center">
              {/* Main Cabin: 6 berths (Left: 1,2,3; Right: 4,5,6) */}
              <div className="col-span-6 grid grid-cols-6 gap-1.5 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                {bay.range.slice(0, 6).map(num => {
                  const bType = getBerthType(num);
                  const isSelected = num === selectedBerth;
                  return (
                    <div
                      key={num}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-md text-center transition-all ${
                        isSelected
                          ? 'bg-gradient-to-b from-orange-500 to-amber-600 text-white font-bold ring-2 ring-orange-400 shadow-lg shadow-orange-500/30 scale-105'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
                      }`}
                    >
                      <span className="text-xs font-mono">{num}</span>
                      <span className="text-[9px] font-bold opacity-80">{bType}</span>
                      <span className="text-[8px] opacity-60 leading-none">{getBerthLabel(bType).split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>

              {/* Corridor / Aisle separator */}
              <div className="col-span-2 grid grid-cols-2 gap-1.5 bg-slate-900/50 p-2 rounded-lg border border-dashed border-slate-800">
                {bay.range.slice(6, 8).map(num => {
                  const bType = getBerthType(num);
                  const isSelected = num === selectedBerth;
                  return (
                    <div
                      key={num}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-md text-center transition-all ${
                        isSelected
                          ? 'bg-gradient-to-b from-orange-500 to-amber-600 text-white font-bold ring-2 ring-orange-400 shadow-lg shadow-orange-500/30 scale-105'
                          : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-xs font-mono">{num}</span>
                      <span className="text-[9px] font-bold opacity-80">{bType}</span>
                      <span className="text-[8px] opacity-60 leading-none">Side</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
