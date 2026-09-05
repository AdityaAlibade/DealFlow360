import React from 'react';
import Card from '../common/Card';

const ReportChart = ({ title }) => {
  // TODO: Integrate dynamic ChartJS / Recharts visualization
  return (
    <Card title={title}>
      <div className="h-64 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
        Chart Visualization Placeholder
      </div>
    </Card>
  );
};

export default ReportChart;
