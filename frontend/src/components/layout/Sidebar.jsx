import React from 'react';
import { NavLink, Link } from 'react-router-dom';
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
  ChevronRight,
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PERMISSIONS } from '../../utils/permissions';

const allNavItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, permission: null },
  { label: 'Quotations', path: '/quotations', icon: FileText, permission: PERMISSIONS.QUOTATION_READ },
  { label: 'Approvals', path: '/approvals', icon: CheckCircle2, permission: PERMISSIONS.APPROVAL_READ },
  { label: 'Warehouses', path: '/warehouses', icon: Package, permission: PERMISSIONS.FULFILLMENT_READ },
  { label: 'Subscriptions', path: '/subscriptions', icon: Repeat, permission: PERMISSIONS.BILLING_READ },
  { label: 'Invoices', path: '/invoices', icon: CreditCard, permission: PERMISSIONS.INVOICE_READ },
  { label: 'Deal Health', path: '/deal-health', icon: Activity, permission: PERMISSIONS.DEAL_HEALTH_READ },
  { label: 'Reports', path: '/reports', icon: BarChart3, permission: PERMISSIONS.REPORT_READ },
  { label: 'Products & Config', path: '/products', icon: ShoppingBag, permission: PERMISSIONS.PRODUCT_READ },
];

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, role, checkPermission } = useAuth();

  // Filter navigation items based on current role permissions
  const visibleNavItems = allNavItems.filter((item) => {
    if (!item.permission) return true;
    return checkPermission(item.permission);
  });

  return (
    <aside
      className={`bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 z-40 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800/80 justify-between">
        {!isCollapsed && (
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity focus:outline-none"
            title="DealFlow360 Dashboard"
          >
            <div className="w-7 h-7 rounded-lg bg-[#a459a8] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-[#a459a8]/40">
              D
            </div>
            <div>
              <span className="text-base font-extrabold text-white tracking-tight">DealFlow360</span>
              <p className="text-[9px] uppercase tracking-wider text-purple-400 font-bold">Revenue Engine</p>
            </div>
          </Link>
        )}
        {isCollapsed && (
          <Link
            to="/dashboard"
            className="w-8 h-8 rounded-lg bg-[#a459a8] mx-auto flex items-center justify-center text-white font-bold text-sm shadow-md shadow-[#a459a8]/30 cursor-pointer hover:opacity-90 transition-opacity focus:outline-none"
            title="DealFlow360 Dashboard"
          >
            D
          </Link>
        )}
      </div>

      {/* Role Badge Indicator */}
      {!isCollapsed && user && (
        <div className="px-4 py-2.5 mx-3 mt-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#a459a8] flex-shrink-0" />
          <div className="truncate">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Role</p>
            <p className="text-xs font-bold text-white truncate">{user.roleLabel || role}</p>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
        {visibleNavItems.map((item) => {
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
                {user?.avatar || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Guest'}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user?.role || 'Guest'}</p>
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
