import React, { useEffect, useState } from 'react';
import { financeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PaymentsPage() {
  const { user } = useAuth();
  const canRecordPayment = user?.role === 'FINANCE' || user?.role === 'MANAGEMENT';

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [invoicesList, setInvoicesList] = useState([]);
  const [selectedInvoiceInfo, setSelectedInvoiceInfo] = useState(null);
  const [paymentForm, setPaymentForm] = useState({});
  const [paymentError, setPaymentError] = useState('');
  const [savingPayment, setSavingPayment] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await financeAPI.getPayments();
      setPayments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const openPaymentModal = async () => {
    setPaymentForm({});
    setSelectedInvoiceInfo(null);
    setPaymentError('');
    try {
      const res = await financeAPI.getInvoices();
      const unpaid = (res.data || []).filter((inv) => inv.status?.toUpperCase() !== 'PAID');
      setInvoicesList(unpaid);
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
        notes: paymentForm.notes || 'Recorded via Payments Ledger'
      });
      setShowPaymentModal(false);
      setPaymentForm({});
      setSelectedInvoiceInfo(null);
      await fetchPayments();
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payments & Realized Collections Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">Audit trail for incoming RTGS, UPI and bank transfers.</p>
        </div>
        {canRecordPayment && (
          <button
            onClick={openPaymentModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition"
          >
            <span className="material-symbols-outlined text-[18px]">price_check</span>
            <span>Record Payment</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Receipt No</th>
                <th className="p-4">Payment Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Invoice Number</th>
                <th className="p-4">Amount Realized</th>
                <th className="p-4">Payment Mode</th>
                <th className="p-4">UTR / Ref Number</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 font-mono font-bold text-blue-600">{p.receipt_number}</td>
                  <td className="p-4 font-mono text-slate-600">{p.payment_date}</td>
                  <td className="p-4 font-bold text-slate-900">{p.customer_name || 'N/A'}</td>
                  <td className="p-4 font-mono font-bold text-blue-600">{p.invoice_number || 'N/A'}</td>
                  <td className="p-4 font-bold text-emerald-600">₹{p.amount.toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {p.payment_mode}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-slate-600">{p.reference_number || 'N/A'}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Cleared & Reconciled
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Record Customer Payment</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Link payment transaction directly to a client invoice.</p>
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
