import React from 'react';

const Badge = ({ variant = 'default', children, className = '', dot = false }) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-[#a459a8]/10 text-[#a459a8] border-[#a459a8]/20',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    gold: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold',
    silver: 'bg-slate-200 text-slate-800 border-slate-300',
    bronze: 'bg-orange-100 text-orange-800 border-orange-200',
    high: 'bg-red-100 text-red-800 border-red-200 font-bold',
    medium: 'bg-amber-100 text-amber-800 border-amber-200 font-semibold',
    low: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold'
  };

  const dotColors = {
    default: 'bg-slate-400',
    primary: 'bg-[#a459a8]',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-sky-500',
    high: 'bg-red-600',
    medium: 'bg-amber-500',
    low: 'bg-emerald-500'
  };

  const style = variantStyles[variant.toLowerCase()] || variantStyles.default;
  const dotColor = dotColors[variant.toLowerCase()] || 'bg-current';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {children}
    </span>
  );
};

export default Badge;
