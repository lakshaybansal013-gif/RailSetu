import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { authService, UserProfile } from './services/authService';
import { isMockMode } from './services/supabaseClient';

// Pages
import { Home } from './pages/Home';
import { SearchResults } from './pages/SearchResults';
import { BookingPage } from './pages/BookingPage';
import { PaymentPage } from './pages/PaymentPage';
import { ETicketPage } from './pages/ETicketPage';
import { PNRStatusPage } from './pages/PNRStatusPage';
import { CancellationPage } from './pages/CancellationPage';
import { LoginPage } from './pages/LoginPage';
import { AuthPage } from './pages/AuthPage';
import { BookingHistoryPage } from './pages/BookingHistoryPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AlgorithmVisualizerPage } from './pages/AlgorithmVisualizerPage';
import { LiveTrainStatusPage } from './pages/LiveTrainStatusPage';
import { ContactPage } from './pages/ContactPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Main Portal Layout: Navbar (top) + Sidebar (left) + Page content (right).
 * Unauthenticated users are redirected to /login first.
 */
const MainPortalLayout: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(authService.getCurrentUser());
  const [authReady, setAuthReady] = useState(isMockMode());

  useEffect(() => {
    const unsubscribe = authService.subscribe(user => {
      setCurrentUser(user);
    });
    void authService.initialize().finally(() => setAuthReady(true));
    return unsubscribe;
  }, []);

  if (!authReady) return <div className="min-h-screen bg-[#f5f5f0]" />;
  if (!currentUser.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#f5f5f0] text-slate-900 selection:bg-orange-500 selection:text-white overflow-hidden">
      {/* Top Navbar */}
      <Navbar />

      {/* Body: Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
          <Footer />
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* 1. Standalone Login (no sidebar/navbar) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<LoginPage />} />

            {/* 2. Main Portal (protected) */}
            <Route element={<MainPortalLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/ticket/:pnr" element={<ETicketPage />} />
              <Route path="/pnr" element={<PNRStatusPage />} />
              <Route path="/cancel/:pnr" element={<CancellationPage />} />
              <Route path="/profile" element={<AuthPage />} />
              <Route path="/history" element={<BookingHistoryPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/visualizer" element={<AlgorithmVisualizerPage />} />
              <Route path="/live-status" element={<LiveTrainStatusPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
