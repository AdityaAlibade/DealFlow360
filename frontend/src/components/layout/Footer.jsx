import React from 'react';

const Footer = () => {
  // TODO: Add copyright, system status indicator, and documentation links
  return (
    <footer className="h-12 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-xs text-slate-500">
      <span>&copy; {new Date().getFullYear()} DealFlow360 Platform. All rights reserved.</span>
      <span>Enterprise Edition v1.0</span>
    </footer>
  );
};

export default Footer;
