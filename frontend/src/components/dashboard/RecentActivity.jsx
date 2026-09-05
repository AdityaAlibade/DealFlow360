import React from 'react';
import Card from '../common/Card';

const RecentActivity = ({ activities = [] }) => {
  const defaultActivities = [
    { id: 1, text: 'Quote Q-1042 (Tata Consultancy Services) submitted for approval', time: '10 mins ago', user: 'Rajesh Kumar' },
    { id: 2, text: 'Quote Q-1039 approved by Sales Manager', time: '45 mins ago', user: 'Priya Sharma' },
    { id: 3, text: 'High discount alert flagged on Q-1045 (Wipro)', time: '2 hours ago', user: 'Deal Sentinel' },
    { id: 4, text: 'Invoice INV-2026-101 marked Paid (₹10,03,000)', time: '4 hours ago', user: 'Vikram Malhotra' },
    { id: 5, text: 'Counter proposal received on Customer Portal Q-1042', time: '5 hours ago', user: 'Ananya Deshmukh' },
  ];

  const items = activities.length > 0 ? activities : defaultActivities;

  return (
    <Card title="Recent Activity" subtitle="Real-time quote and approval stream">
      <ul className="divide-y divide-slate-100">
        {items.map((act) => (
          <li key={act.id} className="py-3 flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-slate-800">{act.text}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Triggered by {act.user}</p>
            </div>
            <span className="text-slate-400 font-mono text-[11px]">{act.time}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default RecentActivity;
