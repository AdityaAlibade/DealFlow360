// TODO: Implement Select component with options, search, multi-select
import React from 'react';

const Select = ({ label, options = [], value, onChange, error, placeholder }) => {
  // TODO: Add select styling and options rendering
  return (
    <div>
      {/* TODO: Build select UI */}
      {label && <label>{label}</label>}
      <select value={value} onChange={onChange}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span>{error}</span>}
    </div>
  );
};

export default Select;
