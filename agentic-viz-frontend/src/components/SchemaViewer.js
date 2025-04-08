import React, { useState } from 'react';

const SchemaViewer = ({ schema }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!schema) {
    return null;
  }
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div className="schema-viewer">
      <div className="schema-header" onClick={toggleExpand}>
        <h3>Database Schema {isExpanded ? '▼' : '▶'}</h3>
      </div>
      
      {isExpanded && (
        <div className="schema-content">
          {Object.entries(schema).map(([tableName, columns]) => (
            <div key={tableName} className="schema-table">
              <h4>{tableName}</h4>
              <ul>
                {columns.map((column, index) => (
                  <li key={index}>
                    <strong>{column.name}</strong> ({column.type})
                    {column.primary_key && <span className="primary-key"> PRIMARY KEY</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchemaViewer;
