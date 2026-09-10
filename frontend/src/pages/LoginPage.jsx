import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  UserCheck,
  GraduationCap,
  FileText,
  CreditCard,
  TrendingUp,
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('amit.saxena@eduflow.ai');
  const [password, setPassword] = useState('DemoAdmin2024!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials or use demo options below.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (roleEmail, rolePassword = 'DemoAdmin2024!') => {
    setEmail(roleEmail);
    setPassword(rolePassword);
    setError(null);
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col justify-between antialiased selection:bg-blue-100 selection:text-blue-900 font-sans">
      <main className="flex-1 w-full flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
          
          {/* LEFT / BRANDING PANEL (Dark Navy Enterprise Section) */}
          <section className="lg:col-span-5 bg-[#060B17] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden grid-pattern">
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
              {/* Logo & Platform Badge with Entrance Animation */}
              <div
                className="eduflow-brand-entrance"
                style={{
                  animation: 'eduflowBrandEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both',
                }}
              >
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 ring-1 ring-white/20">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                        <line x1="12" y1="22.08" x2="12" y2="12"/>
                      </svg>
                    </div>
                    <div>
                      <span className="text-2xl font-extrabold tracking-tight text-white flex items-center">
                        Edu<span className="text-blue-400">Flow</span>
                      </span>
                      <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Enterprise Suite</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    v2.4 Live
                  </span>
                </div>

                {/* Value Proposition */}
                <div className="space-y-3 max-w-md">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Single Connected Data Fabric
                  </div>
                  
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                    One platform for the complete EduTech business lifecycle.
                  </h1>
                  
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                    Manage sales, training, students, billing and profitability in one connected platform.
                  </p>
                </div>
              </div>

              {/* Connected Business Lifecycle Animation */}
              <div className="mt-6 pt-5 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                    Connected Business Lifecycle
                  </p>
                  <span className="text-[10px] font-mono text-blue-300/80 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    Live Pipeline
                  </span>
                </div>

                <div className="space-y-0.5">
                  {/* 1. ENQUIRY NODE */}
                  <div
                    className="eduflow-node relative flex items-center gap-2.5 group"
                    style={{
                      animation: 'eduflowNodeEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both, eduflowSubtleFloat 5s ease-in-out 1.6s infinite',
                    }}
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-sm shadow-blue-500/20 group-hover:bg-blue-500/25 transition-colors">
                      <MessageSquare className="w-3 h-3" />
                    </div>
                    <div className="flex-1 flex items-center justify-between px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 group-hover:border-blue-500/40 group-hover:bg-white/[0.07] transition-all">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold tracking-wider text-white">ENQUIRY</span>
                        <span className="text-[10px] text-slate-400 font-normal">Inbound Demand</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        01
                      </span>
                    </div>
                  </div>

                  {/* Connector 1 */}
                  <div
                    className="eduflow-line flex items-center h-2 ml-3"
                    style={{
                      animation: 'eduflowLineGrow 0.35s cubic-bezier(0.16, 1, 0.3, 1) 0.40s both',
                      transformOrigin: 'top',
                    }}
                  >
                    <div className="w-[1.5px] h-full bg-white/15 relative overflow-hidden rounded-full">
                      <div
                        className="eduflow-beam absolute inset-x-0 w-full h-full bg-gradient-to-b from-blue-400 via-sky-300 to-transparent"
                        style={{
                          animation: 'eduflowBeamFlow 2.8s cubic-bezier(0.4, 0, 0.6, 1) 1.6s infinite',
                        }}
                      />
                    </div>
                    <span className="ml-3 text-[9px] text-slate-500/80 font-mono select-none">↓</span>
                  </div>

                  {/* 2. CUSTOMER NODE */}
                  <div
                    className="eduflow-node relative flex items-center gap-2.5 group"
                    style={{
                      animation: 'eduflowNodeEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.45s both, eduflowSubtleFloat 5s ease-in-out 1.8s infinite',
                    }}
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-sm shadow-blue-500/20 group-hover:bg-blue-500/25 transition-colors">
                      <UserCheck className="w-3 h-3" />
                    </div>
                    <div className="flex-1 flex items-center justify-between px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 group-hover:border-blue-500/40 group-hover:bg-white/[0.07] transition-all">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold tracking-wider text-white">CUSTOMER</span>
                        <span className="text-[10px] text-slate-400 font-normal">Deal Converted</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        02
                      </span>
                    </div>
                  </div>

                  {/* Connector 2 */}
                  <div
                    className="eduflow-line flex items-center h-2 ml-3"
                    style={{
                      animation: 'eduflowLineGrow 0.35s cubic-bezier(0.16, 1, 0.3, 1) 0.60s both',
                      transformOrigin: 'top',
                    }}
                  >
                    <div className="w-[1.5px] h-full bg-white/15 relative overflow-hidden rounded-full">
                      <div
                        className="eduflow-beam absolute inset-x-0 w-full h-full bg-gradient-to-b from-blue-400 via-sky-300 to-transparent"
                        style={{
                          animation: 'eduflowBeamFlow 2.8s cubic-bezier(0.4, 0, 0.6, 1) 1.9s infinite',
                        }}
                      />
                    </div>
                    <span className="ml-3 text-[9px] text-slate-500/80 font-mono select-none">↓</span>
                  </div>

                  {/* 3. TRAINING NODE */}
                  <div
                    className="eduflow-node relative flex items-center gap-2.5 group"
                    style={{
                      animation: 'eduflowNodeEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.65s both, eduflowSubtleFloat 5s ease-in-out 2.0s infinite',
                    }}
                  >
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-sm shadow-indigo-500/20 group-hover:bg-indigo-500/25 transition-colors">
                      <GraduationCap className="w-3 h-3" />
                    </div>
                    <div className="flex-1 flex items-center justify-between px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 group-hover:border-indigo-500/40 group-hover:bg-white/[0.07] transition-all">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold tracking-wider text-white">TRAINING</span>
                        <span className="text-[10px] text-slate-400 font-normal">Active Batches</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        03
                      </span>
                    </div>
                  </div>

                  {/* Connector 3 */}
                  <div
                    className="eduflow-line flex items-center h-2 ml-3"
                    style={{
                      animation: 'eduflowLineGrow 0.35s cubic-bezier(0.16, 1, 0.3, 1) 0.80s both',
                      transformOrigin: 'top',
                    }}
                  >
                    <div className="w-[1.5px] h-full bg-white/15 relative overflow-hidden rounded-full">
                      <div
                        className="eduflow-beam absolute inset-x-0 w-full h-full bg-gradient-to-b from-indigo-400 via-sky-300 to-transparent"
                        style={{
                          animation: 'eduflowBeamFlow 2.8s cubic-bezier(0.4, 0, 0.6, 1) 2.2s infinite',
                        }}
                      />
                    </div>
                    <span className="ml-3 text-[9px] text-slate-500/80 font-mono select-none">↓</span>
                  </div>

                  {/* 4. INVOICE NODE */}
                  <div
                    className="eduflow-node relative flex items-center gap-2.5 group"
                    style={{
                      animation: 'eduflowNodeEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.85s both, eduflowSubtleFloat 5s ease-in-out 2.2s infinite',
                    }}
                  >
                    <div className="w-6 h-6 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 shadow-sm shadow-sky-500/20 group-hover:bg-sky-500/25 transition-colors">
                      <FileText className="w-3 h-3" />
                    </div>
                    <div className="flex-1 flex items-center justify-between px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 group-hover:border-sky-500/40 group-hover:bg-white/[0.07] transition-all">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold tracking-wider text-white">INVOICE</span>
                        <span className="text-[10px] text-slate-400 font-normal">Billing Issued</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                        04
                      </span>
                    </div>
                  </div>

                  {/* Connector 4 */}
                  <div
                    className="eduflow-line flex items-center h-2 ml-3"
                    style={{
                      animation: 'eduflowLineGrow 0.35s cubic-bezier(0.16, 1, 0.3, 1) 1.00s both',
                      transformOrigin: 'top',
                    }}
                  >
                    <div className="w-[1.5px] h-full bg-white/15 relative overflow-hidden rounded-full">
                      <div
                        className="eduflow-beam absolute inset-x-0 w-full h-full bg-gradient-to-b from-sky-400 via-teal-300 to-transparent"
                        style={{
                          animation: 'eduflowBeamFlow 2.8s cubic-bezier(0.4, 0, 0.6, 1) 2.5s infinite',
                        }}
                      />
                    </div>
                    <span className="ml-3 text-[9px] text-slate-500/80 font-mono select-none">↓</span>
                  </div>

                  {/* 5. PAYMENT NODE */}
                  <div
                    className="eduflow-node relative flex items-center gap-2.5 group"
                    style={{
                      animation: 'eduflowNodeEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1) 1.05s both, eduflowSubtleFloat 5s ease-in-out 2.4s infinite',
                    }}
                  >
                    <div className="w-6 h-6 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 shadow-sm shadow-teal-500/20 group-hover:bg-teal-500/25 transition-colors">
                      <CreditCard className="w-3 h-3" />
                    </div>
                    <div className="flex-1 flex items-center justify-between px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 group-hover:border-teal-500/40 group-hover:bg-white/[0.07] transition-all">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold tracking-wider text-white">PAYMENT</span>
                        <span className="text-[10px] text-slate-400 font-normal">Cash Collected</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                        05
                      </span>
                    </div>
                  </div>

                  {/* Connector 5 */}
                  <div
                    className="eduflow-line flex items-center h-2 ml-3"
                    style={{
                      animation: 'eduflowLineGrow 0.35s cubic-bezier(0.16, 1, 0.3, 1) 1.20s both',
                      transformOrigin: 'top',
                    }}
                  >
                    <div className="w-[1.5px] h-full bg-white/15 relative overflow-hidden rounded-full">
                      <div
                        className="eduflow-beam absolute inset-x-0 w-full h-full bg-gradient-to-b from-teal-400 via-emerald-400 to-transparent"
                        style={{
                          animation: 'eduflowBeamFlow 2.8s cubic-bezier(0.4, 0, 0.6, 1) 2.8s infinite',
                        }}
                      />
                    </div>
                    <span className="ml-3 text-[9px] text-slate-500/80 font-mono select-none">↓</span>
                  </div>

                  {/* 6. PROFITABILITY NODE */}
                  <div
                    className="eduflow-node relative flex items-center gap-2.5 group"
                    style={{
                      animation: 'eduflowNodeEntrance 0.45s cubic-bezier(0.16, 1, 0.3, 1) 1.25s both, eduflowSubtleFloat 5s ease-in-out 2.6s infinite, eduflowProfitGlow 3s ease-in-out 1.7s infinite',
                    }}
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm shadow-emerald-500/20 group-hover:bg-emerald-500/25 transition-colors">
                      <TrendingUp className="w-3 h-3" />
                    </div>
                    <div className="flex-1 flex items-center justify-between px-2.5 py-1 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/30 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/[0.12] transition-all">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold tracking-wider text-emerald-300">PROFITABILITY</span>
                        <span className="text-[10px] text-emerald-200/80 font-normal">Realized Margin</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                        06 • ROI
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span>99.98% High-Availability ERP</span>
              </div>
              <span className="font-mono text-slate-400">SOC2 Type II • ISO 27001</span>
            </div>
          </section>

          {/* RIGHT / LOGIN FORM SECTION */}
          <section className="lg:col-span-7 bg-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between">
            <div
              className="max-w-md w-full mx-auto my-auto eduflow-form-entrance"
              style={{
                animation: 'eduflowFormEntrance 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both',
              }}
            >
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Sign in to your account
                </h2>
                <p className="text-sm text-slate-500 mt-2">
                  Select a corporate role or enter credentials to access your EduFlow cockpit.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-semibold text-red-900">Authentication error</p>
                    <p className="text-xs text-red-700 mt-0.5">{error}</p>
                  </div>
                  <button onClick={() => setError(null)} className="text-red-400 hover:text-red-700 text-sm font-semibold">✕</button>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Work Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 hover:bg-white text-slate-900 text-sm rounded-xl border border-slate-300 transition-all custom-ring font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 hover:bg-white text-slate-900 text-sm rounded-xl border border-slate-300 transition-all custom-ring font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <span>Sign In to Dashboard →</span>
                  )}
                </button>
              </form>

              {/* DEMO ROLES AUTO-FILL HELPER */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Hackathon Role Profiles (Click to Auto-fill)
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => fillDemo('amit.saxena@eduflow.ai')}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-left transition"
                  >
                    <span className="font-bold block text-slate-800">Management / Ops</span>
                    <span className="text-[10px] text-slate-500">amit.saxena@eduflow.ai</span>
                  </button>

                  <button
                    onClick={() => fillDemo('sales@eduflow.ai')}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-left transition"
                  >
                    <span className="font-bold block text-slate-800">Sales Role</span>
                    <span className="text-[10px] text-slate-500">sales@eduflow.ai</span>
                  </button>

                  <button
                    onClick={() => fillDemo('rahul.kumar@eduflow.ai')}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-left transition"
                  >
                    <span className="font-bold block text-slate-800">Trainer Role</span>
                    <span className="text-[10px] text-slate-500">rahul.kumar@eduflow.ai</span>
                  </button>

                  <button
                    onClick={() => fillDemo('finance@eduflow.ai')}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-left transition"
                  >
                    <span className="font-bold block text-slate-800">Finance Role</span>
                    <span className="text-[10px] text-slate-500">finance@eduflow.ai</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
