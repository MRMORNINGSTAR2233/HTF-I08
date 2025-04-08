import React, { useState, useEffect } from "react";
import { 
  LineChart, 
  BarChart, 
  PieChart, 
  Line, 
  Bar, 
  Pie, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Label,
  Sector,
} from "recharts";

type DataPoint = Record<string, any>;

type ChartProps = {
  data: DataPoint[];
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar' | 'composed' | 'heatmap';
  xKey: string;
  yKey: string;
  secondaryYKey?: string;
  title?: string;
  className?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  stacked?: boolean;
  colorScheme?: 'default' | 'pastel' | 'vivid' | 'monochrome';
};

// Custom type for pie chart label props
interface PieLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
  name: string;
  value: number;
}

const COLORS = {
  default: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28', '#FF8042'],
  pastel: ['#CBD5E8', '#F4CAE4', '#E6F5C9', '#FFF2AE', '#F1E2CC', '#CCCCCC', '#B3E2CD', '#FDCDAC'],
  vivid: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf'],
  monochrome: ['#000000', '#252525', '#525252', '#737373', '#969696', '#bdbdbd', '#d9d9d9', '#f0f0f0']
};

export function Chart({
  data,
  type,
  xKey = "name",
  yKey = "value",
  secondaryYKey,
  title,
  className = "",
  showLegend = true,
  showGrid = true,
  stacked = false,
  colorScheme = 'default',
}: ChartProps) {
  const [chartData, setChartData] = useState<DataPoint[]>([]);

  useEffect(() => {
    // Prepare data based on the structure
    if (data && data.length > 0) {
      // If data is already in the right format, use it directly
      if (data[0][xKey] !== undefined && data[0][yKey] !== undefined) {
        setChartData(data);
      } else {
        // Otherwise, try to convert it to the right format
        const keys = Object.keys(data[0]);
        const formattedData = data.map(item => {
          // Try to find numeric values for y-axis
          const numericKeys = keys.filter(key => 
            typeof item[key] === 'number'
          );
          
          // Try to find string values for x-axis
          const stringKeys = keys.filter(key => 
            typeof item[key] === 'string'
          );
          
          return {
            [stringKeys[0] || xKey]: item[stringKeys[0]] || "Unknown",
            [numericKeys[0] || yKey]: item[numericKeys[0]] || 0
          };
        });
        
        setChartData(formattedData);
      }
    } else {
      setChartData([]);
    }
  }, [data, xKey, yKey]);

  // Get appropriate color scheme
  const colors = COLORS[colorScheme] || COLORS.default;
  
  // Format data for pie charts
  const pieData = React.useMemo(() => {
    if (type !== 'pie') return [];
    
    // Group data by xKey and sum yKey values
    const groupedData = data.reduce((acc: Record<string, any>, item) => {
      const key = item[xKey]?.toString() || "undefined";
      if (!acc[key]) {
        acc[key] = { name: key, value: 0 };
      }
      acc[key].value += Number(item[yKey]) || 0;
      return acc;
    }, {});
    
    return Object.values(groupedData);
  }, [data, type, xKey, yKey]);

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis 
                dataKey={xKey} 
                angle={-45} 
                textAnchor="end"
                tick={{ fontSize: 12 }}
                interval={0}
                height={60}
              />
              <YAxis />
              {showLegend && <Legend />}
              <Tooltip />
              <Bar 
                dataKey={yKey} 
                fill={colors[0]} 
                stackId={stacked ? "stack" : undefined}
              />
              {secondaryYKey && (
                <Bar 
                  dataKey={secondaryYKey} 
                  fill={colors[1]} 
                  stackId={stacked ? "stack" : undefined}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis 
                dataKey={xKey} 
                angle={-45} 
                textAnchor="end" 
                tick={{ fontSize: 12 }}
                interval={0}
                height={60}
              />
              <YAxis />
              {showLegend && <Legend />}
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey={yKey} 
                stroke={colors[0]} 
                activeDot={{ r: 8 }} 
              />
              {secondaryYKey && (
                <Line 
                  type="monotone" 
                  dataKey={secondaryYKey} 
                  stroke={colors[1]} 
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              {showLegend && <Legend />}
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis 
                dataKey={xKey} 
                angle={-45} 
                textAnchor="end" 
                tick={{ fontSize: 12 }}
                interval={0}
                height={60}
              />
              <YAxis />
              {showLegend && <Legend />}
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey={yKey} 
                fill={colors[0]} 
                stroke={colors[0]} 
                fillOpacity={0.6}
                stackId={stacked ? "stack" : undefined}
              />
              {secondaryYKey && (
                <Area 
                  type="monotone" 
                  dataKey={secondaryYKey} 
                  fill={colors[1]} 
                  stroke={colors[1]} 
                  fillOpacity={0.6}
                  stackId={stacked ? "stack" : undefined}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis 
                type="number" 
                dataKey={xKey} 
                name={xKey} 
                label={{ value: xKey, position: 'insideBottomRight', offset: -10 }}
              />
              <YAxis 
                type="number" 
                dataKey={yKey} 
                name={yKey}
                label={{ value: yKey, angle: -90, position: 'insideLeft', offset: -5 }}
              />
              {secondaryYKey && (
                <ZAxis 
                  type="number" 
                  dataKey={secondaryYKey} 
                  range={[50, 400]} 
                  name={secondaryYKey} 
                />
              )}
              {showLegend && <Legend />}
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter 
                name={`${xKey} vs ${yKey}`} 
                data={data} 
                fill={colors[0]} 
              />
            </ScatterChart>
          </ResponsiveContainer>
        );
        
      case 'radar':
        const radarData = data.slice(0, 8); // Limit to 8 items for radar chart readability
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart 
              cx="50%" 
              cy="50%" 
              outerRadius="80%" 
              data={radarData}
            >
              <PolarGrid />
              <PolarAngleAxis dataKey={xKey} />
              <PolarRadiusAxis />
              <Radar 
                name={yKey} 
                dataKey={yKey} 
                stroke={colors[0]} 
                fill={colors[0]} 
                fillOpacity={0.6} 
              />
              {secondaryYKey && (
                <Radar 
                  name={secondaryYKey} 
                  dataKey={secondaryYKey} 
                  stroke={colors[1]} 
                  fill={colors[1]} 
                  fillOpacity={0.6} 
                />
              )}
              {showLegend && <Legend />}
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        );
        
      case 'composed':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis 
                dataKey={xKey} 
                angle={-45} 
                textAnchor="end" 
                tick={{ fontSize: 12 }}
                interval={0}
                height={60}
              />
              <YAxis />
              {showLegend && <Legend />}
              <Tooltip />
              <Bar 
                dataKey={yKey} 
                fill={colors[0]} 
                stackId={stacked ? "stack" : undefined}
              />
              {secondaryYKey && (
                <Line 
                  type="monotone" 
                  dataKey={secondaryYKey} 
                  stroke={colors[1]}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        );
        
      case 'heatmap':
        // For heatmap, we need to preprocess the data
        // This is a simple implementation - a full heatmap would need more complex data processing
        const heatmapData = React.useMemo(() => {
          // Get unique x and y values
          const xValues = [...new Set(data.map(item => item[xKey]))];
          const yValues = [...new Set(data.map(item => item[yKey]))];
          
          // Create a matrix with intensity values
          return xValues.map(x => {
            const row: any = { name: x };
            yValues.forEach(y => {
              // Find matching data point
              const match = data.find(item => item[xKey] === x && item[yKey] === y);
              row[y] = match ? (match[secondaryYKey || ''] || 0) : 0;
            });
            return row;
          });
        }, [data, xKey, yKey, secondaryYKey]);
        
        // Simple heatmap-like visualization using bar charts
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={heatmapData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 100, bottom: 60 }}
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" horizontal={false} />}
              <XAxis type="number" />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 12 }}
                width={100}
              />
              {showLegend && <Legend />}
              <Tooltip />
              {/* Render each y-category as a separate bar */}
              {Object.keys(heatmapData[0] || {})
                .filter(key => key !== 'name')
                .map((key, index) => (
                  <Bar 
                    key={key} 
                    dataKey={key} 
                    stackId="stack" 
                    fill={colors[index % colors.length]} 
                  />
                ))
              }
            </BarChart>
          </ResponsiveContainer>
        );
      
      default:
        return <div className="p-4 text-center text-zinc-400">Unsupported chart type</div>;
    }
  };

  return (
    <div className={`bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-4 ${className}`}>
      {title && (
        <h3 className="text-sm font-medium text-zinc-300 mb-4 text-center">{title}</h3>
      )}
      {chartData.length > 0 ? (
        renderChart()
      ) : (
        <div className="h-[300px] flex items-center justify-center text-zinc-400">
          No data available
        </div>
      )}
    </div>
  );
} 