import React from 'react';

const DataTable = ({ data, columns }) => {
  if (!data || data.length === 0 || !columns || columns.length === 0) {
    return null;
  }

  return (
    <div className="data-table">
      <h2>Data Table</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>{row[column]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
