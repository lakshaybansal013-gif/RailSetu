import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { Booking } from '../types';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Train,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const PNRStatusPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPnr = searchParams.get('pnr') || '';

  const [pnrInput, setPnrInput] = useState(initialPnr);
  const [searchedPnr, setSearchedPnr] = useState(initialPnr);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const samplePnrs = ['2847193021', '4910284712', '8391029471'];

  useEffect(() => {
    if (searchedPnr) {
      setLoading(true);
      setNotFound(false);
      bookingService.getBookingByPNR(searchedPnr).then(res => {
        if (res) {
          setBooking(res);
          setNotFound(false);
        } else {
          setBooking(null);
          setNotFound(true);
        }
        setLoading(false);
      });
    }
  }, [searchedPnr]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnrInput.trim()) return;
    setSearchParams({ pnr: pnrInput.trim() });
    setSearchedPnr(pnrInput.trim());
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Title Card */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Passenger Current Status (PNR Enquiry)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Check real-time confirmation status, coach &amp; berth assignment, and waitlist position.
        </p>
      </div>

      {/* PNR Search Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Enter 10-Digit PNR Number
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={10}
                  value={pnrInput}
                  onChange={e => setPnrInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 2847193021"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Get Status</span>
              </button>
            </div>
          </div>

          {/* Quick Demo PNRs */}
          <div className="flex items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 font-medium">Quick Demo PNRs:</span>
            <div className="flex flex-wrap gap-1.5">
              {samplePnrs.map(sample => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setPnrInput(sample);
                    setSearchedPnr(sample);
                    setSearchParams({ pnr: sample });
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 rounded-lg text-slate-700 font-mono font-semibold transition"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Querying reservation database...</p>
        </div>
      )}

      {/* Not Found */}
      {notFound && !loading && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3 max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="font-bold text-slate-900">No Booking Found</h3>
          <p className="text-xs text-slate-500">
            Could not find any ticket with PNR #{searchedPnr}. Please try one of the quick demo PNRs above or book a new ticket.
          </p>
        </div>
      )}

      {/* Booking Details Found */}
      {booking && !loading && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden space-y-6 p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-mono font-bold text-slate-400">PNR NUMBER</span>
              <div className="text-2xl font-black font-mono tracking-wider text-slate-900">
                {booking.pnr}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {booking.trainName} (#{booking.trainNumber}) &bull; Class: {booking.coachClass}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 ${
                  booking.status === 'CONFIRMED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : booking.status === 'CANCELLED'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{booking.status}</span>
              </span>
              <Link
                to={`/ticket/${booking.pnr}`}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition flex items-center gap-1"
              >
                <span>View E-Ticket</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Stepper Progression */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Journey Status Timeline
            </span>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="space-y-1">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center mx-auto text-[10px]">
                  ✓
                </div>
                <p className="font-bold text-slate-900">Booked</p>
                <span className="text-[10px] text-slate-400">Payment Verified</span>
              </div>
              <div className="space-y-1">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center mx-auto text-[10px]">
                  ✓
                </div>
                <p className="font-bold text-slate-900">Berth Allocated</p>
                <span className="text-[10px] text-slate-400">Activity Selection</span>
              </div>
              <div className="space-y-1">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center mx-auto text-[10px]">
                  3
                </div>
                <p className="font-bold text-slate-900">Platform #{booking.platformNumber || 1}</p>
                <span className="text-[10px] text-slate-400">Interval Partition</span>
              </div>
              <div className="space-y-1 opacity-50">
                <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 font-bold flex items-center justify-center mx-auto text-[10px]">
                  4
                </div>
                <p className="font-bold text-slate-900">Departed</p>
                <span className="text-[10px] text-slate-400">Awaiting Boarding</span>
              </div>
            </div>
          </div>

          {/* Passengers Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Passenger Allocation Status
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Passenger</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Coach</th>
                    <th className="p-3">Berth</th>
                    <th className="p-3">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {booking.passengers.map((p, i) => (
                    <tr key={p.id}>
                      <td className="p-3 text-slate-400 font-mono">{i + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{p.name} ({p.age}y, {p.gender})</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-emerald-100 text-emerald-800">
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold">{p.seatAllocated?.coach || 'B1'}</td>
                      <td className="p-3 font-mono font-extrabold text-orange-600">
                        {p.seatAllocated?.berthNumber || '12'}
                      </td>
                      <td className="p-3 text-slate-600">{p.seatAllocated?.berthType || 'L'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
