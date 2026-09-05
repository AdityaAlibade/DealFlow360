import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import ApprovalList from '../components/approvals/ApprovalList';

const ApprovalPage = () => {
  // TODO: Render approval requests list in MainLayout
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Approval Requests</h1>
        <ApprovalList />
      </div>
    </MainLayout>
  );
};

export default ApprovalPage;
