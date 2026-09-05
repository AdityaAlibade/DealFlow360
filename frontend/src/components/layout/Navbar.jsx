import React from 'react';

const Navbar = () => {
  // TODO: Implement quick actions, breadcrumb navigator, and search shortcut
  return (
    <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex items-center justify-between text-xs text-slate-500">
      <div className="flex items-center gap-2">
        <span>Workspace</span> / <span className="text-slate-800 font-medium">Overview</span>
      </div>
      <div>Status: Online</div>
    </div>
  );
};

export default Navbar;
