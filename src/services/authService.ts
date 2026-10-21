import { BerthType } from '../types';
import { isMockMode, supabase } from './supabaseClient';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  irctcUsername: string;
  isAuthenticated: boolean;
}

export interface SavedPassenger {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  berthPreference: BerthType;
}

const AUTH_USER_KEY = 'railway_auth_user_v1';
const SAVED_PASSENGERS_KEY = 'railway_saved_passengers_v1';

const DEFAULT_USER: UserProfile = {
  id: 'usr-guest-101',
  name: 'Vikram Aditya',
  email: 'vikram.aditya@college.edu',
  phone: '+91 98765 43210',
  irctcUsername: 'vikram_rail_2026',
  isAuthenticated: false, // Default to false so user first logs in before accessing main pages!
};

const DEFAULT_SAVED_PASSENGERS: SavedPassenger[] = [
  { id: 'sp-1', name: 'Vikram Aditya', age: 22, gender: 'M', berthPreference: 'L' },
  { id: 'sp-2', name: 'Priya Sharma', age: 21, gender: 'F', berthPreference: 'SL' },
  { id: 'sp-3', name: 'Dr. S. K. Verma', age: 65, gender: 'M', berthPreference: 'L' },
];

type AuthListener = (user: UserProfile) => void;
const listeners: Set<AuthListener> = new Set();

function profileFromAuth(user: { id: string; email?: string; phone?: string; user_metadata?: Record<string, any> }): UserProfile {
  const email = user.email ?? '';
  const phone = user.phone ?? '';
  return { id: user.id, name: user.user_metadata?.name ?? email.split('@')[0] ?? phone,
    email, phone, irctcUsername: user.user_metadata?.irctcUsername ?? '', isAuthenticated: true };
}

function notifyListeners(user: UserProfile) {
  listeners.forEach(fn => fn(user));
}

export const authService = {
  async loginWithPassword(email: string, password: string): Promise<UserProfile> {
    if (isMockMode()) return this.loginWithOtp(email, '1234');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) throw error ?? new Error('Sign in failed.');
    const profile = profileFromAuth(data.user);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
    notifyListeners(profile);
    return profile;
  },

  async register(email: string, password: string, name: string, phone: string): Promise<UserProfile | null> {
    if (isMockMode()) return this.loginWithOtp(email, '1234');
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name, phone } } });
    if (error) throw error;
    if (!data.user) throw new Error('Registration did not return a user.');
    if (!data.session) return null; // Email confirmation is enabled; user must follow the email link.
    const profile = profileFromAuth(data.user);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
    notifyListeners(profile);
    return profile;
  },

  async initialize(): Promise<void> {
    if (isMockMode()) return;
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (user) {
      const profile = profileFromAuth(user);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
      notifyListeners(profile);
    }
    supabase.auth.onAuthStateChange((_event, session) => {
      const profile = session?.user ? profileFromAuth(session.user) : { ...DEFAULT_USER, isAuthenticated: false };
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
      notifyListeners(profile);
    });
  },

  async sendOtp(contact: string): Promise<void> {
    if (isMockMode()) return;
    const value = contact.trim();
    const result = value.includes('@')
      ? await supabase.auth.signInWithOtp({ email: value })
      : await supabase.auth.signInWithOtp({ phone: value.replace(/[\s()-]/g, '') });
    if (result.error) throw result.error;
  },
  getCurrentUser(): UserProfile {
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      if (!raw) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(DEFAULT_USER));
        return DEFAULT_USER;
      }
      return JSON.parse(raw);
    } catch {
      return DEFAULT_USER;
    }
  },

  subscribe(listener: AuthListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async loginWithOtp(phoneOrEmail: string, otp: string): Promise<UserProfile> {
    if (!isMockMode()) {
      const value = phoneOrEmail.trim();
      const result = value.includes('@')
        ? await supabase.auth.verifyOtp({ email: value, token: otp, type: 'email' })
        : await supabase.auth.verifyOtp({ phone: value.replace(/[\s()-]/g, ''), token: otp, type: 'sms' });
      if (result.error || !result.data.user) throw result.error ?? new Error('OTP verification failed.');
      const user = profileFromAuth(result.data.user);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      notifyListeners(user);
      return user;
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (otp.length >= 4) {
          const user: UserProfile = {
            id: `usr-${Date.now()}`,
            name: phoneOrEmail.includes('@') ? phoneOrEmail.split('@')[0] : 'Vikram Aditya',
            email: phoneOrEmail.includes('@') ? phoneOrEmail : `${phoneOrEmail}@indianrail.gov.in`,
            phone: phoneOrEmail.includes('@') ? '+91 98765 43210' : phoneOrEmail,
            irctcUsername: `irctc_${Math.floor(1000 + Math.random() * 9000)}`,
            isAuthenticated: true,
          };
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
          notifyListeners(user);
          resolve(user);
        } else {
          reject(new Error('Invalid OTP. Please enter at least 4 digits.'));
        }
      }, 400);
    });
  },

  async loginAsGuest(): Promise<UserProfile> {
    if (!isMockMode()) {
      const { data, error } = await supabase.auth.signInAnonymously({ options: { data: { name: 'Guest Passenger' } } });
      if (error || !data.user) throw error ?? new Error('Anonymous sign-in failed.');
      const guest = profileFromAuth(data.user);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(guest));
      notifyListeners(guest);
      return guest;
    }
    const user: UserProfile = {
      id: `usr-guest-${Date.now()}`,
      name: 'Guest Passenger',
      email: 'guest@railsetu.gov.in',
      phone: '+91 98000 00000',
      irctcUsername: 'guest_railway',
      isAuthenticated: true,
    };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    notifyListeners(user);
    return user;
  },

  logout(): void {
    const guestUser: UserProfile = {
      id: 'usr-guest',
      name: 'Guest Passenger',
      email: '',
      phone: '',
      irctcUsername: '',
      isAuthenticated: false,
    };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(guestUser));
    notifyListeners(guestUser);
    if (!isMockMode()) void supabase.auth.signOut();
  },

  getSavedPassengers(): SavedPassenger[] {
    try {
      const raw = localStorage.getItem(SAVED_PASSENGERS_KEY);
      if (!raw) {
        localStorage.setItem(SAVED_PASSENGERS_KEY, JSON.stringify(DEFAULT_SAVED_PASSENGERS));
        return DEFAULT_SAVED_PASSENGERS;
      }
      return JSON.parse(raw);
    } catch {
      return DEFAULT_SAVED_PASSENGERS;
    }
  },

  addSavedPassenger(passenger: Omit<SavedPassenger, 'id'>): SavedPassenger {
    const list = this.getSavedPassengers();
    const newPassenger: SavedPassenger = {
      ...passenger,
      id: `sp-${Date.now()}`,
    };
    list.push(newPassenger);
    localStorage.setItem(SAVED_PASSENGERS_KEY, JSON.stringify(list));
    return newPassenger;
  },

  removeSavedPassenger(id: string): void {
    const list = this.getSavedPassengers().filter(p => p.id !== id);
    localStorage.setItem(SAVED_PASSENGERS_KEY, JSON.stringify(list));
  },
};
