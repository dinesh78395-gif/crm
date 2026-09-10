import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { crmAPI } from '../services/api';

export default function Customer360Page() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    crmAPI.getCustomer360(id || 1)
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-xs font-bold text-slate-500">Loading Customer 360 Traceability Data...</div>;
  }

  if (!data) return <div className="p-8 text-center text-xs text-red-500 font-bold">Customer records not found.</div>;

  const { customer, lead, batches, invoices, payments, expenses, financial_summary } = data;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {customer.customer_code}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
              {customer.category}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{customer.name}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Contact: {customer.contact_person} • {customer.email} • {customer.phone}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-right">
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Contract Value</p>
            <p className="text-xl font-extrabold text-blue-600">₹{(financial_summary.total_invoiced || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-right">
            <p className="text-[10px] uppercase font-bold text-emerald-700">Calculated Net Profit</p>
            <p className="text-xl font-extrabold text-emerald-700">
              ₹{(financial_summary.net_profit || 0).toLocaleString('en-IN')} ({financial_summary.profit_margin}%)
            </p>
          </div>
        </div>
      </div>

      {/* Traceability Flow Pipeline Bar */}
      <div className="bg-[#060B17] text-white p-5 rounded-2xl shadow-md border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          End-to-End Relational Data Chain (Single Source of Truth)
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-white/10 text-slate-200">Enquiry: {lead?.lead_code || 'LD-1024'}</span>
          <span className="text-slate-500">→</span>
          <span className="px-2.5 py-1 rounded bg-white/10 text-slate-200">Customer: {customer.customer_code}</span>
          <span className="text-slate-500">→</span>
          <span className="px-2.5 py-1 rounded bg-white/10 text-slate-200">Batch: PY-24</span>
          <span className="text-slate-500">→</span>
          <span className="px-2.5 py-1 rounded bg-white/10 text-slate-200">Students: 50 Enrolled</span>
          <span className="text-slate-500">→</span>
          <span className="px-2.5 py-1 rounded bg-white/10 text-slate-200">Invoices: ₹5,00,000</span>
          <span className="text-slate-500">→</span>
          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
            Profit: ₹3,65,000
          </span>
        </div>
      </div>

      {/* Grid: Training Operations & Financial Traceability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Training & Batches */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
            <span className="material-symbols-outlined text-[18px] text-blue-600">layers</span>
            <span>Assigned Training Cohorts & Batches</span>
          </h3>

          <div className="space-y-3">
            {batches.map((b) => (
              <div key={b.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-600 font-mono text-sm">{b.batch_code}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    {b.status}
                  </span>
                </div>
                <p className="font-bold text-slate-900">{b.program_title}</p>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>Trainer: <span className="font-semibold text-slate-800">{b.trainer_name}</span></div>
                  <div>Enrolled: <span className="font-semibold text-slate-800">{b.total_enrolled} Students</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Ledgers */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">account_balance_wallet</span>
            <span>Billing, Inflows & Expense Ledger</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-bold text-slate-800 border-b pb-1">
                <span>Invoices Issued ({invoices.length})</span>
                <span>₹{(financial_summary.total_invoiced || 0).toLocaleString('en-IN')}</span>
              </div>
              {invoices.map((inv) => (
                <div key={inv.id} className="flex justify-between text-slate-600">
                  <span>{inv.invoice_number} ({inv.status})</span>
                  <span className="font-mono">₹{inv.total_amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1.5">
              <div className="flex justify-between font-bold text-emerald-900 border-b border-emerald-200 pb-1">
                <span>Realized Collections ({payments.length})</span>
                <span>₹{(financial_summary.total_collected || 0).toLocaleString('en-IN')}</span>
              </div>
              {payments.map((p) => (
                <div key={p.id} className="flex justify-between text-emerald-800">
                  <span>{p.receipt_number} ({p.payment_mode})</span>
                  <span className="font-mono font-bold">₹{p.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 space-y-1.5">
              <div className="flex justify-between font-bold text-rose-900 border-b border-rose-200 pb-1">
                <span>Direct Training Expenses ({expenses.length})</span>
                <span>₹{(financial_summary.total_expenses || 0).toLocaleString('en-IN')}</span>
              </div>
              {expenses.map((e) => (
                <div key={e.id} className="flex justify-between text-rose-800">
                  <span>{e.expense_code}: {e.description}</span>
                  <span className="font-mono font-bold">₹{e.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
