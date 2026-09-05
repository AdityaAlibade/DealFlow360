import React from 'react';

const Badge = ({ variant = 'default', children, className = '' }) => {
  // TODO: Style badge variants (success, warning, danger, info, primary)
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700',
    primary: 'bg-primary/10 text-primary font-medium',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-sky-50 text-sky-700 border border-sky-200'
  };

  const currentStyle = variantStyles[variant] || variantStyles.default;

  return (
    <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ' + currentStyle + ' ' + className}>
      {children}
    </span>
  );
};

export default Badge;
