import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { Booking, WaitlistPriorityItem } from '../types';
import { CoinChangeResult } from '../algorithms/coinChange';
import { useToast } from '../components/Toast';
import {
  AlertTriangle,
  Coins,
  CheckCircle2,
  Users,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Receipt,
  XCircle,
} from 'lucide-react';

export const CancellationPage: React.FC = () => {
  const { pnr } = useParams<{ pnr: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancellationResult, setCancellationResult] = useState<{
    refundAmount: number;
    cancellationCharge: number;
    greedyRefund: CoinChangeResult;
    promotedPassengers: WaitlistPriorityItem[];
  } | null>(null);

  useEffect(() => {
    if (!pnr) return;
    bookingService.getBookingByPNR(pnr).then(res => {
      setBooking(res || null);
      setLoading(false);
    });
  }, [pnr]);

  const handleCancelTicket = async () => {
    if (!pnr) return;
    setCancelling(true);
    try {
      const result = await bookingService.cancelBooking(pnr);
      setCancellationResult(result);
      showToast('success', 'Ticket Cancelled', 'Refund processed via Greedy Coin Change.');
    } catch (err: any) {
      showToast('error', 'Cancellation Error', err.message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-xs text-slate-500 mt-2">Loading reservation details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h3 className="text-xl font-bold">Booking Not Found</h3>
        <p className="text-xs text-slate-500">No booking matches PNR #{pnr}.</p>
        <Link to="/history" className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
          View My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
          <XCircle className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ticket Cancellation &amp; Refund</h1>
          <p className="text-xs text-slate-500">
            Automated Greedy Coin Change refund dispensing and Priority Queue waitlist promotion.
          </p>
        </div>
      </div>

      {!cancellationResult ? (
        /* Confirmation screen before cancellation */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-rose-900">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Are you sure you want to cancel this booking?</span>
              <p className="mt-0.5 text-rose-700">
                A cancellation charge of ₹120 per passenger applies as per Indian Railways rules. The remainder will be refunded instantly with banknote breakdown.
              </p>
            </div>
          </div>

          {/* Ticket Summary */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500">PNR Number:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{booking.pnr}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Train:</span>
              <span className="font-bold text-slate-900">{booking.trainName} (#{booking.trainNumber})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Travel Date &amp; Route:</span>
              <span className="font-bold text-slate-900">{booking.fromStation} &rarr; {booking.toStation} on {booking.travelDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Passengers ({booking.passengers.length}):</span>
              <span className="font-bold text-slate-900">
                {booking.passengers.map(p => p.name).join(', ')}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold">
              <span className="text-slate-700">Total Ticket Fare:</span>
              <span className="text-slate-900 text-sm">₹{booking.totalFare.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              Keep My Ticket
            </button>
            <button
              type="button"
              onClick={handleCancelTicket}
              disabled={cancelling}
              className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 transition shadow-lg shadow-rose-600/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {cancelling ? 'Processing...' : 'Confirm Ticket Cancellation'}
            </button>
          </div>
        </div>
      ) : (
        /* Results screen after cancellation */
        <div className="space-y-6">
          {/* Success Banner */}
          <div className="bg-emerald-50 border border-emerald-300 p-5 rounded-3xl flex items-center gap-4 text-emerald-950 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black">Ticket Successfully Cancelled</h2>
              <p className="text-xs text-emerald-800">
                PNR #{booking.pnr} has been cancelled. Net refund amount of ₹{cancellationResult.refundAmount} has been processed.
              </p>
            </div>
          </div>

          {/* Greedy Coin Change Refund Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Greedy Coin Change: Refund Dispensing Breakdown
                  </h3>
                  <p className="text-xs text-slate-500">
                    Calculated using canonical Indian currency matroid system for minimum note count.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400">Total Currency Notes</span>
                <p className="text-base font-black text-orange-600 font-mono">
                  {cancellationResult.greedyRefund.totalNotesOrCoins} Units
                </p>
              </div>
            </div>

            {/* Note Dispensed Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {cancellationResult.greedyRefund.denominations.map(d => (
                <div
                  key={d.denomination}
                  className="p-3.5 rounded-2xl border bg-slate-50/80 border-slate-200 text-center space-y-1 hover:border-amber-400 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center mx-auto">
                    {d.count}×
                  </div>
                  <div className="font-black text-slate-900 text-base">₹{d.denomination}</div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Subtotal: ₹{d.totalValue}</span>
                </div>
              ))}
            </div>

            {/* Step Trace Accordion / Explainer */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Greedy Choice Theorem Explanation</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                At each step, the algorithm greedily chooses the largest banknote denomination &le; remaining balance. Since the Indian Rupee system (500, 200, 100, 50, 20, 10, 5, 2, 1) satisfies the canonical greedy matroid property, this is mathematically proven to yield the global minimum count of physical banknotes and coins.
              </p>
            </div>
          </div>

          {/* Waitlisted Passenger Promoted Section */}
          {cancellationResult.promotedPassengers.length > 0 && (
            <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 uppercase tracking-wider">
                      Waitlist Max-Heap Event
                    </span>
                    <h3 className="text-lg font-black text-white">
                      Waitlisted Passenger Promoted to CONFIRMED!
                    </h3>
                  </div>
                </div>

                <Link
                  to="/visualizer?tab=waitlist"
                  className="text-xs font-bold px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-orange-300"
                >
                  Inspect Priority Queue &rarr;
                </Link>
              </div>

              <div className="divide-y divide-slate-800 bg-white/5 rounded-2xl border border-white/10 p-4 text-xs">
                {cancellationResult.promotedPassengers.map(promoted => (
                  <div key={promoted.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-sm">{promoted.passengerName}</p>
                      <p className="text-slate-400 text-[11px]">
                        PNR: <span className="font-mono text-orange-400">{promoted.pnr}</span> &bull; Quota: <strong className="text-white">{promoted.quota}</strong> &bull; Age: {promoted.age}y
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        Promoted to CONFIRMED
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        Score: {promoted.priorityScore.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <Link
              to="/history"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition"
            >
              &larr; View Booking History
            </Link>
            <Link
              to="/search"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition shadow"
            >
              Book Another Journey &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
