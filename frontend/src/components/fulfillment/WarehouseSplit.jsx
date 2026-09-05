import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

const WarehouseSplit = () => {
  // TODO: Implement multi-location stock splitting logic
  return (
    <Card title="Warehouse Allocation Split">
      <div className="space-y-3">
        <p className="text-sm text-slate-600">
          Allocate physical line items across multiple fulfillment centers.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg bg-slate-50">
            <span className="text-xs font-semibold">Warehouse North America (NA-1)</span>
            <p className="text-sm mt-1">30 Units Assigned</p>
          </div>
          <div className="p-3 border rounded-lg bg-slate-50">
            <span className="text-xs font-semibold">Warehouse EMEA (EU-1)</span>
            <p className="text-sm mt-1">20 Units Assigned</p>
          </div>
        </div>
        <Button variant="primary" size="sm">Save Allocation Split</Button>
      </div>
    </Card>
  );
};

export default WarehouseSplit;
