import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, RotateCcw, AlertCircle, Lock } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import approvalAPI from '../api/approvalAPI';
import { useAuth } from '../contexts/AuthContext';

const ApprovalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const currentRole = (user?.role || role || '').toLowerCase().trim();
  const canApprove = currentRole === 'sales_manager' || currentRole === 'finance_ops';

  const [approval, setApproval] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null); // 'approve' | 'return' | 'reject'
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchApprovalDetail = async () => {
    try {
      setLoading(true);
      const res = await approvalAPI.getById(id);
      if (res && res.data) {
        setApproval(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch approval detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchApprovalDetail();
    }
  }, [id]);

  const handleAction = async () => {
    if (!canApprove) return;
    try {
      setIsSubmitting(true);
      setActionError('');
      if (modalType === 'approve') {
        await approvalAPI.approve(id, comment || 'Approved by Manager');
      } else if (modalType === 'reject' || modalType === 'return') {
        await approvalAPI.reject(id, comment || 'Rejected / Returned for review');
      }
      setModalType(null);
      navigate('/approvals');
    } catch (err) {
      setActionError(err.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quotation = approval?.quotation || {};
  const customer = quotation?.customer || {};
  const items = quotation?.items || [];
  const status = (approval?.status || quotation?.status || 'PENDING').toUpperCase();

  const riskLines = items.map((it) => {
    const discount = Number(it.discountPct || it.discount || 0);
    const limit = 15; // Standard 15% authority limit
    const isViolating = discount > limit;
    return {
      product: `${it.product?.name || it.name || 'Item'} (${it.quantity || it.qty || 1} Units)`,
      discountGiven: `${discount}%`,
      limitAllowed: `${limit}%`,
      overBy: isViolating ? `+${discount - limit}%` : '-',
      isViolating
    };
  });

  const hasViolations = riskLines.some((r) => r.isViolating);

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
              Approval Request: <span className="text-[#a459a8]">{quotation.quoteNumber || quotation.id || id}</span>
            </h1>
            <p className="text-xs text-slate-500">
              Customer: {customer.companyName || customer.name || 'Customer'} &bull; Total Value: ₹{Number(quotation.totalAmount || quotation.amount || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {status === 'PENDING' && (
          canApprove ? (
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
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Read-Only: Manager Authorization Required</span>
            </div>
          )
        )}
      </div>

      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Risk Score Card */}
      <Card className="bg-gradient-to-r from-red-500/10 via-amber-500/5 to-white border-amber-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-sm ${
              hasViolations ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {hasViolations ? 'HIGH' : 'LOW'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {hasViolations ? 'Commercial Risk: Policy Limit Concession Triggered' : 'Commercial Risk: Standard Compliance'}
                </h3>
                <Badge variant={status === 'APPROVED' ? 'success' : status === 'REJECTED' ? 'danger' : 'warning'}>
                  Status: {status}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {hasViolations
                  ? 'Quotation contains line items exceeding the standard 15% discount threshold. Requires Manager authorization.'
                  : 'All proposed pricing lines are within standard representative concession boundaries.'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Risk Breakdown & Approval Details */}
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
                  {riskLines.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                        No line items recorded for this quotation.
                      </td>
                    </tr>
                  ) : (
                    riskLines.map((line, idx) => (
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
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Governance Policy Rule #POL-204:</p>
              <p>Standard sales representative authority permits up to 15% discount. Any higher concessions mandate Sales Manager approval.</p>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Quotation & Approver Meta */}
        <div className="space-y-6">
          <Card title="Approval Request Metadata">
            <div className="space-y-3 text-xs">
              <div className="pb-2 border-b border-slate-100">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Assigned Approver</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{approval?.approver?.fullName || 'Sales Manager'}</span>
                <span className="text-slate-500">{approval?.approver?.role || 'Management Role'}</span>
              </div>
              <div className="pb-2 border-b border-slate-100">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Sales Representative</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{quotation.salesRep?.fullName || 'Sales Rep'}</span>
                <span className="text-slate-500">{quotation.salesRep?.email || 'sales@dealflow360.com'}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Created Timestamp</span>
                <span className="font-mono text-slate-700 mt-0.5 block">
                  {approval?.createdAt ? new Date(approval.createdAt).toLocaleString('en-IN') : 'Recent'}
                </span>
              </div>
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
            ? `Approve Quotation ${quotation.quoteNumber || id}`
            : modalType === 'return'
            ? `Return Quotation ${quotation.quoteNumber || id} for Revision`
            : `Reject Quotation Request ${quotation.quoteNumber || id}`
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalType(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant={modalType === 'reject' ? 'danger' : 'primary'}
              onClick={handleAction}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : `Confirm ${modalType?.toUpperCase()}`}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Please enter audit notes or reasons for this decision:
          </p>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add approval comment or justification..."
            className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a459a8]/30"
          />
        </div>
      </Modal>
    </MainLayout>
  );
};

export default ApprovalDetailPage;
