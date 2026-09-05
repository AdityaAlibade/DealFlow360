import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProductDetail from '../components/products/ProductDetail';

const ProductDetailPage = () => {
  const { id } = useParams();

  // TODO: Render product pricing and discount configuration in MainLayout
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Product Configuration</h1>
        <ProductDetail id={id} />
      </div>
    </MainLayout>
  );
};

export default ProductDetailPage;
