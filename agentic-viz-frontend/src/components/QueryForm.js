import React, { useState } from 'react';
import VoiceInput from './VoiceInput';

const QueryForm = ({ onSubmit, loading }) => {
  const [query, setQuery] = useState('');
  const [resetContext, setResetContext] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query, resetContext);
    }
  };
  
  const exampleQueries = [
    "Show me total sales by product category",
    "What were the top 5 selling products last month?",
    "Compare sales across different regions",
    "Show me the sales trend over time",
    "Which customers spent the most?"
  ];
  
  const handleExampleClick = (example) => {
    setQuery(example);
  };

  const handleVoiceInput = (transcript) => {
    setQuery(transcript);
  };

  return (
    <div className="query-form">
      <h2>Ask a Question</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <div className="input-wrapper">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your question about the data..."
              rows={3}
              disabled={loading}
            />
            <VoiceInput 
              onTranscript={handleVoiceInput}
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="form-controls">
          <label className="reset-context">
            <input
              type="checkbox"
              checked={resetContext}
              onChange={(e) => setResetContext(e.target.checked)}
              disabled={loading}
            />
            Reset conversation context
          </label>
          
          <button type="submit" disabled={loading || !query.trim()}>
            {loading ? 'Processing...' : 'Visualize'}
          </button>
        </div>
      </form>
      
      <div className="example-queries">
        <h3>Example Questions:</h3>
        <ul>
          {exampleQueries.map((example, index) => (
            <li key={index}>
              <button 
                onClick={() => handleExampleClick(example)}
                disabled={loading}
              >
                {example}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default QueryForm;
