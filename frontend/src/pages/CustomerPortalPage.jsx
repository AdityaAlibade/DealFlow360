import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Send, ShieldAlert, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

const CustomerPortalPage = () => {
  const { token } = useParams();

  const [comment, setComment] = useState('Can this be 15% off instead of 10%? We are committing to a 2-year term.');
  const [counterDiscount, setCounterDiscount] = useState(15);
  const [requestedDate, setRequestedDate] = useState('2026-09-01');
  const [submitted, setSubmitted] = useState(false);

  const quoteItems = [
    { name: 'Laptop Pro 14 (High Performance)', qty: 2, price: 1200, discount: 10, total: 2160 },
    { name: 'Onsite Setup & Implementation Service', qty: 1, price: 450, discount: 10, total: 405 },
    { name: 'Extended Warranty (2 Years)', qty: 1, price: 180, discount: 10, total: 162 }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Header (Separate Layout) */}
      <header className="bg-white border-b border-slate-200 px-6 md:px-12 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#a459a8] flex items-center justify-center text-white font-bold text-base shadow-sm">
            D
          </div>
          <div>
            <span className="font-extrabold text-base text-slate-900">
              DealFlow<span className="text-[#a459a8]">360</span> Customer Portal
            </span>
            <p className="text-[10px] text-slate-400">Secure Negotiation Session</p>
          </div>
        </div>

        <Badge variant="warning" dot className="px-3 py-1 text-xs">
          Status: Under Negotiation
        </Badge>
      </header>

      {/* Status Warning Banner */}
      <div className="bg-amber-500/10 border-b border-amber-200 px-6 py-2.5 text-center text-xs font-semibold text-amber-900 flex items-center justify-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-600" />
        <span>Notice: If final terms exceed thresholds, quote automatically re-enters internal approval.</span>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-8 space-y-6">
        {submitted ? (
          <div className="bg-white p-8 rounded-2xl border border-emerald-200 text-center shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Counter-Proposal Submitted!</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your requested terms have been sent directly to your assigned sales representative (John Doe). You will receive an updated quote confirmation shortly.
            </p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Quote Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Quotation Proposal: Q-1042</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Prepared exclusively for <span className="font-semibold text-slate-700">Acme Corp</span></p>
                </div>
                <Badge variant="primary">Valid Until Sep 15</Badge>
              </div>

              {/* Line items table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead>
                    <tr className="text-slate-500 font-semibold uppercase">
                      <th className="py-2 text-left">Item Description</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Price</th>
                      <th className="py-2 text-right">Net (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quoteItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-3 font-medium text-slate-800">{item.name}</td>
                        <td className="py-3 text-center font-mono">{item.qty}</td>
                        <td className="py-3 text-right font-mono">₹{item.price}</td>
                        <td className="py-3 text-right font-mono font-bold text-slate-900">₹{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Investment */}
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 uppercase">Total Proposed Investment:</span>
                <span className="text-xl font-extrabold text-[#a459a8]">₹2,727.00</span>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Negotiation Panel */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#a459a8]" />
                Negotiate & Counter
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700">Counter Discount (%)</label>
                  <input
                    type="number"
                    value={counterDiscount}
                    onChange={(e) => setCounterDiscount(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#a459a8]/30 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Requested Delivery Date</label>
                  <input
                    type="date"
                    value={requestedDate}
                    onChange={(e) => setRequestedDate(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#a459a8]/30"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Customer Comment</label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full mt-1 p-3 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#a459a8]/30"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <Button
                    variant="primary"
                    className="w-full"
                    icon={Send}
                    onClick={() => setSubmitted(true)}
                  >
                    Submit Counter Request
                  </Button>
                  <Button
                    variant="success"
                    className="w-full"
                    icon={CheckCircle2}
                    onClick={() => setSubmitted(true)}
                  >
                    Confirm & Accept Quotation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        &copy; 2026 DealFlow360 Platform. Secured with 256-bit encryption.
      </footer>
    </div>
  );
};

export default CustomerPortalPage;
