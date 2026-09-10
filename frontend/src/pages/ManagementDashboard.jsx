import React, { useEffect, useState } from 'react';
import { dashboardAPI, crmAPI, financeAPI, trainingAPI, managementAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ASSISTANT_QUESTIONS = [
  { id: '1', label: '1. What needs my attention today?' },
  { id: '2', label: '2. Which customers have outstanding payments?' },
  { id: '3', label: '3. Which invoices are overdue?' },
  { id: '4', label: '4. Which leads need follow-up?' },
  { id: '5', label: '5. Which customers are waiting for trainer assignment?' },
  { id: '6', label: '6. Which batches are currently active?' },
  { id: '7', label: '7. Which batches are most profitable?' },
  { id: '8', label: '8. What is our current revenue?' },
  { id: '9', label: '9. What is our current collection?' },
  { id: '10', label: '10. What is our current outstanding amount?' },
  { id: '11', label: '11. What is our current net profit?' },
];
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function ManagementDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [financialTrend, setFinancialTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Drawers
  const [modalType, setModalType] = useState(null); // 'payment', 'expense'
  const [formData, setFormData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  // Invoice-based payment state
  const [invoicesList, setInvoicesList] = useState([]);
  const [selectedInvoiceInfo, setSelectedInvoiceInfo] = useState(null);
  const [paymentError, setPaymentError] = useState('');

  // Management Assistant State
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [assistantResult, setAssistantResult] = useState(null);
  const [assistantLoading, setAssistantLoading] = useState(false);

  const handleAskAssistant = async (qId) => {
    setActiveQuestion(qId);
    setAssistantLoading(true);
    try {
      const res = await managementAPI.queryAssistant(qId);
      setAssistantResult(res.data);
    } catch (err) {
      console.error('Failed to query assistant', err);
      setAssistantResult({
        question: '',
        summary: 'Error retrieving insights. Management authorization required.',
        highlights: [],
        items: []
      });
    } finally {
      setAssistantLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const resOverview = await dashboardAPI.getOverview();
      setMetrics(resOverview.data);

      const resFin = await dashboardAPI.getFinancial();
      setFinancialTrend(resFin.data.monthly_performance || []);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const openPaymentModal = async () => {
    setFormData({});
    setSelectedInvoiceInfo(null);
    setPaymentError('');
    try {
      const res = await financeAPI.getInvoices();
      // Only show invoices that are not fully paid
      const unpaidInvoices = (res.data || []).filter(inv => inv.status?.toUpperCase() !== 'PAID');
      setInvoicesList(unpaidInvoices);
    } catch (err) {
      console.error('Failed to load invoices', err);
      setInvoicesList([]);
    }
    setModalType('payment');
  };

  const handleInvoiceSelect = async (invoiceId) => {
    if (!invoiceId) {
      setSelectedInvoiceInfo(null);
      setFormData({ ...formData, invoice_id: '' });
      return;
    }
    setFormData({ ...formData, invoice_id: invoiceId });
    try {
      const res = await financeAPI.getInvoicePaymentInfo(invoiceId);
      setSelectedInvoiceInfo(res.data);
      setPaymentError('');
    } catch (err) {
      console.error('Failed to load invoice info', err);
      setSelectedInvoiceInfo(null);
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setPaymentError('');
    try {
      if (modalType === 'payment') {
        const amount = parseFloat(formData.amount || 0);
        if (selectedInvoiceInfo && amount > selectedInvoiceInfo.outstanding) {
          setPaymentError(`Payment cannot exceed the outstanding amount of ₹${selectedInvoiceInfo.outstanding.toLocaleString('en-IN')}.`);
          setActionLoading(false);
          return;
        }
        await financeAPI.recordPayment({
          invoice_id: parseInt(formData.invoice_id),
          amount: amount,
          payment_mode: formData.payment_mode || 'RTGS/NEFT',
          reference_number: formData.reference_number || '',
          payment_date: formData.payment_date || new Date().toISOString().split('T')[0],
          notes: formData.notes || 'Recorded via Management Cockpit'
        });
      } else if (modalType === 'expense') {
        await financeAPI.createExpense({
          category: formData.category || 'Trainer Payout',
          description: formData.description,
          amount: parseFloat(formData.amount || 0),
          expense_date: new Date().toISOString().split('T')[0],
          batch_id: 1,
          paid_via: formData.paid_via || 'Bank Transfer'
        });
      }
      setModalType(null);
      setFormData({});
      setSelectedInvoiceInfo(null);
      await fetchDashboardData(); // Refresh DB calculated metrics
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      if (modalType === 'payment') {
        setPaymentError(detail);
      } else {
        alert('Failed to execute action: ' + detail);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '₹0';
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="flex flex-col w-full space-y-6 pb-12">
      {/* Top Sub-Header & Global Range Filter Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Good morning, {user?.name || 'Admin'}
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Live DB Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Here's your real-time operational & financial executive overview.
          </p>
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl gap-1">
            <button className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900">Today</button>
            <button className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900">This Week</button>
            <button className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#131b2e] text-white shadow-sm font-bold">This Month</button>
            <button className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900">This Quarter</button>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
            <span className="material-symbols-outlined text-[16px] text-blue-600">date_range</span>
            <span>01 Sep - 30 Sep, 2026</span>
          </div>
        </div>
      </div>

      {/* Row 2: 8 Compact Financial & Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {/* Card 1: Leads */}
        <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200/80 hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Leads</span>
            <span className="material-symbols-outlined text-[18px]">person_search</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{metrics?.total_leads ?? 3}</div>
          <div className="text-[10px] font-semibold text-emerald-600 mt-1 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[12px]">trending_up</span>
            <span>+12.4% MoM</span>
          </div>
        </div>

        {/* Card 2: Conversion */}
        <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200/80 hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Conv. Rate</span>
            <span className="material-symbols-outlined text-[18px]">query_stats</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{metrics?.conversion_rate ?? 33.3}%</div>
          <div className="text-[10px] font-semibold text-emerald-600 mt-1 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[12px]">arrow_upward</span>
            <span>+4.2% MoM</span>
          </div>
        </div>

        {/* Card 3: Active Students */}
        <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200/80 hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Students</span>
            <span className="material-symbols-outlined text-[18px]">school</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{metrics?.total_students ?? 50}</div>
          <div className="text-[10px] font-semibold text-emerald-600 mt-1 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[12px]">check_circle</span>
            <span>ABC Batch Enrolled</span>
          </div>
        </div>

        {/* Card 4: Active Batches */}
        <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200/80 hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Batches</span>
            <span className="material-symbols-outlined text-[18px]">layers</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{metrics?.active_batches ?? 1}</div>
          <div className="text-[10px] font-semibold text-slate-500 mt-1">Batch PY-24</div>
        </div>

        {/* Card 5: Revenue */}
        <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200/80 hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Revenue</span>
            <span className="material-symbols-outlined text-[18px]">payments</span>
          </div>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">{formatCurrency(metrics?.total_revenue)}</div>
          <div className="text-[10px] font-semibold text-emerald-600 mt-1">Contract Total</div>
        </div>

        {/* Card 6: Collected */}
        <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200/80 hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Collected</span>
            <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{formatCurrency(metrics?.total_collected)}</div>
          <div className="text-[10px] font-semibold text-emerald-600 mt-1">RTGS Realized</div>
        </div>

        {/* Card 7: Outstanding */}
        <div className="p-4 bg-white rounded-xl shadow-sm border-l-4 border-amber-500 hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800">Outstanding</span>
            <span className="material-symbols-outlined text-[18px]">pending_actions</span>
          </div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{formatCurrency(metrics?.total_outstanding)}</div>
          <div className="text-[10px] font-semibold text-amber-800 mt-1 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[12px]">warning</span>
            <span>Tranche 2 Due</span>
          </div>
        </div>

        {/* Card 8: Net Profit */}
        <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200/80 hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Net Profit</span>
            <span className="material-symbols-outlined text-[18px]">insights</span>
          </div>
          <div className="text-2xl font-extrabold text-indigo-700 mt-1">{formatCurrency(metrics?.net_profit)}</div>
          <div className="text-[10px] font-semibold text-emerald-600 mt-1">
            {metrics?.profit_margin ?? 73.0}% Margin
          </div>
        </div>
      </div>

      {/* MANAGEMENT BUSINESS ASSISTANT — ONLY FOR MANAGEMENT ROLE */}
      {user?.role === 'MANAGEMENT' && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Management Business Assistant
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Executive Cockpit
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Quick answers from your business data
              </p>
            </div>
            {activeQuestion && (
              <button
                onClick={() => { setActiveQuestion(null); setAssistantResult(null); }}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 self-start sm:self-auto px-2 py-1 rounded hover:bg-slate-100 transition"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
                <span>Clear Selection</span>
              </button>
            )}
          </div>

          {/* 11 Predefined Question Chips */}
          <div className="flex flex-wrap gap-2">
            {ASSISTANT_QUESTIONS.map((q) => (
              <button
                key={q.id}
                onClick={() => handleAskAssistant(q.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  activeQuestion === q.id
                    ? 'bg-[#131b2e] text-white border-[#131b2e] shadow-sm font-bold scale-[1.02]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/70 hover:border-slate-300'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Loading Indicator */}
          {assistantLoading && (
            <div className="p-6 bg-slate-50/60 rounded-xl text-center text-xs font-bold text-slate-400 border border-slate-100 flex items-center justify-center gap-2">
              <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
              <span>Querying live database records...</span>
            </div>
          )}

          {/* Active Result View */}
          {!assistantLoading && assistantResult && (
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3.5 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    {assistantResult.question}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                    {assistantResult.summary}
                  </h4>
                </div>
                {assistantResult.highlights && assistantResult.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {assistantResult.highlights.map((h, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${h.badge || 'bg-blue-50 text-blue-700 border-blue-200'}`}
                      >
                        <span>{h.icon}</span>
                        <span>{h.text}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Entity Breakdown List */}
              {assistantResult.items && assistantResult.items.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {assistantResult.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-slate-900 font-bold">
                          {item.entity}
                        </strong>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.current_status}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs">
                        {item.reason}
                      </p>
                      {item.recommended_action && (
                        <div className="flex items-start gap-2 text-xs text-blue-900 bg-blue-50/80 p-2.5 rounded-lg border border-blue-100/80 font-medium">
                          <span className="material-symbols-outlined text-[16px] text-blue-600 shrink-0 mt-0.5">lightbulb</span>
                          <div>
                            <span className="font-bold text-blue-800">Recommended action: </span>
                            <span>{item.recommended_action.replace('Recommended action: ', '')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No breakdown records for this query.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Row 3: Quick Action Bar — No "New Lead" for Finance */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-100 rounded-2xl border border-slate-200/60">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 text-[20px]">bolt</span>
          <span className="text-xs font-bold tracking-wider uppercase text-slate-700">Instant Database Operations:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(user?.role === 'FINANCE' || user?.role === 'MANAGEMENT') && (
            <button
              onClick={openPaymentModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/30 transition"
            >
              <span className="material-symbols-outlined text-[16px]">price_check</span>
              <span>Record Payment (Collect Money)</span>
            </button>
          )}

          {(user?.role === 'FINANCE' || user?.role === 'MANAGEMENT' || user?.role === 'OPERATIONS') && (
            <button
              onClick={() => { setFormData({}); setModalType('expense'); }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <span className="material-symbols-outlined text-[16px]">shopping_cart_checkout</span>
              <span>Add Expense (Outgoing Money)</span>
            </button>
          )}
        </div>
      </div>

      {/* Row 4: Chart & Operational Ledger Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Financial Chart */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Treasury & Profitability</span>
                <h3 className="text-base font-bold text-slate-900">Revenue vs. Realized Cash & Expenses</h3>
              </div>
              <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                Calculated from PostgreSQL
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={financialTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Invoiced Revenue" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="collected" fill="#10b981" name="Realized Payments" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Training Expenses" />
                  <Line type="monotone" dataKey="profit" stroke="#6366f1" strokeWidth={2.5} name="Net Profit" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Master Scenario Case Card */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Flagship Demo Case</span>
                <h3 className="text-base font-bold text-slate-900">ABC Engineering College</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Batch PY-24
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Program / Requirement:</span>
                <span className="font-bold text-slate-900">Python Full Stack Training</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Assigned Trainer:</span>
                <span className="font-bold text-slate-900">Rahul Kumar</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Enrolled Students:</span>
                <span className="font-bold text-slate-900">50 Students (100% Onboarded)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Contract Value:</span>
                <span className="font-bold text-blue-600">₹5,00,000</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Collected Amount:</span>
                <span className="font-bold text-emerald-600">{formatCurrency(metrics?.total_collected)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Outstanding Balance:</span>
                <span className="font-bold text-amber-700">{formatCurrency(metrics?.total_outstanding)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Training Expenses:</span>
                <span className="font-bold text-rose-600">{formatCurrency(metrics?.total_expenses)}</span>
              </div>
              <div className="flex justify-between py-1.5 bg-indigo-50/60 p-2 rounded-xl">
                <span className="text-indigo-900 font-bold">Calculated Net Profit:</span>
                <span className="font-extrabold text-indigo-700 text-sm">{formatCurrency(metrics?.net_profit)} ({metrics?.profit_margin}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC MODALS FOR EXECUTING DATABASE OPERATIONS */}
      {modalType && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {modalType === 'payment' && 'Record Customer Payment (Collected Money)'}
                {modalType === 'expense' && 'Add Training Expense (Outgoing Money)'}
              </h3>
              <button onClick={() => { setModalType(null); setSelectedInvoiceInfo(null); setPaymentError(''); }} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-5 space-y-4 text-xs">
              {modalType === 'payment' && (
                <>
                  {/* Invoice Selector */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Select Invoice *</label>
                    <select
                      required
                      value={formData.invoice_id || ''}
                      onChange={(e) => handleInvoiceSelect(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                    >
                      <option value="">— Choose an invoice —</option>
                      {invoicesList.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.invoice_number} — {inv.customer_name} — ₹{inv.total_amount.toLocaleString('en-IN')} ({inv.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Invoice Info Panel */}
                  {selectedInvoiceInfo && (
                    <div className="p-4 bg-blue-50 rounded-xl space-y-2 border border-blue-200">
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Customer:</span>
                        <span className="font-bold text-slate-900">{selectedInvoiceInfo.customer_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Invoice Number:</span>
                        <span className="font-bold font-mono text-blue-700">{selectedInvoiceInfo.invoice_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Invoice Total:</span>
                        <span className="font-bold text-slate-900">₹{selectedInvoiceInfo.total_amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Already Paid:</span>
                        <span className="font-bold text-emerald-600">₹{selectedInvoiceInfo.paid_amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Current Outstanding:</span>
                        <span className="font-extrabold text-amber-700">₹{selectedInvoiceInfo.outstanding.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Due Date:</span>
                        <span className="font-bold font-mono text-slate-800">{selectedInvoiceInfo.due_date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Status:</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          selectedInvoiceInfo.status?.toUpperCase() === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : selectedInvoiceInfo.status?.toUpperCase() === 'PARTIALLY PAID'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : selectedInvoiceInfo.status?.toUpperCase() === 'OVERDUE'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {selectedInvoiceInfo.status}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Payment Error */}
                  {paymentError && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 font-bold text-xs">
                      ⚠ {paymentError}
                    </div>
                  )}

                  {/* Payment Fields */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Amount Collected (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={selectedInvoiceInfo?.outstanding || undefined}
                      placeholder="100000"
                      value={formData.amount || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setFormData({ ...formData, amount: e.target.value });
                        if (selectedInvoiceInfo && val > selectedInvoiceInfo.outstanding) {
                          setPaymentError(`Payment cannot exceed the outstanding amount of ₹${selectedInvoiceInfo.outstanding.toLocaleString('en-IN')}.`);
                        } else {
                          setPaymentError('');
                        }
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-emerald-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Payment Mode</label>
                      <select
                        value={formData.payment_mode || 'RTGS/NEFT'}
                        onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                      >
                        <option value="RTGS/NEFT">RTGS / NEFT Transfer</option>
                        <option value="UPI">UPI / Digital</option>
                        <option value="Cheque">Corporate Cheque</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Payment Date</label>
                      <input
                        type="date"
                        value={formData.payment_date || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">UTR / Reference Number</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC992817261"
                      value={formData.reference_number || ''}
                      onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>
                </>
              )}

              {modalType === 'expense' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category *</label>
                    <select
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                    >
                      <option value="Trainer Payout">Trainer Payout</option>
                      <option value="Venue & Infrastructure">Venue & Infrastructure</option>
                      <option value="Material & Software">Material & Software</option>
                      <option value="Travel & Accommodation">Travel & Accommodation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Description *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Guest Faculty Honorarium"
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="15000"
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-rose-600"
                    />
                  </div>
                </>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setModalType(null); setSelectedInvoiceInfo(null); setPaymentError(''); }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || (modalType === 'payment' && !!paymentError)}
                  className={`px-5 py-2 rounded-xl text-white font-bold shadow-md ${
                    actionLoading || (modalType === 'payment' && !!paymentError)
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
                  }`}
                >
                  {actionLoading ? 'Executing...' : 'Save to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
