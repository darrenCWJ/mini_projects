import { Card } from "./ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingDown, TrendingUp, Activity, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";

interface ResolutionTimeData {
  month: string;
  avgResolutionTime: number;
  target: number;
}

interface ResolutionTimeReductionProps {
  data: ResolutionTimeData[];
  currentMonth: number;
  previousMonth: number;
  percentageChange: number;
  trend: 'improving' | 'worsening' | 'stable';
  businessServiceFilter?: string;
  onBusinessServiceFilterChange?: (service: string) => void;
  availableServices?: string[];
}

export function ResolutionTimeReduction({ 
  data, 
  currentMonth, 
  previousMonth, 
  percentageChange,
  trend,
  businessServiceFilter = 'all',
  onBusinessServiceFilterChange,
  availableServices = []
}: ResolutionTimeReductionProps) {
  const getTrendIcon = () => {
    if (trend === 'improving') {
      return <TrendingDown className="w-5 h-5 text-green-600" />;
    } else if (trend === 'worsening') {
      return <TrendingUp className="w-5 h-5 text-red-600" />;
    }
    return <Activity className="w-5 h-5 text-gray-600" />;
  };

  const getTrendColor = () => {
    if (trend === 'improving') return 'bg-green-100';
    if (trend === 'worsening') return 'bg-red-100';
    return 'bg-gray-100';
  };

  const getTrendTextColor = () => {
    if (trend === 'improving') return 'text-green-600';
    if (trend === 'worsening') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${getTrendColor()} rounded-lg`}>
            {getTrendIcon()}
          </div>
          <div className="flex-1">
            <h2>Resolution Time Reduction</h2>
            <p className="text-sm text-gray-600">Average time to resolve incidents</p>
          </div>
        </div>
        
        {/* Business Service Filter */}
        {availableServices.length > 0 && onBusinessServiceFilterChange && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <Select value={businessServiceFilter} onValueChange={onBusinessServiceFilterChange}>
              <SelectTrigger className="w-[240px] h-9">
                <SelectValue placeholder="All Services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Business Services</SelectItem>
                {availableServices.map(service => (
                  <SelectItem key={service} value={service}>{service}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {businessServiceFilter !== 'all' && (
              <Badge variant="secondary" className="ml-2">
                Filtered
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Current Month</p>
          <p className="text-2xl">{currentMonth}h</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Previous Month</p>
          <p className="text-2xl">{previousMonth}h</p>
        </div>
        
        <div className={`${getTrendColor()} p-4 rounded-lg border ${
          trend === 'improving' ? 'border-green-200' : 
          trend === 'worsening' ? 'border-red-200' : 
          'border-gray-200'
        }`}>
          <p className="text-sm text-gray-600 mb-1">Change</p>
          <p className={`text-2xl ${getTrendTextColor()}`}>
            {percentageChange > 0 ? '+' : ''}{percentageChange}%
          </p>
          <p className={`text-xs mt-1 ${getTrendTextColor()}`}>
            {trend === 'improving' && '↓ Improving'}
            {trend === 'worsening' && '↑ Needs attention'}
            {trend === 'stable' && '→ Stable'}
          </p>
        </div>
      </div>

      {/* Trend Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
          />
          <YAxis 
            stroke="#6b7280"
            label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px'
            }}
            formatter={(value: number) => [`${value}h`, '']}
          />
          <Legend />
          <ReferenceLine 
            y={data[0]?.target || 2.5} 
            stroke="#9ca3af" 
            strokeDasharray="5 5"
            label="Target"
          />
          <Line 
            type="monotone" 
            dataKey="avgResolutionTime" 
            stroke={trend === 'improving' ? '#10b981' : trend === 'worsening' ? '#ef4444' : '#6b7280'}
            strokeWidth={3}
            name="Avg Resolution Time"
            dot={{ fill: trend === 'improving' ? '#10b981' : trend === 'worsening' ? '#ef4444' : '#6b7280', r: 5 }}
          />
          <Line 
            type="monotone" 
            dataKey="target" 
            stroke="#9ca3af" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Target"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Performance Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          {trend === 'improving' && (
            <span className="text-green-600">
              ✓ Resolution time has improved by {Math.abs(percentageChange)}% compared to last month. Keep up the good work!
            </span>
          )}
          {trend === 'worsening' && (
            <span className="text-red-600">
              ⚠ Resolution time has increased by {Math.abs(percentageChange)}% compared to last month. Consider reviewing workflow bottlenecks.
            </span>
          )}
          {trend === 'stable' && (
            <span className="text-gray-600">
              → Resolution time remains stable. Current performance is consistent with previous month.
            </span>
          )}
        </p>
      </div>
    </Card>
  );
}
