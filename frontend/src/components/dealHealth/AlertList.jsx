import React from 'react';
import AlertCard from './AlertCard';

const AlertList = () => {
  // TODO: Fetch deal health alerts from dealHealthAPI.getAlerts
  const alerts = [
    { id: 1, severity: 'danger', title: 'Critical Margin Erosion', deal: 'QT-2024-002 (Stark Ind.)', desc: 'Discount is 15% above allowed threshold for current tier.' },
    { id: 2, severity: 'warning', title: 'Stalled Approval Workflow', deal: 'QT-2024-005 (Wayne Ent.)', desc: 'Pending VP Finance review for over 48 hours.' },
  ];

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <AlertCard key={alert.id} alert={alert} />
      ))}
    </div>
  );
};

export default AlertList;
