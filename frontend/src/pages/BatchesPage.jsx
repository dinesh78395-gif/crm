import React, { useEffect, useState } from 'react';
import { trainingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BatchesPage() {
  const { user } = useAuth();
  const isTrainer = user?.role === 'TRAINER';

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatchDetail, setSelectedBatchDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    trainingAPI.getBatches()
      .then((res) => {
        setBatches(res.data);
        const params = new URLSearchParams(window.location.search);
        const qBatchId = params.get('batchId') || params.get('id');
        if (qBatchId) {
          handleOpenDetail(parseInt(qBatchId));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleOpenDetail = async (batchId) => {
    try {
      setLoadingDetail(true);
      const res = await trainingAPI.getBatchDetail(batchId);
      setSelectedBatchDetail(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isTrainer ? 'My Batches' : 'Training Cohorts & Batches'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isTrainer ? 'Batches assigned specifically to you' : 'Manage active batch schedules, assigned faculty and student enrollments.'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-8 rounded-2xl text-center text-xs font-bold text-slate-500">Loading batches...</div>
      ) : batches.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl text-center text-xs font-bold text-slate-500">No batches assigned.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((b) => (
            <div
              key={b.id}
              onClick={() => handleOpenDetail(b.id)}
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-3 cursor-pointer hover:border-blue-300 hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-600 px-2.5 py-0.5 rounded bg-blue-50">
                  {b.batch_code}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {b.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">{b.program_title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Client: <span className="font-semibold text-slate-800">{b.customer_name}</span></p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Faculty:</span>
                  <span className="font-bold text-slate-900">{b.trainer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Enrolled:</span>
                  <span className="font-bold text-blue-600">{b.total_enrolled} Students</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="font-semibold text-slate-800">{b.location || 'Campus Tech Lab'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Start Date:</span>
                  <span className="font-mono font-medium">{b.start_date}</span>
                </div>
              </div>

              <div className="text-right text-[11px] font-bold text-blue-600 flex items-center justify-end gap-1 pt-1">
                <span>View Batch Details</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BATCH DETAIL MODAL */}
      {selectedBatchDetail && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {selectedBatchDetail.batch_code}
                  </span>
                  <h3 className="font-bold text-base text-slate-900">{selectedBatchDetail.program_title}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">Client / College: <span className="font-bold text-slate-800">{selectedBatchDetail.customer_name}</span></p>
              </div>
              <button
                onClick={() => setSelectedBatchDetail(null)}
                className="text-slate-400 font-bold hover:text-slate-700 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Batch Metadata Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/70">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Trainer</span>
                <span className="font-bold text-slate-800 text-xs">{selectedBatchDetail.trainer_name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Students</span>
                <span className="font-bold text-blue-600 text-xs">{selectedBatchDetail.total_enrolled} Enrolled</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Dates</span>
                <span className="font-mono font-medium text-slate-800 text-[11px]">{selectedBatchDetail.start_date} to {selectedBatchDetail.end_date || 'TBD'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Location</span>
                <span className="font-bold text-slate-800 text-xs">{selectedBatchDetail.location}</span>
              </div>
            </div>

            {/* Training Sessions List */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Scheduled Training Sessions</h4>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Session</th>
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Topic</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {selectedBatchDetail.sessions?.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-blue-600">Session {s.session_number}</td>
                        <td className="p-3 font-mono text-slate-600">
                          {s.session_date} <span className="text-[10px] text-slate-400">({s.start_time} - {s.end_time})</span>
                        </td>
                        <td className="p-3 font-bold text-slate-900">{s.topic}</td>
                        <td className="p-3 text-slate-600">{s.location}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            s.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Enrolled Students Roster Preview */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Enrolled Student Roster ({selectedBatchDetail.students?.length || 0})</h4>
              <div className="bg-white rounded-xl border border-slate-200 max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="p-2.5">Student ID</th>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">Institution</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {selectedBatchDetail.students?.map((std) => (
                      <tr key={std.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono font-bold text-blue-600">{std.student_code}</td>
                        <td className="p-2.5 font-bold text-slate-900">{std.name}</td>
                        <td className="p-2.5 text-slate-600">{std.email}</td>
                        <td className="p-2.5 text-slate-700">{std.college_company}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {std.status}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            (std.attendance_percentage ?? 100) >= 80
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {std.attendance_percentage !== undefined && std.attendance_percentage !== null ? `${std.attendance_percentage}%` : '100%'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedBatchDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
