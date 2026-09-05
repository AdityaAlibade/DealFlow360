// TODO: Implement Pagination controls with page numbers, prev/next
import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // TODO: Build pagination controls
  return (
    <div>
      {/* TODO: Build pagination UI */}
      <button disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>Prev</button>
      <span>Page {currentPage} of {totalPages}</span>
      <button disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>Next</button>
    </div>
  );
};

export default Pagination;
