import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  // TODO: Implement dialog transitions and backdrop click handling
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-bold"
          >
            &times;
          </button>
        </div>
        <div className="py-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
