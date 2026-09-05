import React from 'react';
import Card from '../common/Card';
import InvoiceStatus from './InvoiceStatus';
import Button from '../common/Button';

const InvoiceDetail = ({ id }) => {
  // TODO: Fetch invoice payment reconciliation from invoiceAPI.getById
  return (
    <div className="space-y-6">
      <InvoiceStatus id={id} status="Unpaid" />
      <Card title="Payment Reconciliation">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Match bank transactions and reconcile outstanding customer balances.
          </p>
          <div className="p-4 bg-slate-50 border rounded-lg text-sm">
            Outstanding Balance: <strong>$85,000.00</strong>
          </div>
          <Button variant="primary">Record Manual Payment</Button>
        </div>
      </Card>
    </div>
  );
};

export default InvoiceDetail;
