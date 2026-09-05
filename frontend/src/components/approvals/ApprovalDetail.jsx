import React from 'react';
import RiskBreakdown from './RiskBreakdown';
import ApprovalTimeline from './ApprovalTimeline';
import Button from '../common/Button';

const ApprovalDetail = ({ id }) => {
  // TODO: Fetch approval audit data from approvalAPI.getById
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RiskBreakdown />
          <div className="flex gap-4">
            <Button variant="primary">Approve Quote</Button>
            <Button variant="secondary" className="text-red-600 bg-red-50 hover:bg-red-100">
              Reject Request
            </Button>
          </div>
        </div>
        <div>
          <ApprovalTimeline />
        </div>
      </div>
    </div>
  );
};

export default ApprovalDetail;
