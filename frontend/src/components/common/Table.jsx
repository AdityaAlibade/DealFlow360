import React from 'react';

const Table = ({ columns = [], data = [], onRowClick, emptyMessage = 'No records found' }) => {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50/80 text-slate-600 text-xs uppercase tracking-wider font-semibold">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={`px-4 py-3.5 text-left ${col.headerClassName || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400 text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rIdx) => (
              <tr
                key={rIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors duration-100 ${
                  rIdx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                } ${onRowClick ? 'cursor-pointer hover:bg-purple-50/40' : 'hover:bg-slate-50/60'}`}
              >
                {columns.map((col, cIdx) => (
                  <td key={cIdx} className={`px-4 py-3.5 text-slate-700 align-middle ${col.className || ''}`}>
                    {col.render ? col.render(row, rIdx) : row[col.accessor]}
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
