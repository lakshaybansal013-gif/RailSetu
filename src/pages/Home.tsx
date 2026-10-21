import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { StationAutocomplete } from '../components/StationAutocomplete';
import {
  ArrowLeftRight,
  Plus,
  Calendar,
  Users,
  ChevronDown,
  ArrowRight,
  X,
  Search,
  Leaf,
  RefreshCw,
  ShieldCheck,
  Zap,
  Train,
  MapPin,
  TrendingUp,
  Cpu,
  Layers,
  Clock,
} from 'lucide-react';

// ------- Types -------
type TripMode = 'one-way' | 'return' | 'multi-city';

interface JourneyLeg {
  id: string;
  from: string;
  to: string;
  date: string;
}

// ------- Popular Indian Routes -------
const popularRoutes = [
  {
    label: 'New Delhi → Agra → Varanasi',
    gradient: 'from-orange-400 via-amber-500 to-orange-600',
    accent: 'bg-orange-500',
    emoji: '🕌',
    landmark: 'Taj Mahal & Kashi',
    from: '₹849',
    duration: '2h 05m + 8h 00m',
    fromCode: 'NDLS',
    toCode: 'BSB',
  },
  {
    label: 'Mumbai → Pune → Kolhapur',
    gradient: 'from-blue-500 via-indigo-500 to-blue-700',
    accent: 'bg-blue-600',
    emoji: '🌊',
    landmark: 'Gateway & Ghats',
    from: '₹285',
    duration: '3h 35m + 4h 20m',
    fromCode: 'CSMT',
    toCode: 'KOP',
  },
  {
    label: 'Chennai → Bengaluru → Mysuru',
    gradient: 'from-emerald-400 via-teal-500 to-emerald-700',
    accent: 'bg-emerald-600',
    emoji: '🌿',
    landmark: 'Silicon City & Palace',
    from: '₹365',
    duration: '4h 55m + 2h 30m',
    fromCode: 'MAS',
    toCode: 'MYS',
  },
  {
    label: 'Delhi → Jaipur → Jodhpur',
    gradient: 'from-rose-400 via-pink-500 to-rose-600',
    accent: 'bg-rose-500',
    emoji: '🏰',
    landmark: 'Pink City & Blue Fort',
    from: '₹510',
    duration: '4h 40m + 5h 20m',
    fromCode: 'NDLS',
    toCode: 'JU',
  },
];

const coachClasses = ['SL', '3A', '2A', '1A', 'CC', 'EC'];
const passengerOptions = ['1 adult', '2 adults', '3 adults', '4 adults', '1 adult + 1 child'];

// ------- Main Component -------
export const Home: React.FC = () => {
  const navigate = useNavigate();

  // Search form state
  const [mode, setMode] = useState<TripMode>('one-way');
  const [legs, setLegs] = useState<JourneyLeg[]>([
    { id: '1', from: 'NDLS', to: 'CSMT', date: getTomorrow() },
    { id: '2', from: 'CSMT', to: 'MAS', date: getDaysOut(3) },
  ]);
  const [returnDate, setReturnDate] = useState(getDaysOut(5));
  const [passengers, setPassengers] = useState('1 adult');
  const [coachClass, setCoachClass] = useState('3A');
  const [showRailPasses, setShowRailPasses] = useState(false);

  // Trip summary panel state (right side)
  const [tripStops, setTripStops] = useState([
    { city: 'New Delhi (NDLS)', date: 'Wed, 15 Oct 2025' },
    { city: 'Mumbai (CSMT)', date: 'Fri, 17 Oct 2025' },
    { city: 'Chennai (MAS)', date: '' },
  ]);

  function getTomorrow() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }
  function getDaysOut(n: number) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
  }

  const addLeg = () => {
    const lastLeg = legs[legs.length - 1];
    setLegs(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        from: lastLeg?.to || '',
        to: '',
        date: getDaysOut(legs.length + 1),
      },
    ]);
  };

  const removeLeg = (id: string) => {
    if (legs.length <= 1) return;
    setLegs(prev => prev.filter(l => l.id !== id));
  };

  const updateLeg = (id: string, field: keyof JourneyLeg, value: string) => {
    setLegs(prev => prev.map(l => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const swapStations = (id: string) => {
    setLegs(prev =>
      prev.map(l => (l.id === id ? { ...l, from: l.to, to: l.from } : l))
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const leg = legs[0];
    if (!leg.from || !leg.to) return;
    navigate(
      `/search?from=${leg.from}&to=${leg.to}&date=${leg.date}&class=${coachClass}&quota=GN&opt=FASTEST`
    );
  };

  // ---- Render ----
  return (
    <div className="min-h-full bg-[#f5f5f0]">
      {/* ===== HERO + SEARCH PANEL ===== */}
      <div className="relative w-full overflow-hidden">
        {/* Background scenic image - top right portion */}
        <div className="absolute top-0 right-0 w-[45%] h-full hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
            alt="Scenic Indian mountain railway"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#f5f5f0]/20 to-[#f5f5f0]" />
          {/* Handwritten caption overlay */}
          <div className="absolute top-6 right-8 text-right hidden xl:block">
            <p className="font-serif italic text-white/90 text-base leading-snug drop-shadow-lg">
              Different cities.<br />A closer<br />India.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 lg:pt-10 lg:pb-8">
          <div className="lg:max-w-[58%]">
            {/* Hero Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-2">
              Smart routes.{' '}
              <span className="text-[#1c3a2c]">A smarter journey.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mb-6">
              Plan, compare and book Indian train travel — greedy-optimised, fast and affordable.
            </p>

            {/* ---- SEARCH CARD ---- */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden">
              {/* Mode Tabs */}
              <div className="flex border-b border-slate-100">
                {(['multi-city', 'one-way', 'return'] as TripMode[]).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`flex-1 py-3 px-2 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition border-b-2 ${
                      mode === m
                        ? 'border-[#1c3a2c] text-[#1c3a2c]'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {m === 'multi-city' && <Layers className="w-3.5 h-3.5 flex-shrink-0" />}
                    {m === 'one-way' && <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />}
                    {m === 'return' && <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" />}
                    <span className="capitalize">{m.replace('-', ' ')}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSearch} className="p-4 sm:p-5 space-y-4">
                {/* Journey Legs */}
                <div className="space-y-3">
                  {(mode === 'multi-city' ? legs : [legs[0]]).map((leg, idx) => (
                    <div key={leg.id} className="flex items-start gap-2">
                      {/* Leg number for multi-city */}
                      {mode === 'multi-city' && (
                        <div className="flex-shrink-0 flex flex-col items-center mt-3">
                          <div className="w-6 h-6 rounded-full bg-[#1c3a2c] text-white flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </div>
                          {idx < legs.length - 1 && (
                            <div className="w-0.5 h-6 bg-slate-200 mt-1" />
                          )}
                        </div>
                      )}

                      {/* From → To → Date row */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2">
                        {/* FROM */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden hover:border-[#1c3a2c] transition">
                          <div className="px-3 pt-2 pb-0.5">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">From</p>
                          </div>
                          <div className="px-2 pb-2">
                            <StationAutocomplete
                              id={`from-${leg.id}`}
                              label=""
                              value={leg.from}
                              onChange={val => updateLeg(leg.id, 'from', val)}
                              placeholder="City or station"
                              required
                            />
                          </div>
                        </div>

                        {/* Swap Button */}
                        <button
                          type="button"
                          onClick={() => swapStations(leg.id)}
                          className="flex-shrink-0 w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-[#1c3a2c] transition shadow-sm mx-auto"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                        </button>

                        {/* TO */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden hover:border-[#1c3a2c] transition">
                          <div className="px-3 pt-2 pb-0.5">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">To</p>
                          </div>
                          <div className="px-2 pb-2">
                            <StationAutocomplete
                              id={`to-${leg.id}`}
                              label=""
                              value={leg.to}
                              onChange={val => updateLeg(leg.id, 'to', val)}
                              placeholder="City or station"
                              required
                            />
                          </div>
                        </div>

                        {/* Date divider */}
                        <div className="hidden sm:block w-px h-10 bg-slate-200 mx-1" />

                        {/* DATE */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden hover:border-[#1c3a2c] transition relative">
                          <div className="px-3 pt-2 pb-0.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Date</p>
                          </div>
                          <div className="px-3 pb-2 flex items-center justify-between">
                            <input
                              type="date"
                              value={leg.date}
                              onChange={e => updateLeg(leg.id, 'date', e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              required
                              className="text-sm font-semibold text-slate-800 bg-transparent outline-none w-full cursor-pointer"
                            />
                            {mode === 'multi-city' && legs.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLeg(leg.id)}
                                className="ml-1 text-slate-300 hover:text-rose-500 transition flex-shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Return Date row */}
                  {mode === 'return' && (
                    <div className="border border-slate-200 rounded-xl overflow-hidden hover:border-[#1c3a2c] transition">
                      <div className="px-3 pt-2 pb-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Return Date</p>
                      </div>
                      <div className="px-3 pb-2">
                        <input
                          type="date"
                          value={returnDate}
                          onChange={e => setReturnDate(e.target.value)}
                          min={legs[0]?.date || new Date().toISOString().split('T')[0]}
                          className="text-sm font-semibold text-slate-800 bg-transparent outline-none w-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Add Stop button (multi-city only) */}
                  {mode === 'multi-city' && legs.length < 5 && (
                    <button
                      type="button"
                      onClick={addLeg}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#1c3a2c] hover:text-[#264d3a] border border-dashed border-[#1c3a2c]/40 hover:border-[#1c3a2c] rounded-xl px-4 py-2.5 transition w-full sm:w-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add another stop
                    </button>
                  )}
                </div>

                {/* Bottom Row: Passengers + Class + Rail Passes toggle + Search */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {/* Passengers */}
                  <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 hover:border-slate-300 transition">
                    <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <select
                      value={passengers}
                      onChange={e => setPassengers(e.target.value)}
                      className="text-sm font-semibold text-slate-700 bg-transparent outline-none cursor-pointer pr-1"
                    >
                      {passengerOptions.map(p => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  </div>

                  {/* Class */}
                  <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 hover:border-slate-300 transition">
                    <Train className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <select
                      value={coachClass}
                      onChange={e => setCoachClass(e.target.value)}
                      className="text-sm font-semibold text-slate-700 bg-transparent outline-none cursor-pointer pr-1"
                    >
                      {coachClasses.map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  </div>

                  {/* Rail passes toggle */}
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 cursor-pointer select-none">
                    <div
                      onClick={() => setShowRailPasses(!showRailPasses)}
                      className={`relative w-8 h-4 rounded-full transition-colors ${
                        showRailPasses ? 'bg-[#1c3a2c]' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${
                          showRailPasses ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                    Show rail passes
                  </label>

                  {/* Search button — pushed to the right */}
                  <button
                    type="submit"
                    className="ml-auto flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition shadow-md shadow-orange-500/20 whitespace-nowrap"
                  >
                    <Search className="w-4 h-4" />
                    Search trains
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* ---- Feature Highlights ---- */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {[
                {
                  icon: ShieldCheck,
                  title: 'Transparent pricing',
                  sub: 'No hidden fees',
                  color: 'text-emerald-600',
                },
                {
                  icon: RefreshCw,
                  title: 'Flexible tickets',
                  sub: 'Change plans with ease',
                  color: 'text-blue-600',
                },
                {
                  icon: Leaf,
                  title: 'Eco-friendly travel',
                  sub: 'Lower emissions',
                  color: 'text-green-600',
                },
                {
                  icon: Zap,
                  title: 'Greedy optimised',
                  sub: '5 algorithms live',
                  color: 'text-orange-600',
                },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-2">
                    <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${item.color}`} />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{item.title}</p>
                      <p className="text-[10px] text-slate-500">{item.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ===== POPULAR MULTI-CITY ROUTES ===== */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <h2 className="text-lg font-bold text-slate-900">Popular multi-city routes</h2>
          </div>
          <Link
            to="/search"
            className="text-xs font-semibold text-[#1c3a2c] hover:text-orange-600 flex items-center gap-1 transition"
          >
            See all routes <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularRoutes.map(route => (
            <div
              key={route.label}
              onClick={() =>
                navigate(
                  `/search?from=${route.fromCode}&to=${route.toCode}&date=${getTomorrow()}&class=3A&quota=GN&opt=FASTEST`
                )
              }
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-orange-300 transition-all cursor-pointer"
            >
              {/* Gradient Hero instead of image */}
              <div className={`h-28 bg-gradient-to-br ${route.gradient} flex flex-col items-center justify-center relative overflow-hidden`}>
                {/* Decorative circle */}
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full" />
                <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-black/10 rounded-full" />
                {/* Emoji landmark */}
                <span className="text-4xl drop-shadow-lg mb-1 relative z-10">{route.emoji}</span>
                <span className="text-[11px] font-bold text-white/90 relative z-10 tracking-wide">
                  {route.landmark}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-3">
                <p className="text-xs font-bold text-slate-800 leading-snug mb-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-orange-500 flex-shrink-0" />
                  {route.label}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <div>
                    <p className="text-[10px] text-slate-400">From</p>
                    <p className="text-sm font-extrabold text-slate-900">{route.from}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    {route.duration}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center group-hover:bg-orange-500 transition">
                    <ArrowRight className="w-3.5 h-3.5 text-orange-500 group-hover:text-white transition" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== ALGORITHM SHOWCASE BANNER ===== */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-[#1c3a2c] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute right-16 -bottom-12 w-32 h-32 bg-orange-500/10 rounded-full" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold mb-3 border border-orange-500/30">
                <Cpu className="w-3.5 h-3.5" />
                College Viva — Greedy Algorithm Suite
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
                Good connections. Brighter tomorrows.
              </h2>
              <p className="text-sm text-white/70 leading-relaxed">
                Explore 5 live greedy algorithm visualisers — berth allocation, platform assignment, Dijkstra route finder, Kruskal MST, and waitlist priority queues.
              </p>
            </div>

            <Link
              to="/visualizer"
              className="flex-shrink-0 flex items-center gap-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-black/20 whitespace-nowrap"
            >
              Explore more by rail
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

};
