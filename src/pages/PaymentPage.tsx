import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { bookingService } from '../services/bookingService';
import { useToast } from '../components/Toast';
import {
  CreditCard,
  QrCode,
  Building2,
  Lock,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Zap,
} from 'lucide-react';

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [draft, setDraft] = useState<any>(null);
  const [paymentMode, setPaymentMode] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [simulateOutcome, setSimulateOutcome] = useState<'success' | 'failure'>('success');
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes timer

  // Form states
  const [upiId, setUpiId] = useState('vikram@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 8910 2341 9081');
  const [cardName, setCardName] = useState('VIKRAM ADITYA');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('742');
  const [selectedBank, setSelectedBank] = useState('SBI');

  useEffect(() => {
    const raw = sessionStorage.getItem('railway_draft_booking');
    if (!raw) {
      navigate('/search');
      return;
    }
    setDraft(JSON.parse(raw));
  }, [navigate]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrorMessage('');

    setTimeout(async () => {
      if (simulateOutcome === 'failure') {
        setProcessing(false);
        setErrorMessage('Transaction declined by issuing bank (Simulated Failure Mode for Viva demo). Please retry or switch to Success mode.');
        showToast('error', 'Payment Failed', 'Bank declined simulated transaction.');
        return;
      }

      try {
        const newBooking = await bookingService.createBooking({
          trainNumber: draft.trainNumber,
          trainName: draft.trainName,
          travelDate: draft.travelDate,
          fromStation: draft.fromStation,
          toStation: draft.toStation,
          coachClass: draft.coachClass,
          quota: draft.quota,
          passengers: draft.passengers,
          paymentMethod:
            paymentMode === 'upi'
              ? `UPI (${upiId})`
              : paymentMode === 'card'
              ? `Card (ending ${cardNumber.slice(-4)})`
              : `Net Banking (${selectedBank})`,
        });

        // Trigger confetti celebration
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        sessionStorage.removeItem('railway_draft_booking');
        showToast('success', 'Booking Confirmed!', `PNR: ${newBooking.pnr} generated.`);
        navigate(`/ticket/${newBooking.pnr}`);
      } catch (err: any) {
        setProcessing(false);
        setErrorMessage(err.message || 'Booking creation failed.');
      }
    }, 1200);
  };

  if (!draft) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Session Security Timer */}
      <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600 animate-spin" />
          <span>Payment session expires in: <strong className="font-mono text-sm">{formatTimer(timeLeft)}</strong></span>
        </div>
        <div className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
          <Lock className="w-3 h-3" />
          <span>256-bit SSL Encrypted</span>
        </div>
      </div>

      {/* College Viva Simulation Switch Banner */}
      <div className="bg-indigo-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5">
          <Zap className="w-4 h-4 text-amber-400" />
          <div>
            <span className="font-bold text-xs uppercase tracking-wider text-indigo-300">Viva Demonstration Control</span>
            <p className="text-xs text-white font-medium">Select outcome to demonstrate payment success or failure handling:</p>
          </div>
        </div>

        <div className="flex items-center bg-indigo-950/80 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setSimulateOutcome('success')}
            className={`px-3 py-1.5 rounded-lg transition ${
              simulateOutcome === 'success'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-indigo-200 hover:text-white'
            }`}
          >
            Simulate Success
          </button>
          <button
            type="button"
            onClick={() => setSimulateOutcome('failure')}
            className={`px-3 py-1.5 rounded-lg transition ${
              simulateOutcome === 'failure'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-indigo-200 hover:text-white'
            }`}
          >
            Simulate Failure
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Payment Methods */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-slate-900">Select Payment Method</h3>
            <span className="text-xs text-slate-400">Total: ₹{draft.totalFare.toFixed(2)}</span>
          </div>

          {/* Payment Tabs */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMode('upi')}
              className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1.5 ${
                paymentMode === 'upi'
                  ? 'bg-orange-50 border-orange-500 text-orange-600 ring-2 ring-orange-500/20'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <QrCode className="w-5 h-5" />
              <span>UPI / QR</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMode('card')}
              className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1.5 ${
                paymentMode === 'card'
                  ? 'bg-orange-50 border-orange-500 text-orange-600 ring-2 ring-orange-500/20'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span>Cards</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMode('netbanking')}
              className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1.5 ${
                paymentMode === 'netbanking'
                  ? 'bg-orange-50 border-orange-500 text-orange-600 ring-2 ring-orange-500/20'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span>Net Banking</span>
            </button>
          </div>

          <form onSubmit={handlePay} className="space-y-4 pt-2">
            {/* UPI Option */}
            {paymentMode === 'upi' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-32 h-32 bg-white p-2 rounded-xl border border-slate-300 shadow-sm flex flex-col items-center justify-center text-center">
                    {/* Simulated QR Pattern */}
                    <div className="w-24 h-24 bg-slate-900 rounded-lg p-1.5 flex flex-wrap gap-1">
                      <div className="w-6 h-6 border-2 border-white rounded-sm"></div>
                      <div className="w-6 h-6 bg-white rounded-sm"></div>
                      <div className="w-6 h-6 bg-orange-500 rounded-sm"></div>
                      <div className="w-6 h-6 border-2 border-white rounded-sm"></div>
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 font-mono">Scan via GPay/PhonePe</span>
                  </div>

                  <div className="flex-1 space-y-2 text-xs">
                    <p className="font-bold text-slate-900">Or Pay with UPI ID</p>
                    <input
                      type="text"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      placeholder="username@bank"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs"
                    />
                    <div className="flex gap-2 pt-1 text-[10px] text-slate-500">
                      <span className="px-2 py-0.5 rounded bg-white border">@okhdfcbank</span>
                      <span className="px-2 py-0.5 rounded bg-white border">@okaxis</span>
                      <span className="px-2 py-0.5 rounded bg-white border">@ybl</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Card Option */}
            {paymentMode === 'card' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg uppercase"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Net Banking Option */}
            {paymentMode === 'netbanking' && (
              <div className="space-y-3 text-xs">
                <label className="block font-semibold text-slate-600">Select Bank</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'SBI', name: 'State Bank of India' },
                    { id: 'HDFC', name: 'HDFC Bank' },
                    { id: 'ICICI', name: 'ICICI Bank' },
                    { id: 'AXIS', name: 'Axis Bank' },
                  ].map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBank(b.id)}
                      className={`p-3 rounded-xl border text-left font-semibold transition ${
                        selectedBank === b.id
                          ? 'border-orange-500 bg-orange-50 text-orange-950 ring-1 ring-orange-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={processing}
              className="w-full py-3.5 px-6 rounded-2xl font-black text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 transition shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Payment via Bank Gateway...</span>
                </div>
              ) : (
                <>
                  <span>Pay ₹{draft.totalFare.toFixed(2)} &amp; Allocate Berths</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right 1 Col: Booking Summary */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 text-xs">
          <h4 className="font-extrabold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
            Booking Overview
          </h4>

          <div className="space-y-2">
            <div>
              <span className="text-slate-400">Train</span>
              <p className="font-bold text-slate-900">{draft.trainName} (#{draft.trainNumber})</p>
            </div>
            <div>
              <span className="text-slate-400">Route &amp; Date</span>
              <p className="font-bold text-slate-900">{draft.fromStation} &rarr; {draft.toStation} ({draft.travelDate})</p>
            </div>
            <div>
              <span className="text-slate-400">Class &amp; Quota</span>
              <p className="font-bold text-slate-900">{draft.coachClass} &bull; {draft.quota}</p>
            </div>
            <div>
              <span className="text-slate-400">Passengers ({draft.passengers.length})</span>
              <ul className="mt-1 space-y-1">
                {draft.passengers.map((p: any, i: number) => (
                  <li key={i} className="font-medium text-slate-700 flex justify-between">
                    <span>{p.name} ({p.age}y, {p.gender})</span>
                    <span className="text-orange-600 font-semibold">{p.berthPreference}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-1.5">
            <div className="flex justify-between text-slate-500">
              <span>Base Ticket Price</span>
              <span>₹{draft.baseFare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Convenience Fee</span>
              <span>₹{draft.convenienceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1 border-t border-dashed">
              <span>Grand Total</span>
              <span className="text-orange-600 text-base">₹{draft.totalFare.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
