import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import QueryForm from './components/QueryForm';
import VisualizationContainer from './components/VisualizationContainer';
import DataTable from './components/DataTable';
import SchemaViewer from './components/SchemaViewer';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [schema, setSchema] = useState(null);

  // Fetch database schema on component mount
  React.useEffect(() => {
    fetchSchema();
  }, []);

  const fetchSchema = async () => {
    try {
      const response = await axios.get('/api/schema');
      setSchema(response.data.schema);
    } catch (err) {
      console.error('Error fetching schema:', err);
      setError('Failed to fetch database schema');
    }
  };

  const handleQuery = async (query, resetContext) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/query', {
        query,
        reset_context: resetContext,
        visualization_format: 'd3'
      });
      
      setResult(response.data);
    } catch (err) {
      console.error('Error processing query:', err);
      setError(err.response?.data?.detail || 'An error occurred while processing your query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Agentic Data Visualization</h1>
        <p>Transform natural language queries into interactive visualizations</p>
      </header>
      
      <main className="app-content">
        <aside className="sidebar">
          <div className="schema-section">
            {schema && <SchemaViewer schema={schema} />}
          </div>
        </aside>

        <section className="main-content">
          <div className="chat-container">
            {error && (
              <div className="message error">
                <div className="message-content">
                  <h3>Error</h3>
                  <p>{error}</p>
                </div>
              </div>
            )}
            
            {result && (
              <div className="message">
                <div className="message-content">
                  <div className="result-header">
                    <h3>{result.query}</h3>
                    <div className="metadata">
                      <span>Rows: {result.row_count}</span>
                      <span>Type: {result.visualization_type}</span>
                    </div>
                  </div>
                  
                  <VisualizationContainer 
                    data={result.data} 
                    spec={result.d3_spec} 
                    visualizationType={result.visualization_type} 
                  />
                  
                  <details className="sql-details">
                    <summary>View SQL Query</summary>
                    <code>{result.sql_query}</code>
                  </details>

                  <details className="data-details">
                    <summary>View Data Table</summary>
                    <DataTable data={result.data} columns={result.columns} />
                  </details>
                </div>
              </div>
            )}
          </div>

          <div className="query-section">
            <QueryForm onSubmit={handleQuery} loading={loading} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
