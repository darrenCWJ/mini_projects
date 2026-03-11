import { useState, useMemo, useEffect } from "react";
import { TicketTrendChart } from "./components/TicketTrendChart";
import { ServiceIncidentTable } from "./components/ServiceIncidentTable";
import { MetricsCards } from "./components/MetricsCards";
import { DataUpload } from "./components/DataUpload";
import { OpenTicketsPanel } from "./components/OpenTicketsPanel";
import { AgentWorkload } from "./components/AgentWorkload";
import { TopIssues } from "./components/TopIssues";
import { AgingTickets } from "./components/AgingTickets";
import { ResolutionTimeReduction } from "./components/ResolutionTimeReduction";
import { ResolutionTimeByService } from "./components/ResolutionTimeByService";
import { DashboardFilters, DashboardFiltersState } from "./components/DashboardFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { ChartCalculations } from "./components/ChartCalculations";
import { TicketCheck, TicketX, Clock, TrendingUp, LayoutDashboard, Upload, Users, CheckCircle2, Calculator } from "lucide-react";
import { Alert, AlertDescription } from "./components/ui/alert";
import {
  processTicketTrend,
  processServiceData,
  processOpenTickets,
  processAgentWorkload,
  processTopIssues,
  processAgingTickets,
  processResolutionTime,
  processResolutionTimeByService,
  processMetrics,
} from "./utils/dataProcessor";
import { filterIncidents, extractFilterOptions } from "./utils/filterData";
import { BUSINESS_SERVICES } from "./utils/businessServices";

// Mock data for ticket trends over 6 months
const ticketTrendData = [
  { month: 'May', opened: 145, closed: 132, resolved: 128 },
  { month: 'Jun', opened: 158, closed: 149, resolved: 145 },
  { month: 'Jul', opened: 172, closed: 165, resolved: 160 },
  { month: 'Aug', opened: 189, closed: 178, resolved: 175 },
  { month: 'Sep', opened: 203, closed: 195, resolved: 190 },
  { month: 'Oct', opened: 176, closed: 198, resolved: 192 },
];

// Mock data for business services with spike detection (using actual GovTech services)
const serviceData = [
  {
    id: '1',
    name: 'SG-Mail Email Services',
    category: 'Email & Communication',
    currentMonth: 47,
    lastMonth: 23,
    trend: 'up' as const,
    spikeLevel: 'high' as const,
    averageResolutionTime: '2.4h',
  },
  {
    id: '2',
    name: 'Microsoft Authenticator',
    category: 'Security',
    currentMonth: 38,
    lastMonth: 25,
    trend: 'up' as const,
    spikeLevel: 'moderate' as const,
    averageResolutionTime: '1.8h',
  },
  {
    id: '3',
    name: 'SG-VPN - Application',
    category: 'Network & VPN',
    currentMonth: 29,
    lastMonth: 31,
    trend: 'down' as const,
    spikeLevel: 'none' as const,
    averageResolutionTime: '3.2h',
  },
  {
    id: '4',
    name: 'StellarNet Active Directory',
    category: 'Infrastructure',
    currentMonth: 18,
    lastMonth: 19,
    trend: 'stable' as const,
    spikeLevel: 'none' as const,
    averageResolutionTime: '4.5h',
  },
  {
    id: '5',
    name: 'COMET - Device Configuration',
    category: 'Device & Endpoint',
    currentMonth: 34,
    lastMonth: 28,
    trend: 'up' as const,
    spikeLevel: 'moderate' as const,
    averageResolutionTime: '2.1h',
  },
  {
    id: '6',
    name: 'SG-Zoom (GoMax)',
    category: 'Collaboration',
    currentMonth: 12,
    lastMonth: 15,
    trend: 'down' as const,
    spikeLevel: 'none' as const,
    averageResolutionTime: '1.5h',
  },
  {
    id: '7',
    name: 'GOMAX - Agency Mobile Application',
    category: 'Applications & Portal',
    currentMonth: 25,
    lastMonth: 22,
    trend: 'up' as const,
    spikeLevel: 'none' as const,
    averageResolutionTime: '3.8h',
  },
  {
    id: '8',
    name: 'Nucleus - Azure AD Identity Protection',
    category: 'Security',
    currentMonth: 16,
    lastMonth: 18,
    trend: 'down' as const,
    spikeLevel: 'none' as const,
    averageResolutionTime: '2.9h',
  },
];

// Sort services by spike level (high -> moderate -> none)
const sortedServices = [...serviceData].sort((a, b) => {
  const spikeOrder = { high: 0, moderate: 1, none: 2 };
  return spikeOrder[a.spikeLevel] - spikeOrder[b.spikeLevel];
});

// Mock data for agent workload
const agentData = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@company.com',
    totalAssigned: 18,
    open: 5,
    inProgress: 8,
    resolved: 5,
    avgResolutionTime: 2.4,
    capacity: 95,
    workloadStatus: 'overloaded' as const,
    critical: 2,
    high: 5,
    medium: 8,
    low: 3,
    performanceTrend: 'down' as const,
    overdueTickets: 3,
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.c@company.com',
    totalAssigned: 15,
    open: 3,
    inProgress: 7,
    resolved: 5,
    avgResolutionTime: 1.8,
    capacity: 75,
    workloadStatus: 'normal' as const,
    critical: 1,
    high: 4,
    medium: 7,
    low: 3,
    performanceTrend: 'up' as const,
    overdueTickets: 1,
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.r@company.com',
    totalAssigned: 12,
    open: 2,
    inProgress: 5,
    resolved: 5,
    avgResolutionTime: 2.1,
    capacity: 60,
    workloadStatus: 'normal' as const,
    critical: 0,
    high: 3,
    medium: 6,
    low: 3,
    performanceTrend: 'stable' as const,
    overdueTickets: 0,
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.k@company.com',
    totalAssigned: 9,
    open: 2,
    inProgress: 3,
    resolved: 4,
    avgResolutionTime: 3.2,
    capacity: 45,
    workloadStatus: 'light' as const,
    critical: 0,
    high: 2,
    medium: 4,
    low: 3,
    performanceTrend: 'up' as const,
    overdueTickets: 1,
  },
  {
    id: '5',
    name: 'Jessica Taylor',
    email: 'jessica.t@company.com',
    totalAssigned: 16,
    open: 4,
    inProgress: 7,
    resolved: 5,
    avgResolutionTime: 2.6,
    capacity: 85,
    workloadStatus: 'normal' as const,
    critical: 1,
    high: 5,
    medium: 7,
    low: 3,
    performanceTrend: 'stable' as const,
    overdueTickets: 0,
  },
  {
    id: '6',
    name: 'Robert Martinez',
    email: 'robert.m@company.com',
    totalAssigned: 19,
    open: 6,
    inProgress: 9,
    resolved: 4,
    avgResolutionTime: 3.8,
    capacity: 100,
    workloadStatus: 'overloaded' as const,
    critical: 3,
    high: 6,
    medium: 7,
    low: 3,
    performanceTrend: 'down' as const,
    overdueTickets: 4,
  },
];

// Mock data for open tickets (using actual GovTech services)
const openTicketsData = [
  {
    id: '1',
    incidentId: 'INC2456',
    serviceName: 'Email delivery failure - SG-Mail',
    businessService: 'SG-Mail Email Services',
    severity: 'Critical' as const,
    currentStatus: 'In Progress',
    lastUpdated: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    statusDuration: 52, // hours
    isBottleneck: true,
    createdDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    daysSinceCreated: 8,
    assignmentGroup: 'Email Services Team',
  },
  {
    id: '2',
    incidentId: 'INC2457',
    serviceName: 'MFA authentication timeout',
    businessService: 'Microsoft Authenticator',
    severity: 'High' as const,
    currentStatus: 'Awaiting Vendor',
    lastUpdated: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    statusDuration: 32,
    isBottleneck: true,
    createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    daysSinceCreated: 7,
    assignmentGroup: 'Security Team',
  },
  {
    id: '3',
    incidentId: 'INC2458',
    serviceName: 'VPN connection drops intermittently',
    businessService: 'SG-VPN - Application',
    severity: 'High' as const,
    currentStatus: 'In Progress',
    lastUpdated: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
    statusDuration: 18,
    isBottleneck: false,
    createdDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    daysSinceCreated: 3,
    assignmentGroup: 'Network Team',
  },
  {
    id: '4',
    incidentId: 'INC2459',
    serviceName: 'AD sync issues',
    businessService: 'StellarNet Active Directory',
    severity: 'Medium' as const,
    currentStatus: 'Investigating',
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    statusDuration: 28,
    isBottleneck: true,
    createdDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    daysSinceCreated: 6,
    assignmentGroup: 'Infrastructure Team',
  },
  {
    id: '5',
    incidentId: 'INC2460',
    serviceName: 'Device encryption not applying',
    businessService: 'COMET - Encryption',
    severity: 'Medium' as const,
    currentStatus: 'In Progress',
    lastUpdated: new Date(Date.now() - 20 * 60 * 1000), // 20 mins ago
    statusDuration: 6,
    isBottleneck: false,
    createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    daysSinceCreated: 2,
    assignmentGroup: 'Endpoint Security Team',
  },
  {
    id: '6',
    incidentId: 'INC2461',
    serviceName: 'Mobile app crashes on launch',
    businessService: 'GOMAX - Agency Mobile Application',
    severity: 'Low' as const,
    currentStatus: 'Pending',
    lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    statusDuration: 12,
    isBottleneck: false,
    createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    daysSinceCreated: 10,
    assignmentGroup: 'Application Support',
  },
  {
    id: '7',
    incidentId: 'INC2462',
    serviceName: 'Teams meeting audio issues',
    businessService: 'SG-Mail-M365-Teams',
    severity: 'Low' as const,
    currentStatus: 'In Progress',
    lastUpdated: new Date(Date.now() - 90 * 60 * 1000), // 90 mins ago
    statusDuration: 9,
    isBottleneck: false,
    createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    daysSinceCreated: 1,
    assignmentGroup: 'Collaboration Team',
  },
];

// Mock data for top 10 issues (GovTech-specific)
const topIssuesData = [
  { issueType: 'MFA Authentication Issues', count: 45, category: 'Security', percentageOfTotal: 18.2 },
  { issueType: 'Email Delivery Failures', count: 38, category: 'Email & Communication', percentageOfTotal: 15.4 },
  { issueType: 'VPN Connection Problems', count: 32, category: 'Network & VPN', percentageOfTotal: 13.0 },
  { issueType: 'Device Configuration Errors', count: 28, category: 'Device & Endpoint', percentageOfTotal: 11.3 },
  { issueType: 'Teams/Zoom Meeting Issues', count: 24, category: 'Collaboration', percentageOfTotal: 9.7 },
  { issueType: 'Portal Access Denied', count: 21, category: 'Applications & Portal', percentageOfTotal: 8.5 },
  { issueType: 'AD Account Lockouts', count: 18, category: 'Infrastructure', percentageOfTotal: 7.3 },
  { issueType: 'Printer/Scanning Issues', count: 16, category: 'Device & Endpoint', percentageOfTotal: 6.5 },
  { issueType: 'Mobile App Crashes', count: 14, category: 'Applications & Portal', percentageOfTotal: 5.7 },
  { issueType: 'Encryption Not Applied', count: 11, category: 'Security', percentageOfTotal: 4.5 },
];

// Mock data for aging tickets
const agingTicketsData = {
  agingData: [
    { ageRange: '0-5 days', count: 15, severity: 'low' as const },
    { ageRange: '6-10 days', count: 8, severity: 'moderate' as const },
    { ageRange: '11-20 days', count: 5, severity: 'high' as const },
    { ageRange: '20+ days', count: 3, severity: 'critical' as const },
  ],
  totalTickets: 31,
  averageAge: 7.2,
  oldestTicket: 28,
};

// Mock data for resolution time reduction
const resolutionTimeData = {
  data: [
    { month: 'May', avgResolutionTime: 3.5, target: 2.5 },
    { month: 'Jun', avgResolutionTime: 3.2, target: 2.5 },
    { month: 'Jul', avgResolutionTime: 3.0, target: 2.5 },
    { month: 'Aug', avgResolutionTime: 2.9, target: 2.5 },
    { month: 'Sep', avgResolutionTime: 2.6, target: 2.5 },
    { month: 'Oct', avgResolutionTime: 2.3, target: 2.5 },
  ],
  currentMonth: 2.3,
  previousMonth: 2.6,
  percentageChange: -11.5,
  trend: 'improving' as const,
};

// Mock data for resolution time by service
const resolutionTimeByServiceData = [
  { serviceName: 'StellarNet Active Directory', avgResolutionTime: 4.5, currentMonthAvg: 4.8, lastMonthAvg: 4.2, ticketCount: 18, category: 'Infrastructure', trend: 'worsening' as const, trendPercentage: 14.3 },
  { serviceName: 'GOMAX - Agency Mobile Application', avgResolutionTime: 3.8, currentMonthAvg: 3.6, lastMonthAvg: 4.0, ticketCount: 25, category: 'Applications & Portal', trend: 'improving' as const, trendPercentage: -10.0 },
  { serviceName: 'SG-VPN - Application', avgResolutionTime: 3.2, currentMonthAvg: 3.2, lastMonthAvg: 3.1, ticketCount: 29, category: 'Network & VPN', trend: 'stable' as const, trendPercentage: 3.2 },
  { serviceName: 'Nucleus - Azure AD Identity Protection', avgResolutionTime: 2.9, currentMonthAvg: 2.7, lastMonthAvg: 3.1, ticketCount: 16, category: 'Security', trend: 'improving' as const, trendPercentage: -12.9 },
  { serviceName: 'SG-Mail Email Services', avgResolutionTime: 2.4, currentMonthAvg: 2.2, lastMonthAvg: 2.6, ticketCount: 47, category: 'Email & Communication', trend: 'improving' as const, trendPercentage: -15.4 },
  { serviceName: 'COMET - Device Configuration', avgResolutionTime: 2.1, currentMonthAvg: 2.3, lastMonthAvg: 1.9, ticketCount: 34, category: 'Device & Endpoint', trend: 'worsening' as const, trendPercentage: 21.1 },
  { serviceName: 'Microsoft Authenticator', avgResolutionTime: 1.8, currentMonthAvg: 1.8, lastMonthAvg: 1.8, ticketCount: 38, category: 'Security', trend: 'stable' as const, trendPercentage: 0.0 },
  { serviceName: 'SG-Zoom (GoMax)', avgResolutionTime: 1.5, currentMonthAvg: 1.5, lastMonthAvg: 0, ticketCount: 12, category: 'Collaboration', trend: 'new' as const, trendPercentage: 0 },
];

// Metrics data
const metricsData = [
  {
    title: 'Total Tickets Closed',
    value: '198',
    change: '+1.5% from last month',
    changeType: 'positive' as const,
    icon: <TicketCheck className="w-6 h-6 text-gray-600" />,
  },
  {
    title: 'Open Tickets',
    value: String(openTicketsData.length),
    change: '-12.2% from last month',
    changeType: 'positive' as const,
    icon: <TicketX className="w-6 h-6 text-gray-600" />,
  },
  {
    title: 'Avg Resolution Time',
    value: '2.3h',
    change: '-11.5% from last month',
    changeType: 'positive' as const,
    icon: <Clock className="w-6 h-6 text-gray-600" />,
  },
  {
    title: 'Services with Spikes',
    value: '2',
    change: 'Payment Gateway, API Gateway',
    changeType: 'neutral' as const,
    icon: <TrendingUp className="w-6 h-6 text-gray-600" />,
  },
];

export default function App() {
  const [uploadedData, setUploadedData] = useState<any>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [filters, setFilters] = useState<DashboardFiltersState>({
    dateRange: { from: null, to: null },
    businessServices: [],
    priorities: [],
    states: [],
    assignmentGroups: [],
    primaryBusinessService: 'all',
  });

  const handleDataParsed = (data: any) => {
    setUploadedData(data);
    setShowSuccessAlert(true);
    console.log('Data uploaded:', data);
  };

  useEffect(() => {
    if (showSuccessAlert) {
      const timer = setTimeout(() => setShowSuccessAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessAlert]);

  // Extract filter options from uploaded data
  const filterOptions = useMemo(() => {
    if (uploadedData && uploadedData.data && uploadedData.data.length > 0) {
      return extractFilterOptions(uploadedData.data);
    }
    return {
      businessServices: [],
      priorities: [],
      states: [],
      assignmentGroups: [],
    };
  }, [uploadedData]);

  // Process uploaded data or use mock data
  const processedData = useMemo(() => {
    if (uploadedData && uploadedData.data && uploadedData.data.length > 0) {
      // Apply filters to uploaded data
      const filteredIncidents = filterIncidents(uploadedData.data, filters);
      
      // Process filtered data
      const incidents = filteredIncidents;
      const ticketTrend = processTicketTrend(incidents);
      const services = processServiceData(incidents);
      const openTickets = processOpenTickets(incidents);
      const agents = processAgentWorkload(incidents);
      const topIssues = processTopIssues(incidents);
      const agingTickets = processAgingTickets(incidents);
      const resolutionTime = processResolutionTime(incidents, filters.primaryBusinessService);
      const resolutionTimeByService = processResolutionTimeByService(incidents);
      const metricsRaw = processMetrics(incidents, openTickets, services);

      // Add icons to metrics
      const metrics = metricsRaw.map((metric, index) => ({
        ...metric,
        icon: index === 0 ? <TicketCheck className="w-6 h-6 text-gray-600" /> :
              index === 1 ? <TicketX className="w-6 h-6 text-gray-600" /> :
              index === 2 ? <Clock className="w-6 h-6 text-gray-600" /> :
              <TrendingUp className="w-6 h-6 text-gray-600" />
      }));

      return {
        ticketTrendData: ticketTrend,
        serviceData: services,
        openTicketsData: openTickets,
        agentData: agents,
        topIssuesData: topIssues,
        agingTicketsData: agingTickets,
        resolutionTimeData: resolutionTime,
        resolutionTimeByServiceData: resolutionTimeByService,
        metricsData: metrics,
      };
    }

    // Return mock data if no upload
    return {
      ticketTrendData,
      serviceData: sortedServices,
      openTicketsData,
      agentData,
      topIssuesData,
      agingTicketsData,
      resolutionTimeData,
      resolutionTimeByServiceData,
      metricsData,
    };
  }, [uploadedData, filters]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1920px] mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2">Incident Management Dashboard</h1>
          <p className="text-gray-600">
            Track ticket closures and identify business services with incident spikes
          </p>
        </div>

        {/* Tabs for Navigation */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="agents" className="gap-2">
              <Users className="w-4 h-4" />
              Agent Workload
            </TabsTrigger>
            <TabsTrigger value="calculations" className="gap-2">
              <Calculator className="w-4 h-4" />
              Calculations
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {/* Success Alert */}
            {showSuccessAlert && uploadedData && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <div className="flex items-start justify-between">
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <AlertDescription className="text-green-800">
                      Data successfully imported! Dashboard updated with {uploadedData.data.length} incidents.
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}

            {/* Mock Data Notice */}
            {!uploadedData && (
              <Alert className="mb-6 border-blue-200 bg-blue-50">
                <Upload className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Currently showing sample data. Upload your incident dataset in the <strong>Upload Data</strong> tab to see your actual metrics.
                </AlertDescription>
              </Alert>
            )}

            {/* Filters - Only show when data is uploaded */}
            {uploadedData && uploadedData.data && uploadedData.data.length > 0 && (
              <>
                <DashboardFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  availableBusinessServices={filterOptions.businessServices}
                  availablePriorities={filterOptions.priorities}
                  availableStates={filterOptions.states}
                  availableAssignmentGroups={filterOptions.assignmentGroups}
                />
                {/* Filter Results Info */}
                {(filters.dateRange.from || filters.dateRange.to || 
                  filters.businessServices.length > 0 || filters.priorities.length > 0 || 
                  filters.states.length > 0 || filters.assignmentGroups.length > 0 ||
                  (filters.primaryBusinessService && filters.primaryBusinessService !== 'all')) && (
                  <Alert className="mb-6 border-blue-200 bg-blue-50">
                    <AlertDescription className="text-blue-800">
                      {filters.primaryBusinessService && filters.primaryBusinessService !== 'all' && (
                        <div className="mb-1">
                          <strong>Business Service:</strong> {filters.primaryBusinessService}
                        </div>
                      )}
                      Showing {processedData.ticketTrendData.reduce((sum: number, d: any) => sum + d.opened, 0)} filtered incidents 
                      out of {uploadedData.data.length} total records
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
              {/* Left Side - Main Dashboard */}
              <div className="space-y-6">
                {/* Metrics Cards */}
                <MetricsCards metrics={processedData.metricsData} />

                {/* Resolution Time Reduction */}
                <ResolutionTimeReduction 
                  data={processedData.resolutionTimeData.data}
                  currentMonth={processedData.resolutionTimeData.currentMonth}
                  previousMonth={processedData.resolutionTimeData.previousMonth}
                  percentageChange={processedData.resolutionTimeData.percentageChange}
                  trend={processedData.resolutionTimeData.trend}
                  businessServiceFilter={filters.primaryBusinessService}
                  onBusinessServiceFilterChange={(value) => setFilters({ ...filters, primaryBusinessService: value })}
                  availableServices={uploadedData ? filterOptions.businessServices : []}
                />

                {/* Resolution Time by Business Service */}
                <ResolutionTimeByService 
                  services={processedData.resolutionTimeByServiceData}
                  targetTime={2.5}
                />

                {/* Ticket Trend Chart */}
                <TicketTrendChart data={processedData.ticketTrendData} />

                {/* Top 10 Issues */}
                <TopIssues issues={processedData.topIssuesData} />

                {/* Aging Tickets */}
                <AgingTickets 
                  agingData={processedData.agingTicketsData.agingData}
                  totalTickets={processedData.agingTicketsData.totalTickets}
                  averageAge={processedData.agingTicketsData.averageAge}
                  oldestTicket={processedData.agingTicketsData.oldestTicket}
                />

                {/* Service Incident Table */}
                <ServiceIncidentTable services={processedData.serviceData} />
              </div>

              {/* Right Side - Open Tickets Panel */}
              <div className="xl:sticky xl:top-6 xl:h-[calc(100vh-8rem)]">
                <OpenTicketsPanel tickets={processedData.openTicketsData} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="agents">
            <AgentWorkload agents={processedData.agentData} />
          </TabsContent>

          <TabsContent value="calculations">
            <ChartCalculations data={processedData} />
          </TabsContent>

          <TabsContent value="upload">
            <DataUpload onDataParsed={handleDataParsed} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
