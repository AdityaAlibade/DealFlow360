// TODO: Customer portal page - separate layout (no MainLayout)
import React from 'react';
import { useParams } from 'react-router-dom';
import CustomerNegotiation from '../components/customerPortal/CustomerNegotiation';
import CustomerQuotationView from '../components/customerPortal/CustomerQuotationView';

const CustomerPortalPage = () => {
  const { token } = useParams();
  // TODO: Fetch quotation data from token
  return (
    <div>
      {/* TODO: Build customer negotiation UI */}
      <CustomerQuotationView />
      <CustomerNegotiation token={token} />
    </div>
  );
};

export default CustomerPortalPage;
