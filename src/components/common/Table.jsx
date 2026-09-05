// TODO: Implement reusable Table component with sorting and column definitions
import React from 'react';

const Table = ({ columns = [], data = [], onRowClick }) => {
  // TODO: Implement table header, rows, empty state
  return (
    <table>
      {/* TODO: Build table UI */}
      <thead>
        <tr>
          {columns.map((col, idx) => (
            <th key={idx}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIdx) => (
          <tr key={rowIdx} onClick={() => onRowClick && onRowClick(row)}>
            {columns.map((col, colIdx) => (
              <td key={colIdx}>{col.render ? col.render(row) : row[col.accessor]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
