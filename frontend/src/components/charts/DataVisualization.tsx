import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Button } from '../ui/button';
import { BarChart2, PieChart, LineChart } from 'lucide-react';

type ChartType = 'bar' | 'pie' | 'line';

interface DataVisualizationProps {
  data: any[];
  query?: string | null;
  className?: string;
}

const DataVisualization: React.FC<DataVisualizationProps> = ({ data, query, className = '' }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine if the data is suitable for visualization
  const isVisualizableData = data && Array.isArray(data) && data.length > 0;

  // Extract column names from the first data item
  const columns = isVisualizableData ? Object.keys(data[0]) : [];
  
  // Try to determine numeric columns for y-axis
  const numericColumns = columns.filter(col => {
    return data.some(item => typeof item[col] === 'number');
  });

  // Try to determine categorical columns for x-axis
  const categoricalColumns = columns.filter(col => {
    return !numericColumns.includes(col);
  });

  // Default selections for axes
  const [xAxis, setXAxis] = useState(categoricalColumns[0] || '');
  const [yAxis, setYAxis] = useState(numericColumns[0] || '');

  useEffect(() => {
    if (isVisualizableData && chartRef.current && isExpanded) {
      renderChart();
    }
  }, [chartType, data, isExpanded, xAxis, yAxis]);

  // Define margin as a component-level constant for all chart functions to use
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };

  const renderChart = () => {
    if (!chartRef.current || !isVisualizableData) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();

    const width = chartRef.current.clientWidth;
    const height = 300;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    switch (chartType) {
      case 'bar':
        renderBarChart(svg, innerWidth, innerHeight);
        break;
      case 'pie':
        renderPieChart(svg, Math.min(innerWidth, innerHeight) / 2);
        break;
      case 'line':
        renderLineChart(svg, innerWidth, innerHeight);
        break;
    }
  };

  const renderBarChart = (svg: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => {
    if (!xAxis || !yAxis) return;

    // Create scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => String(d[xAxis])))
      .range([0, width])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => Number(d[yAxis])) || 0])
      .nice()
      .range([height, 0]);

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    svg.append('g')
      .call(d3.axisLeft(yScale));

    // Add bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(String(d[xAxis])) || 0)
      .attr('y', d => yScale(Number(d[yAxis])))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - yScale(Number(d[yAxis])))
      .attr('fill', '#8b5cf6')
      .attr('rx', 2)
      .attr('ry', 2);

    // Add labels
    svg.append('text')
      .attr('class', 'x-label')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 5)
      .attr('fill', '#a1a1aa')
      .attr('font-size', '12px')
      .text(xAxis);

    svg.append('text')
      .attr('class', 'y-label')
      .attr('text-anchor', 'middle')
      .attr('transform', `rotate(-90)`)
      .attr('x', -height / 2)
      .attr('y', -margin.left + 15)
      .attr('fill', '#a1a1aa')
      .attr('font-size', '12px')
      .text(yAxis);
  };

  const renderPieChart = (svg: d3.Selection<SVGGElement, unknown, null, undefined>, radius: number) => {
    if (!xAxis || !yAxis) return;

    // Group data by the x-axis category and sum the y-axis values
    const pieData = d3.rollup(
      data,
      v => d3.sum(v, d => Number(d[yAxis])),
      d => String(d[xAxis])
    );

    const pieArray = Array.from(pieData, ([key, value]) => ({ key, value }));

    // Create a pie layout
    const pie = d3.pie<{ key: string; value: number }>()
      .value(d => d.value);

    const arcs = pie(pieArray);

    // Create an arc generator
    const arcGenerator = d3.arc<d3.PieArcDatum<{ key: string; value: number }>>()
      .innerRadius(0)
      .outerRadius(radius);

    // Create a color scale
    const colorScale = d3.scaleOrdinal<string>()
      .domain(pieArray.map(d => d.key))
      .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), pieArray.length));

    // Draw the pie chart
    const g = svg.append('g')
      .attr('transform', `translate(${radius},${radius})`);

    g.selectAll('path')
      .data(arcs)
      .enter()
      .append('path')
      .attr('d', arcGenerator)
      .attr('fill', d => colorScale(d.data.key))
      .attr('stroke', 'white')
      .style('stroke-width', '2px');

    // Add labels
    const labelArc = d3.arc<d3.PieArcDatum<{ key: string; value: number }>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.6);

    g.selectAll('text')
      .data(arcs)
      .enter()
      .append('text')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '10px')
      .text(d => d.data.key);

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${radius * 2 + 20}, 0)`);

    pieArray.forEach((d, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendRow.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', colorScale(d.key));

      legendRow.append('text')
        .attr('x', 15)
        .attr('y', 10)
        .attr('text-anchor', 'start')
        .attr('font-size', '12px')
        .attr('fill', '#a1a1aa')
        .text(`${d.key} (${d.value})`);
    });
  };

  const renderLineChart = (svg: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => {
    if (!xAxis || !yAxis) return;

    // Sort data by x-axis if it's a date or number
    const sortedData = [...data];
    if (data.length > 0 && (typeof data[0][xAxis] === 'number' || data[0][xAxis] instanceof Date)) {
      sortedData.sort((a, b) => {
        const aVal = a[xAxis];
        const bVal = b[xAxis];
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      });
    }

    // Create scales
    const xScale = d3.scaleBand()
      .domain(sortedData.map(d => String(d[xAxis])))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(sortedData, d => Number(d[yAxis])) || 0])
      .nice()
      .range([height, 0]);

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    svg.append('g')
      .call(d3.axisLeft(yScale));

    // Create the line generator
    const line = d3.line<any>()
      .x(d => (xScale(String(d[xAxis])) || 0) + xScale.bandwidth() / 2)
      .y(d => yScale(Number(d[yAxis])))
      .curve(d3.curveMonotoneX);

    // Add the line path
    svg.append('path')
      .datum(sortedData)
      .attr('fill', 'none')
      .attr('stroke', '#8b5cf6')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add data points
    svg.selectAll('.dot')
      .data(sortedData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => (xScale(String(d[xAxis])) || 0) + xScale.bandwidth() / 2)
      .attr('cy', d => yScale(Number(d[yAxis])))
      .attr('r', 4)
      .attr('fill', '#8b5cf6')
      .attr('stroke', 'white')
      .attr('stroke-width', 1.5);

    // Add labels
    svg.append('text')
      .attr('class', 'x-label')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 5)
      .attr('fill', '#a1a1aa')
      .attr('font-size', '12px')
      .text(xAxis);

    svg.append('text')
      .attr('class', 'y-label')
      .attr('text-anchor', 'middle')
      .attr('transform', `rotate(-90)`)
      .attr('x', -height / 2)
      .attr('y', -margin.left + 15)
      .attr('fill', '#a1a1aa')
      .attr('font-size', '12px')
      .text(yAxis);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isVisualizableData) {
    return null;
  }

  return (
    <div className={`mt-3 border-t border-purple-900/30 pt-3 ${className}`}>
      <div className="text-xs text-purple-300 mb-2 flex justify-between items-center">
        <span>Data Visualization</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleExpand} 
          className="text-xs text-purple-300 hover:text-purple-200 p-1 h-6"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>

      {isExpanded ? (
        <div className="bg-black/30 p-3 rounded-md">
          {/* Chart Type Selector */}
          <div className="flex items-center justify-center mb-4 gap-2">
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
              className="flex items-center gap-1"
            >
              <BarChart2 size={14} />
              Bar
            </Button>
            <Button
              variant={chartType === 'pie' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('pie')}
              className="flex items-center gap-1"
            >
              <PieChart size={14} />
              Pie
            </Button>
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
              className="flex items-center gap-1"
            >
              <LineChart size={14} />
              Line
            </Button>
          </div>

          {/* Axis Selectors */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1">X-Axis</label>
              <select
                value={xAxis}
                onChange={(e) => setXAxis(e.target.value)}
                className="bg-zinc-800 text-white text-sm rounded-md px-2 py-1 border border-zinc-700"
              >
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1">Y-Axis</label>
              <select
                value={yAxis}
                onChange={(e) => setYAxis(e.target.value)}
                className="bg-zinc-800 text-white text-sm rounded-md px-2 py-1 border border-zinc-700"
              >
                {numericColumns.length > 0 ? (
                  numericColumns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))
                ) : (
                  columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* SQL Query Display */}
          {query && (
            <div className="mb-4 p-2 bg-zinc-900 rounded-md overflow-x-auto">
              <pre className="text-xs text-gray-300">{query}</pre>
            </div>
          )}

          {/* Chart Container */}
          <div
            ref={chartRef}
            className="w-full h-[300px] bg-zinc-900/50 rounded-md overflow-hidden"
          />

          {/* Data Table Preview */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-800">
                  {columns.map((col) => (
                    <th key={col} className="p-2 text-left text-gray-300 border-b border-zinc-700">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 5).map((row, i) => (
                  <tr key={i} className="hover:bg-zinc-800/50">
                    {columns.map((col) => (
                      <td key={col} className="p-2 border-b border-zinc-900">
                        {row[col]?.toString()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 5 && (
              <div className="text-center text-xs text-gray-500 mt-2">
                Showing 5 of {data.length} rows
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-black/30 p-2 rounded-md">
          <div className="text-xs text-gray-400">
            {data.length} data points available for visualization
          </div>
          <div className="flex items-center justify-center mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs flex items-center gap-1"
              onClick={toggleExpand}
            >
              <BarChart2 size={12} />
              View Chart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataVisualization;
