import React, { useEffect, useState } from 'react';
import { trainingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PendingAssignmentsPage() {
  const { user } = useAuth();
  const [pendingList, setPendingList] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedTrainerId, setSelectedTrainerId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const canAssign = user?.role === 'OPERATIONS' || user?.role === 'MANAGEMENT';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pendingRes, trainersRes] = await Promise.all([
        trainingAPI.getPendingAssignments(),
        trainingAPI.getTrainers()
      ]);
      setPendingList(pendingRes.data || []);
      setTrainers(trainersRes.data || []);
    } catch (err) {
      console.error('Failed to load pending assignments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAssignModal = (item) => {
    setSelectedItem(item);
    setSelectedTrainerId(trainers[0]?.id ? String(trainers[0].id) : '');
    setAssignmentSuccess(null);
    setErrorMsg('');
  };

  const closeAssignModal = () => {
    setSelectedItem(null);
    setSelectedTrainerId('');
    setAssignmentSuccess(null);
    setErrorMsg('');
  };

  const handleAssignTrainer = async (e) => {
    e.preventDefault();
    if (!selectedTrainerId) {
      setErrorMsg('Please select a trainer.');
      return;
    }

    try {
      setAssignLoading(true);
      setErrorMsg('');
      const res = await trainingAPI.assignTrainer(selectedItem.batch_id, {
        trainer_id: parseInt(selectedTrainerId)
      });
      setAssignmentSuccess(res.data);
      // Refresh pending list
      fetchData();
    } catch (err) {
      console.error('Assignment failed', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to assign trainer.');
    } finally {
      setAssignLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const val = Number(amount || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Pending Trainer Assignment
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Operations & Management Handoff
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Converted training deals and client cohorts awaiting faculty allocation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            Pending Cohorts: <strong className="text-slate-900">{pendingList.length}</strong>
          </span>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl text-center text-xs font-bold text-slate-500 shadow-sm border border-slate-200/80">
          Loading pending assignments...
        </div>
      ) : pendingList.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl text-center shadow-sm border border-slate-200/80 space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900">All Batches Assigned!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are no customer programs currently waiting for trainer assignment. Converted deals from Sales will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {pendingList.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-4 hover:border-blue-300 transition"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {item.customer_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {item.batch_code}
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs font-medium text-slate-600">
                      {item.program_title}
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  {item.status}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-50/80 rounded-xl text-xs border border-slate-100">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Students</span>
                  <span className="font-bold text-slate-800">{item.students}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Contract Value</span>
                  <span className="font-bold text-slate-900">{formatCurrency(item.contract_value)}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Won Date</span>
                  <span className="font-semibold text-slate-700">{item.won_date}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Start Date</span>
                  <span className="font-mono font-medium text-slate-700">{item.start_date || 'TBD'}</span>
                </div>
              </div>

              {/* Requirement Note */}
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-slate-400">info</span>
                <span>Requirement: <strong className="text-slate-700">{item.required_training}</strong></span>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Location: <strong className="text-slate-600">{item.preferred_location}</strong>
                </span>
                {canAssign && (
                  <button
                    onClick={() => openAssignModal(item)}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    <span>Assign Trainer</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ASSIGN TRAINER MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Assign Faculty Trainer
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Allocate a qualified trainer for this customer training cohort.
                </p>
              </div>
              <button
                onClick={closeAssignModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {assignmentSuccess ? (
              /* Success State */
              <div className="space-y-4 py-2">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    <span>Trainer Successfully Assigned!</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Trainer</span>
                      <strong className="text-slate-900">{assignmentSuccess.trainer_name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Status</span>
                      <strong className="text-emerald-700">{assignmentSuccess.status}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Batch</span>
                      <strong className="font-mono text-blue-600">{assignmentSuccess.batch_code}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Customer</span>
                      <strong className="text-slate-900">{assignmentSuccess.customer_name}</strong>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <button
                    onClick={closeAssignModal}
                    className="bg-[#131b2e] hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Assignment Form */
              <form onSubmit={handleAssignTrainer} className="space-y-4">
                {/* Cohort Overview Card */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Customer:</span>
                    <strong className="text-slate-900">{selectedItem.customer_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Program:</span>
                    <strong className="text-slate-900">{selectedItem.program_title}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Number of Students:</span>
                    <strong className="text-blue-600">{selectedItem.students} Students</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Required Training:</span>
                    <span className="text-slate-800 font-medium">{selectedItem.required_training}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Start Date:</span>
                    <span className="font-mono text-slate-800">{selectedItem.start_date || '2026-09-15'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Preferred Location:</span>
                    <span className="text-slate-800">{selectedItem.preferred_location}</span>
                  </div>
                </div>

                {/* Trainer Selection Dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Select Trainer <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedTrainerId}
                    onChange={(e) => setSelectedTrainerId(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Select Trainer...</option>
                    {trainers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.expertise || 'Faculty'})
                      </option>
                    ))}
                  </select>
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeAssignModal}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assignLoading}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
                  >
                    {assignLoading ? 'Assigning...' : 'Assign Trainer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
