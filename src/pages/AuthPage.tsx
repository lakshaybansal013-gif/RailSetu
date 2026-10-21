import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, SavedPassenger } from '../services/authService';
import { useToast } from '../components/Toast';
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const currentUser = authService.getCurrentUser();

  const [inputVal, setInputVal] = useState('+91 98765 43210');
  const [otp, setOtp] = useState('1234');
  const [step, setStep] = useState<'enter_contact' | 'enter_otp'>('enter_contact');
  const [loading, setLoading] = useState(false);

  // Saved passengers management
  const [savedPassengers, setSavedPassengers] = useState<SavedPassenger[]>(
    authService.getSavedPassengers()
  );
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState(25);
  const [newGender, setNewGender] = useState<'M' | 'F' | 'O'>('M');
  const [newBerth, setNewBerth] = useState<'L' | 'M' | 'U' | 'SL' | 'SU'>('L');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    try {
      await authService.sendOtp(inputVal);
      setStep('enter_otp');
      showToast('info', 'OTP Sent', 'Check your phone or email for the verification code.');
    } catch (err: any) { showToast('error', 'OTP Failed', err.message); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.loginWithOtp(inputVal, otp);
      showToast('success', 'Logged In', 'Welcome to RailSetu!');
      navigate('/history');
    } catch (err: any) {
      showToast('error', 'Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPassenger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const added = authService.addSavedPassenger({
      name: newName.trim(),
      age: Number(newAge),
      gender: newGender,
      berthPreference: newBerth,
    });
    setSavedPassengers([...savedPassengers, added]);
    setNewName('');
    showToast('success', 'Passenger Saved', `${added.name} added to your list.`);
  };

  const handleRemovePassenger = (id: string) => {
    authService.removeSavedPassenger(id);
    setSavedPassengers(savedPassengers.filter(p => p.id !== id));
    showToast('info', 'Removed', 'Passenger removed from saved list.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Passenger Account &amp; Profiles
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Sign in via simulated Mobile OTP or Email to manage bookings and master passenger list.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {currentUser.isAuthenticated ? 'Active User Session' : 'OTP Fast Login'}
              </h3>
              <p className="text-xs text-slate-400">No password needed &bull; Instant OTP</p>
            </div>
          </div>

          {currentUser.isAuthenticated ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-950">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-sm">{currentUser.name}</p>
                  <p className="text-slate-600">{currentUser.email || currentUser.phone}</p>
                  <span className="text-[10px] font-mono text-emerald-800 font-bold">
                    IRCTC ID: {currentUser.irctcUsername}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/history')}
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs shadow transition text-center"
                >
                  View My Bookings &rarr;
                </button>
                <button
                  type="button"
                  onClick={() => {
                    authService.logout();
                    window.location.reload();
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 rounded-xl font-bold text-xs transition"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : step === 'enter_contact' ? (
            <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Mobile Number or Email ID
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
                  <input
                    type="text"
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Simulated gateway: enter any mobile number or email
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold rounded-xl shadow transition hover:from-orange-700"
              >
                Send One-Time Password (OTP) &rarr;
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-orange-900 text-xs">
                OTP sent to <strong>{inputVal}</strong>. Enter code below:
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Enter 4-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="1234"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center tracking-widest text-base font-bold focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition"
              >
                {loading ? 'Verifying OTP...' : 'Verify OTP & Continue'}
              </button>

              <button
                type="button"
                onClick={() => setStep('enter_contact')}
                className="w-full text-center text-[11px] text-slate-500 hover:text-slate-700"
              >
                &larr; Change mobile number
              </button>
            </form>
          )}
        </div>

        {/* Saved Passengers List */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Saved Passenger Master List</h3>
              <p className="text-xs text-slate-400">1-click autofill during train booking</p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              {savedPassengers.length} Saved
            </span>
          </div>

          {/* Existing List */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {savedPassengers.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No saved passengers yet.</p>
            ) : (
              savedPassengers.map(sp => (
                <div
                  key={sp.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:border-orange-200 transition"
                >
                  <div>
                    <p className="font-bold text-slate-900">{sp.name}</p>
                    <span className="text-[11px] text-slate-500">
                      {sp.age} Yrs &bull; {sp.gender} &bull; Pref: {sp.berthPreference}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePassenger(sp.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add New Passenger Form */}
          <form onSubmit={handleAddPassenger} className="pt-3 border-t border-slate-100 space-y-3 text-xs">
            <span className="font-bold text-slate-700 block">Add New Passenger to Master List</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Full Name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                required
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
              <input
                type="number"
                min="1"
                max="120"
                placeholder="Age"
                value={newAge}
                onChange={e => setNewAge(Number(e.target.value))}
                required
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={newGender}
                onChange={e => setNewGender(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>

              <select
                value={newBerth}
                onChange={e => setNewBerth(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="L">Lower (L)</option>
                <option value="M">Middle (M)</option>
                <option value="U">Upper (U)</option>
                <option value="SL">Side Lower (SL)</option>
                <option value="SU">Side Upper (SU)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition"
            >
              + Save Passenger
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
