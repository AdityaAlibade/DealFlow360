import React from 'react';

const Footer = () => {
  return (
    <footer className="h-12 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-xs text-slate-500">
      <div className="flex items-center gap-1">
        <span>&copy; 2026 DealFlow360. All rights reserved.</span>
      </div>
      <div className="flex items-center gap-6">
        <a href="#about" className="hover:text-[#a459a8] transition-colors">About</a>
        <a href="#privacy" className="hover:text-[#a459a8] transition-colors">Privacy</a>
        <a href="#terms" className="hover:text-[#a459a8] transition-colors">Terms</a>
        <a href="#help" className="hover:text-[#a459a8] transition-colors">Help</a>
        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">v1.0.0</span>
      </div>
    </footer>
  );
};

export default Footer;
