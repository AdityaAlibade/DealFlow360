import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Building, Mail, Phone, ArrowUpRight, Search, Shield } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import customerAPI from '../api/customerAPI';

const CustomerPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState('ALL');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await customerAPI.getAll({ search, tier: selectedTier });
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setCustomers(list);
    } catch (err) {
      console.warn('Failed to fetch customers from PostgreSQL:', err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, selectedTier]);

  const formattedCustomers = customers.map((c) => ({
    id: c.id,
    name: c.name,
    companyName: c.companyName || c.name,
    email: c.email,
    phone: c.phone || 'N/A',
    tier: c.tier || 'BRONZE',
    quotesCount: Array.isArray(c.quotations) ? c.quotations.length : 0,
    ordersCount: Array.isArray(c.orders) ? c.orders.length : 0,
    requestsCount: Array.isArray(c.productRequests) ? c.productRequests.length : 0
  }));

  const columns = [
    {
      header: 'Customer / Company',
      accessor: 'name',
      render: (r) => (
        <div>
          <span className="font-semibold text-slate-800 flex items-center gap-1 group-hover:text-[#a459a8]">
            {r.name} <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
            <Building className="w-3 h-3 text-slate-400" /> {r.companyName}
          </span>
        </div>
      )
    },
    {
      header: 'Contact Email',
      accessor: 'email',
      render: (r) => (
        <span className="text-xs font-mono text-slate-600 flex items-center gap-1">
          <Mail className="w-3 h-3 text-slate-400" /> {r.email}
        </span>
      )
    },
    {
      header: 'Tier',
      accessor: 'tier',
      render: (r) => {
        let variant = 'default';
        if (r.tier === 'GOLD') variant = 'warning';
        if (r.tier === 'SILVER') variant = 'primary';
        if (r.tier === 'BRONZE') variant = 'secondary';
        return <Badge variant={variant}>{r.tier}</Badge>;
      }
    },
    {
      header: 'Activity',
      accessor: 'quotesCount',
      render: (r) => (
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded bg-purple-50 text-[#a459a8] font-bold text-[10px]" title="Quotations">
            {r.quotesCount} Quotes
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]" title="Orders">
            {r.ordersCount} Orders
          </span>
        </div>
      )
    },
    {
      header: 'Phone',
      accessor: 'phone',
      render: (r) => <span className="text-xs text-slate-500 font-mono">{r.phone}</span>
    }
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Enterprise Customers</h1>
            <Badge variant="success">{customers.length} registered</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise customer directory & self-registered accounts. Customers manage their own company profiles and order requests.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search customers by name, company, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#a459a8]"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'GOLD', 'SILVER', 'BRONZE'].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedTier === tier
                  ? 'bg-[#a459a8] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      <Card title="Customer Directory">
        <Table
          columns={columns}
          data={formattedCustomers}
          emptyMessage={loading ? 'Loading customers from PostgreSQL...' : 'No customers found.'}
          onRowClick={(row) => navigate(`/customers/${row.id}`)}
        />
      </Card>
    </MainLayout>
  );
};

export default CustomerPage;
