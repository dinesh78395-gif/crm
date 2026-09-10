import React, { useEffect, useState } from 'react';
import { trainingAPI } from '../services/api';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trainingAPI.getPrograms()
      .then((res) => setPrograms(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Courses & Training Programs</h1>
          <p className="text-xs text-slate-500 mt-1">Manage EduTech curriculum catalog, session counts and student pricing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {programs.map((prog) => (
          <div key={prog.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-blue-600 px-2 py-0.5 rounded bg-blue-50">
                {prog.program_code}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {prog.category}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">{prog.title}</h3>

            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Duration</span>
                <span className="font-bold text-slate-800">{prog.duration_hours} Hours</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Sessions</span>
                <span className="font-bold text-slate-800">{prog.total_sessions} Sessions</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Price / Head</span>
                <span className="font-bold text-blue-600">₹{prog.price_per_student.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
