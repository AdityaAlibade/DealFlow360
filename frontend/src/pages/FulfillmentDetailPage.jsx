import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const FulfillmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/fulfillment')}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
              Fulfillment Detail: <span className="text-[#a459a8]">{id || 'Q-1042'}</span> (Acme Corp)
            </h1>
            <p className="text-xs text-slate-500">Order Total: 24 Units &bull; Recommended: 2 Warehouse Split</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm">
            Manual Override
          </Button>
          <Button variant="primary" size="sm" icon={CheckCircle2}>
            Accept Suggested Split
          </Button>
        </div>
      </div>

      {/* Warehouse Split Display Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Split 1 */}
        <Card title="Shipment #1: Main Warehouse (BOM-1)">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Allocated Units:</span>
              <span className="font-bold text-slate-900 text-sm">18 Units</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Estimated Shipments:</span>
              <span className="font-semibold text-slate-700">1 Express Batch</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Estimated Freight Cost:</span>
              <span className="font-bold text-[#a459a8]">₹42.00</span>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                <span>Stock Utilization</span>
                <span>75% of order</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#a459a8] h-full rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Split 2 */}
        <Card title="Shipment #2: East Depot (CCU-1)">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Allocated Units:</span>
              <span className="font-bold text-slate-900 text-sm">6 Units</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Estimated Shipments:</span>
              <span className="font-semibold text-slate-700">1 Ground Dispatch</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Estimated Freight Cost:</span>
              <span className="font-bold text-[#a459a8]">₹18.00</span>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                <span>Stock Utilization</span>
                <span>25% of order</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: '25%' }} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Backorder Alert Prompt */}
      <Card className="bg-amber-50/60 border-amber-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">Backorder Consolidation Opportunity</h4>
              <p className="text-xs text-amber-700 mt-1">
                4 accessory units are scheduled for factory arrival tomorrow. You can consolidate the remaining backorder into a single shipment to reduce logistics overhead.
              </p>
            </div>
          </div>
          <Button size="sm" variant="secondary" className="whitespace-nowrap bg-white text-amber-800 border-amber-300">
            Consolidate Remaining Backorder
          </Button>
        </div>
      </Card>
    </MainLayout>
  );
};

export default FulfillmentDetailPage;
