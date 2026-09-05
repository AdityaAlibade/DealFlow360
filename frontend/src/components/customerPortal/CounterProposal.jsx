import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

const CounterProposal = ({ token }) => {
  const [targetPrice, setTargetPrice] = useState('');
  const [comments, setComments] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Connect with customerPortalAPI.submitCounterProposal
  };

  return (
    <Card title="Negotiate & Counter">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Target Budget / Price (₹)"
          type="number"
          placeholder="₹8,50,000"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
        />
        <div>
          <label className="text-sm font-medium text-slate-700">Comments / Desired Scope</label>
          <textarea
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Specify reason for counter-proposal..."
          />
        </div>
        <Button type="submit" variant="primary" className="w-full">
          Submit Counter-Proposal
        </Button>
      </form>
    </Card>
  );
};

export default CounterProposal;
