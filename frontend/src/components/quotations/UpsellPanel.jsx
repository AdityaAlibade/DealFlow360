import React from 'react';
import { Plus } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

const UpsellPanel = ({ onAddUpsell }) => {
  const recommendations = [
    { id: 'up-1', name: 'Docking Station USB-C Dual 4K', price: 180, margin: 42, badge: 'PROMO' },
    { id: 'up-2', name: 'Premium Cloud Backup 1TB', price: 60, margin: 85, badge: 'POPULAR' },
    { id: 'up-3', name: 'Annual Care Plan Gold SLA', price: 250, margin: 60, badge: 'HIGH MARGIN' }
  ];

  return (
    <Card title="Recommended Add-ons" subtitle="AI upsell recommendations">
      <div className="space-y-3">
        {recommendations.map((item) => (
          <div key={item.id} className="p-3 bg-slate-50 hover:bg-purple-50/40 border border-slate-200 rounded-xl transition-all">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Badge variant="primary" className="text-[9px] py-0">{item.badge}</Badge>
                <h4 className="text-xs font-bold text-slate-800 mt-1">{item.name}</h4>
              </div>
              <span className="text-xs font-bold text-slate-900 font-mono">₹{item.price}</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px]">
              <span className="text-emerald-600 font-semibold">+{item.margin}% margin impact</span>
              <Button
                size="sm"
                variant="primary"
                icon={Plus}
                onClick={() => onAddUpsell && onAddUpsell(item)}
                className="py-1 px-2 text-[11px]"
              >
                Add
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default UpsellPanel;
