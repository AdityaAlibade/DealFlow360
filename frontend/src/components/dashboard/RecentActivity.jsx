import React from 'react';
import Card from '../common/Card';

const RecentActivity = () => {
  // TODO: Fetch recent activity feed from dashboardAPI.getRecentActivity
  const activities = [
    { id: 1, text: 'Quote #Q-1048 approved by Finance', time: '10m ago' },
    { id: 2, text: 'New counter-proposal on Quote #Q-1045', time: '1h ago' },
    { id: 3, text: 'Warehouse split completed for Order #F-88', time: '3h ago' },
  ];

  return (
    <Card title="Recent Activity">
      <ul className="divide-y divide-slate-100">
        {activities.map((item) => (
          <li key={item.id} className="py-3 first:pt-0 last:pb-0 flex justify-between text-sm">
            <span className="text-slate-700">{item.text}</span>
            <span className="text-xs text-slate-400">{item.time}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default RecentActivity;
