import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface OpenTicket {
  id: string;
  incidentId: string;
  serviceName: string;
  businessService: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  currentStatus: string;
  lastUpdated: Date;
  statusDuration: number; // in hours
  isBottleneck: boolean;
  createdDate: Date;
  daysSinceCreated: number;
  assignmentGroup?: string;
}

interface OpenTicketsPanelProps {
  tickets: OpenTicket[];
}

export function OpenTicketsPanel({ tickets }: OpenTicketsPanelProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute for live display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Count overdue tickets (more than 5 days)
  const overdueTickets = tickets.filter(ticket => ticket.daysSinceCreated > 5);

  // Prepare data for severity chart
  const severityCount = {
    Critical: tickets.filter(t => t.severity === 'Critical').length,
    High: tickets.filter(t => t.severity === 'High').length,
    Medium: tickets.filter(t => t.severity === 'Medium').length,
    Low: tickets.filter(t => t.severity === 'Low').length,
  };

  const severityData = [
    { name: 'Critical', value: severityCount.Critical, color: '#ef4444' },
    { name: 'High', value: severityCount.High, color: '#f97316' },
    { name: 'Medium', value: severityCount.Medium, color: '#eab308' },
    { name: 'Low', value: severityCount.Low, color: '#3b82f6' },
  ].filter(item => item.value > 0);

  // Prepare data for business service chart
  const businessServiceCount: { [key: string]: number } = {};
  tickets.forEach(ticket => {
    const service = ticket.businessService || 'Unknown Service';
    businessServiceCount[service] = (businessServiceCount[service] || 0) + 1;
  });

  const businessServiceData = Object.entries(businessServiceCount)
    .map(([name, value]) => ({ 
      name: name.length > 30 ? name.substring(0, 30) + '...' : name, // Truncate long names
      value,
      fullName: name // Keep full name for tooltip
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 business services

  // Prepare data for assignment group chart
  const assignmentGroupCount: { [key: string]: number } = {};
  tickets.forEach(ticket => {
    const group = ticket.assignmentGroup || 'Unassigned';
    assignmentGroupCount[group] = (assignmentGroupCount[group] || 0) + 1;
  });

  const assignmentGroupData = Object.entries(assignmentGroupCount)
    .map(([name, value]) => ({ 
      name: name.length > 25 ? name.substring(0, 25) + '...' : name, // Truncate long names
      value,
      fullName: name // Keep full name for tooltip
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 assignment groups

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-600';
      case 'High':
        return 'bg-orange-500';
      case 'Medium':
        return 'bg-yellow-500';
      case 'Low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTimeSinceUpdate = (lastUpdated: Date) => {
    const now = currentTime;
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours % 24}h ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m ago`;
    } else {
      return `${diffMins}m ago`;
    }
  };

  const formatDuration = (hours: number) => {
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }
    return `${hours}h`;
  };

  const getBottleneckIndicator = (isBottleneck: boolean, duration: number) => {
    if (!isBottleneck) return null;
    
    const severity = duration > 48 ? 'critical' : duration > 24 ? 'high' : 'medium';
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    };

    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded border ${colors[severity]}`}>
        <AlertCircle className="w-4 h-4" />
        <span className="text-xs">Bottleneck</span>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header Card */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="mb-1">Open Tickets</h2>
            <p className="text-sm text-gray-600">Real-time status monitoring</p>
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {tickets.length}
          </Badge>
        </div>

        {/* Overdue Alert */}
        {overdueTickets.length > 0 && (
          <div className="mt-3 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div className="flex-1">
                <p className="text-sm text-red-900">
                  <span className="font-semibold">{overdueTickets.length} Overdue Ticket{overdueTickets.length !== 1 ? 's' : ''}</span>
                </p>
                <p className="text-xs text-red-700">Open for more than 5 days</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Charts Overview */}
      <div className="grid grid-cols-1 gap-4">
        {/* Severity Distribution */}
        <Card className="p-4">
          <h3 className="text-sm mb-3">By Severity</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {severityData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Assignment Group Distribution */}
        <Card className="p-4">
          <h3 className="text-sm mb-3">By Assignment Group</h3>
          {assignmentGroupData.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(140, assignmentGroupData.length * 30)}>
              <BarChart 
                data={assignmentGroupData} 
                layout="horizontal"
                margin={{ top: 5, right: 10, left: 120, bottom: 5 }}
              >
                <XAxis 
                  type="number" 
                  stroke="#6b7280"
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={115}
                  stroke="#6b7280"
                  tick={{ fontSize: 10 }}
                  interval={0}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '8px'
                  }}
                  formatter={(value: number, name: string, props: any) => {
                    return [`${value} tickets`, props.payload.fullName || props.payload.name];
                  }}
                  labelFormatter={() => ''}
                />
                <Bar 
                  dataKey="value" 
                  fill="#8b5cf6" 
                  radius={[0, 4, 4, 0]}
                  name="Tickets"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[140px] text-gray-400 text-sm">
              No assignment group data
            </div>
          )}
        </Card>

        {/* Business Service Distribution */}
        <Card className="p-4">
          <h3 className="text-sm mb-3">By Business Service</h3>
          {businessServiceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(140, businessServiceData.length * 30)}>
              <BarChart 
                data={businessServiceData} 
                layout="horizontal"
                margin={{ top: 5, right: 10, left: 120, bottom: 5 }}
              >
                <XAxis 
                  type="number" 
                  stroke="#6b7280"
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={115}
                  stroke="#6b7280"
                  tick={{ fontSize: 10 }}
                  interval={0}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '8px'
                  }}
                  formatter={(value: number, name: string, props: any) => {
                    return [`${value} tickets`, props.payload.fullName || props.payload.name];
                  }}
                  labelFormatter={() => ''}
                />
                <Bar 
                  dataKey="value" 
                  fill="#3b82f6" 
                  radius={[0, 4, 4, 0]}
                  name="Tickets"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[140px] text-gray-400 text-sm">
              No business service data
            </div>
          )}
        </Card>
      </div>

      {/* Tickets List */}
      <Card className="flex-1 p-4 flex flex-col min-h-0">

        <div className="flex-1 overflow-y-auto space-y-4">
          {tickets.map((ticket) => {
            const isOverdue = ticket.daysSinceCreated > 5;
            return (
              <div
                key={ticket.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isOverdue
                    ? 'border-red-400 bg-red-50 shadow-md'
                    : ticket.isBottleneck 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-600">{ticket.incidentId}</span>
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(ticket.severity)}`} />
                      {isOverdue && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0">
                          OVERDUE
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm line-clamp-2 mb-2">{ticket.serviceName}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {ticket.businessService}
                      </Badge>
                      {ticket.assignmentGroup && (
                        <Badge variant="secondary" className="text-xs">
                          {ticket.assignmentGroup}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {getBottleneckIndicator(ticket.isBottleneck, ticket.statusDuration)}
                </div>
            

              {/* Status */}
              <div className="mb-3">
                <Badge variant="secondary" className="text-xs">
                  {ticket.currentStatus}
                </Badge>
              </div>

              {/* Time Information */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last Updated
                  </span>
                  <span>{getTimeSinceUpdate(ticket.lastUpdated)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">In Current Status</span>
                  <span className={`${
                    ticket.statusDuration > 48 ? 'text-red-600' :
                    ticket.statusDuration > 24 ? 'text-orange-600' :
                    'text-gray-900'
                  }`}>
                    {formatDuration(ticket.statusDuration)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Days Since Created</span>
                  <span className={`${
                    ticket.daysSinceCreated > 5 ? 'text-red-600 font-semibold' : 'text-gray-900'
                  }`}>
                    {ticket.daysSinceCreated} day{ticket.daysSinceCreated !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Severity Badge */}
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Severity</span>
                  <Badge 
                    variant={
                      ticket.severity === 'Critical' ? 'destructive' :
                      ticket.severity === 'High' ? 'default' :
                      'secondary'
                    }
                    className="text-xs"
                  >
                    {ticket.severity}
                  </Badge>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* Last Updated Time */}
        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-xs text-gray-500">
            Last refreshed: {currentTime.toLocaleTimeString()}
          </p>
        </div>
      </Card>
    </div>
  );
}
