import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, XCircle, PlayCircle, PauseCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import subscriptionAPI from '../api/subscriptionAPI';

const SubscriptionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const res = await subscriptionAPI.getById(id);
      const subData = res?.data || res;
      setSubscription(subData);
    } catch (err) {
      console.warn('Failed to load subscription detail from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSubscription();
    }
  }, [id]);

  const handlePause = async () => {
    try {
      await subscriptionAPI.pause(id);
      setToast({ type: 'success', text: 'Subscription paused successfully.' });
      fetchSubscription();
    } catch (err) {
      setToast({ type: 'danger', text: err.message || 'Failed to pause subscription' });
    }
  };

  const handleResume = async () => {
    try {
      await subscriptionAPI.resume(id);
      setToast({ type: 'success', text: 'Subscription resumed successfully.' });
      fetchSubscription();
    } catch (err) {
      setToast({ type: 'danger', text: err.message || 'Failed to resume subscription' });
    }
  };

  const handleCancel = async () => {
    try {
      await subscriptionAPI.cancel(id);
      setToast({ type: 'info', text: 'Subscription cancelled.' });
      fetchSubscription();
    } catch (err) {
      setToast({ type: 'danger', text: err.message || 'Failed to cancel subscription' });
    }
  };

  const customer = subscription?.customer || subscription?.order?.customer || {};
  const status = (subscription?.status || 'ACTIVE').toUpperCase();
  const isPaused = status === 'PAUSED';

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
              Subscription Contract: <span className="text-[#a459a8]">{subscription?.planName || id}</span>
            </h1>
            <p className="text-xs text-slate-500">
              Customer: {customer.companyName || customer.name || 'Account'} &bull; Status: {status}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isPaused ? (
            <Button variant="primary" size="sm" icon={PlayCircle} onClick={handleResume}>
              Resume Billing
            </Button>
          ) : (
            <Button variant="secondary" size="sm" icon={PauseCircle} onClick={handlePause}>
              Pause Billing
            </Button>
          )}
          <Button variant="danger" size="sm" icon={XCircle} onClick={handleCancel}>
            Cancel Contract
          </Button>
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
        <div className="py-12 text-center text-xs text-slate-400">Loading subscription details from database...</div>
      ) : (
        <div className="space-y-6">
          <Card title="Subscription Contract Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold">Plan / Tier</span>
                <p className="font-bold text-slate-900 text-sm mt-1">{subscription?.planName || 'Enterprise Tier'}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold">Billing Cycle</span>
                <p className="font-semibold text-slate-800 mt-1">{subscription?.billingCycle || 'Monthly'}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold">Recurring Amount</span>
                <p className="font-bold text-[#a459a8] text-base mt-1">₹{Number(subscription?.recurringAmount || 0).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold">Next Invoice Date</span>
                <p className="font-mono text-slate-800 mt-1">
                  {subscription?.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString('en-IN') : 'Scheduled'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </MainLayout>
  );
};

export default SubscriptionDetailPage;
