import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { trainService } from '../services/trainService';
import { stationService } from '../services/stationService';
import { Train, ConnectingRoute, CoachClass, QuotaType } from '../types';
import { TrainSearchCard } from '../components/TrainSearchCard';
import {
  Train as TrainIcon,
  Clock,
  ArrowRight,
  Filter,
  ArrowUpDown,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Share2,
} from 'lucide-react';

export const SearchResults: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const fromCode = (searchParams.get('from') || 'NDLS').toUpperCase();
  const toCode = (searchParams.get('to') || 'BSB').toUpperCase();
  const travelDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const queryClass = (searchParams.get('class') as CoachClass | 'ALL') || 'ALL';
  const quota = (searchParams.get('quota') as QuotaType) || 'GN';
  const opt = (searchParams.get('opt') as 'FASTEST' | 'CHEAPEST') || 'FASTEST';

  const [directTrains, setDirectTrains] = useState<Train[]>([]);
  const [dijkstraRoutes, setDijkstraRoutes] = useState<ConnectingRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTrain, setExpandedTrain] = useState<string | null>(null);

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>(queryClass);
  const [selectedTrainTypes, setSelectedTrainTypes] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'duration' | 'departure' | 'fare'>('duration');

  useEffect(() => {
    setLoading(true);
    trainService
      .searchTrains(fromCode, toCode, travelDate, selectedClass === 'ALL' ? '3A' : (selectedClass as CoachClass), opt)
      .then(res => {
        setDirectTrains(res.directTrains);
        setDijkstraRoutes(res.dijkstraRoutes);
      })
      .finally(() => setLoading(false));
  }, [fromCode, toCode, travelDate, opt, selectedClass]);

  const handleBook = (trainNumber: string, coachClass: CoachClass) => {
    navigate(
      `/booking?train=${trainNumber}&class=${coachClass}&from=${fromCode}&to=${toCode}&date=${travelDate}&quota=${quota}`
    );
  };

  // Filter direct trains
  const filteredTrains = directTrains.filter(train => {
    // Class filter
    if (selectedClass !== 'ALL' && !train.classes[selectedClass as CoachClass]) {
      return false;
    }
    // Type filter
    if (selectedTrainTypes.length > 0 && !selectedTrainTypes.includes(train.type)) {
      return false;
    }
    // Departure time filter
    if (selectedTimeSlot !== 'ALL') {
      const depHour = parseInt(train.departureTime.split(':')[0], 10);
      if (selectedTimeSlot === 'MORNING' && (depHour < 6 || depHour >= 12)) return false;
      if (selectedTimeSlot === 'AFTERNOON' && (depHour < 12 || depHour >= 18)) return false;
      if (selectedTimeSlot === 'EVENING' && (depHour < 18 || depHour >= 24)) return false;
      if (selectedTimeSlot === 'NIGHT' && depHour >= 6) return false;
    }
    return true;
  });

  // Sort direct trains
  const sortedTrains = [...filteredTrains].sort((a, b) => {
    if (sortBy === 'duration') return a.durationMinutes - b.durationMinutes;
    if (sortBy === 'departure') return a.departureTime.localeCompare(b.departureTime);
    // Sort by lowest fare
    const aFare = Math.min(...Object.values(a.classes).map(c => c?.fare || 99999));
    const bFare = Math.min(...Object.values(b.classes).map(c => c?.fare || 99999));
    return aFare - bFare;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Re-search Box */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-5">
        <TrainSearchCard
          initialFrom={fromCode}
          initialTo={toCode}
          initialDate={travelDate}
          initialClass={queryClass}
          initialQuota={quota}
          compact
        />
      </div>

      {/* Header bar with summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-orange-50/80 border border-orange-200/80 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold">
            <TrainIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-slate-900">
                {fromCode} &rarr; {toCode}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-200 text-orange-900 font-semibold">
                {travelDate}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Showing {sortedTrains.length} direct trains &bull; {dijkstraRoutes.length} Dijkstra connecting options
            </p>
          </div>
        </div>

        {/* Algorithm Badge */}
        <div className="flex items-center gap-2">
          <Link
            to="/visualizer?tab=route"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-orange-800 bg-white border border-orange-300 shadow-sm hover:bg-orange-100 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Dijkstra Shortest Path Enabled</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Filter className="w-4 h-4 text-orange-600" />
                <span>Filters &amp; Sort</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedClass('ALL');
                  setSelectedTrainTypes([]);
                  setSelectedTimeSlot('ALL');
                  setSortBy('duration');
                }}
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
              >
                Reset
              </button>
            </div>

            {/* Sort by */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                Sort Results By
              </label>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'duration', label: 'Fastest Duration' },
                  { id: 'departure', label: 'Earliest Departure' },
                  { id: 'fare', label: 'Lowest Fare' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSortBy(item.id as any)}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition flex items-center justify-between ${
                      sortBy === item.id
                        ? 'bg-orange-600 text-white font-bold'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{item.label}</span>
                    {sortBy === item.id && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Class filter */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                Coach Class
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {['ALL', '1A', '2A', '3A', 'SL', 'CC', 'EC'].map(cls => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedClass(cls)}
                    className={`py-1.5 px-2 rounded-lg border text-center font-semibold transition ${
                      selectedClass === cls
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cls === 'ALL' ? 'All Classes' : cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Departure time slots */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                Departure Time
              </label>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'ALL', label: 'Any Time' },
                  { id: 'MORNING', label: 'Morning (06:00 - 12:00)' },
                  { id: 'AFTERNOON', label: 'Afternoon (12:00 - 18:00)' },
                  { id: 'EVENING', label: 'Evening (18:00 - 24:00)' },
                  { id: 'NIGHT', label: 'Early Morning (00:00 - 06:00)' },
                ].map(slot => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedTimeSlot(slot.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition ${
                      selectedTimeSlot === slot.id
                        ? 'bg-orange-100 text-orange-950 font-bold border border-orange-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Train types */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                Train Type
              </label>
              <div className="space-y-1.5 text-xs">
                {['Vande Bharat', 'Rajdhani', 'Shatabdi', 'Superfast', 'Express'].map(type => {
                  const isChecked = selectedTrainTypes.includes(type);
                  return (
                    <label key={type} className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedTrainTypes(selectedTrainTypes.filter(t => t !== type));
                          } else {
                            setSelectedTrainTypes([...selectedTrainTypes, type]);
                          }
                        }}
                        className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span>{type}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Trains List */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
                  <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-12 bg-slate-100 rounded"></div>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="h-16 bg-slate-100 rounded"></div>
                    <div className="h-16 bg-slate-100 rounded"></div>
                    <div className="h-16 bg-slate-100 rounded"></div>
                    <div className="h-16 bg-slate-100 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Direct Trains Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Direct Trains</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">
                      {sortedTrains.length}
                    </span>
                  </h3>
                </div>

                {sortedTrains.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
                    <AlertCircle className="w-10 h-10 text-orange-500 mx-auto" />
                    <h4 className="font-bold text-slate-900">No Direct Trains Found for this query</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Don't worry! Our Dijkstra Greedy Route Finder has automatically computed multi-hop connecting routes below with guaranteed layover time.
                    </p>
                  </div>
                ) : (
                  sortedTrains.map(train => {
                    const isExpanded = expandedTrain === train.trainNumber;
                    const srcStop = train.stops.find(s => s.stationCode === fromCode);
                    const destStop = train.stops.find(s => s.stationCode === toCode);

                    return (
                      <div
                        key={train.trainNumber}
                        className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition overflow-hidden"
                      >
                        {/* Top info strip */}
                        <div className="p-5 border-b border-slate-100">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span
                                className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                  train.type === 'Vande Bharat'
                                    ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                    : train.type === 'Rajdhani'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                }`}
                              >
                                {train.type}
                              </span>
                              <div>
                                <h4 className="font-extrabold text-slate-900 text-base">{train.trainName}</h4>
                                <span className="text-xs font-mono text-slate-400">#{train.trainNumber}</span>
                              </div>
                            </div>

                            {/* Punctuality badge */}
                            <div className="text-right">
                              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                {train.averagePunctuality}% On-Time Rating
                              </span>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Runs: {train.runningDays.join(', ')}
                              </div>
                            </div>
                          </div>

                          {/* Time & Route Bar */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 items-center bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                            <div>
                              <p className="text-xs text-slate-500 font-medium">{fromCode}</p>
                              <p className="text-xl font-black text-slate-900">{srcStop?.departureTime || train.departureTime}</p>
                              <p className="text-xs text-slate-600 font-semibold">{srcStop?.stationName || fromCode}</p>
                            </div>

                            <div className="text-center flex flex-col items-center">
                              <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-orange-500" />
                                {train.duration}
                              </span>
                              <div className="w-full flex items-center gap-1 my-1">
                                <div className="h-0.5 flex-1 bg-slate-300"></div>
                                <TrainIcon className="w-4 h-4 text-orange-600 shrink-0" />
                                <div className="h-0.5 flex-1 bg-slate-300"></div>
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium">{train.distanceKm} km direct</span>
                            </div>

                            <div className="text-right">
                              <p className="text-xs text-slate-500 font-medium">{toCode}</p>
                              <p className="text-xl font-black text-slate-900">{destStop?.arrivalTime || train.arrivalTime}</p>
                              <p className="text-xs text-slate-600 font-semibold">{destStop?.stationName || toCode}</p>
                            </div>
                          </div>
                        </div>

                        {/* Class Availability & Booking Chips */}
                        <div className="p-4 bg-slate-50/50">
                          <p className="text-[11px] font-bold uppercase text-slate-400 mb-2 tracking-wider">
                            Select Class &bull; Quota: {quota}
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
                            {Object.entries(train.classes).map(([clsKey, clsInfo]) => {
                              if (!clsInfo) return null;
                              const isAvail = clsInfo.status === 'AVAILABLE';
                              const isRac = clsInfo.status === 'RAC';

                              return (
                                <div
                                  key={clsKey}
                                  onClick={() => handleBook(train.trainNumber, clsKey as CoachClass)}
                                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                                    isAvail
                                      ? 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-500 hover:shadow-md'
                                      : isRac
                                      ? 'bg-amber-50/70 border-amber-200 hover:border-amber-500 hover:shadow-md'
                                      : 'bg-rose-50/70 border-rose-200 hover:border-rose-500 hover:shadow-md'
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="font-extrabold text-sm text-slate-900">{clsKey}</span>
                                      <span className="font-bold text-xs text-slate-900">₹{clsInfo.fare}</span>
                                    </div>
                                    <div className="mt-1">
                                      {isAvail ? (
                                        <span className="text-xs font-bold text-emerald-700">
                                          AVL {clsInfo.availableSeats}
                                        </span>
                                      ) : isRac ? (
                                        <span className="text-xs font-bold text-amber-700">
                                          RAC {clsInfo.racSeats}
                                        </span>
                                      ) : (
                                        <span className="text-xs font-bold text-rose-700">
                                          WL {clsInfo.wlSeats}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    className={`mt-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                                      isAvail
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                        : isRac
                                        ? 'bg-amber-600 text-white hover:bg-amber-700'
                                        : 'bg-rose-600 text-white hover:bg-rose-700'
                                    }`}
                                  >
                                    Book Now
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Collapsible Stops & Platforms Footer */}
                        <div className="px-5 py-2.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={() => setExpandedTrain(isExpanded ? null : train.trainNumber)}
                            className="font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                          >
                            <span>{isExpanded ? 'Hide Intermediate Stops' : 'View Intermediate Stops & Platforms'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          <span className="text-[11px] text-slate-500">
                            Activity Selection: Dynamic berth packing enabled
                          </span>
                        </div>

                        {isExpanded && (
                          <div className="p-4 bg-slate-900 text-white border-t border-slate-800 text-xs animate-slide-down">
                            <h5 className="font-bold text-orange-400 mb-2">Schedule &amp; Platform Assignments:</h5>
                            <div className="divide-y divide-slate-800">
                              {train.stops.map(stop => (
                                <div key={stop.stationCode} className="py-2 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-slate-300">{stop.stationCode}</span>
                                    <span>{stop.stationName}</span>
                                  </div>
                                  <div className="flex items-center gap-4 text-slate-400 font-mono">
                                    <span>Arr: {stop.arrivalTime}</span>
                                    <span>Dep: {stop.departureTime}</span>
                                    <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold">
                                      Platform {stop.platformNumber}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Dijkstra Connecting Routes Section */}
              <div className="space-y-4 pt-6 border-t border-slate-200">
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <div>
                      <h4 className="font-bold text-sm">Dijkstra Connecting Routes (Greedy Shortest Path)</h4>
                      <p className="text-[11px] text-blue-200">
                        Evaluated all transfer stations with guaranteed &ge; 30-min minimum layover constraint
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/visualizer?tab=route"
                    className="text-xs font-bold px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition"
                  >
                    View Graph &rarr;
                  </Link>
                </div>

                {dijkstraRoutes.length === 0 ? (
                  <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                    No connecting route needed or found with &ge; 30-min layover. Direct trains are optimal!
                  </div>
                ) : (
                  dijkstraRoutes.slice(0, 3).map((cRoute, idx) => {
                    const leg1 = cRoute.segments[0];
                    const leg2 = cRoute.segments[1];

                    return (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl border-2 border-indigo-100 hover:border-indigo-300 shadow-sm p-5 space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 font-mono">
                              Transfer at {cRoute.transferStation}
                            </span>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              Layover: {cRoute.layoverDuration} (&ge; 30m safe)
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-xs text-slate-400">Total Duration: </span>
                            <span className="font-extrabold text-sm text-slate-900">{cRoute.totalDuration}</span>
                            <span className="text-slate-400 mx-2">&bull;</span>
                            <span className="text-xs text-slate-400">Total Fare: </span>
                            <span className="font-extrabold text-sm text-orange-600">₹{cRoute.totalFare}</span>
                          </div>
                        </div>

                        {/* Two-leg visual */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                          {/* Leg 1 */}
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                            <div className="font-bold text-slate-800">
                              Leg 1: {leg1.train.trainName} (#{leg1.train.trainNumber})
                            </div>
                            <div className="flex justify-between text-slate-500 mt-1">
                              <span>Dep: {leg1.departureTime} ({leg1.fromStation})</span>
                              <span>Arr: {leg1.arrivalTime} ({leg1.toStation})</span>
                            </div>
                            <div className="text-right text-[11px] font-semibold text-orange-600 mt-1">
                              Fare: ₹{leg1.fare}
                            </div>
                          </div>

                          {/* Leg 2 */}
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                            <div className="font-bold text-slate-800">
                              Leg 2: {leg2.train.trainName} (#{leg2.train.trainNumber})
                            </div>
                            <div className="flex justify-between text-slate-500 mt-1">
                              <span>Dep: {leg2.departureTime} ({leg2.fromStation})</span>
                              <span>Arr: {leg2.arrivalTime} ({leg2.toStation})</span>
                            </div>
                            <div className="text-right text-[11px] font-semibold text-orange-600 mt-1">
                              Fare: ₹{leg2.fare}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-slate-500">
                            Optimal shortest path relaxed via Dijkstra vertex relaxations
                          </span>
                          <button
                            type="button"
                            onClick={() => handleBook(leg1.train.trainNumber, '3A')}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm transition"
                          >
                            Book Connecting Route &rarr;
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
