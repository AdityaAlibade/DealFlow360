import React from 'react';
import Card from '../common/Card';
import Select from '../common/Select';
import Button from '../common/Button';

const ReportFilters = () => {
  // TODO: Handle date range and sales team filter state
  return (
    <Card>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <Select label="Time Range" options={['Last 30 Days', 'This Quarter', 'Year to Date']} />
        <Select label="Sales Team" options={['All Teams', 'North America', 'EMEA', 'APAC']} />
        <Select label="Product Line" options={['All Products', 'Cloud', 'Hardware', 'Services']} />
        <Button variant="primary">Apply Filters</Button>
      </div>
    </Card>
  );
};

export default ReportFilters;
