import React, { useState } from 'react';
import { Search, Bell, User, Settings, LogOut, ChevronDown, Crown, Briefcase, UserCheck, Calculator, Globe } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasNotifications] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, switchRole, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRoleClick = (roleKey) => {
    if (roleKey === 'customer') return;
    const switchedUser = switchRole(roleKey);
    if (switchedUser) {
      if (roleKey === 'admin') {
        navigate('/admin');
      } else if (roleKey === 'sales_rep' || roleKey === 'sales_manager') {
        navigate('/sales');
      } else if (roleKey === 'finance_ops') {
        navigate('/finance');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const roleButtons = [
    { key: 'admin', label: 'Admin', icon: Crown, color: 'hover:border-purple-500 hover:text-purple-600', activeBg: 'bg-purple-600 text-white shadow-purple-200' },
    { key: 'sales_rep', label: 'Sales Rep', icon: Briefcase, color: 'hover:border-blue-500 hover:text-blue-600', activeBg: 'bg-blue-600 text-white shadow-blue-200' },
    { key: 'sales_manager', label: 'Sales Mgr', icon: UserCheck, color: 'hover:border-indigo-500 hover:text-indigo-600', activeBg: 'bg-indigo-600 text-white shadow-indigo-200' },
    { key: 'finance_ops', label: 'Finance & Ops', icon: Calculator, color: 'hover:border-emerald-500 hover:text-emerald-600', activeBg: 'bg-emerald-600 text-white shadow-emerald-200' }
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left: Brand / Title */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity focus:outline-none"
          title="DealFlow360 Dashboard"
        >
          <div className="w-8 h-8 rounded-lg bg-[#a459a8] flex items-center justify-center text-white font-bold shadow-md shadow-[#a459a8]/20">
            D
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900 hidden sm:inline">
            DealFlow<span className="text-[#a459a8]">360</span>
          </span>
        </Link>
      </div>

      {/* Center: Prominent Role Access Buttons Toolbar (Admin Portal Only) */}
      {isAdmin && (
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200 shadow-inner">
          {roleButtons.map((btn) => {
            const Icon = btn.icon;
            const isActive = role === btn.key;
            return (
              <button
                key={btn.key}
                id={`role-btn-${btn.key}`}
                onClick={() => handleRoleClick(btn.key)}
                title={`Switch active RBAC role to ${btn.label}`}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 shadow-sm ${
                  isActive
                    ? `${btn.activeBg} ring-2 ring-offset-1 ring-slate-900/10 scale-105`
                    : `bg-white text-slate-700 border border-slate-200/80 ${btn.color} hover:bg-slate-50`
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{btn.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5" />
          {hasNotifications && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500 border-2 border-white rounded-full animate-pulse" />
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#a459a8] to-[#c892cb] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user?.avatar || 'U'}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name || 'User'}</p>
              <p className="text-[11px] text-[#a459a8] font-semibold leading-tight capitalize">
                {user?.roleLabel || role}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
              <div 
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/profile');
                }}
                className="px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors"
                title="View Profile"
              >
                <p className="text-xs font-bold text-slate-900 hover:text-[#a459a8]">{user?.name || 'John Doe'}</p>
                <p className="text-[11px] text-slate-500 font-mono truncate">{user?.email || 'demo@dealflow.com'}</p>
                <div className="mt-1.5 inline-block px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                  {user?.roleLabel || 'Sales Representative'}
                </div>
              </div>

              {/* Profile Link */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-purple-50/50 hover:text-[#a459a8] flex items-center gap-2 cursor-pointer transition-colors font-medium"
                >
                  <User className="w-3.5 h-3.5" /> My Profile
                </button>
              </div>

              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
