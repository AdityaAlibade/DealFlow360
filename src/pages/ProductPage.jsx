// TODO: Product catalog management page
import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import ProductDashboard from '../components/products/ProductDashboard';
import ProductTable from '../components/products/ProductTable';

const ProductPage = () => {
  // TODO: Fetch products data
  return (
    <MainLayout>
      {/* TODO: Build product catalog UI */}
      <ProductDashboard />
      <ProductTable />
    </MainLayout>
  );
};

export default ProductPage;
