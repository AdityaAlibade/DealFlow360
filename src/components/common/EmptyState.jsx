// TODO: Implement EmptyState component for empty lists and search results
import React from 'react';

const EmptyState = ({ title = 'No data found', description, actionLabel, onAction }) => {
  // TODO: Build empty state with icon and call-to-action
  return (
    <div>
      {/* TODO: Build empty state UI */}
      <h4>{title}</h4>
      {description && <p>{description}</p>}
      {actionLabel && onAction && <button onClick={onAction}>{actionLabel}</button>}
    </div>
  );
};

export default EmptyState;
