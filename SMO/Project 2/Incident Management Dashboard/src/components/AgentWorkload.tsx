import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Progress } from "./ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { User, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AgentData {
  id: string;
  name: string;
  email: string;
  totalAssigned: number;
  open: number;
  inProgress: number;
  resolved: number;
  avgResolutionTime: number; // in hours
  capacity: number; // percentage
  workloadStatus: 'overloaded' | 'normal' | 'light';
  critical: number;
  high: number;
  medium: number;
  low: number;
  performanceTrend: 'up' | 'down' | 'stable';
  overdueTickets: number; // tickets open for more than 5 days
}

interface AgentWorkloadProps {
  agents: AgentData[];
}

export function AgentWorkload({ agents }: AgentWorkloadProps) {
  // Calculate total tickets across all agents
  const totalTickets = agents.reduce((sum, agent) => sum + agent.totalAssigned, 0);
  const avgWorkload = agents.length > 0 ? (totalTickets / agents.length).toFixed(1) : '0';
  const totalOverdue = agents.reduce((sum, agent) => sum + agent.overdueTickets, 0);
  
  // Prepare data for workload distribution chart
  const workloadChartData = agents.map(agent => ({
    name: agent.name.split(' ')[0], // First name only
    Open: agent.open,
    'In Progress': agent.inProgress,
    Resolved: agent.resolved,
  }));

  // Prepare data for capacity overview
  const capacityData = [
    { status: 'Overloaded', count: agents.filter(a => a.workloadStatus === 'overloaded').length },
    { status: 'Normal', count: agents.filter(a => a.workloadStatus === 'normal').length },
    { status: 'Light', count: agents.filter(a => a.workloadStatus === 'light').length },
  ];

  const COLORS = ['#ef4444', '#3b82f6', '#10b981'];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getWorkloadBadge = (status: string) => {
    switch (status) {
      case 'overloaded':
        return <Badge variant="destructive">Overloaded</Badge>;
      case 'normal':
        return <Badge variant="outline">Normal</Badge>;
      case 'light':
        return <Badge variant="secondary">Light Load</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCapacityColor = (capacity: number) => {
    if (capacity >= 90) return 'bg-red-500';
    if (capacity >= 70) return 'bg-orange-500';
    if (capacity >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">Total Agents</p>
          <p className="text-3xl mb-2">{agents.length}</p>
          <p className="text-sm text-gray-600">Active team members</p>
        </Card>
        
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">Total Assigned</p>
          <p className="text-3xl mb-2">{totalTickets}</p>
          <p className="text-sm text-gray-600">Tickets across all agents</p>
        </Card>
        
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">Avg Workload</p>
          <p className="text-3xl mb-2">{avgWorkload}</p>
          <p className="text-sm text-gray-600">Tickets per agent</p>
        </Card>
        
        <Card className="p-6 border-2 border-red-200 bg-red-50">
          <p className="text-sm text-red-700 mb-1">Overdue Tickets</p>
          <p className="text-3xl mb-2 text-red-600">{totalOverdue}</p>
          <p className="text-sm text-red-700">Open more than 5 days</p>
        </Card>
        
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">Overloaded</p>
          <p className="text-3xl mb-2 text-orange-600">
            {agents.filter(a => a.workloadStatus === 'overloaded').length}
          </p>
          <p className="text-sm text-gray-600">Agents need support</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workload Distribution Chart */}
        <Card className="p-6">
          <h3 className="mb-4">Workload Distribution by Agent</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workloadChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Bar dataKey="Open" fill="#ef4444" />
              <Bar dataKey="In Progress" fill="#f59e0b" />
              <Bar dataKey="Resolved" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Capacity Overview */}
        <Card className="p-6">
          <h3 className="mb-4">Team Capacity Overview</h3>
          <div className="flex items-center justify-center h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={capacityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {capacityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Agent Details Table */}
      <Card className="p-6">
        <h3 className="mb-4">Agent Details</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Open</TableHead>
              <TableHead className="text-center">In Progress</TableHead>
              <TableHead className="text-center">Resolved</TableHead>
              <TableHead className="text-center">Overdue</TableHead>
              <TableHead className="text-center">Capacity</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Avg Resolution</TableHead>
              <TableHead className="text-center">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {getInitials(agent.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">{agent.name}</p>
                      <p className="text-xs text-gray-500">{agent.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">{agent.totalAssigned}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="border-red-300 text-red-700">
                    {agent.open}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="border-orange-300 text-orange-700">
                    {agent.inProgress}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="border-green-300 text-green-700">
                    {agent.resolved}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {agent.overdueTickets > 0 ? (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {agent.overdueTickets}
                    </Badge>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="space-y-1">
                    <Progress 
                      value={agent.capacity} 
                      className="h-2"
                    />
                    <p className="text-xs text-gray-600">{agent.capacity}%</p>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {getWorkloadBadge(agent.workloadStatus)}
                </TableCell>
                <TableCell className="text-right">
                  {agent.avgResolutionTime}h
                </TableCell>
                <TableCell className="text-center">
                  {getTrendIcon(agent.performanceTrend)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Severity Distribution per Agent */}
      <Card className="p-6">
        <h3 className="mb-4">Ticket Severity Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Card key={agent.id} className="p-4 border">
              <div className="flex items-center gap-2 mb-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                    {getInitials(agent.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">{agent.name}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-500"></div>
                    Critical
                  </span>
                  <span>{agent.critical}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-orange-500"></div>
                    High
                  </span>
                  <span>{agent.high}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-yellow-500"></div>
                    Medium
                  </span>
                  <span>{agent.medium}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500"></div>
                    Low
                  </span>
                  <span>{agent.low}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
