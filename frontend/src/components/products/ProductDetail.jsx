import React from 'react';
import ProductForm from './ProductForm';
import DiscountSetup from './DiscountSetup';

const ProductDetail = ({ id }) => {
  // TODO: Fetch product configuration by id from productAPI.getById
  return (
    <div className="space-y-6">
      <ProductForm productId={id} />
      <DiscountSetup productId={id} />
    </div>
  );
};

export default ProductDetail;
