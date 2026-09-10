import React, { useEffect, useState } from 'react';
import { trainingAPI } from '../services/api';

export default function TrainersPage() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trainingAPI.getTrainers()
      .then((res) => setTrainers(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Faculty & Trainers Management</h1>
          <p className="text-xs text-slate-500 mt-1">Faculty directory, technical expertise and per-session compensation rates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trainers.map((t) => (
          <div key={t.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-blue-600 px-2 py-0.5 rounded bg-blue-50">
                {t.trainer_code}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                {t.status}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{t.name}</h3>
              <p className="text-xs text-slate-500">{t.email} • {t.phone}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Expertise</span>
              <p className="font-semibold text-slate-800">{t.expertise}</p>
              <div className="pt-1 text-slate-600">
                Session Honorarium: <span className="font-bold text-emerald-600">₹{t.per_session_rate.toLocaleString('en-IN')}/session</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
