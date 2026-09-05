import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

const WarehouseSplit = () => {
  return (
    <Card title="Warehouse Allocation Split" subtitle="Automated multi-depot parcel distribution">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800">Main Warehouse (BOM-1)</span>
            <span className="font-mono font-bold text-[#a459a8]">18 Units (75%)</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div className="bg-[#a459a8] h-full" style={{ width: '75%' }} />
          </div>
          <p className="text-[11px] text-slate-500">Shipping Cost: ₹42.00 &bull; Estimated delivery: 2 days</p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800">East Depot (CCU-1)</span>
            <span className="font-mono font-bold text-sky-600">6 Units (25%)</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div className="bg-sky-500 h-full" style={{ width: '25%' }} />
          </div>
          <p className="text-[11px] text-slate-500">Shipping Cost: ₹18.00 &bull; Estimated delivery: 3 days</p>
        </div>
      </div>
    </Card>
  );
};

export default WarehouseSplit;
