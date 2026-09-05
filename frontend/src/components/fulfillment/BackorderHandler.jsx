import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

const BackorderHandler = () => {
  // TODO: Trigger automated supplier PO for backordered items
  return (
    <Card title="Backorder Handling">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-sm font-medium text-slate-800">8 Units Currently Short</h5>
          <p className="text-xs text-slate-500">Auto-create purchase requisition for missing stock</p>
        </div>
        <Button variant="primary" size="sm">Generate Supplier PO</Button>
      </div>
    </Card>
  );
};

export default BackorderHandler;
