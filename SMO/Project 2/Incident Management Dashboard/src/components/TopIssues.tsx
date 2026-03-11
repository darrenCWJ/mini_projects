import { Card } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle } from "lucide-react";

interface TopIssue {
  issueType: string;
  count: number;
  category: string;
  percentageOfTotal: number;
}

interface TopIssuesProps {
  issues: TopIssue[];
}

export function TopIssues({ issues }: TopIssuesProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-100 rounded-lg">
          <AlertCircle className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h2>Top 10 Issues Faced by GovTechies</h2>
          <p className="text-sm text-gray-600">Most common incident types this month</p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart 
          data={issues} 
          layout="vertical"
          margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" stroke="#6b7280" />
          <YAxis 
            type="category" 
            dataKey="issueType" 
            stroke="#6b7280"
            width={110}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px'
            }}
            formatter={(value: number, name: string, props: any) => [
              `${value} incidents (${props.payload.percentageOfTotal}%)`,
              'Count'
            ]}
            labelFormatter={(label: string) => `Issue: ${label}`}
          />
          <Bar 
            dataKey="count" 
            fill="#f59e0b" 
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {issues.slice(0, 5).map((issue, index) => (
            <div key={index} className="text-center">
              <p className="text-sm text-gray-600">{issue.issueType}</p>
              <p className="text-orange-600">{issue.count}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
