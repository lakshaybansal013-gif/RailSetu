import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { trainService } from '../services/trainService';
import { Train } from '../types';
import {
  Radio,
  Train as TrainIcon,
  Clock,
  MapPin,
  CheckCircle2,
  Navigation,
  Sparkles,
} from 'lucide-react';

export const LiveTrainStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryTrain = searchParams.get('train') || '22436';

  const [allTrains, setAllTrains] = useState<Train[]>([]);
  const [selectedTrainNo, setSelectedTrainNo] = useState(queryTrain);
  const [train, setTrain] = useState<Train | null>(null);

  useEffect(() => {
    trainService.getAllTrains().then(trains => {
      setAllTrains(trains);
      const found = trains.find(t => t.trainNumber === selectedTrainNo) || trains[0];
      setTrain(found || null);
    });
  }, [selectedTrainNo]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live GPS Satellite Tracking (Simulated)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Live Train Running Status
        </h1>
        <p className="text-xs text-slate-500">
          Track real-time location, upcoming intermediate halts, and assigned platform numbers.
        </p>
      </div>

      {/* Select Train Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <label className="text-xs font-bold text-slate-700">Select Active Train:</label>
        <select
          value={selectedTrainNo}
          onChange={e => setSelectedTrainNo(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer focus:ring-2 focus:ring-orange-500/20"
        >
          {allTrains.map(t => (
            <option key={t.trainNumber} value={t.trainNumber}>
              {t.trainNumber} - {t.trainName} ({t.sourceCode} &rarr; {t.destinationCode})
            </option>
          ))}
        </select>
      </div>

      {train && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">
                  #{train.trainNumber}
                </span>
                <span className="text-xs font-semibold text-slate-300">{train.type}</span>
              </div>
              <h2 className="text-2xl font-black">{train.trainName}</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {train.sourceCode} &rarr; {train.destinationCode} &bull; {train.distanceKm} km
              </p>
            </div>

            <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10 text-right">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                STATUS: RUNNING ON TIME
              </span>
              <p className="text-lg font-black text-white">Current Speed: 128 km/h</p>
            </div>
          </div>

          {/* Timeline of Stops */}
          <div className="p-6 space-y-6">
            <h3 className="font-extrabold text-sm uppercase text-slate-500 tracking-wider">
              Route Progression &amp; Platform Assignments
            </h3>

            <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {train.stops.map((stop, index) => {
                const isPassed = index === 0;
                const isCurrent = index === 1;

                return (
                  <div key={stop.stationCode} className="relative flex items-start justify-between gap-4 text-xs">
                    {/* Circle Indicator */}
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isPassed
                          ? 'bg-emerald-500 border-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-orange-500 border-orange-600 text-white animate-pulse'
                          : 'bg-white border-slate-300 text-slate-400'
                      }`}
                    >
                      {isPassed && <span className="text-[9px] font-bold">✓</span>}
                      {isCurrent && <Navigation className="w-2.5 h-2.5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-slate-900">{stop.stationName}</strong>
                        <span className="font-mono text-xs px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">
                          {stop.stationCode}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-extrabold">
                            NEXT ARRIVAL
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Distance: {stop.distanceKm} km &bull; Halt: {stop.haltMinutes} mins
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-slate-900 block text-xs">
                        Arr: {stop.arrivalTime} | Dep: {stop.departureTime}
                      </span>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-orange-50 text-orange-700 font-mono font-bold text-[10px] border border-orange-200">
                        Platform #{stop.platformNumber}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
