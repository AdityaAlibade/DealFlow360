import React from 'react';
import { Trash2 } from 'lucide-react';
import Badge from '../common/Badge';

const CartItem = ({ item, onRemove }) => {
  const isOver = item.discount > item.limit;
  const netAmount = ((item.qty * item.price * (100 - item.discount)) / 100).toFixed(2);

  return (
    <div className="py-3 flex items-center justify-between gap-4 text-xs">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h5 className="font-bold text-slate-800">{item.name}</h5>
          {isOver && <Badge variant="danger" className="text-[10px]">⚠️ OVER (+{item.discount - item.limit}pt)</Badge>}
        </div>
        <p className="text-slate-500 text-[11px] mt-0.5 font-mono">
          Qty: {item.qty} &times; ₹{item.price} &bull; Discount: {item.discount}% (Policy Limit: {item.limit}%)
        </p>
      </div>

      <div className="text-right flex items-center gap-3">
        <span className="text-sm font-extrabold text-slate-900 font-mono">₹{netAmount}</span>
        {onRemove && (
          <button onClick={() => onRemove(item.id)} className="text-slate-400 hover:text-red-500 p-1">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CartItem;
