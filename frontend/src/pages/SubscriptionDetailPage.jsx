import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, XCircle } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const SubscriptionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const oneTimeLines = [
    { product: 'Setup & Onboarding Consultation', qty: 1, amount: '₹5,000.00' },
    { product: 'Hardware Appliance Gateway', qty: 2, amount: '₹14,000.00' }
  ];

  const recurringLines = [
    { plan: 'Care Plan 2yr (Pro Support)', cycle: 'Monthly', nextBill: 'Sep 15, 2026', amount: '₹1,200.00 / month' },
    { plan: 'Cloud Storage 5TB Add-on', cycle: 'Monthly', nextBill: 'Sep 15, 2026', amount: '₹350.00 / month' }
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/subscriptions')}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
              Billing Detail: Tata Consultancy Services (TCS) - <span className="text-[#a459a8]">Enterprise CPQ Platform</span>
            </h1>
            <p className="text-xs text-slate-500">Contract Ref: {id || 'SUB-2026-881'} &bull; Auto-renewal: Active</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" icon={Edit}>
            Modify Subscription
          </Button>
          <Button variant="danger" size="sm" icon={XCircle}>
            Cancel Subscription
          </Button>
        </div>
      </div>

      {/* One-Time Lines Table */}
      <Card title="One-Time Upfront Charges">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-semibold uppercase">
              <th className="px-4 py-2.5 text-left">Product / Service</th>
              <th className="px-4 py-2.5 text-center">Qty</th>
              <th className="px-4 py-2.5 text-right">Total Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {oneTimeLines.map((line, idx) => (
              <tr key={idx}>
                <td className="px-4 py-3 font-medium text-slate-800">{line.product}</td>
                <td className="px-4 py-3 text-center font-mono">{line.qty}</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">{line.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Recurring Lines Table */}
      <Card title="Recurring Subscription Schedule">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-semibold uppercase">
              <th className="px-4 py-2.5 text-left">Plan / Feature</th>
              <th className="px-4 py-2.5 text-center">Billing Cycle</th>
              <th className="px-4 py-2.5 text-center">Next Invoice Date</th>
              <th className="px-4 py-2.5 text-right">Recurring Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recurringLines.map((line, idx) => (
              <tr key={idx}>
                <td className="px-4 py-3 font-semibold text-slate-800">{line.plan}</td>
                <td className="px-4 py-3 text-center font-mono">{line.cycle}</td>
                <td className="px-4 py-3 text-center font-mono text-slate-500">{line.nextBill}</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-[#a459a8]">{line.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </MainLayout>
  );
};

export default SubscriptionDetailPage;
