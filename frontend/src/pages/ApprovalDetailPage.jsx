import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, RotateCcw } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

const ApprovalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [modalType, setModalType] = useState(null); // 'approve' | 'return' | 'reject'
  const [comment, setComment] = useState('');

  const riskLines = [
    {
      product: 'Laptop Pro 14 (2 Units)',
      discountGiven: '12%',
      limitAllowed: '15%',
      overBy: '-',
      isViolating: false
    },
    {
      product: 'Onsite Setup Service (1 Unit)',
      discountGiven: '18%',
      limitAllowed: '10%',
      overBy: '+8%',
      isViolating: true
    },
    {
      product: 'Extended Warranty 2yr (1 Unit)',
      discountGiven: '10%',
      limitAllowed: '15%',
      overBy: '-',
      isViolating: false
    }
  ];

  const timeline = [
    {
      step: 'Quote Submitted',
      user: 'J. Rao (Sales Rep)',
      date: 'Aug 20, 2026 - 10:30 AM',
      note: 'Initial 12% blended discount package submitted for enterprise client.',
      status: 'completed'
    },
    {
      step: 'Sales Manager Approval',
      user: 'M. Shah (Sales Manager)',
      date: 'Pending Action',
      note: 'Awaiting review of 18% discount on onsite setup services.',
      status: 'current'
    },
    {
      step: 'Finance Review (Conditional)',
      user: 'R. Iyer (Finance)',
      date: 'Scheduled',
      note: 'Required if blended gross margin drops below 30%.',
      status: 'pending'
    },
    {
      step: 'Quotation Confirmed',
      user: 'Customer & Admin',
      date: 'Upcoming',
      note: 'Quote converted to official binding contract.',
      status: 'pending'
    }
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/approvals')}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
              Approval Detail: <span className="text-[#a459a8]">{id || 'Q-1042'}</span> (Tata Consultancy Services)
            </h1>
            <p className="text-xs text-slate-500">Tier: Gold Customer &bull; Total Value: ₹10,03,000</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="danger"
            size="sm"
            icon={X}
            onClick={() => setModalType('reject')}
          >
            Reject Request
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={RotateCcw}
            onClick={() => setModalType('return')}
          >
            Return for Revision
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Check}
            onClick={() => setModalType('approve')}
          >
            Approve Quotation
          </Button>
        </div>
      </div>

      {/* Risk Score Card */}
      <Card className="bg-gradient-to-r from-red-500/10 via-amber-500/5 to-white border-amber-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-extrabold text-xl shadow-sm">
              HIGH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Blended Risk Score: Level 3 Escalation</h3>
                <Badge variant="gold">Customer: Gold</Badge>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Discount threshold on line item <span className="font-semibold text-red-600">Onsite Setup Service</span> exceeds standard rep authority by 8 percentage points.
              </p>
            </div>
          </div>
          <Badge variant="warning" className="px-3 py-1 text-xs">
            Pending Sales Manager Sign-off
          </Badge>
        </div>
      </Card>

      {/* Risk Breakdown & Approval Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Risk Breakdown Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Discount Compliance Audit" subtitle="Line-by-line comparison against policy limits">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold uppercase">
                    <th className="px-4 py-3 text-left">Product Line</th>
                    <th className="px-4 py-3 text-center">Discount Given</th>
                    <th className="px-4 py-3 text-center">Limit Allowed</th>
                    <th className="px-4 py-3 text-center">Over Policy By</th>
                    <th className="px-4 py-3 text-center">Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {riskLines.map((line, idx) => (
                    <tr
                      key={idx}
                      className={line.isViolating ? 'bg-red-50/70 font-semibold text-red-950' : 'text-slate-700'}
                    >
                      <td className="px-4 py-3.5 font-medium">{line.product}</td>
                      <td className="px-4 py-3.5 text-center font-mono">{line.discountGiven}</td>
                      <td className="px-4 py-3.5 text-center font-mono text-slate-500">{line.limitAllowed}</td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-red-600">
                        {line.overBy}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {line.isViolating ? (
                          <Badge variant="danger" className="text-[10px]">
                            ⚠️ VIOLATION
                          </Badge>
                        ) : (
                          <Badge variant="success" className="text-[10px]">
                            Compliant
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Governance Policy Rule #POL-204:</p>
              <p>Service lines carry a strict 10% discount ceiling for Sales Rep tier. Any concession above 10% mandates Stage 1 Sales Manager approval.</p>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Vertical Timeline */}
        <div className="space-y-6">
          <Card title="Approval Hierarchy Timeline">
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {timeline.map((item, idx) => (
                <div key={idx} className="relative group">
                  <div
                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                      item.status === 'completed'
                        ? 'bg-emerald-500 border-white text-white shadow'
                        : item.status === 'current'
                        ? 'bg-amber-500 border-white text-white shadow animate-pulse'
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}
                  >
                    {item.status === 'completed' ? '✓' : idx + 1}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{item.step}</h5>
                    <p className="text-[11px] font-semibold text-[#a459a8]">{item.user}</p>
                    <p className="text-[10px] text-slate-400">{item.date}</p>
                    <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {item.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Action Modals */}
      <Modal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        title={
          modalType === 'approve'
            ? 'Approve Quotation Q-1042'
            : modalType === 'return'
            ? 'Return Quotation for Revision'
            : 'Reject Quotation Request'
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalType(null)}>
              Cancel
            </Button>
            <Button
              variant={modalType === 'reject' ? 'danger' : 'primary'}
              onClick={() => {
                setModalType(null);
                navigate('/approvals');
              }}
            >
              Confirm {modalType?.toUpperCase()}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Please enter any mandatory comments or audit justifications for this action:
          </p>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add approval comment or reason for return/rejection..."
            className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a459a8]/30"
          />
        </div>
      </Modal>
    </MainLayout>
  );
};

export default ApprovalDetailPage;
