import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';

const RiskBreakdown = ({ lines = [] }) => {
  const defaultLines = [
    { product: 'Laptop Pro 14 (2 Units)', discountGiven: '12%', limitAllowed: '15%', overBy: '-', isViolating: false },
    { product: 'Onsite Setup Service (1 Unit)', discountGiven: '18%', limitAllowed: '10%', overBy: '+8%', isViolating: true },
    { product: 'Extended Warranty 2yr (1 Unit)', discountGiven: '10%', limitAllowed: '15%', overBy: '-', isViolating: false }
  ];

  const data = lines.length > 0 ? lines : defaultLines;

  return (
    <Card title="Risk Breakdown & Governance">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-semibold uppercase">
              <th className="px-4 py-2.5 text-left">Product Line</th>
              <th className="px-4 py-2.5 text-center">Discount Given</th>
              <th className="px-4 py-2.5 text-center">Limit Allowed</th>
              <th className="px-4 py-2.5 text-center">Over Policy By</th>
              <th className="px-4 py-2.5 text-center">Compliance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((line, idx) => (
              <tr key={idx} className={line.isViolating ? 'bg-red-50/70 font-semibold' : ''}>
                <td className="px-4 py-3">{line.product}</td>
                <td className="px-4 py-3 text-center font-mono">{line.discountGiven}</td>
                <td className="px-4 py-3 text-center font-mono text-slate-500">{line.limitAllowed}</td>
                <td className="px-4 py-3 text-center font-mono font-bold text-red-600">{line.overBy}</td>
                <td className="px-4 py-3 text-center">
                  {line.isViolating ? (
                    <Badge variant="danger" className="text-[10px]">⚠️ VIOLATION</Badge>
                  ) : (
                    <Badge variant="success" className="text-[10px]">Compliant</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default RiskBreakdown;
