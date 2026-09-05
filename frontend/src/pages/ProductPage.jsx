import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import ProductDashboard from '../components/products/ProductDashboard';

const ProductPage = () => {
  // TODO: Render product catalog in MainLayout
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Product Management</h1>
        <ProductDashboard />
      </div>
    </MainLayout>
  );
};

export default ProductPage;
