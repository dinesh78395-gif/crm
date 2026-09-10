import React, { useEffect, useState } from 'react';
import { crmAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const LIFECYCLE_STAGES = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'NEGOTIATION',
  'WON',
  'LOST'
];

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadDetailData, setLeadDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // New Lead Form State
  const [formData, setFormData] = useState({
    organization_name: '',
    contact_person: '',
    email: '',
    phone: '',
    category: 'College',
    requirement: '',
    estimated_value: 500000,
    priority: 'MEDIUM',
    lead_source: 'Inbound',
    next_followup_date: '',
    next_followup_time: '10:00 AM',
    reason: ''
  });

  // Quick Followup Form in Drawer
  const [quickFollowup, setQuickFollowup] = useState({
    followup_date: '',
    followup_time: '10:00 AM',
    type: 'Call',
    reason: '',
    notes: ''
  });

  const navigate = useNavigate();

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await crmAPI.getLeads();
      setLeads(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const openLeadDetail = async (lead) => {
    setSelectedLead(lead);
    try {
      setDetailLoading(true);
      const res = await crmAPI.getLeadDetail(lead.id);
      setLeadDetailData(res.data);
    } catch (err) {
      console.error('Failed to load lead detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      await crmAPI.createLead(formData);
      setShowAddModal(false);
      setFormData({
        organization_name: '',
        contact_person: '',
        email: '',
        phone: '',
        category: 'College',
        requirement: '',
        estimated_value: 500000,
        priority: 'MEDIUM',
        lead_source: 'Inbound',
        next_followup_date: '',
        next_followup_time: '10:00 AM',
        reason: ''
      });
      fetchLeads();
    } catch (err) {
      alert('Error creating lead');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedLead) return;
    try {
      await crmAPI.updateLead(selectedLead.id, { status: newStatus });
      fetchLeads();
      openLeadDetail(selectedLead);
    } catch (err) {
      alert('Failed to update lead status');
    }
  };

  const handleAddQuickFollowup = async (e) => {
    e.preventDefault();
    if (!selectedLead || !quickFollowup.followup_date) return;
    try {
      await crmAPI.addFollowup(selectedLead.id, quickFollowup);
      setQuickFollowup({
        followup_date: '',
        followup_time: '10:00 AM',
        type: 'Call',
        reason: '',
        notes: ''
      });
      openLeadDetail(selectedLead);
      fetchLeads();
    } catch (err) {
      alert('Failed to schedule follow-up');
    }
  };

  const handleConvertLead = async (leadId) => {
    try {
      const res = await crmAPI.convertLead(leadId, { address: 'Campus Main Office' });
      alert(`Lead converted successfully to Customer ${res.data.customer_code}!`);
      navigate(`/customers/${res.data.id}/360`);
    } catch (err) {
      console.error(err);
      alert('Error converting lead to customer');
    }
  };

  const getStatusBadgeClass = (status) => {
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

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Leads & Sales Lifecycle</h1>
          <p className="text-xs text-slate-500 mt-1">Manage institutional enquiries, lead qualification, negotiation, and customer conversion.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/followups')}
            className="flex items-center gap-1 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            <span className="material-symbols-outlined text-[18px]">ring_volume</span>
            <span>Follow-up Workspace</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add New Lead</span>
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Lead ID</th>
                <th className="p-4">Organization / Client</th>
                <th className="p-4">Contact Person</th>
                <th className="p-4">Requirement</th>
                <th className="p-4">Est. Value</th>
                <th className="p-4">Next Follow-up</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 font-bold">Loading leads...</td>
                </tr>
              ) : leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 font-mono font-bold text-blue-600">{lead.lead_code}</td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{lead.organization_name}</div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600">{lead.category}</span>
                  </td>
                  <td className="p-4 text-slate-600">
                    <div className="font-bold text-slate-800">{lead.contact_person}</div>
                    <div className="text-[10px] text-slate-400">{lead.email || lead.phone}</div>
                  </td>
                  <td className="p-4 text-slate-700 font-medium max-w-xs truncate">
                    {lead.requirement || 'Training cohort'}
                  </td>
                  <td className="p-4 font-bold text-slate-900">₹{(lead.estimated_value || 0).toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    {lead.next_followup_date ? (
                      <div>
                        <span className="font-bold text-blue-600">{lead.next_followup_date}</span>
                        <span className="text-[10px] text-slate-400 block">{lead.next_followup_time || '10:00 AM'}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-normal">None scheduled</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getPriorityBadgeClass(lead.priority)}`}>
                      {lead.priority || 'MEDIUM'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${getStatusBadgeClass(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openLeadDetail(lead)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition"
                    >
                      Details & Timeline
                    </button>
                    {lead.status === 'WON' && (
                      <button
                        onClick={() => handleConvertLead(lead.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                      >
                        Convert to Customer →
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Slide-over / Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto p-6 space-y-6 text-xs border-l border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-widest">{selectedLead.lead_code}</span>
                <h2 className="text-xl font-extrabold text-slate-900">{selectedLead.organization_name}</h2>
                <span className="text-xs text-slate-500">{selectedLead.category} • Source: {selectedLead.lead_source || 'Inbound'}</span>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-slate-700 font-bold text-lg p-1">✕</button>
            </div>

            {/* Lifecycle Timeline Stepper */}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">Sales Lifecycle Progress</span>
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 overflow-x-auto">
                {LIFECYCLE_STAGES.map((stage, idx) => {
                  const isCurrent = selectedLead.status === stage;
                  const isPast = LIFECYCLE_STAGES.indexOf(selectedLead.status) > idx;
                  return (
                    <div key={stage} className="flex items-center">
                      <button
                        onClick={() => handleUpdateStatus(stage)}
                        className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition ${
                          isCurrent
                            ? 'bg-blue-600 text-white shadow-md'
                            : isPast
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        <span>{stage}</span>
                      </button>
                      {idx < LIFECYCLE_STAGES.length - 1 && (
                        <span className="text-slate-300 text-xs px-1">→</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Key Information Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Contract Value</span>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5">₹{(selectedLead.estimated_value || 0).toLocaleString('en-IN')}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned To</span>
                <p className="font-bold text-slate-900 text-xs mt-0.5">{selectedLead.assigned_salesperson_name || 'Priya Verma'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Priority</span>
                <p className="mt-0.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getPriorityBadgeClass(selectedLead.priority)}`}>
                    {selectedLead.priority || 'MEDIUM'}
                  </span>
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Next Follow-up</span>
                <p className="font-bold text-blue-600 text-xs mt-0.5">{selectedLead.next_followup_date || 'Not set'}</p>
              </div>
            </div>

            {/* Reason Callout */}
            {selectedLead.reason && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-[10px] font-bold text-amber-700 uppercase block">Follow-up Reason / Context</span>
                <p className="font-bold text-slate-800 text-xs mt-0.5">{selectedLead.reason}</p>
              </div>
            )}

            {/* Convert Button for WON lead */}
            {selectedLead.status === 'WON' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">Lead Won! Ready for Onboarding</h4>
                  <p className="text-[11px] text-emerald-700">Convert this lead into a Customer entity to start batch billing & training.</p>
                </div>
                <button
                  onClick={() => handleConvertLead(selectedLead.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition"
                >
                  Convert to Customer →
                </button>
              </div>
            )}

            {/* Schedule Next Follow-up Section */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Schedule Next Action / Follow-up</h4>
              <form onSubmit={handleAddQuickFollowup} className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Follow-up Date *</label>
                  <input
                    type="date"
                    required
                    value={quickFollowup.followup_date}
                    onChange={(e) => setQuickFollowup({ ...quickFollowup, followup_date: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Interaction Type</label>
                  <select
                    value={quickFollowup.type}
                    onChange={(e) => setQuickFollowup({ ...quickFollowup, type: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300 font-bold"
                  >
                    <option value="Call">Call</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Demo">Demo</option>
                    <option value="Email">Email</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Reason for Follow-up</label>
                  <input
                    type="text"
                    value={quickFollowup.reason}
                    onChange={(e) => setQuickFollowup({ ...quickFollowup, reason: e.target.value })}
                    placeholder="e.g. Follow up on commercial proposal response"
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="col-span-2 flex justify-end">
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm">
                    Schedule Follow-up
                  </button>
                </div>
              </form>
            </div>

            {/* Timeline Interaction History */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Previous Follow-up History</h4>
              {detailLoading ? (
                <div className="p-4 text-center text-slate-400">Loading history...</div>
              ) : leadDetailData?.followups?.length === 0 ? (
                <p className="text-slate-400 italic">No previous interactions logged yet.</p>
              ) : (
                <div className="space-y-2 border-l-2 border-slate-200 pl-4">
                  {leadDetailData?.followups?.map((f) => (
                    <div key={f.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 relative">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{f.type} • {f.followup_date}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase ${f.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {f.status}
                        </span>
                      </div>
                      {f.reason && <p className="text-slate-700 mt-1 font-semibold">{f.reason}</p>}
                      {f.outcome && <p className="text-blue-600 mt-0.5 font-medium">Outcome: {f.outcome}</p>}
                      {f.notes && <p className="text-slate-500 mt-0.5 italic">{f.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Add New Institutional Lead</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>
            <form onSubmit={handleCreateLead} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.organization_name}
                    onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                    placeholder="e.g. BMS College of Engineering"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    placeholder="e.g. Dr. Venugopal K."
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@org.edu.in"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Requirement / Training Scope</label>
                <input
                  type="text"
                  value={formData.requirement}
                  onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                  placeholder="e.g. Python Full Stack Training for 50 Students"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  >
                    <option value="College">College</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Individual">Individual</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Value (₹)</label>
                  <input
                    type="number"
                    value={formData.estimated_value}
                    onChange={(e) => setFormData({ ...formData, estimated_value: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Next Follow-up Date</label>
                  <input
                    type="date"
                    value={formData.next_followup_date}
                    onChange={(e) => setFormData({ ...formData, next_followup_date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Follow-up Reason / Action Item</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g. Schedule syllabus review call with Dean"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
