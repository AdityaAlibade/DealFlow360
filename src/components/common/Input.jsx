// TODO: Implement Input component with label, error state, icons
import React from 'react';

const Input = ({ label, error, type = 'text', value, onChange, placeholder, name, ...rest }) => {
  // TODO: Add input styling, error message display
  return (
    <div>
      {/* TODO: Build input UI */}
      {label && <label>{label}</label>}
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} {...rest} />
      {error && <span>{error}</span>}
    </div>
  );
};

export default Input;
