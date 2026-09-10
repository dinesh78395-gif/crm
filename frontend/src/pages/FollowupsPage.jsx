import React, { useEffect, useState } from 'react';
import { crmAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function FollowupsPage() {
  const [data, setData] = useState({ summary: {}, items: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'HIGH', 'TODAY', 'OVERDUE', 'UPCOMING'
  const [selectedFollowup, setSelectedFollowup] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeForm, setCompleteForm] = useState({
    outcome: '',
    notes: '',
    next_action: '',
    next_followup_date: '',
    next_followup_time: '10:00 AM',
    updated_lead_status: ''
  });

  const navigate = useNavigate();

  const fetchFollowups = async () => {
    try {
      setLoading(true);
      const res = await crmAPI.getFollowups();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load follow-ups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowups();
  }, []);

  const handleOpenCompleteModal = (item) => {
    setSelectedFollowup(item);
    setCompleteForm({
      outcome: '',
      notes: '',
      next_action: item.next_action || '',
      next_followup_date: '',
      next_followup_time: '10:00 AM',
      updated_lead_status: item.lead_status || 'NEGOTIATION'
    });
    setShowCompleteModal(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFollowup) return;
    try {
      await crmAPI.completeFollowup(selectedFollowup.id, completeForm);
      setShowCompleteModal(false);
      fetchFollowups();
    } catch (err) {
      alert('Failed to complete follow-up');
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LOW':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getLeadStatusBadgeClass = (status) => {
    switch (status) {
      case 'WON':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'NEGOTIATION':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'PROPOSAL_SENT':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'QUALIFIED':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'CONTACTED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'LOST':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'NEW':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const items = data.items || [];
  const summary = data.summary || {};

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredItems = items.filter((item) => {
    if (activeTab === 'HIGH') return item.priority === 'HIGH' && item.status === 'PENDING';
    if (activeTab === 'TODAY') return item.followup_date === todayStr && item.status === 'PENDING';
    if (activeTab === 'OVERDUE') return item.followup_date < todayStr && item.status === 'PENDING';
    if (activeTab === 'UPCOMING') return item.followup_date > todayStr && item.status === 'PENDING';
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Actionable Sales Follow-ups</h1>
          <p className="text-xs text-slate-500 mt-1">
            "Who should I contact next, when should I contact them, and why?"
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/leads')}
            className="flex items-center gap-1 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            <span className="material-symbols-outlined text-[18px]">list</span>
            <span>View All Leads</span>
          </button>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Priority Calls */}
        <div 
          onClick={() => setActiveTab('HIGH')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeTab === 'HIGH' ? 'bg-red-500/10 border-red-500 shadow-md' : 'bg-white border-slate-200/80 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority Calls</span>
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{summary.priority_calls || 0}</span>
            <span className="text-[10px] text-red-600 font-semibold">High Priority Action</span>
          </div>
        </div>

        {/* Due Today */}
        <div 
          onClick={() => setActiveTab('TODAY')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeTab === 'TODAY' ? 'bg-blue-500/10 border-blue-500 shadow-md' : 'bg-white border-slate-200/80 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Due Today</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">today</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{summary.due_today || 0}</span>
            <span className="text-[10px] text-blue-600 font-semibold">Scheduled for Today</span>
          </div>
        </div>

        {/* Overdue */}
        <div 
          onClick={() => setActiveTab('OVERDUE')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeTab === 'OVERDUE' ? 'bg-amber-500/10 border-amber-500 shadow-md' : 'bg-white border-slate-200/80 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overdue</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">history</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{summary.overdue || 0}</span>
            <span className="text-[10px] text-amber-600 font-semibold">Needs Follow-up</span>
          </div>
        </div>

        {/* Upcoming */}
        <div 
          onClick={() => setActiveTab('UPCOMING')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeTab === 'UPCOMING' ? 'bg-emerald-500/10 border-emerald-500 shadow-md' : 'bg-white border-slate-200/80 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">event</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{summary.upcoming || 0}</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Scheduled Next Days</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { key: 'ALL', label: 'All Active Follow-ups' },
          { key: 'HIGH', label: `🔥 High Priority (${summary.priority_calls || 0})` },
          { key: 'TODAY', label: `📌 Due Today (${summary.due_today || 0})` },
          { key: 'OVERDUE', label: `⚠️ Overdue (${summary.overdue || 0})` },
          { key: 'UPCOMING', label: `🗓️ Upcoming (${summary.upcoming || 0})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === tab.key
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Followups Workspace Cards List */}
      {loading ? (
        <div className="p-12 text-center text-xs font-bold text-slate-400">Loading sales follow-up workspace...</div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center">
          <span className="material-symbols-outlined text-[48px] text-slate-300">task_alt</span>
          <p className="text-sm font-bold text-slate-700 mt-2">No follow-ups matching this category</p>
          <p className="text-xs text-slate-400">Great job! All scheduled activities for this section are up to date.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl shadow-sm border p-5 transition hover:shadow-md ${
                item.priority === 'HIGH' ? 'border-l-4 border-l-red-500 border-slate-200/80' : 'border-slate-200/80'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  {/* Priority Badge */}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${getPriorityBadgeClass(item.priority)}`}>
                    {item.priority} PRIORITY
                  </span>

                  {/* Client Name */}
                  <h3 className="font-extrabold text-slate-900 text-base">{item.organization_name}</h3>

                  {/* Lead Status */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getLeadStatusBadgeClass(item.lead_status)}`}>
                    {item.lead_status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold">
                  <div className="text-slate-500">
                    Est. Value: <span className="font-bold text-slate-900">₹{(item.estimated_value || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-slate-500">
                    Scheduled: <span className="font-bold text-blue-600">{item.followup_date} {item.followup_time ? `at ${item.followup_time}` : ''}</span>
                  </div>
                </div>
              </div>

              {/* WHY THIS FOLLOWUP IS REQUIRED Banner */}
              <div className="mt-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-blue-600 shrink-0 mt-0.5">contact_support</span>
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">Why Contact Next?</span>
                  <p className="text-xs font-bold text-slate-800">{item.reason || "Scheduled follow-up contact."}</p>
                </div>
              </div>

              {/* Interaction Context Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Person</span>
                  <span className="font-bold text-slate-800">{item.contact_person}</span>
                  <span className="text-[10px] text-slate-400 block">Assigned: {item.assigned_salesperson_name}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Interaction Type</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-slate-500">
                      {item.type === 'Call' ? 'call' : item.type === 'Meeting' ? 'groups' : item.type === 'Demo' ? 'present_to_all' : 'mail'}
                    </span>
                    {item.type}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Previous Interaction</span>
                  <span className="text-slate-600 italic block">{item.previous_interaction || item.notes || "No previous notes"}</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  Follow-up Status: <span className={`font-bold ${item.status === 'COMPLETED' ? 'text-emerald-600' : 'text-amber-600'}`}>{item.status}</span>
                </div>

                {item.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleOpenCompleteModal(item)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition"
                  >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>Complete Follow-up & Record Outcome</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complete Followup Modal */}
      {showCompleteModal && selectedFollowup && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Record Follow-up Outcome</h3>
                <p className="text-[11px] text-slate-500">{selectedFollowup.organization_name} — {selectedFollowup.contact_person}</p>
              </div>
              <button onClick={() => setShowCompleteModal(false)} className="text-slate-400 font-bold text-base">✕</button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Interaction Outcome *</label>
                <input
                  type="text"
                  required
                  value={completeForm.outcome}
                  onChange={(e) => setCompleteForm({ ...completeForm, outcome: e.target.value })}
                  placeholder="e.g. Customer requested revised proposal with 50 seats"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Interaction Notes</label>
                <textarea
                  rows={2}
                  value={completeForm.notes}
                  onChange={(e) => setCompleteForm({ ...completeForm, notes: e.target.value })}
                  placeholder="Additional conversation notes or feedback..."
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Next Action Required</label>
                <input
                  type="text"
                  value={completeForm.next_action}
                  onChange={(e) => setCompleteForm({ ...completeForm, next_action: e.target.value })}
                  placeholder="e.g. Send revised commercial proposal"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Update Lead Status</label>
                  <select
                    value={completeForm.updated_lead_status}
                    onChange={(e) => setCompleteForm({ ...completeForm, updated_lead_status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  >
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="QUALIFIED">QUALIFIED</option>
                    <option value="PROPOSAL_SENT">PROPOSAL_SENT</option>
                    <option value="NEGOTIATION">NEGOTIATION</option>
                    <option value="WON">WON</option>
                    <option value="LOST">LOST</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Next Follow-up Date</label>
                  <input
                    type="date"
                    value={completeForm.next_followup_date}
                    onChange={(e) => setCompleteForm({ ...completeForm, next_followup_date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-slate-600 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-600/30"
                >
                  Save & Update Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
