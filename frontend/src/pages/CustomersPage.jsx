import React, { useEffect, useState } from 'react';
import { crmAPI } from '../services/api';
import { Link } from 'react-router-dom';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    crmAPI.getCustomers()
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Active Customers & Corporate Accounts</h1>
          <p className="text-xs text-slate-500 mt-1">View converted client accounts and access 360-degree operational traceability.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((cust) => (
          <div key={cust.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-600 px-2 py-0.5 rounded bg-blue-50">
                  {cust.customer_code}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {cust.category}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{cust.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{cust.contact_person}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{cust.email}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Active Contract
              </span>
              <Link
                to={`/customers/${cust.id}/360`}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#131b2e] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <span>Customer 360</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
