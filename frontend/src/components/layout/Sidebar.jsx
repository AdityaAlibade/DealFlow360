import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  CheckCircle2,
  Package,
  Repeat,
  CreditCard,
  Activity,
  BarChart3,
  ShoppingBag,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Quotations', path: '/quotations', icon: FileText },
  { label: 'Approvals', path: '/approvals', icon: CheckCircle2 },
  { label: 'Fulfillment', path: '/fulfillment', icon: Package },
  { label: 'Subscriptions', path: '/subscriptions', icon: Repeat },
  { label: 'Invoices', path: '/invoices', icon: CreditCard },
  { label: 'Deal Health', path: '/deal-health', icon: Activity },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Products', path: '/products', icon: ShoppingBag },
];

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  return (
    <aside
      className={`bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 z-40 ${
        isCollapsed ? 'w-20' : 'w-60'
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800/80 justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#a459a8] flex items-center justify-center text-white font-bold text-sm">
              D
            </div>
            <span className="text-base font-bold text-white tracking-tight">DealFlow360</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded-lg bg-[#a459a8] mx-auto flex items-center justify-center text-white font-bold text-sm">
            D
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'px-3.5 py-2.5'} rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#a459a8] text-white shadow-md shadow-[#a459a8]/30 font-semibold'
                    : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                }`
              }
            >
              <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4 mr-3'}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info Card & Collapse Toggle */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#a459a8]/30 border border-[#a459a8]/50 text-[#ddbade] flex items-center justify-center font-bold text-xs flex-shrink-0">
                JD
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">John Doe</p>
                <p className="text-[10px] text-slate-400">Sales Rep</p>
              </div>
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
