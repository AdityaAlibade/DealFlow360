// TODO: Implement Modal dialog with backdrop, header, footer
import React from 'react';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  // TODO: Handle keyboard esc, backdrop click, transitions
  if (!isOpen) return null;

  return (
    <div>
      {/* TODO: Build modal UI */}
      <div>
        {title && <h3>{title}</h3>}
        <div>{children}</div>
        {footer && <div>{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
