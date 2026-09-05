import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const BackorderHandler = () => {
  return (
    <Card className="bg-amber-50/60 border-amber-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-900">Backorder Consolidation Opportunity</h4>
            <p className="text-xs text-amber-700 mt-1">
              4 accessory units are scheduled for factory arrival tomorrow. You can consolidate the remaining backorder into a single shipment.
            </p>
          </div>
        </div>
        <Button size="sm" variant="secondary" className="whitespace-nowrap bg-white text-amber-800 border-amber-300">
          Consolidate Remaining Backorder
        </Button>
      </div>
    </Card>
  );
};

export default BackorderHandler;
