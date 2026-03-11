import { Card } from "./ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Clock, AlertTriangle } from "lucide-react";

interface AgingData {
  ageRange: string;
  count: number;
  severity: 'low' | 'moderate' | 'high' | 'critical';
}

interface AgingTicketsProps {
  agingData: AgingData[];
  totalTickets: number;
  averageAge: number;
  oldestTicket: number;
}

const COLORS = {
  low: '#10b981',
  moderate: '#f59e0b',
  high: '#ef4444',
  critical: '#dc2626',
};

export function AgingTickets({ agingData, totalTickets, averageAge, oldestTicket }: AgingTicketsProps) {
  const chartData = agingData.map(item => ({
    name: item.ageRange,
    value: item.count,
    severity: item.severity,
  }));

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Clock className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2>Aging Tickets Analysis</h2>
          <p className="text-sm text-gray-600">Distribution of tickets by age</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.severity]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Statistics */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Open Tickets</p>
            <p className="text-2xl">{totalTickets}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Average Age</p>
            <p className="text-2xl">{averageAge} days</p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-600">Oldest Ticket</p>
            </div>
            <p className="text-2xl text-red-600">{oldestTicket} days</p>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="mb-3">Age Distribution Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {agingData.map((item, index) => (
            <div 
              key={index} 
              className="p-3 rounded-lg border-l-4"
              style={{ borderLeftColor: COLORS[item.severity] }}
            >
              <p className="text-sm text-gray-600">{item.ageRange}</p>
              <p className="text-xl">{item.count}</p>
              <p className="text-xs text-gray-500 mt-1">
                {((item.count / totalTickets) * 100).toFixed(1)}% of total
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
