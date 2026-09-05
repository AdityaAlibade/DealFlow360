// TODO: Implement Badge with variants
import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  return (
    <span className={className}>
      {/* TODO: Build badge UI */}
      {children}
    </span>
  );
};

export default Badge;
