import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { Booking } from '../types';
import {
  Train,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';

export const BookingHistoryPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingService.getAllBookings().then(res => {
      setBookings(res);
      setLoading(false);
    });
  }, []);

  const filteredBookings = bookings.filter(b => {
    if (filterStatus === 'ALL') return true;
    return b.status === filterStatus;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Bookings &amp; Reservation History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Access past journeys, download e-tickets, check PNR status, or process cancellations.
          </p>
        </div>

        <Link
          to="/search"
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition shadow self-start sm:self-auto"
        >
          + Book New Journey
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {['ALL', 'CONFIRMED', 'RAC', 'WAITLISTED', 'CANCELLED'].map(status => (
          <button
            key={status}
            type="button"
            onClick={() => setFilterStatus(status)}
            className={`px-3.5 py-1.5 rounded-xl border transition ${
              filterStatus === status
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2">Loading reservation history...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4">
          <Train className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No bookings found in this category</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Ready to travel? Search direct trains and Dijkstra connecting routes across 15 Indian metropolitan hubs.
          </p>
          <Link
            to="/search"
            className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600"
          >
            Book Trains Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(b => {
            const isConfirmed = b.status === 'CONFIRMED';
            const isCancelled = b.status === 'CANCELLED';

            return (
              <div
                key={b.pnr}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition p-5 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 ${
                        isConfirmed
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isCancelled
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {isConfirmed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {isCancelled && <XCircle className="w-3.5 h-3.5" />}
                      <span>{b.status}</span>
                    </span>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">PNR NUMBER</span>
                      <span className="font-mono font-black text-sm text-slate-900 tracking-wider">
                        {b.pnr}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 font-medium">Total Fare</span>
                    <p className="text-sm font-black text-slate-900">₹{b.totalFare.toFixed(2)}</p>
                  </div>
                </div>

                {/* Train and route line */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{b.trainName}</p>
                    <span className="font-mono text-orange-600 font-semibold">#{b.trainNumber}</span>
                  </div>

                  <div className="text-slate-600">
                    <span className="text-slate-400 block text-[10px]">ROUTE &amp; DATE</span>
                    <strong>{b.fromStation} &rarr; {b.toStation}</strong> on <span>{b.travelDate}</span>
                  </div>

                  <div className="text-slate-600 md:text-right">
                    <span className="text-slate-400 block text-[10px]">SEATS ALLOCATED</span>
                    <span className="font-semibold text-slate-900">
                      {b.passengers.map(p => `${p.name} (${p.seatAllocated?.coach || 'B1'}-${p.seatAllocated?.berthNumber || '12'})`).join(', ')}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Booked on: {new Date(b.createdAt).toLocaleDateString()} &bull; Platform #{b.platformNumber || 1}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/ticket/${b.pnr}`}
                      className="px-3.5 py-1.5 rounded-lg font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition flex items-center gap-1"
                    >
                      <span>E-Ticket Slip</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      to={`/pnr?pnr=${b.pnr}`}
                      className="px-3 py-1.5 rounded-lg font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                    >
                      PNR Status
                    </Link>

                    {!isCancelled && (
                      <Link
                        to={`/cancel/${b.pnr}`}
                        className="px-3 py-1.5 rounded-lg font-bold text-rose-600 hover:bg-rose-50 transition"
                      >
                        Cancel
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
