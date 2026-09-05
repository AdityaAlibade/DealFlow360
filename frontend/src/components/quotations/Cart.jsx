import React from 'react';
import Card from '../common/Card';
import CartItem from './CartItem';

const Cart = ({ items = [], onRemove, onUpdateQty }) => {
  return (
    <Card title="Quotation Cart Line Items">
      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <CartItem key={item.id} item={item} onRemove={onRemove} onUpdateQty={onUpdateQty} />
        ))}
      </div>
    </Card>
  );
};

export default Cart;
