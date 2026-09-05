import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

const DiscountSetup = ({ productId }) => {
  // TODO: Configure tiered volume discount schedules
  return (
    <Card title="Tiered Volume Discounts">
      <div className="space-y-3">
        <p className="text-xs text-slate-500">Configure discount tiers based on quantity purchased.</p>
        <div className="grid grid-cols-3 gap-3">
          <Input label="Min Quantity" placeholder="10" />
          <Input label="Max Quantity" placeholder="50" />
          <Input label="Allowed Discount (%)" placeholder="15" />
        </div>
        <Button size="sm" variant="primary">Add Tier</Button>
      </div>
    </Card>
  );
};

export default DiscountSetup;
