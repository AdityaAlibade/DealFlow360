import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Download, Printer, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import invoiceAPI from '../api/invoiceAPI';
import { useAuth } from '../contexts/AuthContext';

const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const currentRole = (user?.role || role || '').toLowerCase().trim();
  const isReadOnly = currentRole === 'sales_rep';

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await invoiceAPI.getById(id);
      const invData = res?.data || res;
      setInvoice(invData);
      if (invData?.totalAmount) {
        setPaymentAmount(String(invData.totalAmount));
      }
    } catch (err) {
      console.warn('Failed to load invoice detail from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const handleRecordPayment = async () => {
    try {
      setIsProcessing(true);
      await invoiceAPI.recordPayment(id, {
        amount: parseFloat(paymentAmount) || Number(invoice?.totalAmount || 0),
        paymentMethod: 'BANK_TRANSFER',
        referenceNumber: paymentRef || `TXN-${Date.now()}`
      });
      setToast({ type: 'success', text: 'Payment recorded and reconciled successfully!' });
      setPaymentModalOpen(false);
      fetchInvoice();
    } catch (err) {
      setToast({ type: 'danger', text: err.message || 'Failed to record payment' });
    } finally {
      setIsProcessing(false);
    }
  };

  const isPaid = (invoice?.status || '').toUpperCase() === 'PAID';
  const customer = invoice?.customer || invoice?.order?.customer || {};
  const items = invoice?.items || invoice?.order?.items || [];
  const totalAmount = Number(invoice?.totalAmount || invoice?.amount || 0);
  const taxAmount = Number(invoice?.taxAmount || totalAmount * 0.18 / 1.18);
  const subtotal = totalAmount - taxAmount;

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/invoices')}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
              Invoice Detail: <span className="text-[#a459a8]">{invoice?.invoiceNumber || id}</span>
            </h1>
            <p className="text-xs text-slate-500">
              Customer: {customer.companyName || customer.name || 'Customer Account'} &bull; Due Date: {invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN') : 'Net 30 Days'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>
            Print
          </Button>
          {!isPaid && (
            !isReadOnly ? (
              <Button
                variant="primary"
                size="sm"
                icon={CreditCard}
                onClick={() => setPaymentModalOpen(true)}
              >
                Record Payment
              </Button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg border border-slate-200">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Read-Only Ledger</span>
              </div>
            )
          )}
        </div>
      </div>

      {toast && (
        <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span>{toast.text}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading invoice from database...</div>
      ) : (
        <Card>
          <div className="flex justify-between items-start pb-6 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">DealFlow360 Technologies Pvt Ltd</h3>
              <p className="text-xs text-slate-500 mt-1">GSTIN: 27AABCT3518Q1ZP</p>
              <p className="text-xs text-slate-500">Enterprise Quote-to-Cash Hub</p>
            </div>
            <div className="text-right">
              <Badge variant={isPaid ? 'success' : 'danger'} dot className="text-xs px-3 py-1">
                {isPaid ? '🟢 Paid' : '🔴 Unpaid'}
              </Badge>
              <p className="text-xs text-slate-400 mt-2 font-mono">Invoice #: {invoice?.invoiceNumber || id}</p>
            </div>
          </div>

          {/* Customer info & line items */}
          <div className="py-6">
            <div className="mb-4">
              <span className="text-[10px] uppercase font-bold text-slate-400">Billed To:</span>
              <h4 className="text-sm font-bold text-slate-800">{customer.companyName || customer.name || 'Account'}</h4>
              <p className="text-xs text-slate-500">{customer.address || customer.city || 'Commercial Procurement'}</p>
            </div>

            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold uppercase">
                  <th className="px-4 py-2.5 text-left">Item Description</th>
                  <th className="px-4 py-2.5 text-center">Qty</th>
                  <th className="px-4 py-2.5 text-right">Unit Price</th>
                  <th className="px-4 py-2.5 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-6 text-center text-slate-400">
                      Standard Contract Line Items
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 font-medium text-slate-800">{item.product?.name || item.name || 'Product'}</td>
                      <td className="px-4 py-3 text-center font-mono">{item.quantity || item.qty || 1}</td>
                      <td className="px-4 py-3 text-right font-mono">₹{Number(item.unitPrice || item.price || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                        ₹{Number((item.quantity || item.qty || 1) * (item.unitPrice || item.price || 0)).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST / Taxes:</span>
                <span className="font-mono">₹{taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200 text-sm">
                <span>Total Invoice Value:</span>
                <span className="text-[#a459a8]">₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={`Record Payment for ${invoice?.invoiceNumber || id}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPaymentModalOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRecordPayment} disabled={isProcessing}>
              {isProcessing ? 'Recording...' : 'Confirm Payment'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">Enter payment settlement details received from customer:</p>
          <div>
            <label className="text-xs font-semibold text-slate-700">Amount Received (₹):</label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full mt-1 p-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a459a8]/30 font-mono font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Reference / UTR Number:</label>
            <input
              type="text"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              placeholder="e.g. UTR-HDFC-991823"
              className="w-full mt-1 p-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a459a8]/30 font-mono"
            />
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default InvoiceDetailPage;
