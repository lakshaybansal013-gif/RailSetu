import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { Booking } from '../types';
import {
  Train,
  Printer,
  Download,
  Share2,
  XCircle,
  Radio,
  CheckCircle2,
  QrCode,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const ETicketPage: React.FC = () => {
  const { pnr } = useParams<{ pnr: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pnr) return;
    bookingService.getBookingByPNR(pnr).then(res => {
      setBooking(res || null);
      setLoading(false);
    });
  }, [pnr]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-xs text-slate-500 mt-3 font-medium">Fetching electronic reservation slip...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-900">PNR Not Found</h3>
        <p className="text-xs text-slate-500">We could not locate booking for PNR #{pnr}.</p>
        <Link
          to="/search"
          className="inline-block px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold"
        >
          Book a Ticket
        </Link>
      </div>
    );
  }

  const isConfirmed = booking.status === 'CONFIRMED';
  const isCancelled = booking.status === 'CANCELLED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Action Bar (hidden during print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Link
            to="/history"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200"
          >
            &larr; My Bookings
          </Link>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs font-bold text-slate-800">Electronic Reservation Slip</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>

          {!isCancelled && (
            <Link
              to={`/cancel/${booking.pnr}`}
              className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Ticket &amp; Refund</span>
            </Link>
          )}

          <Link
            to={`/live-status?train=${booking.trainNumber}`}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 transition flex items-center gap-1.5 shadow-sm"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Track Live Status</span>
          </Link>
        </div>
      </div>

      {/* Main E-Ticket Slip (Printable) */}
      <div className="print-card bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-4 border-orange-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg">
              <Train className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">IRCTC E-TICKET</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-mono">
                  INDIAN RAILWAYS
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">Electronic Reservation Slip (ERS)</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">PNR NUMBER</span>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-orange-400">
              {booking.pnr}
            </div>
            <div className="mt-1">
              <span
                className={`text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
                  isConfirmed
                    ? 'bg-emerald-500 text-white'
                    : isCancelled
                    ? 'bg-rose-500 text-white'
                    : 'bg-amber-500 text-white'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                {booking.status}
              </span>
            </div>
          </div>
        </div>

        {/* Journey Details Grid */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs">
            <div>
              <span className="text-slate-400">Train Number &amp; Name</span>
              <p className="font-bold text-slate-900 mt-0.5 text-sm">{booking.trainName}</p>
              <span className="font-mono text-orange-600 font-bold">#{booking.trainNumber}</span>
            </div>

            <div>
              <span className="text-slate-400">Date of Journey</span>
              <p className="font-bold text-slate-900 mt-0.5 text-sm">{booking.travelDate}</p>
              <span className="text-slate-500">Class: {booking.coachClass}</span>
            </div>

            <div>
              <span className="text-slate-400">From &rarr; To</span>
              <p className="font-bold text-slate-900 mt-0.5 text-sm">{booking.fromStation} &rarr; {booking.toStation}</p>
              <span className="text-slate-500">Quota: {booking.quota}</span>
            </div>

            <div>
              <span className="text-slate-400">Boarding Platform</span>
              <p className="font-black text-slate-900 mt-0.5 text-base text-orange-600">
                Platform #{booking.platformNumber || 1}
              </p>
              <span className="text-[10px] text-slate-400 font-medium">Interval Partitioned</span>
            </div>
          </div>

          {/* Passenger Berth Allocation Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800">
                Passenger &amp; Berth Allocation (Activity Selection)
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {booking.passengers.length} Passenger(s)
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/90 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Passenger Name</th>
                    <th className="p-3">Age / Gender</th>
                    <th className="p-3">Booking Status</th>
                    <th className="p-3">Coach</th>
                    <th className="p-3">Berth No.</th>
                    <th className="p-3">Berth Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {booking.passengers.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{p.name}</td>
                      <td className="p-3 text-slate-600">{p.age} Yrs / {p.gender}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {p.seatAllocated?.coach || 'B1'}
                      </td>
                      <td className="p-3 font-mono font-extrabold text-orange-600 text-sm">
                        {p.seatAllocated?.berthNumber || '12'}
                      </td>
                      <td className="p-3 font-semibold text-slate-700">
                        {p.seatAllocated?.berthType === 'L'
                          ? 'Lower (L)'
                          : p.seatAllocated?.berthType === 'M'
                          ? 'Middle (M)'
                          : p.seatAllocated?.berthType === 'U'
                          ? 'Upper (U)'
                          : p.seatAllocated?.berthType === 'SL'
                          ? 'Side Lower (SL)'
                          : p.seatAllocated?.berthType === 'WS'
                          ? 'Window Seat'
                          : 'Berth'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment & QR Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-5 bg-slate-50/80 rounded-2xl border border-slate-200">
            {/* Payment Details */}
            <div className="space-y-1 text-xs">
              <span className="font-bold uppercase text-slate-400 tracking-wider">Payment &amp; Fare Receipt</span>
              <div className="text-sm font-black text-slate-900">Total Fare: ₹{booking.totalFare.toFixed(2)}</div>
              <p className="text-slate-500">Method: {booking.paymentMethod || 'UPI Verified'}</p>
              <p className="text-[11px] font-mono text-slate-400">Txn ID: {booking.transactionId || 'TXN89123891'}</p>
              <p className="text-[11px] text-slate-400">Booked at: {new Date(booking.createdAt).toLocaleString()}</p>
            </div>

            {/* QR Code */}
            <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              {/* Scalable SVG QR code */}
              <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none">
                <rect width="100" height="100" fill="white" />
                {/* 3 Corner Finder Squares */}
                <rect x="10" y="10" width="24" height="24" fill="#0f172a" />
                <rect x="14" y="14" width="16" height="16" fill="white" />
                <rect x="18" y="18" width="8" height="8" fill="#ea580c" />

                <rect x="66" y="10" width="24" height="24" fill="#0f172a" />
                <rect x="70" y="14" width="16" height="16" fill="white" />
                <rect x="74" y="18" width="8" height="8" fill="#ea580c" />

                <rect x="10" y="66" width="24" height="24" fill="#0f172a" />
                <rect x="14" y="70" width="16" height="16" fill="white" />
                <rect x="18" y="74" width="8" height="8" fill="#ea580c" />

                {/* Data modules */}
                <rect x="40" y="12" width="6" height="6" fill="#0f172a" />
                <rect x="50" y="20" width="6" height="6" fill="#0f172a" />
                <rect x="42" y="32" width="6" height="6" fill="#0f172a" />
                <rect x="52" y="42" width="6" height="6" fill="#ea580c" />
                <rect x="36" y="52" width="6" height="6" fill="#0f172a" />
                <rect x="66" y="45" width="6" height="6" fill="#0f172a" />
                <rect x="78" y="55" width="6" height="6" fill="#0f172a" />
                <rect x="44" y="68" width="6" height="6" fill="#0f172a" />
                <rect x="56" y="76" width="6" height="6" fill="#0f172a" />
                <rect x="68" y="80" width="6" height="6" fill="#0f172a" />
                <rect x="80" y="72" width="6" height="6" fill="#ea580c" />
              </svg>

              <div className="text-[11px] text-slate-500">
                <span className="font-bold text-slate-800 block">Digital Verification QR</span>
                <span>Scan onboard by TTE</span>
                <span className="block font-mono text-orange-600 font-bold">{booking.pnr}</span>
              </div>
            </div>
          </div>

          {/* Academic Viva Footnote */}
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-[11px] text-indigo-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>College Project Viva Note:</strong> Berth allocated via <em>Greedy Activity Selection</em> &bull; Boarding platform assigned via <em>Interval Partitioning Min-Heap</em>.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
