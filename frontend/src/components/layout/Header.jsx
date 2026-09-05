import React from 'react';

const Header = () => {
  // TODO: Add notification bell, search bar, and user profile dropdown
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-800">DealFlow360</h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500">Welcome, User</span>
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
          D
        </div>
      </div>
    </header>
  );
};

export default Header;
