import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";

interface ServiceData {
  id: string;
  name: string;
  category: string;
  currentMonth: number;
  lastMonth: number;
  trend: 'up' | 'down' | 'stable';
  spikeLevel: 'none' | 'moderate' | 'high';
  averageResolutionTime: string;
}

interface ServiceIncidentTableProps {
  services: ServiceData[];
}

export function ServiceIncidentTable({ services }: ServiceIncidentTableProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSpikeBadge = (level: string) => {
    switch (level) {
      case 'high':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            High Spike
          </Badge>
        );
      case 'moderate':
        return (
          <Badge variant="outline" className="gap-1 border-orange-500 text-orange-600">
            <AlertTriangle className="w-3 h-3" />
            Moderate
          </Badge>
        );
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const getPercentageChange = (current: number, last: number) => {
    if (last === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - last) / last) * 100;
    return change > 0 ? `+${change.toFixed(0)}%` : `${change.toFixed(0)}%`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2>Business Services - Incident Tracking</h2>
        <p className="text-sm text-gray-500">Sorted by spike level</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Current Month</TableHead>
            <TableHead className="text-right">Last Month</TableHead>
            <TableHead className="text-center">Trend</TableHead>
            <TableHead className="text-center">Spike Status</TableHead>
            <TableHead className="text-right">Avg Resolution</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell>{service.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{service.category}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {service.currentMonth}
              </TableCell>
              <TableCell className="text-right text-gray-500">
                {service.lastMonth}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  {getTrendIcon(service.trend)}
                  <span className={`text-sm ${
                    service.trend === 'up' ? 'text-red-600' : 
                    service.trend === 'down' ? 'text-green-600' : 
                    'text-gray-500'
                  }`}>
                    {getPercentageChange(service.currentMonth, service.lastMonth)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                {getSpikeBadge(service.spikeLevel)}
              </TableCell>
              <TableCell className="text-right">
                {service.averageResolutionTime}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
