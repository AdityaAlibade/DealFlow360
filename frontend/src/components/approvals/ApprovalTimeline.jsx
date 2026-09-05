import React from 'react';
import Card from '../common/Card';

const ApprovalTimeline = ({ steps = [] }) => {
  const defaultSteps = [
    { step: 'Quote Submitted', user: 'Rajesh Kumar (Sales Rep)', date: 'Aug 20, 2026', note: 'Initial 12% discount proposal', status: 'completed' },
    { step: 'Sales Manager Review', user: 'Priya Sharma (Sales Manager)', date: 'Pending', note: 'Evaluating 18% service line concession', status: 'current' },
    { step: 'Finance Sign-off', user: 'Vikram Malhotra (Finance Ops)', date: 'Scheduled', note: 'Conditional on blended margin > 30%', status: 'pending' },
    { step: 'Customer Acceptance', user: 'Tata Consultancy Services (TCS)', date: 'Upcoming', note: 'Contract execution', status: 'pending' }
  ];

  const list = steps.length > 0 ? steps : defaultSteps;

  return (
    <Card title="Approval Hierarchy Timeline">
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {list.map((item, idx) => (
          <div key={idx} className="relative group">
            <div
              className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                item.status === 'completed'
                  ? 'bg-emerald-500 border-white text-white shadow'
                  : item.status === 'current'
                  ? 'bg-amber-500 border-white text-white shadow animate-pulse'
                  : 'bg-white border-slate-300 text-slate-400'
              }`}
            >
              {item.status === 'completed' ? '✓' : idx + 1}
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900">{item.step}</h5>
              <p className="text-[11px] font-semibold text-[#a459a8]">{item.user}</p>
              <p className="text-[10px] text-slate-400">{item.date}</p>
              {item.note && (
                <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {item.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ApprovalTimeline;
