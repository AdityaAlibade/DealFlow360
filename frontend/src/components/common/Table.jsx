import React from 'react';

const Table = ({ columns = [], data = [], onRowClick }) => {
  // TODO: Implement sortable headers and custom column renderers
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-lg">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-slate-600 font-medium">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-4 py-3 text-left">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-slate-500">
                {/* TODO: Add EmptyState integration */}
                No records found.
              </td>
            </tr>
          ) : (
            data.map((row, rIdx) => (
              <tr
                key={rIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''}
              >
                {columns.map((col, cIdx) => (
                  <td key={cIdx} className="px-4 py-3 text-slate-700">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
