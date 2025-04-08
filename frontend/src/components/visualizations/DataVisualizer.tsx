import React, { useState, useEffect } from 'react';
import { Chart } from '../ui/chart';

type DataPoint = Record<string, any>;

interface DataVisualizerProps {
  data: DataPoint[];
  className?: string;
}

export function DataVisualizer({ data, className = "" }: DataVisualizerProps) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar' | 'composed' | 'heatmap'>('bar');
  const [xKey, setXKey] = useState<string>("");
  const [yKey, setYKey] = useState<string>("");
  const [secondaryYKey, setSecondaryYKey] = useState<string>("");
  const [availableKeys, setAvailableKeys] = useState<{
    numeric: string[];
    categorical: string[];
    temporal: string[];
  }>({
    numeric: [],
    categorical: [],
    temporal: []
  });
  const [stackedMode, setStackedMode] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [colorScheme, setColorScheme] = useState<'default' | 'pastel' | 'vivid' | 'monochrome'>('default');

  // Analyze data to determine appropriate keys and chart type
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Get the first data point to analyze structure
    const sampleDataPoint = data[0];
    const keys = Object.keys(sampleDataPoint);
    
    // Categorize keys by data type
    const numericKeys: string[] = [];
    const categoricalKeys: string[] = [];
    const temporalKeys: string[] = [];
    
    keys.forEach(key => {
      const value = sampleDataPoint[key];
      
      // Check if it looks like a date
      if (
        typeof value === 'string' && 
        (
          /^\d{4}-\d{2}-\d{2}/.test(value) || // ISO date format
          !isNaN(Date.parse(value))           // Can be parsed as date
        )
      ) {
        temporalKeys.push(key);
      }
      // Check if numeric
      else if (typeof value === 'number') {
        numericKeys.push(key);
      }
      // Everything else is considered categorical
      else {
        categoricalKeys.push(key);
      }
    });
    
    setAvailableKeys({
      numeric: numericKeys,
      categorical: categoricalKeys,
      temporal: temporalKeys
    });
    
    // Auto-select appropriate keys and chart type based on data
    if (temporalKeys.length > 0 && numericKeys.length > 0) {
      // Time series data - use line chart
      setChartType('line');
      setXKey(temporalKeys[0]);
      setYKey(numericKeys[0]);
      
      // If multiple numeric fields available, set secondary Y key for composed chart
      if (numericKeys.length >= 2) {
        setSecondaryYKey(numericKeys[1]);
      }
    } else if (categoricalKeys.length > 0 && numericKeys.length > 0) {
      // Categorical vs numeric - use bar chart
      setChartType('bar');
      setXKey(categoricalKeys[0]);
      setYKey(numericKeys[0]);
      
      // If small number of categories, pie chart might be better
      if (
        new Set(data.map(item => item[categoricalKeys[0]])).size <= 8 && 
        numericKeys.length > 0
      ) {
        setChartType('pie');
      }
      
      // If multiple categorical dimensions and numeric values, radar might work well
      if (categoricalKeys.length >= 3 && numericKeys.length >= 1) {
        setChartType('radar');
      }
    } else if (numericKeys.length >= 2) {
      // Multiple numeric columns - try scatter plot
      setChartType('scatter');
      setXKey(numericKeys[0]);
      setYKey(numericKeys[1]);
      
      // If we have a third numeric dimension, set it as secondary Y for bubble chart potential
      if (numericKeys.length >= 3) {
        setSecondaryYKey(numericKeys[2]);
      }
    }
    
    // For large datasets with 2 categorical dimensions, heatmap might be appropriate
    if (categoricalKeys.length >= 2 && data.length > 20) {
      const uniqueCat1 = new Set(data.map(item => item[categoricalKeys[0]])).size;
      const uniqueCat2 = new Set(data.map(item => item[categoricalKeys[1]])).size;
      
      if (uniqueCat1 <= 15 && uniqueCat2 <= 15 && numericKeys.length > 0) {
        setChartType('heatmap');
        setXKey(categoricalKeys[0]);
        setYKey(categoricalKeys[1]);
        setSecondaryYKey(numericKeys[0]); // Value for the heatmap intensity
      }
    }
  }, [data]);

  const handleChartTypeChange = (type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar' | 'composed' | 'heatmap') => {
    setChartType(type);
  };

  const handleXKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setXKey(e.target.value);
  };

  const handleYKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYKey(e.target.value);
  };
  
  const handleSecondaryYKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSecondaryYKey(e.target.value);
  };

  if (!data || data.length === 0) {
    return (
      <div className="p-6 text-zinc-400 text-center bg-zinc-800/60 border border-zinc-700/50 rounded-lg">
        No data available for visualization
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="mb-4 p-4 bg-zinc-800/60 border border-zinc-700/50 rounded-lg">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">Visualization Controls</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Chart Type Selector - Extended */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Chart Type</label>
            <div className="flex flex-wrap gap-1 rounded-md">
              {['bar', 'line', 'pie', 'area', 'scatter', 'radar', 'composed', 'heatmap'].map((type) => (
                <button
                  key={type}
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    chartType === type 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}
                  onClick={() => handleChartTypeChange(type as any)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* X-Axis Selector */}
          <div>
            <label htmlFor="x-axis" className="block text-xs text-zinc-400 mb-1">
              X-Axis / Category
            </label>
            <select
              id="x-axis"
              value={xKey}
              onChange={handleXKeyChange}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-md py-2 px-3 text-xs text-zinc-200"
            >
              {xKey === "" && <option value="">Select field</option>}
              {availableKeys.categorical.map(key => (
                <option key={`cat-${key}`} value={key}>{key} (categorical)</option>
              ))}
              {availableKeys.temporal.map(key => (
                <option key={`temp-${key}`} value={key}>{key} (date/time)</option>
              ))}
              {availableKeys.numeric.map(key => (
                <option key={`num-${key}`} value={key}>{key} (numeric)</option>
              ))}
            </select>
          </div>
          
          {/* Y-Axis Selector */}
          <div>
            <label htmlFor="y-axis" className="block text-xs text-zinc-400 mb-1">
              Y-Axis / Value
            </label>
            <select
              id="y-axis"
              value={yKey}
              onChange={handleYKeyChange}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-md py-2 px-3 text-xs text-zinc-200"
            >
              {yKey === "" && <option value="">Select field</option>}
              {availableKeys.numeric.map(key => (
                <option key={`num-${key}`} value={key}>{key} (numeric)</option>
              ))}
              {chartType === 'heatmap' && availableKeys.categorical.map(key => (
                <option key={`cat-${key}`} value={key}>{key} (categorical)</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Secondary Y-Axis / Value field (for composed charts, bubble charts, etc.) */}
          <div>
            <label htmlFor="secondary-y-axis" className="block text-xs text-zinc-400 mb-1">
              Secondary Value {chartType === 'heatmap' ? '(Intensity)' : ''}
            </label>
            <select
              id="secondary-y-axis"
              value={secondaryYKey}
              onChange={handleSecondaryYKeyChange}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-md py-2 px-3 text-xs text-zinc-200"
            >
              <option value="">None</option>
              {availableKeys.numeric.map(key => (
                <option key={`num-${key}`} value={key}>{key} (numeric)</option>
              ))}
            </select>
          </div>
          
          {/* Visual Options */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Options</label>
            <div className="flex space-x-2">
              <label className="flex items-center space-x-1">
                <input 
                  type="checkbox" 
                  checked={showLegend} 
                  onChange={(e) => setShowLegend(e.target.checked)}
                  className="w-3 h-3 rounded bg-zinc-700 border-zinc-600"
                />
                <span className="text-xs text-zinc-300">Legend</span>
              </label>
              <label className="flex items-center space-x-1">
                <input 
                  type="checkbox" 
                  checked={showGrid} 
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="w-3 h-3 rounded bg-zinc-700 border-zinc-600"
                />
                <span className="text-xs text-zinc-300">Grid</span>
              </label>
              <label className="flex items-center space-x-1">
                <input 
                  type="checkbox" 
                  checked={stackedMode} 
                  onChange={(e) => setStackedMode(e.target.checked)}
                  className="w-3 h-3 rounded bg-zinc-700 border-zinc-600"
                />
                <span className="text-xs text-zinc-300">Stacked</span>
              </label>
            </div>
          </div>
          
          {/* Color Scheme */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Color Scheme</label>
            <select
              value={colorScheme}
              onChange={(e) => setColorScheme(e.target.value as any)}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-md py-2 px-3 text-xs text-zinc-200"
            >
              <option value="default">Default</option>
              <option value="pastel">Pastel</option>
              <option value="vivid">Vivid</option>
              <option value="monochrome">Monochrome</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Chart Display */}
      {xKey && yKey ? (
        <Chart
          data={data}
          type={chartType}
          xKey={xKey}
          yKey={yKey}
          secondaryYKey={secondaryYKey}
          title={`${yKey} by ${xKey}`}
          showLegend={showLegend}
          showGrid={showGrid}
          stacked={stackedMode}
          colorScheme={colorScheme}
        />
      ) : (
        <div className="p-6 text-zinc-400 text-center bg-zinc-800/60 border border-zinc-700/50 rounded-lg">
          Please select fields for both axes
        </div>
      )}
      
      {/* Data Summary */}
      <div className="mt-4 p-4 bg-zinc-800/60 border border-zinc-700/50 rounded-lg">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">Data Summary</h3>
        <div className="text-xs text-zinc-400">
          <p>{data.length} data points available for visualization</p>
          <p className="mt-1">
            {availableKeys.numeric.length} numeric fields, {availableKeys.categorical.length} categorical fields,{' '}
            {availableKeys.temporal.length} temporal fields
          </p>
          
          {/* Additional stats based on selected fields */}
          {yKey && availableKeys.numeric.includes(yKey) && (
            <div className="mt-2 pt-2 border-t border-zinc-700/50">
              <p className="text-zinc-300 mb-1">Stats for {yKey}:</p>
              <p>Min: {Math.min(...data.map(d => parseFloat(d[yKey])))?.toFixed(2) || 0}</p>
              <p>Max: {Math.max(...data.map(d => parseFloat(d[yKey])))?.toFixed(2) || 0}</p>
              <p>Avg: {(data.reduce((sum, d) => sum + parseFloat(d[yKey]), 0) / data.length)?.toFixed(2) || 0}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 