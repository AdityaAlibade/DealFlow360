import React from 'react';

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  // TODO: Implement pagination page numbers, next, and previous triggers
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
      <span className="text-sm text-slate-600">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
          className="px-3 py-1 text-sm border border-slate-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
          className="px-3 py-1 text-sm border border-slate-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
