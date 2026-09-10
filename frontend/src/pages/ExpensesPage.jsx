import React, { useEffect, useState } from 'react';
import { financeAPI } from '../services/api';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    financeAPI.getExpenses()
      .then((res) => setExpenses(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Expenses Management & Operating Cost Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">Track trainer payouts, venue costs, software licenses and travel logistics.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Expense Code</th>
                <th className="p-4">Category</th>
                <th className="p-4">Description</th>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Paid Via</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 font-mono font-bold text-rose-600">{exp.expense_code}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {exp.category}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-900">{exp.description}</td>
                  <td className="p-4 font-mono text-slate-600">{exp.expense_date}</td>
                  <td className="p-4 font-bold text-rose-600">₹{exp.amount.toLocaleString('en-IN')}</td>
                  <td className="p-4 font-semibold text-slate-700">{exp.paid_via}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
