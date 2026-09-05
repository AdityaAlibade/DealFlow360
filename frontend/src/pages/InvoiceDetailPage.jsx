import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, CheckCircle2, Download, Printer } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const lineItems = [
    { name: 'Laptop Pro 14 (Model X)', qty: 2, unitPrice: 1200, total: 2400 },
    { name: 'Onsite Setup & Deployment', qty: 1, unitPrice: 330, total: 330 },
  ];

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
              Invoice Detail: <span className="text-[#a459a8]">{id || 'INV-1042'}</span>
            </h1>
            <p className="text-xs text-slate-500">Customer: Acme Corp &bull; Due Date: Sep 10, 2026</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" icon={Printer}>
            Print
          </Button>
          <Button variant="outline" size="sm" icon={Download}>
            Download PDF
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={CreditCard}
            onClick={() => setPaymentModalOpen(true)}
          >
            Record Payment
          </Button>
        </div>
      </div>

      {/* Invoice Card */}
      <Card>
        <div className="flex justify-between items-start pb-6 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900">DealFlow360 Technologies Pvt Ltd</h3>
            <p className="text-xs text-slate-500 mt-1">GSTIN: 27AABCT3518Q1ZP</p>
            <p className="text-xs text-slate-500">Tech Park One, Mumbai, MH</p>
          </div>
          <div className="text-right">
            <Badge variant="danger" dot className="text-xs px-3 py-1">🔴 Unpaid</Badge>
            <p className="text-xs text-slate-400 mt-2 font-mono">Invoice #: {id || 'INV-1042'}</p>
          </div>
        </div>

        {/* Customer info & line items */}
        <div className="py-6">
          <div className="mb-4">
            <span className="text-[10px] uppercase font-bold text-slate-400">Billed To:</span>
            <h4 className="text-sm font-bold text-slate-800">Acme Corp</h4>
            <p className="text-xs text-slate-500">Attn: R. Sharma, Mumbai, MH</p>
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
              {lineItems.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                  <td className="px-4 py-3 text-center font-mono">{item.qty}</td>
                  <td className="px-4 py-3 text-right font-mono">₹{item.unitPrice}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">₹{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total calculation */}
        <div className="border-t border-slate-200 pt-4 flex justify-end">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal:</span>
              <span className="font-semibold text-slate-800">₹2,730.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tax Included:</span>
              <span className="font-semibold text-slate-800">₹0.00</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-extrabold text-slate-900">
              <span>Total Amount:</span>
              <span className="text-base text-[#a459a8]">₹2,730.00</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Record Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Record Received Payment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setPaymentModalOpen(false);
              }}
            >
              Record ₹2,730 Payment
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700">Payment Method</label>
            <select className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs">
              <option>Bank Wire (NEFT / RTGS)</option>
              <option>Corporate Card</option>
              <option>UPI</option>
              <option>Cheque</option>
            </select>
          </div>
          <div>
            <label className="font-semibold text-slate-700">Transaction / Reference ID</label>
            <input
              type="text"
              placeholder="e.g. TXN-99882312"
              className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default InvoiceDetailPage;
