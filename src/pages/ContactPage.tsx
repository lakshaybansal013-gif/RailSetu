import React, { useState } from 'react';
import { useToast } from '../components/Toast';
import {
  Phone,
  Mail,
  ShieldCheck,
  MessageSquare,
  HelpCircle,
  Award,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('PNR / Booking Query');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('success', 'Message Dispatched', 'Thank you! Your grievance query has been logged.');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Railway Passenger Help &amp; Support
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          24x7 Indian Railways Helplines, passenger assistance, and academic project attribution.
        </p>
      </div>

      {/* Emergency Helpline Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-center">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold mx-auto">
            <Phone className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
            National Railway Helpline
          </span>
          <p className="text-2xl font-black text-slate-900 font-mono">139</p>
          <span className="text-[11px] text-slate-500 block">Toll-free 24/7 across India</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold mx-auto">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
            Security &amp; RPF Helpline
          </span>
          <p className="text-2xl font-black text-blue-900 font-mono">182</p>
          <span className="text-[11px] text-slate-500 block">RPF Passenger Safety Escort</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mx-auto">
            <Mail className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
            Email Support
          </span>
          <p className="text-sm font-bold text-slate-900">support@railsetu.gov.in</p>
          <span className="text-[11px] text-slate-500 block">Online Ticketing Assistance</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Support Grievance Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-4 text-xs">
          <h3 className="font-extrabold text-base text-slate-900 pb-2 border-b border-slate-100">
            Submit Passenger Query / Feedback
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Vikram Aditya"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="passenger@example.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Category</label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="PNR / Booking Query">PNR / Berth Allocation Query</option>
                <option value="Cancellation / Refund">Cancellation &amp; Refund Dispensing</option>
                <option value="Dijkstra Route Feedback">Dijkstra Route Suggestion</option>
                <option value="Academic Project Inquiry">College Viva Project Feedback</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Message</label>
              <textarea
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
                placeholder="Describe your query in detail..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow transition"
            >
              Submit Support Request &rarr;
            </button>
          </form>
        </div>

        {/* Academic Project Viva Dossier */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 text-xs">
          <div className="flex items-center gap-2 text-orange-400 font-bold">
            <Award className="w-5 h-5" />
            <span className="text-sm font-extrabold uppercase tracking-wider">College Capstone Dossier</span>
          </div>

          <p className="text-slate-300 leading-relaxed text-[11px]">
            This project demonstrates how canonical Greedy Algorithms solve real-world logistical challenges in national passenger railway systems.
          </p>

          <div className="space-y-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
              <strong className="text-white block font-bold">1. Berth Interval Sharing:</strong>
              <span>Activity Selection algorithm maximizes seat utilization by allowing non-overlapping station journeys on identical berths.</span>
            </div>

            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
              <strong className="text-white block font-bold">2. Platform Contention Management:</strong>
              <span>Interval Partitioning with Min-Heap guarantees minimal platform construction cost at major junctions.</span>
            </div>

            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
              <strong className="text-white block font-bold">3. Dijkstra 30-min Safe Transfers:</strong>
              <span>Enforces minimum physical passenger transfer window at transit junction stations.</span>
            </div>

            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
              <strong className="text-white block font-bold">4. Greedy Matroid Refund:</strong>
              <span>Fewest banknotes computed instantly for cancellation returns.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
