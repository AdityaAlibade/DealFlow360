import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Quotations', path: '/quotations' },
  { label: 'Approvals', path: '/approvals' },
  { label: 'Fulfillment', path: '/fulfillment' },
  { label: 'Subscriptions', path: '/subscriptions' },
  { label: 'Invoices', path: '/invoices' },
  { label: 'Deal Health', path: '/deal-health' },
  { label: 'Reports', path: '/reports' },
  { label: 'Products', path: '/products' },
];

const Sidebar = () => {
  // TODO: Add collapsible menu state and icon indicators
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary inline-block"></span>
          DealFlow360
        </span>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ' +
              (isActive ? 'bg-primary text-white' : 'hover:bg-slate-800 text-slate-300')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        Deal Engine Active
      </div>
    </aside>
  );
};

export default Sidebar;
