import React from 'react';

const Spinner = ({ size = 'md', className = '' }) => {
  // TODO: Add customizable spinner size and primary color branding
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';

  return (
    <div className="flex items-center justify-center p-4">
      <div
        className={'animate-spin rounded-full border-2 border-slate-200 border-t-primary ' + sizeClass + ' ' + className}
      />
    </div>
  );
};

export default Spinner;
