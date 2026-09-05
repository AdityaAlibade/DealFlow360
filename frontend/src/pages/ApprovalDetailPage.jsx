import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ApprovalDetail from '../components/approvals/ApprovalDetail';

const ApprovalDetailPage = () => {
  const { id } = useParams();

  // TODO: Render risk breakdown and multi-tier approval actions in MainLayout
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Approval Workflow Review</h1>
        <ApprovalDetail id={id} />
      </div>
    </MainLayout>
  );
};

export default ApprovalDetailPage;
