// TODO: Implement Button with variants, sizes, loading state
import React from 'react';

const Button = ({ children, variant = 'primary', size = 'md', disabled = false, loading = false, onClick, type = 'button', className = '' }) => {
  // TODO: Add variant styles, loading spinner
  return (
    <button type={type} disabled={disabled || loading} onClick={onClick} className={className}>
      {/* TODO: Build button UI */}
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;
