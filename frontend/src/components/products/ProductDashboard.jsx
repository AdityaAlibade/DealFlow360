import React from 'react';
import ProductTable from './ProductTable';
import Button from '../common/Button';

const ProductDashboard = () => {
  // TODO: Fetch product catalog from productAPI.getAll
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Product Catalog</h3>
        <Button variant="primary">Add Product</Button>
      </div>
      <ProductTable />
    </div>
  );
};

export default ProductDashboard;
