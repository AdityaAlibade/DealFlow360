// TODO: Implement Toast notification wrapper / alert toast
import React from 'react';

const Toast = ({ message, type = 'info', onClose }) => {
  // TODO: Build toast styling based on type (success, error, info)
  return (
    <div>
      {/* TODO: Build toast UI */}
      <p>{message}</p>
      {onClose && <button onClick={onClose}>Close</button>}
    </div>
  );
};

export default Toast;
