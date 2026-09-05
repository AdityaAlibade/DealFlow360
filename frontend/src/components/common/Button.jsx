import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) => {
  // TODO: Implement variant styling (primary #a459a8, secondary, outline, danger)
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClass = variant === 'primary' ? 'bg-primary hover:bg-primary-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseClasses + ' ' + variantClass + ' ' + className}
      {...props}
    >
      {/* TODO: Add loading spinner support */}
      {children}
    </button>
  );
};

export default Button;
