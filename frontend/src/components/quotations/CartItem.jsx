import React from 'react';

const CartItem = ({ item }) => {
  // TODO: Allow inline editing of quantity and discount percentage
  const total = ((item.qty * item.price * (100 - item.discount)) / 100).toFixed(2);

  return (
    <div className="py-3 flex items-center justify-between">
      <div>
        <h5 className="text-sm font-medium text-slate-800">{item.name}</h5>
        <span className="text-xs text-slate-500">
          Qty: {item.qty} &times; ${item.price} ({item.discount}% off)
        </span>
      </div>
      <div className="text-right">
        <span className="text-sm font-semibold text-slate-900">
          ${total}
        </span>
      </div>
    </div>
  );
};

export default CartItem;
