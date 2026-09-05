import React from 'react';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error,
  className = '',
  ...props
}) => {
  // TODO: Implement input validation states and icons
  return (
    <div className="w-full flex flex-col gap-1">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={'px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary border-slate-300 ' + (error ? 'border-red-500 ' : '') + className}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default Input;
