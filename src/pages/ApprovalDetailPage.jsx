// TODO: Approval detail page with risk breakdown and workflow
import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ApprovalDetail from '../components/approvals/ApprovalDetail';
import RiskBreakdown from '../components/approvals/RiskBreakdown';
import ApprovalTimeline from '../components/approvals/ApprovalTimeline';

const ApprovalDetailPage = () => {
  const { id } = useParams();
  // TODO: Fetch approval details, risk assessment data
  return (
    <MainLayout>
      {/* TODO: Build approval detail page UI */}
      <ApprovalDetail id={id} />
      <RiskBreakdown />
      <ApprovalTimeline approvalId={id} />
    </MainLayout>
  );
};

export default ApprovalDetailPage;
