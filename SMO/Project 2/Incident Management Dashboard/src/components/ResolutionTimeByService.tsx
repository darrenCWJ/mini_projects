import { Card } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { Clock, TrendingDown, TrendingUp, Minus, Sparkles, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface ServiceResolutionData {
  serviceName: string;
  avgResolutionTime: number;
  currentMonthAvg: number;
  lastMonthAvg: number;
  ticketCount: number;
  category: string;
  trend: 'improving' | 'worsening' | 'stable' | 'new';
  trendPercentage: number;
}

interface ResolutionTimeByServiceProps {
  services: ServiceResolutionData[];
  targetTime?: number;
}

export function ResolutionTimeByService({ services, targetTime = 2.5 }: ResolutionTimeByServiceProps) {
  const [sortBy, setSortBy] = useState<'time' | 'count'>('time');
  const [showAll, setShowAll] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [trendFilter, setTrendFilter] = useState<string>('all');

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(services.map(s => s.category))).sort();
    return uniqueCategories;
  }, [services]);

  // Filter and sort services
  const filteredAndSortedServices = useMemo(() => {
    let filtered = [...services];
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(s => s.category === categoryFilter);
    }
    
    // Apply trend filter
    if (trendFilter !== 'all') {
      filtered = filtered.filter(s => s.trend === trendFilter);
    }
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'time') {
        return b.avgResolutionTime - a.avgResolutionTime;
      }
      return b.ticketCount - a.ticketCount;
    });
    
    return filtered;
  }, [services, categoryFilter, trendFilter, sortBy]);

  // Show top 10 or all
  const displayServices = showAll ? filteredAndSortedServices : filteredAndSortedServices.slice(0, 10);

  // Calculate statistics (based on filtered services)
  const totalTickets = filteredAndSortedServices.reduce((sum, s) => sum + s.ticketCount, 0);
  const overallAvg = totalTickets > 0 
    ? filteredAndSortedServices.reduce((sum, s) => sum + (s.avgResolutionTime * s.ticketCount), 0) / totalTickets
    : 0;
  const servicesAboveTarget = filteredAndSortedServices.filter(s => s.avgResolutionTime > targetTime).length;
  const servicesBelowTarget = filteredAndSortedServices.filter(s => s.avgResolutionTime <= targetTime).length;
  const servicesImproving = filteredAndSortedServices.filter(s => s.trend === 'improving').length;
  const servicesWorsening = filteredAndSortedServices.filter(s => s.trend === 'worsening').length;

  // Get color for bar based on performance
  const getBarColor = (time: number) => {
    if (time <= targetTime) return '#10b981'; // Green - meeting target
    if (time <= targetTime * 1.5) return '#f59e0b'; // Orange - slightly over
    return '#ef4444'; // Red - significantly over
  };

  // Get trend icon and color
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingDown className="w-3 h-3 text-green-600" />;
      case 'worsening':
        return <TrendingUp className="w-3 h-3 text-red-600" />;
      case 'new':
        return <Sparkles className="w-3 h-3 text-blue-600" />;
      default:
        return <Minus className="w-3 h-3 text-gray-600" />;
    }
  };

  const getTrendBadgeVariant = (trend: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (trend) {
      case 'improving':
        return 'default';
      case 'worsening':
        return 'destructive';
      case 'new':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2>Resolution Time by Business Service</h2>
              <p className="text-sm text-gray-600">Average resolution time for each service</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'time' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('time')}
            >
              Sort by Time
            </Button>
            <Button
              variant={sortBy === 'count' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('count')}
            >
              Sort by Volume
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Filters:</span>
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px] h-8">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={trendFilter} onValueChange={setTrendFilter}>
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="All Trends" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trends</SelectItem>
              <SelectItem value="improving">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-3 h-3 text-green-600" />
                  Improving
                </div>
              </SelectItem>
              <SelectItem value="worsening">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-red-600" />
                  Worsening
                </div>
              </SelectItem>
              <SelectItem value="stable">
                <div className="flex items-center gap-2">
                  <Minus className="w-3 h-3 text-gray-600" />
                  Stable
                </div>
              </SelectItem>
              <SelectItem value="new">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  New
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {(categoryFilter !== 'all' || trendFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCategoryFilter('all');
                setTrendFilter('all');
              }}
              className="h-8"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Overall Avg</p>
          <p className="text-2xl">{overallAvg.toFixed(1)}h</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Target</p>
          <p className="text-2xl">{targetTime}h</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Meeting Target</p>
          <p className="text-2xl text-green-600">{servicesBelowTarget}</p>
          <p className="text-xs text-green-600 mt-1">
            {filteredAndSortedServices.length > 0 ? ((servicesBelowTarget / filteredAndSortedServices.length) * 100).toFixed(0) : 0}% of services
          </p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-gray-600 mb-1">Above Target</p>
          <p className="text-2xl text-red-600">{servicesAboveTarget}</p>
          <p className="text-xs text-red-600 mt-1">
            {filteredAndSortedServices.length > 0 ? ((servicesAboveTarget / filteredAndSortedServices.length) * 100).toFixed(0) : 0}% of services
          </p>
        </div>

        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Improving</p>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-green-600" />
            <p className="text-xl text-green-600">{servicesImproving}</p>
          </div>
        </div>

        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
          <p className="text-sm text-gray-600 mb-1">Worsening</p>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-600" />
            <p className="text-xl text-red-600">{servicesWorsening}</p>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      {displayServices.length > 0 && (
        <div className="mb-6">
          <ResponsiveContainer width="100%" height={Math.max(400, displayServices.length * 35)}>
          <BarChart 
            data={displayServices}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              type="number" 
              stroke="#6b7280"
              label={{ value: 'Hours', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              type="category" 
              dataKey="serviceName" 
              stroke="#6b7280"
              width={190}
              tick={(props) => {
                const { x, y, payload } = props;
                const service = displayServices.find(s => s.serviceName === payload.value);
                if (!service) return null;
                
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text 
                      x={0} 
                      y={0} 
                      dy={4} 
                      textAnchor="end" 
                      fill="#6b7280" 
                      fontSize={12}
                      style={{ maxWidth: 160 }}
                    >
                      {payload.value.length > 25 ? payload.value.substring(0, 25) + '...' : payload.value}
                    </text>
                    {service.trend === 'improving' && (
                      <g transform="translate(5, -4)">
                        <circle cx={0} cy={0} r={8} fill="#dcfce7" />
                        <path d="M -3 2 L 0 -2 L 3 2" stroke="#16a34a" strokeWidth={1.5} fill="none" />
                      </g>
                    )}
                    {service.trend === 'worsening' && (
                      <g transform="translate(5, -4)">
                        <circle cx={0} cy={0} r={8} fill="#fee2e2" />
                        <path d="M -3 -2 L 0 2 L 3 -2" stroke="#dc2626" strokeWidth={1.5} fill="none" />
                      </g>
                    )}
                    {service.trend === 'new' && (
                      <g transform="translate(5, -4)">
                        <circle cx={0} cy={0} r={8} fill="#dbeafe" />
                        <circle cx={-1} cy={-1} r={1} fill="#2563eb" />
                        <circle cx={2} cy={1} r={1.5} fill="#2563eb" />
                      </g>
                    )}
                  </g>
                );
              }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '12px'
              }}
              formatter={(value: number, name: string, props: any) => {
                if (name === 'avgResolutionTime') {
                  const service = props.payload;
                  return [
                    <div key="tooltip" className="space-y-1">
                      <div className="font-semibold">{value.toFixed(1)}h avg resolution time</div>
                      <div className="text-xs text-gray-600">{service.ticketCount} tickets • {service.category}</div>
                      {service.trend !== 'new' && (
                        <div className="text-xs pt-2 border-t border-gray-200 mt-2">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Current month:</span>
                            <span className="font-medium">{service.currentMonthAvg.toFixed(1)}h</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Last month:</span>
                            <span className="font-medium">{service.lastMonthAvg.toFixed(1)}h</span>
                          </div>
                          <div className={`flex items-center gap-1 mt-1 ${
                            service.trend === 'improving' ? 'text-green-600' : 
                            service.trend === 'worsening' ? 'text-red-600' : 
                            'text-gray-600'
                          }`}>
                            {service.trend === 'improving' && <TrendingDown className="w-3 h-3" />}
                            {service.trend === 'worsening' && <TrendingUp className="w-3 h-3" />}
                            {service.trend === 'stable' && <Minus className="w-3 h-3" />}
                            <span className="font-medium">
                              {service.trendPercentage > 0 ? '+' : ''}{service.trendPercentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )}
                      {service.trend === 'new' && (
                        <div className="text-xs text-blue-600 flex items-center gap-1 pt-1">
                          <Sparkles className="w-3 h-3" />
                          New this month
                        </div>
                      )}
                    </div>,
                    ''
                  ];
                }
                return [value, name];
              }}
            />
            <ReferenceLine 
              x={targetTime} 
              stroke="#9ca3af" 
              strokeDasharray="5 5"
              label={{ value: 'Target', position: 'top', fill: '#6b7280' }}
            />
            <Bar dataKey="avgResolutionTime" name="Avg Resolution Time">
              {displayServices.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.avgResolutionTime)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        </div>
      )}

      {/* Show More/Less Button */}
      {filteredAndSortedServices.length > 10 && (
        <div className="text-center pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Top 10 Only' : `Show All ${filteredAndSortedServices.length} Services`}
          </Button>
        </div>
      )}

      {/* No Results Message */}
      {filteredAndSortedServices.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Filter className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No services match the selected filters</p>
          <Button
            variant="link"
            onClick={() => {
              setCategoryFilter('all');
              setTrendFilter('all');
            }}
            className="mt-2"
          >
            Clear all filters
          </Button>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-gray-600">Meeting target (≤ {targetTime}h)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500"></div>
            <span className="text-gray-600">Slightly over target ({targetTime}h - {(targetTime * 1.5).toFixed(1)}h)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-gray-600">Significantly over target ({'>'}  {(targetTime * 1.5).toFixed(1)}h)</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
