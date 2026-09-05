import React from 'react';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';

const ProductForm = ({ productId }) => {
  // TODO: Manage product metadata updates with productAPI.update
  return (
    <Card title={productId ? 'Edit Product' : 'Create Product'}>
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Product Name" placeholder="Cloud Instance - Large" />
          <Input label="SKU" placeholder="SKU-CLD-LG" />
          <Input label="Base Price (₹)" type="number" placeholder="150000" />
          <Input label="Standard Cost (₹)" type="number" placeholder="110000" />
        </div>
        <Button variant="primary">Save Changes</Button>
      </form>
    </Card>
  );
};

export default ProductForm;
