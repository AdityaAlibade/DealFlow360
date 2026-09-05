import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

const UpsellPanel = () => {
  // TODO: Render AI-recommended upsell bundles and volume discounts
  return (
    <Card title="Recommended Upsells & Add-ons">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
          <h5 className="text-sm font-medium text-slate-800">Advanced Analytics Module</h5>
          <p className="text-xs text-slate-500 mt-1">+18% margin uplift when bundled</p>
          <Button size="sm" variant="primary" className="mt-3">
            Add to Quote
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default UpsellPanel;
