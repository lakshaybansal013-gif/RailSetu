import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/authService';
import { useToast } from '../components/Toast';
import {
  User,
  Lock,
  Phone,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Train,
  FileText,
  BarChart2,
  Languages,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { i18n } = useTranslation();

  const [activeTab, setActiveTab] = useState<'password' | 'otp' | 'register'>('password');
  const [username, setUsername] = useState('vikram_rail_2026');
  const [password, setPassword] = useState('Railway@2026');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [otp, setOtp] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Checkboxes
  const [loginWithOtpCheckbox, setLoginWithOtpCheckbox] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [divyangjanConcession, setDivyangjanConcession] = useState(false);

  // Captcha
  const [captchaCode, setCaptchaCode] = useState('7K9X2B');
  const [captchaInput, setCaptchaInput] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const refreshCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setCaptchaInput('');
  };

  const fillVivaDemoCredentials = () => {
    setUsername('vikram_rail_2026');
    setPassword('Railway@2026');
    setPhone('+91 98765 43210');
    setOtp('1234');
    setCaptchaInput(captchaCode);
    showToast('info', 'Demo Credentials Loaded', 'Auto-filled test credentials for College Viva demo.');
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaInput.toUpperCase() !== captchaCode) {
      showToast('error', 'Invalid Captcha', 'Please enter the exact captcha code shown.');
      return;
    }
    setLoading(true);
    try {
      await authService.loginWithPassword(username, password);
      setLoading(false);
      showToast('success', 'Login Successful', `Welcome back, ${username}! Leading to main portal.`);
      navigate('/', { replace: true });
    } catch (err: any) { setLoading(false); showToast('error', 'Login Failed', err.message); }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    try {
      await authService.sendOtp(phone);
      setOtpSent(true);
      showToast('info', 'OTP Sent', 'Check your phone or email for the verification code.');
    } catch (err: any) { showToast('error', 'OTP Failed', err.message); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.loginWithOtp(phone, otp);
      setLoading(false);
      showToast('success', 'Verified & Logged In', 'Welcome to RailSetu! Leading to main portal.');
      navigate('/', { replace: true });
    } catch (err: any) {
      setLoading(false);
      showToast('error', 'Verification Failed', err.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      showToast('error', 'Missing Fields', 'Please fill in all registration fields.');
      return;
    }
    setLoading(true);
    try {
      const user = await authService.register(regEmail, regPassword, regName, regPhone);
      setLoading(false);
      if (!user) {
        showToast('info', 'Check your email', 'Confirm your address, then sign in.');
        setActiveTab('password');
        setUsername(regEmail);
        return;
      }
      showToast('success', 'Account Registered', `Welcome to RailSetu, ${regName}!`);
      navigate('/', { replace: true });
    } catch (err: any) { setLoading(false); showToast('error', 'Registration Failed', err.message); }
  };

  const handleContinueAsGuest = async () => {
    try { await authService.loginAsGuest(); }
    catch (err: any) { showToast('error', 'Guest sign-in failed', err.message); return; }
    showToast('info', 'Guest Mode', 'Continuing as Guest Passenger to main portal.');
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-slate-950 font-sans selection:bg-orange-500 selection:text-white">
      {/* Background Train Image with subtle vignette and motion aesthetic */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/indian_railways_locomotive.jpg"
          alt="Indian Railways Locomotive"
          className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.1]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/85 via-slate-950/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/50"></div>
      </div>

      {/* Standalone Top Bar for Login Gate */}
      <header className="relative z-20 bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow">
            <Train className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base tracking-tight text-white">RailSetu</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded font-mono border border-orange-500/30">
                PORTAL ACCESS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-none hidden sm:block">
              Ministry of Railways &bull; Greedy Allocation Architecture
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition text-xs font-semibold text-slate-200"
          >
            <Languages className="w-3.5 h-3.5 text-orange-400" />
            <span>{i18n.language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          <button
            type="button"
            onClick={handleContinueAsGuest}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-orange-600 border border-white/20 hover:border-orange-500 transition flex items-center gap-1.5 shadow-sm"
          >
            <span>Continue as Guest</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full relative z-10 px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col lg:flex-row items-center lg:items-center justify-between gap-8 my-auto">
        {/* Left Side: The Iconic Login Card (styled directly from the reference) */}
        <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
          {/* Top Blue Bar with Tabs */}
          <div className="bg-[#1b3a6b] text-white flex items-center divide-x divide-white/20 text-xs font-bold tracking-wide">
            <button
              type="button"
              onClick={() => {
                setActiveTab('password');
                setLoginWithOtpCheckbox(false);
              }}
              className={`flex-1 py-3.5 px-3 flex items-center justify-center gap-2 transition ${
                activeTab === 'password'
                  ? 'bg-[#0f2942] text-white font-extrabold shadow-inner'
                  : 'hover:bg-white/10 text-slate-200'
              }`}
            >
              <User className="w-4 h-4 text-orange-400" />
              <span>IRCTC LOGIN</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('otp');
                setLoginWithOtpCheckbox(true);
              }}
              className={`flex-1 py-3.5 px-3 flex items-center justify-center gap-2 transition ${
                activeTab === 'otp'
                  ? 'bg-[#0f2942] text-white font-extrabold shadow-inner'
                  : 'hover:bg-white/10 text-slate-200'
              }`}
            >
              <Phone className="w-4 h-4 text-orange-400" />
              <span>OTP LOGIN</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-3.5 px-3 flex items-center justify-center gap-2 transition ${
                activeTab === 'register'
                  ? 'bg-[#0f2942] text-white font-extrabold shadow-inner'
                  : 'hover:bg-white/10 text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4 text-orange-400" />
              <span>REGISTER</span>
            </button>
          </div>

          {/* Quick Shortcuts Sub-bar: Auto-Fill & PNR demo */}
          <div className="bg-slate-100 px-4 py-2 flex items-center justify-between text-[11px] font-bold text-[#1b3a6b] border-b border-slate-200">
            <span className="flex items-center gap-1.5 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>SECURE ACCESS GATE</span>
            </span>

            <span className="text-slate-300">|</span>

            <button
              type="button"
              onClick={fillVivaDemoCredentials}
              className="text-orange-600 hover:text-orange-700 flex items-center gap-1 font-extrabold"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Auto-Fill Demo Credentials</span>
            </button>
          </div>

          {/* Card Content Area */}
          <div className="p-6 sm:p-8 space-y-5">
            {/* Form Title */}
            <div className="text-center pb-2">
              <h2 className="text-2xl font-black text-[#1b3a6b] tracking-wide uppercase">
                {activeTab === 'password'
                  ? 'USER LOGIN'
                  : activeTab === 'otp'
                  ? 'LOGIN WITH OTP'
                  : 'NEW USER REGISTRATION'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeTab === 'register'
                  ? 'Create your RailSetu reservation account'
                  : 'Please sign in to proceed to the ticket booking portal'}
              </p>
            </div>

            {/* TAB 1: USERNAME & PASSWORD LOGIN */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                {/* Username Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    User Name / IRCTC ID *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="User Name"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-[#1b3a6b] transition"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password *
                    </label>
                    <a
                      href="#forgot"
                      onClick={(e) => {
                        e.preventDefault();
                        showToast('info', 'Forgot Password', 'Login via OTP with your registered mobile number.');
                      }}
                      className="text-[11px] font-bold text-[#1b3a6b] hover:text-orange-600 transition"
                    >
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-[#1b3a6b] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Captcha Section */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Enter Captcha *
                  </label>
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <input
                      type="text"
                      value={captchaInput}
                      onChange={e => setCaptchaInput(e.target.value.toUpperCase())}
                      placeholder="Enter Captcha"
                      required
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-md text-sm font-mono font-bold uppercase text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-[#1b3a6b]"
                    />

                    {/* Captcha Box */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 py-2 px-3 bg-slate-100 border border-slate-300 rounded-md flex items-center justify-center select-none shadow-inner">
                        <span className="font-mono text-base font-black tracking-widest text-[#1b3a6b] line-through italic">
                          {captchaCode}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={refreshCaptcha}
                        title="Refresh Captcha"
                        className="p-2 border border-slate-300 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-600 transition"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Checkbox Options styled after the reference image */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={loginWithOtpCheckbox}
                      onChange={e => {
                        setLoginWithOtpCheckbox(e.target.checked);
                        if (e.target.checked) setActiveTab('otp');
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-[#1b3a6b] focus:ring-[#1b3a6b]"
                    />
                    <span>Login &amp; Booking with OTP</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#1b3a6b] focus:ring-[#1b3a6b]"
                    />
                    <span>Remember My Username</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={divyangjanConcession}
                      onChange={e => setDivyangjanConcession(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#1b3a6b] focus:ring-[#1b3a6b]"
                    />
                    <span>Person With Disability Concession</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-500">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-[#1b3a6b] focus:ring-[#1b3a6b]"
                    />
                    <span>Railway Pass Concession</span>
                  </label>
                </div>

                {/* Buttons (matching the reference styling) */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
                  {/* Primary Orange Rectangular Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto flex-1 py-3 px-8 rounded-lg font-black text-sm text-white bg-[#f97316] hover:bg-[#ea580c] transition shadow-md shadow-orange-500/20 uppercase tracking-wider cursor-pointer text-center"
                  >
                    {loading ? 'Authenticating...' : 'SIGN IN & ENTER PORTAL'}
                  </button>

                  {/* Secondary Orange Pill Button like 'Easy Booking on AskDISHA' */}
                  <button
                    type="button"
                    onClick={() => {
                      fillVivaDemoCredentials();
                      setTimeout(() => {
                        authService.loginWithOtp('vikram_rail_2026', '1234');
                        showToast('success', 'Fast Login Approved', 'Logged in via AskDISHA 2.0 AI fast gateway.');
                        navigate('/', { replace: true });
                      }, 300);
                    }}
                    className="w-full sm:w-auto py-3 px-6 rounded-lg font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition shadow cursor-pointer text-center whitespace-nowrap"
                  >
                    Fast Login on AskDISHA 2.0
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: MOBILE OTP LOGIN */}
            {activeTab === 'otp' && (
              <div className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Registered Mobile Number / Email *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          required
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-[#1b3a6b]"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        A 4-digit verification code will be dispatched via SMS.
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-6 rounded-lg font-black text-sm text-white bg-[#f97316] hover:bg-[#ea580c] transition shadow-md shadow-orange-500/20 uppercase tracking-wider cursor-pointer"
                    >
                      GET ONE-TIME PASSWORD (OTP)
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-950 text-xs">
                      OTP sent to <strong>{phone}</strong>. Enter code below (Demo Code: <strong>1234</strong>):
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Enter 4 or 6 Digit OTP *
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        placeholder="1234"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-md font-mono text-center tracking-widest text-lg font-black text-[#1b3a6b] focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-[#1b3a6b]"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 px-6 rounded-lg font-black text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition shadow uppercase tracking-wider cursor-pointer"
                      >
                        {loading ? 'Verifying...' : 'VERIFY & ENTER PORTAL'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="py-3 px-4 rounded-lg font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                      >
                        Change Number
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB 3: REGISTER NEW USER */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="e.g. Vikram Aditya Sharma"
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="vikram@college.edu"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Choose Password *
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-lg font-black text-sm text-white bg-[#f97316] hover:bg-[#ea580c] transition shadow-md shadow-orange-500/20 uppercase tracking-wider cursor-pointer mt-2"
                >
                  {loading ? 'Creating Account...' : 'REGISTER & PROCEED TO PORTAL'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Side: Bold Indian Railways Title & Motto Banner (Matching the reference typography) */}
        <div className="w-full lg:w-1/2 text-white lg:text-right space-y-4 drop-shadow-lg lg:pt-4">
          <div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              INDIAN RAILWAYS
            </h1>
            <p className="text-sm sm:text-lg lg:text-xl font-bold tracking-widest text-slate-100 mt-1 uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              Safety &nbsp;|&nbsp; Security &nbsp;|&nbsp; Punctuality
            </p>
            <p className="text-xs sm:text-sm text-orange-300 font-semibold mt-1">
              सुरक्षा &nbsp;|&nbsp; संरक्षा &nbsp;|&nbsp; समय-पालन
            </p>
          </div>

          <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 max-w-md lg:ml-auto space-y-2 text-xs text-left shadow-xl">
            <div className="flex items-center gap-2 text-orange-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>College Viva Portal Gateway</span>
            </div>
            <p className="text-slate-200 text-[11px] leading-relaxed">
              Login to access the <strong>RailSetu Booking Engine</strong>, interactive <strong>Algorithm Visualizers</strong>, <strong>Platform Gantt Charts</strong>, and <strong>Dijkstra Route Finder</strong>.
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Announcement Warning Banner (Styled Exactly from the reference image) */}
      <footer className="w-full max-w-7xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 sm:p-5 border-2 border-slate-200 shadow-xl text-center space-y-1.5 text-xs">
          <p className="font-extrabold text-[#0f3a8a] text-xs sm:text-sm">
            Customers can use enhanced interface for their IRCTC related queries!!{' '}
            <a
              href="https://enquiry.irctc.co.in"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-orange-600"
            >
              https://enquiry.irctc.co.in
            </a>
          </p>

          <p className="font-black text-[#dc2626] text-xs sm:text-sm tracking-wide">
            Customer Care Numbers : 14646 / 08044647999 / 08035734999
          </p>

          <p className="font-black text-[#0f3a8a] text-[11px] sm:text-xs uppercase tracking-wider">
            BEWARE OF FRAUDSTERS: Always download official IRCTC Rail Connect App from the Google Play Store or Apple App Store Only.
          </p>
        </div>
      </footer>
    </div>
  );
};
