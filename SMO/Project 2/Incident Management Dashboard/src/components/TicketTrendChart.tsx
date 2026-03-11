import { Card } from "./ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TicketTrendChartProps {
  data: Array<{
    month: string;
    opened: number;
    closed: number;
    resolved: number;
  }>;
}

export function TicketTrendChart({ data }: TicketTrendChartProps) {
  return (
    <Card className="p-6">
      <h2 className="mb-4">Ticket Closure Trends</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
          />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="opened" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Opened"
            dot={{ fill: '#ef4444', r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="closed" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Closed"
            dot={{ fill: '#10b981', r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="resolved" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Resolved"
            dot={{ fill: '#3b82f6', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
