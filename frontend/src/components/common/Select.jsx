import React from 'react';

const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  placeholder = 'Select an option',
  className = '',
  ...props
}) => {
  // TODO: Implement select options rendering and custom styled dropdown
  return (
    <div className="w-full flex flex-col gap-1">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={'px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary border-slate-300 ' + className}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt, idx) => (
          <option key={opt.value || opt || idx} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default Select;
