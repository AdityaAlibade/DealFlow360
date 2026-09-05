import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Table from '../common/Table';
import Badge from '../common/Badge';
import Button from '../common/Button';

const QuotationList = () => {
  const navigate = useNavigate();
  // TODO: Connect with quotationAPI.getAll
  const columns = [
    { header: 'Quote ID', accessor: 'id' },
    { header: 'Customer', accessor: 'customer' },
    { header: 'Total Value', accessor: 'total' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge variant={row.statusVariant}>{row.status}</Badge>
    },
    { header: 'Date', accessor: 'date' }
  ];

  const dummyData = [
    { id: 'Q-1042', customer: 'Tata Consultancy Services (TCS)', total: '₹10,03,000', status: 'Pending Approval', statusVariant: 'warning', date: '2026-09-01' },
    { id: 'Q-1039', customer: 'Infosys Limited', total: '₹11,50,500', status: 'Approved', statusVariant: 'success', date: '2026-08-28' },
    { id: 'Q-1035', customer: 'Reliance Digital Enterprises', total: '₹6,60,800', status: 'Confirmed', statusVariant: 'success', date: '2026-08-24' },
    { id: 'Q-1045', customer: 'Wipro Infotech Solutions', total: '₹10,03,000', status: 'Negotiation', statusVariant: 'info', date: '2026-09-03' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">All Quotations</h3>
        <Button variant="primary" icon={Plus} onClick={() => navigate('/quotations/new')}>
          New Quotation
        </Button>
      </div>
      <Table columns={columns} data={dummyData} />
    </div>
  );
};

export default QuotationList;
