import React, { useEffect, useState } from 'react';
import { financeAPI, crmAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function InvoicesPage() {
  const { user } = useAuth();
  const canRecordPayment = user?.role === 'FINANCE' || user?.role === 'MANAGEMENT';

  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: 1,
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    description: 'Python Full Stack Training - Capstone Tranche',
    quantity: 50,
    unit_price: 6000
  });

  // Record Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [invoicesList, setInvoicesList] = useState([]);
  const [selectedInvoiceInfo, setSelectedInvoiceInfo] = useState(null);
  const [paymentForm, setPaymentForm] = useState({});
  const [paymentError, setPaymentError] = useState('');
  const [savingPayment, setSavingPayment] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await financeAPI.getInvoices();
      setInvoices(res.data);
      const custRes = await crmAPI.getCustomers();
      setCustomers(custRes.data);
      if (custRes.data && custRes.data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          customer_id: prev.customer_id || custRes.data[0].id
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleOpenModal = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const dueStr = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
    setFormData({
      customer_id: customers.length > 0 ? customers[0].id : 1,
      issue_date: todayStr,
      due_date: dueStr,
      description: 'Python Full Stack Training - Capstone Tranche',
      quantity: 50,
      unit_price: 6000
    });
    setShowAddModal(true);
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const dueStr = formData.due_date || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
      await financeAPI.createInvoice({
        customer_id: parseInt(formData.customer_id),
        batch_id: null,
        issue_date: todayStr,
        due_date: dueStr,
        items: [
          {
            description: formData.description,
            quantity: parseInt(formData.quantity),
            unit_price: parseFloat(formData.unit_price)
          }
        ]
      });
      setShowAddModal(false);
      await fetchInvoices();
    } catch (err) {
      console.error(err);
      alert('Error generating invoice: ' + (err.response?.data?.detail || err.message));
    }
  };

  const openPaymentModal = async (preselectedInvoiceId = null) => {
    setPaymentForm({});
    setSelectedInvoiceInfo(null);
    setPaymentError('');
    try {
      const res = await financeAPI.getInvoices();
      const unpaid = (res.data || []).filter((inv) => inv.status?.toUpperCase() !== 'PAID');
      setInvoicesList(unpaid);
      if (preselectedInvoiceId) {
        handleInvoiceSelect(preselectedInvoiceId);
      }
    } catch (err) {
      console.error(err);
      setInvoicesList([]);
    }
    setShowPaymentModal(true);
  };

  const handleInvoiceSelect = async (invoiceId) => {
    if (!invoiceId) {
      setSelectedInvoiceInfo(null);
      setPaymentForm((prev) => ({ ...prev, invoice_id: '' }));
      return;
    }
    setPaymentForm((prev) => ({ ...prev, invoice_id: invoiceId }));
    try {
      const res = await financeAPI.getInvoicePaymentInfo(invoiceId);
      setSelectedInvoiceInfo(res.data);
      setPaymentError('');
    } catch (err) {
      console.error(err);
      setSelectedInvoiceInfo(null);
    }
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    setSavingPayment(true);
    setPaymentError('');
    try {
      const amount = parseFloat(paymentForm.amount || 0);
      if (selectedInvoiceInfo && amount > selectedInvoiceInfo.outstanding) {
        setPaymentError(`Payment cannot exceed the outstanding amount of ₹${selectedInvoiceInfo.outstanding.toLocaleString('en-IN')}.`);
        setSavingPayment(false);
        return;
      }
      await financeAPI.recordPayment({
        invoice_id: parseInt(paymentForm.invoice_id),
        amount: amount,
        payment_mode: paymentForm.payment_mode || 'RTGS/NEFT',
        reference_number: paymentForm.reference_number || '',
        payment_date: paymentForm.payment_date || new Date().toISOString().split('T')[0],
        notes: paymentForm.notes || 'Recorded via Invoices Page'
      });
      setShowPaymentModal(false);
      setPaymentForm({});
      setSelectedInvoiceInfo(null);
      await fetchInvoices();
    } catch (err) {
      setPaymentError(err.response?.data?.detail || err.message);
    } finally {
      setSavingPayment(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Invoices & Accounts Receivable</h1>
          <p className="text-xs text-slate-500 mt-1">Manage client billing, payment tranches and outstanding receivables.</p>
        </div>
        <div className="flex items-center gap-2">
          {canRecordPayment && (
            <button
              onClick={() => openPaymentModal()}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition"
            >
              <span className="material-symbols-outlined text-[18px]">price_check</span>
              <span>Record Payment</span>
            </button>
          )}
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition"
          >
            <span className="material-symbols-outlined text-[18px]">post_add</span>
            <span>Create New Invoice</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Invoice Number</th>
                <th className="p-4">Client Name</th>
                <th className="p-4">Issue Date</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Paid</th>
                <th className="p-4">Outstanding</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 font-mono font-bold text-blue-600">{inv.invoice_number}</td>
                  <td className="p-4 font-bold text-slate-900">{inv.customer_name}</td>
                  <td className="p-4 text-slate-600 font-mono">{inv.issue_date}</td>
                  <td className="p-4 text-slate-600 font-mono">{inv.due_date}</td>
                  <td className="p-4 font-bold text-blue-600">₹{inv.total_amount.toLocaleString('en-IN')}</td>
                  <td className="p-4 font-bold text-emerald-600">₹{(inv.paid_amount || 0).toLocaleString('en-IN')}</td>
                  <td className="p-4 font-bold text-amber-700">₹{(inv.outstanding || 0).toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      inv.status?.toUpperCase() === 'PAID'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : inv.status?.toUpperCase() === 'PARTIALLY PAID'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : inv.status?.toUpperCase() === 'OVERDUE'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Create Client Invoice</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>
            <form onSubmit={handleCreateInvoice} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Customer *</label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-800"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.customer_code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Line Description *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity (Students)</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit Rate (₹)</label>
                  <input
                    type="number"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-blue-600"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold">Issue Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Record Customer Payment</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Apply collected money directly to a customer invoice.</p>
              </div>
              <button
                onClick={() => { setShowPaymentModal(false); setSelectedInvoiceInfo(null); setPaymentError(''); }}
                className="text-slate-400 font-bold hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4">
              {/* Invoice Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Invoice *</label>
                <select
                  required
                  value={paymentForm.invoice_id || ''}
                  onChange={(e) => handleInvoiceSelect(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  <option value="">-- Choose Invoice to Apply Payment --</option>
                  {invoicesList.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number} - {inv.customer_name} (Outstanding: ₹{(inv.outstanding || 0).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Invoice Summary Card */}
              {selectedInvoiceInfo && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Customer:</span>
                    <strong className="text-slate-900">{selectedInvoiceInfo.customer_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Invoice Number:</span>
                    <strong className="font-mono text-blue-600">{selectedInvoiceInfo.invoice_number}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Invoice Total:</span>
                    <span className="font-bold text-slate-900">₹{selectedInvoiceInfo.total_amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Already Paid:</span>
                    <span className="font-bold text-emerald-600">₹{selectedInvoiceInfo.paid_amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Current Outstanding:</span>
                    <span className="font-extrabold text-amber-700">₹{selectedInvoiceInfo.outstanding.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Due Date:</span>
                    <span className="font-bold font-mono text-slate-800">{selectedInvoiceInfo.due_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Status:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      selectedInvoiceInfo.status?.toUpperCase() === 'PAID'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : selectedInvoiceInfo.status?.toUpperCase() === 'PARTIALLY PAID'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : selectedInvoiceInfo.status?.toUpperCase() === 'OVERDUE'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {selectedInvoiceInfo.status}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Error */}
              {paymentError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 font-bold text-xs">
                  ⚠ {paymentError}
                </div>
              )}

              {/* Payment Fields */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Amount Collected (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedInvoiceInfo?.outstanding || undefined}
                  placeholder="100000"
                  value={paymentForm.amount || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setPaymentForm({ ...paymentForm, amount: e.target.value });
                    if (selectedInvoiceInfo && val > selectedInvoiceInfo.outstanding) {
                      setPaymentError(`Payment cannot exceed the outstanding amount of ₹${selectedInvoiceInfo.outstanding.toLocaleString('en-IN')}.`);
                    } else {
                      setPaymentError('');
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={paymentForm.payment_mode || 'RTGS/NEFT'}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_mode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  >
                    <option value="RTGS/NEFT">RTGS / NEFT Transfer</option>
                    <option value="UPI">UPI / Digital</option>
                    <option value="Cheque">Corporate Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={paymentForm.payment_date || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">UTR / Reference Number</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC992817261"
                  value={paymentForm.reference_number || ''}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowPaymentModal(false); setSelectedInvoiceInfo(null); setPaymentError(''); }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPayment || !paymentForm.invoice_id}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/30 disabled:opacity-50"
                >
                  {savingPayment ? 'Saving...' : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
