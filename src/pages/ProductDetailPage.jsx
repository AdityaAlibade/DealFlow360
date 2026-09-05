// TODO: Product detail page with configuration and discounts
import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProductDetail from '../components/products/ProductDetail';
import DiscountSetup from '../components/products/DiscountSetup';

const ProductDetailPage = () => {
  const { id } = useParams();
  // TODO: Fetch product data and discount tier structures
  return (
    <MainLayout>
      {/* TODO: Build product detail page UI */}
      <ProductDetail id={id} />
      <DiscountSetup productId={id} />
    </MainLayout>
  );
};

export default ProductDetailPage;
