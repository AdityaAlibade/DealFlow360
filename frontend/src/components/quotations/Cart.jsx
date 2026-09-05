import React from 'react';
import Card from '../common/Card';
import CartItem from './CartItem';

const Cart = () => {
  // TODO: Integrate with QuotationContext for cart item mutations
  const items = [
    { id: 'P-1', name: 'Enterprise Cloud Platform (Seat)', qty: 50, price: 120, discount: 10 },
    { id: 'P-2', name: 'Premium 24/7 SLA Support', qty: 1, price: 5000, discount: 0 }
  ];

  return (
    <Card title="Quotation Items">
      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>
    </Card>
  );
};

export default Cart;
