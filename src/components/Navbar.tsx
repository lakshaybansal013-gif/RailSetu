import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService, UserProfile } from '../services/authService';
import {
  Train,
  Globe,
  ChevronDown,
  User,
  Ticket,
  CreditCard,
  MapPin,
  HelpCircle,
  Menu,
  X,
  LogOut,
  History,
  Cpu,
} from 'lucide-react';

const topNavLinks = [
  { to: '/', label: 'Plan a trip', exact: true },
  { to: '/search', label: 'Tickets' },
  { to: '/pnr', label: 'Rail passes' },
  { to: '/contact', label: 'Destinations' },
  { to: '/contact', label: 'Help' },
];

export const Navbar: React.FC = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>(authService.getCurrentUser());

  useEffect(() => {
    const unsubscribe = authService.subscribe(user => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname === to;
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-sm">
            <Train className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
          </div>
          <div>
            <div className="text-sm font-black text-slate-900 tracking-tight leading-none">
              RailSetu
            </div>
            <div className="text-[9px] text-slate-400 leading-none font-medium">
              Trains for smarter India
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 ml-8">
          {topNavLinks.map((link, i) => {
            const active = isActive(link.to, link.exact);
            return (
              <Link
                key={`nav-${i}`}
                to={link.to}
                className={`relative px-3.5 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? 'text-orange-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-orange-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Algorithm Visualizer quick link */}
          <Link
            to="/visualizer"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition border border-indigo-100"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Algorithms</span>
          </Link>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition border border-slate-200"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{i18n.language === 'en' ? 'EN' : 'HI'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* User Menu */}
          {currentUser.isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 transition"
              >
                <div className="w-7 h-7 rounded-full bg-[#1c3a2c] text-white flex items-center justify-center text-xs font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-none">
                    Hi, {currentUser.name.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight">Traveller</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                      <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                    </div>
                    <Link
                      to="/history"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                    >
                      <History className="w-4 h-4 text-slate-400" />
                      My Bookings
                    </Link>
                    <Link
                      to="/pnr"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Ticket className="w-4 h-4 text-slate-400" />
                      PNR Status
                    </Link>
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          authService.logout();
                          setUserDropdownOpen(false);
                          navigate('/login', { replace: true });
                        }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition"
            >
              <User className="w-3.5 h-3.5" />
              Sign in
            </Link>
          )}

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg">
          {topNavLinks.map((link, i) => (
            <Link
              key={`mob-${i}`}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/visualizer"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-indigo-600 bg-indigo-50 transition"
          >
            <Cpu className="w-4 h-4" />
            Algorithm Visualizer
          </Link>
        </div>
      )}
    </header>
  );
};
