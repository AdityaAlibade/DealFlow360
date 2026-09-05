import React from 'react';

const Card = ({ title, action, children, className = '' }) => {
  // TODO: Implement card header, body, and action button container
  return (
    <div className={'bg-white rounded-xl border border-slate-200 shadow-sm p-5 ' + className}>
      {(title || action) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          {title && <h3 className="text-base font-semibold text-slate-800">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default Card;
