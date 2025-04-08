import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const VisualizationContainer = ({ data, spec, visualizationType }) => {
  const d3Container = useRef(null);
  
  useEffect(() => {
    if (data && data.length > 0 && spec && d3Container.current) {
      // Clear any existing visualization
      d3.select(d3Container.current).selectAll('*').remove();
      
      // Create the visualization based on the type
      switch (visualizationType) {
        case 'bar':
          createBarChart(data, spec);
          break;
        case 'line':
          createLineChart(data, spec);
          break;
        case 'scatter':
          createScatterPlot(data, spec);
          break;
        case 'pie':
          createPieChart(data, spec);
          break;
        case 'heatmap':
          createHeatmap(data, spec);
          break;
        default:
          createDataTable(data);
      }
    }
  }, [data, spec, visualizationType]);
  
  // Add this style to all tooltips in each chart type
  const tooltipStyle = {
    fill: '#ffffff',  // White text
    fontSize: '12px',
    fontWeight: 'bold'
  };

  // Add shared text style object
  const textStyle = {
    fill: '#ffffff',
    fontSize: '12px'
  };

  const titleStyle = {
    ...textStyle,
    fontSize: '16px',
    fontWeight: 'bold'
  };

  const axisStyle = {
    ...textStyle,
    fontSize: '12px'
  };

  // Update chart creation functions
  const createBarChart = (data, spec) => {
    // Get container dimensions
    const containerWidth = d3Container.current.clientWidth;
    const containerHeight = 500;
    
    // Set margins
    const margin = { top: 50, right: 30, bottom: 60, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    
    // Get field names from spec
    const xField = spec.encoding.x.field;
    const yField = spec.encoding.y?.field;
    
    // Create SVG
    const svg = d3.select(d3Container.current)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('fill', '#ffffff')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(`${yField || 'Count'} by ${xField}`);
    
    // Create scales
    const x = d3.scaleBand()
      .domain(data.map(d => d[xField]))
      .range([0, width])
      .padding(0.2);
    
    const yValues = yField ? data.map(d => +d[yField]) : data.map(() => 1);
    const yMax = d3.max(yValues);
    
    const y = d3.scaleLinear()
      .domain([0, yMax * 1.1]) // Add 10% padding
      .range([height, 0]);
    
    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('fill', '#ffffff')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');
    
    // Add X axis label
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .style('fill', '#ffffff')
      .style('text-anchor', 'middle')
      .text(xField);
    
    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('fill', '#ffffff');
    
    // Add Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 15)
      .attr('x', -height / 2)
      .attr('dy', '1em')
      .style('fill', '#ffffff')
      .style('text-anchor', 'middle')
      .text(yField || 'Count');
    
    // Add bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d[xField]))
      .attr('width', x.bandwidth())
      .attr('y', d => yField ? y(+d[yField]) : y(1))
      .attr('height', d => yField ? height - y(+d[yField]) : height - y(1))
      .attr('fill', '#4285F4')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill', '#3367D6');
        
        // Show tooltip
        const tooltip = svg.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${x(d[xField]) + x.bandwidth() / 2},${yField ? y(+d[yField]) - 10 : y(1) - 10})`);
        
        tooltip.append('text')
          .attr('text-anchor', 'middle')
          .text(`${yField ? d[yField] : 1}`)
          .style('fill', '#ffffff')
          .style('font-size', '12px')
          .style('font-weight', 'bold');
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill', '#4285F4');
        svg.select('.tooltip').remove();
      });
  };

  // Apply the same style updates to other chart types
  const createLineChart = (data, spec) => {
    // Get container dimensions
    const containerWidth = d3Container.current.clientWidth;
    const containerHeight = 500;
    
    // Set margins
    const margin = { top: 50, right: 30, bottom: 60, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    
    // Get field names from spec
    const xField = spec.encoding.x.field;
    const yField = spec.encoding.y?.field;
    
    // Sort data by x-axis field
    data = [...data].sort((a, b) => {
      if (a[xField] < b[xField]) return -1;
      if (a[xField] > b[xField]) return 1;
      return 0;
    });
    
    // Create SVG
    const svg = d3.select(d3Container.current)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('fill', '#ffffff')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(`${yField} over ${xField}`);
    
    // Create scales
    const x = d3.scalePoint()
      .domain(data.map(d => d[xField]))
      .range([0, width]);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => +d[yField]) * 1.1])
      .range([height, 0]);
    
    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('fill', '#ffffff')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');
    
    // Add X axis label
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .style('fill', '#ffffff')
      .style('text-anchor', 'middle')
      .text(xField);
    
    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('fill', '#ffffff');
    
    // Add Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 15)
      .attr('x', -height / 2)
      .attr('dy', '1em')
      .style('fill', '#ffffff')
      .style('text-anchor', 'middle')
      .text(yField);
    
    // Add line
    const line = d3.line()
      .x(d => x(d[xField]))
      .y(d => y(+d[yField]));
    
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#4285F4')
      .attr('stroke-width', 2)
      .attr('d', line);
    
    // Add points
    svg.selectAll('.point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', d => x(d[xField]))
      .attr('cy', d => y(+d[yField]))
      .attr('r', 5)
      .attr('fill', '#4285F4')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('r', 8)
          .attr('fill', '#3367D6');
        
        // Show tooltip
        const tooltip = svg.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${x(d[xField])},${y(+d[yField]) - 15})`);
        
        tooltip.append('text')
          .attr('text-anchor', 'middle')
          .text(`${d[yField]}`)
          .style('fill', '#ffffff')
          .style('font-size', '12px')
          .style('font-weight', 'bold');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('r', 5)
          .attr('fill', '#4285F4');
        svg.select('.tooltip').remove();
      });
  };

  const createScatterPlot = (data, spec) => {
    // Get container dimensions
    const containerWidth = d3Container.current.clientWidth;
    const containerHeight = 500;
    
    // Set margins
    const margin = { top: 50, right: 30, bottom: 60, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    
    // Get field names from spec
    const xField = spec.encoding.x.field;
    const yField = spec.encoding.y?.field;
    const colorField = spec.encoding.color?.field;
    
    // Create SVG
    const svg = d3.select(d3Container.current)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('fill', '#ffffff')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(`${yField} vs ${xField}`);
    
    // Create scales
    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => +d[xField]) * 1.1])
      .range([0, width]);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => +d[yField]) * 1.1])
      .range([height, 0]);
    
    // Create color scale if needed
    let colorScale;
    if (colorField) {
      const uniqueValues = [...new Set(data.map(d => d[colorField]))];
      colorScale = d3.scaleOrdinal()
        .domain(uniqueValues)
        .range(d3.schemeCategory10);
    }
    
    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('fill', '#ffffff');
    
    // Add X axis label
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .style('fill', '#ffffff')
      .style('text-anchor', 'middle')
      .text(xField);
    
    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('fill', '#ffffff');
    
    // Add Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 15)
      .attr('x', -height / 2)
      .attr('dy', '1em')
      .style('fill', '#ffffff')
      .style('text-anchor', 'middle')
      .text(yField);
    
    // Add points
    svg.selectAll('.point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', d => x(+d[xField]))
      .attr('cy', d => y(+d[yField]))
      .attr('r', 7)
      .attr('fill', d => colorField ? colorScale(d[colorField]) : '#4285F4')
      .attr('opacity', 0.7)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('r', 10)
          .attr('opacity', 1);
        
        // Show tooltip
        const tooltip = svg.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${x(+d[xField])},${y(+d[yField]) - 15})`);
        
        tooltip.append('text')
          .attr('text-anchor', 'middle')
          .text(`${xField}: ${d[xField]}, ${yField}: ${d[yField]}${colorField ? `, ${colorField}: ${d[colorField]}` : ''}`)
          .style('fill', '#ffffff')
          .style('font-size', '12px')
          .style('font-weight', 'bold');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('r', 7)
          .attr('opacity', 0.7);
        svg.select('.tooltip').remove();
      });
    
    // Add legend if using color
    if (colorField) {
      const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width - 100}, 0)`);
      
      const uniqueValues = [...new Set(data.map(d => d[colorField]))];
      
      uniqueValues.forEach((value, i) => {
        const legendRow = legend.append('g')
          .attr('transform', `translate(0, ${i * 20})`);
        
        legendRow.append('rect')
          .attr('width', 10)
          .attr('height', 10)
          .attr('fill', colorScale(value));
        
        legendRow.append('text')
          .attr('x', 15)
          .attr('y', 10)
          .text(value)
          .style('fill', '#ffffff')
          .style('font-size', '12px');
      });
    }
  };

  const createPieChart = (data, spec) => {
    // Get container dimensions
    const containerWidth = d3Container.current.clientWidth;
    const containerHeight = 500;
    
    // Set margins
    const margin = { top: 50, right: 30, bottom: 60, left: 30 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    
    // Get field names from spec
    const nameField = spec.encoding.x.field;
    const valueField = spec.encoding.y?.field;
    
    // Create SVG
    const svg = d3.select(d3Container.current)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .append('g')
      .attr('transform', `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);
    
    // Add title
    svg.append('text')
      .attr('x', 0)
      .attr('y', -height / 2 - 20)
      .attr('text-anchor', 'middle')
      .style('fill', '#ffffff')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(`Distribution of ${nameField}`);
    
    // Compute the position of each group on the pie
    const radius = Math.min(width, height) / 2;
    
    // Prepare data for pie chart
    let pieData;
    if (valueField) {
      pieData = data.map(d => ({ name: d[nameField], value: +d[valueField] }));
    } else {
      // Count occurrences of each category
      const counts = {};
      data.forEach(d => {
        const name = d[nameField];
        counts[name] = (counts[name] || 0) + 1;
      });
      pieData = Object.entries(counts).map(([name, value]) => ({ name, value }));
    }
    
    // Create color scale
    const color = d3.scaleOrdinal()
      .domain(pieData.map(d => d.name))
      .range(d3.schemeCategory10);
    
    // Create the pie layout
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);
    
    // Create arc generator
    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);
    
    // Create outer arc for labels
    const outerArc = d3.arc()
      .innerRadius(radius * 1.1)
      .outerRadius(radius * 1.1);
    
    // Build the pie chart
    svg.selectAll('pieces')
      .data(pie(pieData))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.name))
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .style('opacity', 0.8)
          .style('stroke-width', '3px');
        
        // Show tooltip
        const tooltip = svg.append('g')
          .attr('class', 'tooltip');
        
        tooltip.append('text')
          .attr('text-anchor', 'middle')
          .text(`${d.data.name}: ${d.data.value} (${(d.data.value / d3.sum(pieData, d => d.value) * 100).toFixed(1)}%)`)
          .style('fill', '#ffffff')
          .style('font-size', '12px')
          .style('font-weight', 'bold');
      })
      .on('mouseout', function() {
        d3.select(this)
          .style('opacity', 1)
          .style('stroke-width', '2px');
        svg.select('.tooltip').remove();
      });
    
    // Add labels
    svg.selectAll('allLabels')
      .data(pie(pieData))
      .enter()
      .append('text')
      .text(d => {
        const percent = (d.data.value / d3.sum(pieData, d => d.value) * 100).toFixed(1);
        return `${d.data.name} (${percent}%)`;
      })
      .attr('transform', d => {
        const pos = outerArc.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .style('text-anchor', d => {
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return (midangle < Math.PI ? 'start' : 'end');
      })
      .style('fill', '#ffffff')
      .style('font-size', '12px');
    
    // Add lines connecting slices to labels
    svg.selectAll('allPolylines')
      .data(pie(pieData))
      .enter()
      .append('polyline')
      .attr('points', d => {
        const posA = arc.centroid(d);
        const posB = outerArc.centroid(d);
        const posC = outerArc.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1);
        return [posA, posB, posC];
      })
      .style('fill', 'none')
      .style('stroke', 'black')
      .style('stroke-width', '1px');
  };

  const createHeatmap = (data, spec) => {
    // Get container dimensions
    const containerWidth = d3Container.current.clientWidth;
    const containerHeight = 500;
    
    // Set margins
    const margin = { top: 50, right: 30, bottom: 60, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    
    // Get field names from spec
    const xField = spec.encoding.x.field;
    const yField = spec.encoding.y?.field;
    const colorField = spec.encoding.color?.field || yField;
    
    // Create SVG
    const svg = d3.select(d3Container.current)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('fill', '#ffffff')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(`Heatmap of ${colorField} by ${xField} and ${yField}`);
    
    // Get unique x and y values
    const xValues = [...new Set(data.map(d => d[xField]))];
    const yValues = [...new Set(data.map(d => d[yField]))];
    
    // Create scales
    const x = d3.scaleBand()
      .domain(xValues)
      .range([0, width])
      .padding(0.05);
    
    const y = d3.scaleBand()
      .domain(yValues)
      .range([height, 0])
      .padding(0.05);
    
    // Create color scale
    const colorValues = data.map(d => +d[colorField]);
    const colorScale = d3.scaleSequential()
      .interpolator(d3.interpolateBlues)
      .domain([d3.min(colorValues), d3.max(colorValues)]);
    
    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('fill', '#ffffff')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');
    
    // Add X axis label
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .style('fill', '#ffffff')
      .style('text-anchor', 'middle')
      .text(xField);
    
    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('fill', '#ffffff');
    
    // Add Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 15)
      .attr('x', -height / 2)
      .attr('dy', '1em')
      .style('fill', '#ffffff')
      .style('text-anchor', 'middle')
      .text(yField);
    
    // Add heatmap cells
    svg.selectAll('.cell')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', d => x(d[xField]))
      .attr('y', d => y(d[yField]))
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('fill', d => colorScale(+d[colorField]))
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke', 'black')
          .attr('stroke-width', 2);
        
        // Show tooltip
        const tooltip = svg.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${x(d[xField]) + x.bandwidth() / 2},${y(d[yField]) + y.bandwidth() / 2})`);
        
        tooltip.append('text')
          .attr('text-anchor', 'middle')
          .text(`${xField}: ${d[xField]}, ${yField}: ${d[yField]}, ${colorField}: ${d[colorField]}`)
          .style('fill', '#ffffff')
          .style('font-size', '12px')
          .style('font-weight', 'bold');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke', 'none');
        svg.select('.tooltip').remove();
      });
    
    // Add color legend
    const legendWidth = 20;
    const legendHeight = height;
    
    const legendScale = d3.scaleSequential()
      .interpolator(d3.interpolateBlues)
      .domain([d3.min(colorValues), d3.max(colorValues)]);
    
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width + 20}, 0)`);
    
    // Create gradient
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '0%')
      .attr('y2', '0%');
    
    // Add color stops
    const numStops = 10;
    for (let i = 0; i <= numStops; i++) {
      const offset = i / numStops;
      const value = d3.min(colorValues) + offset * (d3.max(colorValues) - d3.min(colorValues));
      gradient.append('stop')
        .attr('offset', `${offset * 100}%`)
        .attr('stop-color', legendScale(value));
    }
    
    // Add legend rectangle
    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#legend-gradient)');
    
    // Add legend axis
    const legendAxis = d3.axisRight()
      .scale(d3.scaleLinear().domain([d3.min(colorValues), d3.max(colorValues)]).range([legendHeight, 0]))
      .ticks(5);
    
    legend.append('g')
      .attr('transform', `translate(${legendWidth}, 0)`)
      .call(legendAxis)
      .selectAll('text')
      .style('fill', '#ffffff');
    
    // Add legend title
    legend.append('text')
      .attr('transform', 'rotate(90)')
      .attr('y', -legendWidth - 10)
      .attr('x', legendHeight / 2)
      .style('text-anchor', 'middle')
      .style('fill', '#ffffff')
      .text(colorField);
  };

  const createDataTable = (data) => {
    if (!data || data.length === 0) return;
    
    // Get container dimensions
    const containerWidth = d3Container.current.clientWidth;
    
    // Create table
    const table = d3.select(d3Container.current)
      .append('table')
      .style('width', `${containerWidth}px`)
      .style('border-collapse', 'collapse')
      .style('margin-top', '20px');
    
    // Create header
    const headers = Object.keys(data[0]);
    
    table.append('thead')
      .append('tr')
      .selectAll('th')
      .data(headers)
      .enter()
      .append('th')
      .text(d => d)
      .style('padding', '8px')
      .style('border', '1px solid #ddd')
      .style('background-color', '#f2f2f2')
      .style('font-weight', 'bold');
    
    // Create rows
    const rows = table.append('tbody')
      .selectAll('tr')
      .data(data)
      .enter()
      .append('tr');
    
    // Create cells
    rows.selectAll('td')
      .data(row => headers.map(header => ({ header, value: row[header] })))
      .enter()
      .append('td')
      .text(d => d.value)
      .style('padding', '8px')
      .style('border', '1px solid #ddd')
      .style('text-align', (d, i) => typeof d.value === 'number' ? 'right' : 'left');
    
    // Add zebra striping
    rows.style('background-color', (d, i) => i % 2 === 0 ? 'white' : '#f9f9f9');
  };
  
  return (
    <div className="visualization-container">
      <h2>Visualization</h2>
      {data && data.length > 0 ? (
        <div className="d3-container" ref={d3Container} />
      ) : (
        <div className="no-data-message">
          <p>No data available for visualization</p>
        </div>
      )}
    </div>
  );
};

export default VisualizationContainer;
