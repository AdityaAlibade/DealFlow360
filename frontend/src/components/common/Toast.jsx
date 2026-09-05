import React from 'react';

const Toast = ({ message, type = 'info', onClose }) => {
  // TODO: Implement toast auto-dismiss timer and position animation
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          &times;
        </button>
      )}
    </div>
  );
};

export default Toast;
