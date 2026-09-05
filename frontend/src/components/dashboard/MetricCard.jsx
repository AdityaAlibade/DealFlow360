import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../common/Card';

const MetricCard = ({ title, value, change, isPositive = true, icon: Icon, color = 'bg-purple-50 text-[#a459a8] border-purple-200' }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1.5">{value}</h3>
          {change && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-red-600" />
              )}
              <span className={isPositive ? 'text-emerald-700 font-medium' : 'text-red-700 font-medium'}>{change}</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;
