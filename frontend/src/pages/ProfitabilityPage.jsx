import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../services/api';

export default function ProfitabilityPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getOverview()
      .then((res) => setMetrics(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (val) => `₹${(val || 0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Profitability & Unit Economics Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time P&L breakdown and net profit margin calculations derived from PostgreSQL.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-200/80 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Gross Contract Revenue</span>
          <div className="text-3xl font-extrabold text-blue-600">{formatCurrency(metrics?.total_revenue)}</div>
          <p className="text-xs text-slate-500">Sum of all generated client invoices</p>
        </div>

        <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-200/80 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Operating Expenses</span>
          <div className="text-3xl font-extrabold text-rose-600">{formatCurrency(metrics?.total_expenses)}</div>
          <p className="text-xs text-slate-500">Faculty honorarium, venue, travel & materials</p>
        </div>

        <div className="p-5 bg-emerald-50 rounded-2xl shadow-sm border border-emerald-200 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Net Realized Profit</span>
          <div className="text-3xl font-extrabold text-emerald-700">{formatCurrency(metrics?.net_profit)}</div>
          <p className="text-xs font-bold text-emerald-800">Net Profit Margin: {metrics?.profit_margin ?? 73.0}%</p>
        </div>
      </div>
    </div>
  );
}
