import React, { useState } from 'react';
import { Search, Bell, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasNotifications] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
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
          <span className="font-extrabold text-lg tracking-tight text-slate-900">
            DealFlow<span className="text-[#a459a8]">360</span>
          </span>
        </Link>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search quotations, customers, SKU, orders... (Ctrl + K)"
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-[#a459a8] focus:ring-2 focus:ring-[#a459a8]/20 transition-all text-slate-700 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-4">
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
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#a459a8] to-[#c892cb] text-white flex items-center justify-center font-semibold text-sm shadow-sm">
              JD
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">John Doe</p>
              <p className="text-[11px] text-slate-500 leading-tight">Sales Rep</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
              <div 
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/profile');
                }}
                className="px-4 py-2 cursor-pointer hover:bg-purple-50/40 transition-colors"
                title="View Profile"
              >
                <p className="text-xs font-semibold text-slate-800 hover:text-[#a459a8]">John Doe</p>
                <p className="text-[11px] text-slate-400 truncate">demo@dealflow.com</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-purple-50/50 hover:text-[#a459a8] flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <User className="w-3.5 h-3.5" /> My Profile
                </button>
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-purple-50/50 hover:text-[#a459a8] flex items-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5" /> System Settings
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
