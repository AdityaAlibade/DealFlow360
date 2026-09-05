import React from 'react';
import { useParams } from 'react-router-dom';
import CustomerNegotiation from '../components/customerPortal/CustomerNegotiation';

const CustomerPortalPage = () => {
  const { token } = useParams();

  // NOTE: Customer Portal does NOT use MainLayout (customer-facing standalone layout)
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary inline-block"></span>
          <span className="font-bold text-lg text-slate-900">DealFlow360 Customer Portal</span>
        </div>
        <span className="text-xs text-slate-500">Secure Negotiation Session</span>
      </header>
      <main className="flex-1 p-6 md:p-10">
        <CustomerNegotiation token={token} />
      </main>
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        Powered by DealFlow360 Negotiation Engine
      </footer>
    </div>
  );
};

export default CustomerPortalPage;
