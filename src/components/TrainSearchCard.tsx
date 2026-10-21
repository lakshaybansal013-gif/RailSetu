import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { StationAutocomplete } from './StationAutocomplete';
import { ArrowLeftRight, Calendar, Layers, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { CoachClass, QuotaType } from '../types';

interface TrainSearchCardProps {
  initialFrom?: string;
  initialTo?: string;
  initialDate?: string;
  initialClass?: CoachClass | 'ALL';
  initialQuota?: QuotaType;
  onSearch?: (params: {
    from: string;
    to: string;
    date: string;
    coachClass: CoachClass | 'ALL';
    quota: QuotaType;
    optimization: 'FASTEST' | 'CHEAPEST';
  }) => void;
  compact?: boolean;
}

export const TrainSearchCard: React.FC<TrainSearchCardProps> = ({
  initialFrom = 'NDLS',
  initialTo = 'BSB',
  initialDate,
  initialClass = 'ALL',
  initialQuota = 'GN',
  onSearch,
  compact = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [fromStation, setFromStation] = useState(initialFrom);
  const [toStation, setToStation] = useState(initialTo);
  const [travelDate, setTravelDate] = useState(initialDate || getTomorrowDate());
  const [coachClass, setCoachClass] = useState<CoachClass | 'ALL'>(initialClass);
  const [quota, setQuota] = useState<QuotaType>(initialQuota);
  const [optimization, setOptimization] = useState<'FASTEST' | 'CHEAPEST'>('FASTEST');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSwap = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromStation) {
      setErrorMsg('Please select a departure station');
      return;
    }
    if (!toStation) {
      setErrorMsg('Please select an arrival station');
      return;
    }
    if (fromStation.toUpperCase() === toStation.toUpperCase()) {
      setErrorMsg('Departure and Arrival stations cannot be the same');
      return;
    }
    setErrorMsg('');

    const searchParams = {
      from: fromStation,
      to: toStation,
      date: travelDate,
      coachClass,
      quota,
      optimization,
    };

    if (onSearch) {
      onSearch(searchParams);
    } else {
      navigate(
        `/search?from=${fromStation}&to=${toStation}&date=${travelDate}&class=${coachClass}&quota=${quota}&opt=${optimization}`
      );
    }
  };

  return (
    <div className={`w-full bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden ${compact ? 'p-4' : 'p-6 md:p-8'}`}>
      {/* Top Banner with algorithm reminder */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
            <Zap className="w-4 h-4 fill-orange-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Greedy Route & Berth Engine</h3>
            <p className="text-[11px] text-slate-500">Dijkstra shortest path with 30-min guaranteed layover</p>
          </div>
        </div>

        {/* Fastest vs Cheapest toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setOptimization('FASTEST')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              optimization === 'FASTEST'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Fastest Route
          </button>
          <button
            type="button"
            onClick={() => setOptimization('CHEAPEST')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              optimization === 'CHEAPEST'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>₹</span> Cheapest Fare
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium animate-shake">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: From, Swap, To */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-end">
          <div className="md:col-span-5">
            <StationAutocomplete
              id="from-station"
              label={t('from_station')}
              value={fromStation}
              onChange={setFromStation}
              required
            />
          </div>

          <div className="md:col-span-1 flex items-center justify-center pb-1">
            <button
              type="button"
              onClick={handleSwap}
              title={t('swap_stations')}
              className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 text-slate-600 flex items-center justify-center transition shadow-sm hover:rotate-180 duration-300"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          <div className="md:col-span-5">
            <StationAutocomplete
              id="to-station"
              label={t('to_station')}
              value={toStation}
              onChange={setToStation}
              required
            />
          </div>
        </div>

        {/* Row 2: Date, Class, Quota */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Journey Date */}
          <div>
            <label htmlFor="journey-date" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              {t('journey_date')}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-600 pointer-events-none" />
              <input
                id="journey-date"
                type="date"
                value={travelDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setTravelDate(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-sm"
              />
            </div>
          </div>

          {/* Coach Class */}
          <div>
            <label htmlFor="coach-class" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              {t('all_classes')}
            </label>
            <div className="relative">
              <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-600 pointer-events-none" />
              <select
                id="coach-class"
                value={coachClass}
                onChange={e => setCoachClass(e.target.value as CoachClass | 'ALL')}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-sm appearance-none cursor-pointer"
              >
                <option value="ALL">All Classes (SL, 3A, 2A, 1A, CC, EC)</option>
                <option value="1A">AC First Class (1A)</option>
                <option value="2A">AC 2 Tier (2A)</option>
                <option value="3A">AC 3 Tier (3A)</option>
                <option value="SL">Sleeper (SL)</option>
                <option value="CC">AC Chair Car (CC)</option>
                <option value="EC">Executive Chair Car (EC)</option>
              </select>
            </div>
          </div>

          {/* Quota */}
          <div>
            <label htmlFor="booking-quota" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              {t('quota')}
            </label>
            <div className="relative">
              <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-600 pointer-events-none" />
              <select
                id="booking-quota"
                value={quota}
                onChange={e => setQuota(e.target.value as QuotaType)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-sm appearance-none cursor-pointer"
              >
                <option value="GN">{t('general_quota')}</option>
                <option value="TQ">{t('tatkal_quota')}</option>
                <option value="LD">{t('ladies_quota')}</option>
                <option value="SS">{t('senior_citizen')}</option>
                <option value="DP">{t('divyangjan')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-700 hover:to-amber-600 transition shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transform active:scale-[0.99] cursor-pointer"
          >
            <span>{t('search_trains_btn')}</span>
            <span className="text-xs font-normal opacity-90 px-2 py-0.5 rounded bg-black/15">
              Dijkstra & Interval Engine
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
