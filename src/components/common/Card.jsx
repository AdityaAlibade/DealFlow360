// TODO: Implement Card component with header, content, footer
import React from 'react';

const Card = ({ children, title, subtitle, footer, className = '' }) => {
  return (
    <div className={className}>
      {/* TODO: Build card UI */}
      {title && (
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
      )}
      <div>{children}</div>
      {footer && <div>{footer}</div>}
    </div>
  );
};

export default Card;
