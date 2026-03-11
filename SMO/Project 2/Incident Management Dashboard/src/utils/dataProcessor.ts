// Utility to process incident data and transform it for dashboard charts

interface RawIncident {
  'Ticket#': string;
  'Opened': string;
  'State': string;
  'Short description': string;
  'Assignment group': string;
  'Resolution Category 1'?: string;
  'Resolution Category 2'?: string;
  'Resolution Category 3'?: string;
  'Description Resolver Notes'?: string;
  'Work node Channel'?: string;
  'Priority': string;
  'Application Name'?: string;
  'Resolver Code'?: string;
  'Updated by'?: string;
  'Reported by Duration'?: string;
  'Parent Incident'?: string;
  'Child Dependent'?: string;
  'Business Service': string;
  'Updated': string;
  'Affected User'?: string;
  'closed_at'?: string; // Closed date field from CSV
  [key: string]: any;
}

// Parse date strings
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  try {
    return new Date(dateStr);
  } catch {
    return null;
  }
}

// Calculate days between two dates
function daysBetween(date1: Date, date2: Date): number {
  const diff = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Calculate hours between two dates (for resolution time)
function hoursBetween(date1: Date, date2: Date): number {
  const diff = Math.abs(date2.getTime() - date1.getTime());
  return diff / (1000 * 60 * 60); // Return as decimal hours
}

// Get month name from date
function getMonthName(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[date.getMonth()];
}

// Process ticket trend data (monthly aggregation)
export function processTicketTrend(incidents: RawIncident[]): any[] {
  const monthlyData: { [key: string]: { opened: number; closed: number; resolved: number; monthDate: Date } } = {};
  
  incidents.forEach(incident => {
    const openedDate = parseDate(incident['Opened']);
    if (!openedDate) return;
    
    const monthKey = `${openedDate.getFullYear()}-${openedDate.getMonth()}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { 
        opened: 0, 
        closed: 0, 
        resolved: 0,
        monthDate: new Date(openedDate.getFullYear(), openedDate.getMonth(), 1)
      };
    }
    
    monthlyData[monthKey].opened++;
    
    const state = incident['State']?.toLowerCase() || '';
    if (state === 'closed') {
      monthlyData[monthKey].closed++;
    }
    if (state === 'resolved' || state === 'closed') {
      monthlyData[monthKey].resolved++;
    }
  });
  
  // Sort by date and return last 6 months
  return Object.entries(monthlyData)
    .sort((a, b) => a[1].monthDate.getTime() - b[1].monthDate.getTime())
    .slice(-6)
    .map(([_, data]) => ({
      month: getMonthName(data.monthDate),
      opened: data.opened,
      closed: data.closed,
      resolved: data.resolved,
    }));
}

// Process service incident data
// Counts ALL incidents (opened) per business service and compares this month vs last month
// Flags services with >=20% increase in incidents as spikes
// Average resolution time is calculated from closed cases only: closed date - opened date
export function processServiceData(incidents: RawIncident[]): any[] {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  
  const serviceMap: { [key: string]: { currentMonth: number; lastMonth: number; resolutionTimes: number[] } } = {};
  
  // Count ALL incidents (opened) for each business service by month
  // AND calculate resolution times for closed cases only
  incidents.forEach(incident => {
    const serviceName = incident['Business Service'] || 'Unknown Service';
    const openedDate = parseDate(incident['Opened']);
    
    if (!serviceMap[serviceName]) {
      serviceMap[serviceName] = { currentMonth: 0, lastMonth: 0, resolutionTimes: [] };
    }
    
    if (openedDate) {
      // Count incidents opened in current month
      if (openedDate >= currentMonthStart) {
        serviceMap[serviceName].currentMonth++;
      } 
      // Count incidents opened in last month
      else if (openedDate >= lastMonthStart && openedDate <= lastMonthEnd) {
        serviceMap[serviceName].lastMonth++;
      }
    }
    
    // Calculate resolution time for CLOSED cases only
    // Duration = closed date - opened date (in hours)
    const state = incident['State']?.toLowerCase() || '';
    if (state === 'closed' || state === 'resolved') {
      const closedDate = parseDate(incident['closed_at'] || incident['Updated']);
      if (openedDate && closedDate) {
        const duration = hoursBetween(openedDate, closedDate);
        if (duration > 0) {
          serviceMap[serviceName].resolutionTimes.push(duration);
        }
      }
    }
  });
  
  return Object.entries(serviceMap).map(([name, data], index) => {
    // Calculate average resolution time: sum of durations / total closed tickets
    const avgResolutionTime = data.resolutionTimes.length > 0
      ? (data.resolutionTimes.reduce((a, b) => a + b, 0) / data.resolutionTimes.length).toFixed(1)
      : '0';
    
    // Calculate percentage change: compare this month vs last month
    // If lastMonth is 0 but currentMonth > 0, treat as 100%+ increase (new service with incidents = spike)
    let percentChange: number;
    if (data.lastMonth === 0) {
      // New service or service with no incidents last month
      if (data.currentMonth > 0) {
        // Service has incidents this month but had none last month - treat as significant spike
        percentChange = 100; // 100%+ increase (from 0 to any number)
      } else {
        percentChange = 0; // No incidents in either month
      }
    } else {
      // Calculate percentage change: ((current - last) / last) * 100
      percentChange = ((data.currentMonth - data.lastMonth) / data.lastMonth) * 100;
    }
    
    // Determine spike level based on >=20% increase threshold
    // High spike: >=50% increase
    // Moderate spike: >=20% increase (but <50%)
    // No spike: <20% increase
    let spikeLevel: 'high' | 'moderate' | 'none' = 'none';
    if (percentChange >= 50) {
      spikeLevel = 'high';
    } else if (percentChange >= 20) {
      spikeLevel = 'moderate';
    }
    
    // Determine trend for visualization
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (percentChange > 5) trend = 'up';
    else if (percentChange < -5) trend = 'down';
    
    return {
      id: String(index + 1),
      name,
      category: categorizeService(name),
      currentMonth: data.currentMonth,
      lastMonth: data.lastMonth,
      trend,
      spikeLevel,
      averageResolutionTime: `${avgResolutionTime}h`,
    };
  }).sort((a, b) => {
    // Sort by spike level (high first, then moderate, then none)
    const spikeOrder = { high: 0, moderate: 1, none: 2 };
    return spikeOrder[a.spikeLevel] - spikeOrder[b.spikeLevel];
  });
}

// Parse duration string to hours
function parseDuration(duration: string): number {
  if (!duration) return 0;
  
  // Try to extract numbers from duration
  const match = duration.match(/(\d+(?:\.\d+)?)/);
  if (match) {
    return parseFloat(match[1]);
  }
  
  return 0;
}

// Import business service categorization
import { categorizeBusinessService } from './businessServices';

// Categorize service based on name
function categorizeService(serviceName: string): string {
  return categorizeBusinessService(serviceName);
}

// Process open tickets
export function processOpenTickets(incidents: RawIncident[]): any[] {
  const now = new Date();
  
  return incidents
    .filter(incident => {
      const state = incident['State']?.toLowerCase() || '';
      return state !== 'closed' && state !== 'resolved';
    })
    .map((incident, index) => {
      const openedDate = parseDate(incident['Opened']) || now;
      const updatedDate = parseDate(incident['Updated']) || now;
      const daysSinceCreated = daysBetween(openedDate, now);
      const hoursSinceUpdate = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60));
      
      // Map priority to severity
      const priority = incident['Priority']?.toLowerCase() || '';
      let severity: 'Critical' | 'High' | 'Medium' | 'Low' = 'Medium';
      if (priority.includes('1') || priority.includes('critical')) severity = 'Critical';
      else if (priority.includes('2') || priority.includes('high')) severity = 'High';
      else if (priority.includes('3') || priority.includes('medium')) severity = 'Medium';
      else if (priority.includes('4') || priority.includes('low')) severity = 'Low';
      
      return {
        id: String(index + 1),
        incidentId: incident['Ticket#'] || `INC${index}`,
        serviceName: incident['Short description'] || 'No description',
        businessService: incident['Business Service'] || 'Unknown',
        severity,
        currentStatus: incident['State'] || 'Unknown',
        lastUpdated: updatedDate,
        statusDuration: hoursSinceUpdate,
        isBottleneck: daysSinceCreated > 5,
        createdDate: openedDate,
        daysSinceCreated,
        assignmentGroup: incident['Assignment group'] || 'Unassigned',
      };
    })
    .sort((a, b) => b.daysSinceCreated - a.daysSinceCreated);
}

// Process agent workload
export function processAgentWorkload(incidents: RawIncident[]): any[] {
  const agentMap: { 
    [key: string]: { 
      assigned: RawIncident[];
      resolved: number;
      open: number;
      inProgress: number;
      overdue: number;
    } 
  } = {};
  
  incidents.forEach(incident => {
    const assignmentGroup = incident['Assignment group'] || 'Unassigned';
    
    if (!agentMap[assignmentGroup]) {
      agentMap[assignmentGroup] = {
        assigned: [],
        resolved: 0,
        open: 0,
        inProgress: 0,
        overdue: 0,
      };
    }
    
    agentMap[assignmentGroup].assigned.push(incident);
    
    const state = incident['State']?.toLowerCase() || '';
    if (state === 'resolved' || state === 'closed') {
      agentMap[assignmentGroup].resolved++;
    } else if (state === 'in progress') {
      agentMap[assignmentGroup].inProgress++;
    } else {
      agentMap[assignmentGroup].open++;
    }
    
    const openedDate = parseDate(incident['Opened']);
    if (openedDate && daysBetween(openedDate, new Date()) > 5) {
      agentMap[assignmentGroup].overdue++;
    }
  });
  
  return Object.entries(agentMap).map(([name, data], index) => {
    const totalAssigned = data.assigned.length;
    const capacity = Math.min(100, (totalAssigned / 20) * 100); // Assume 20 is max capacity
    
    // Calculate average resolution time
    const resolutionTimes = data.assigned
      .map(inc => parseDuration(inc['Reported by Duration'] || ''))
      .filter(t => t > 0);
    const avgResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
      : 0;
    
    let workloadStatus: 'overloaded' | 'normal' | 'light' = 'normal';
    if (capacity >= 85) workloadStatus = 'overloaded';
    else if (capacity < 50) workloadStatus = 'light';
    
    // Count by priority
    const priorities = data.assigned.reduce((acc, inc) => {
      const priority = inc['Priority']?.toLowerCase() || '';
      if (priority.includes('1') || priority.includes('critical')) acc.critical++;
      else if (priority.includes('2') || priority.includes('high')) acc.high++;
      else if (priority.includes('3') || priority.includes('medium')) acc.medium++;
      else acc.low++;
      return acc;
    }, { critical: 0, high: 0, medium: 0, low: 0 });
    
    return {
      id: String(index + 1),
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
      totalAssigned,
      open: data.open,
      inProgress: data.inProgress,
      resolved: data.resolved,
      avgResolutionTime: parseFloat(avgResolutionTime.toFixed(1)),
      capacity,
      workloadStatus,
      critical: priorities.critical,
      high: priorities.high,
      medium: priorities.medium,
      low: priorities.low,
      performanceTrend: 'stable' as const,
      overdueTickets: data.overdue,
    };
  });
}

// Process top issues
export function processTopIssues(incidents: RawIncident[]): any[] {
  const issueMap: { [key: string]: { count: number; category: string } } = {};
  
  incidents.forEach(incident => {
    const description = incident['Short description'] || 'Unknown Issue';
    // Extract key issue type (simplified - could use more sophisticated categorization)
    const issueType = extractIssueType(description);
    const category = categorizeService(incident['Business Service'] || '');
    
    if (!issueMap[issueType]) {
      issueMap[issueType] = { count: 0, category };
    }
    issueMap[issueType].count++;
  });
  
  const totalIncidents = incidents.length;
  
  return Object.entries(issueMap)
    .map(([issueType, data]) => ({
      issueType,
      count: data.count,
      category: data.category,
      percentageOfTotal: parseFloat(((data.count / totalIncidents) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

// Extract issue type from description
function extractIssueType(description: string): string {
  const lower = description.toLowerCase();
  
  // Common patterns
  if (lower.includes('login') || lower.includes('sign in')) return 'Login Issues';
  if (lower.includes('payment') || lower.includes('transaction')) return 'Payment Issues';
  if (lower.includes('timeout') || lower.includes('slow')) return 'Performance Issues';
  if (lower.includes('error') || lower.includes('failed')) return 'Error Messages';
  if (lower.includes('access') || lower.includes('permission')) return 'Access Issues';
  if (lower.includes('email') || lower.includes('notification')) return 'Email/Notification Issues';
  if (lower.includes('database') || lower.includes('data')) return 'Database Issues';
  if (lower.includes('api')) return 'API Issues';
  if (lower.includes('mobile') || lower.includes('app')) return 'Mobile App Issues';
  if (lower.includes('report') || lower.includes('export')) return 'Reporting Issues';
  
  // Return first 3 words as issue type if no pattern matches
  const words = description.split(' ').slice(0, 3).join(' ');
  return words || 'Other Issues';
}

// Process aging tickets
export function processAgingTickets(incidents: RawIncident[]): any {
  const now = new Date();
  const openIncidents = incidents.filter(inc => {
    const state = inc['State']?.toLowerCase() || '';
    return state !== 'closed' && state !== 'resolved';
  });
  
  const agingData = [
    { ageRange: '0-5 days', count: 0, severity: 'low' as const },
    { ageRange: '6-10 days', count: 0, severity: 'moderate' as const },
    { ageRange: '11-20 days', count: 0, severity: 'high' as const },
    { ageRange: '20+ days', count: 0, severity: 'critical' as const },
  ];
  
  let totalAge = 0;
  let oldestTicketDays = 0;
  
  openIncidents.forEach(incident => {
    const openedDate = parseDate(incident['Opened']);
    if (!openedDate) return;
    
    const age = daysBetween(openedDate, now);
    totalAge += age;
    if (age > oldestTicketDays) oldestTicketDays = age;
    
    if (age <= 5) agingData[0].count++;
    else if (age <= 10) agingData[1].count++;
    else if (age <= 20) agingData[2].count++;
    else agingData[3].count++;
  });
  
  return {
    agingData,
    totalTickets: openIncidents.length,
    averageAge: openIncidents.length > 0 ? parseFloat((totalAge / openIncidents.length).toFixed(1)) : 0,
    oldestTicket: oldestTicketDays,
  };
}

// Process resolution time reduction
// Compares closed cases for current month vs previous month
// Duration = closed date - opened date (in hours)
// Average duration = sum of durations / total tickets (by business service if filtered)
export function processResolutionTime(incidents: RawIncident[], businessServiceFilter?: string): any {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  
  // Filter to only closed/resolved incidents
  let filteredIncidents = incidents.filter(inc => {
    const state = inc['State']?.toLowerCase() || '';
    return state === 'closed' || state === 'resolved';
  });
  
  // Apply business service filter if provided
  if (businessServiceFilter && businessServiceFilter !== 'all') {
    filteredIncidents = filteredIncidents.filter(inc => 
      inc['Business Service'] === businessServiceFilter
    );
  }
  
  // Collect resolution times for current month and previous month based on CLOSED date
  // Duration is calculated as: closed date - opened date (in hours)
  const currentMonthTimes: number[] = [];
  const previousMonthTimes: number[] = [];
  const monthlyData: { [key: string]: { times: number[]; monthDate: Date } } = {};
  
  filteredIncidents.forEach(incident => {
    // Get opened date
    const openedDate = parseDate(incident['Opened']);
    if (!openedDate) return;
    
    // Use closed_at date if available, otherwise use Updated date (when state is closed)
    const closedDate = parseDate(incident['closed_at'] || incident['Updated']);
    if (!closedDate) return;
    
    // Calculate duration: closed date - opened date (in hours)
    const duration = hoursBetween(openedDate, closedDate);
    if (duration <= 0) return; // Skip if invalid duration (shouldn't happen, but safety check)
    
    // Group by closed month for historical chart (last 6 months)
    const monthKey = `${closedDate.getFullYear()}-${closedDate.getMonth()}`;
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { 
        times: [], 
        monthDate: new Date(closedDate.getFullYear(), closedDate.getMonth(), 1)
      };
    }
    monthlyData[monthKey].times.push(duration);
    
    // Categorize for current vs previous month comparison
    if (closedDate >= currentMonthStart) {
      // Case closed in current month
      currentMonthTimes.push(duration);
    } else if (closedDate >= lastMonthStart && closedDate <= lastMonthEnd) {
      // Case closed in previous month
      previousMonthTimes.push(duration);
    }
  });
  
  // Build historical data for chart (last 6 months)
  // Average = sum of durations / total tickets
  const sortedMonths = Object.entries(monthlyData)
    .sort((a, b) => a[1].monthDate.getTime() - b[1].monthDate.getTime())
    .slice(-6);
  
  const data = sortedMonths.map(([_, monthData]) => {
    // Average = sum of all durations / total count
    const sum = monthData.times.reduce((a, b) => a + b, 0);
    const count = monthData.times.length;
    const avgTime = count > 0 ? sum / count : 0;
    return {
      month: getMonthName(monthData.monthDate),
      avgResolutionTime: parseFloat(avgTime.toFixed(1)),
      target: 2.5,
    };
  });
  
  // Calculate averages for current month and previous month
  // Average = sum of durations / total tickets
  const currentMonthSum = currentMonthTimes.reduce((a, b) => a + b, 0);
  const currentMonthCount = currentMonthTimes.length;
  const currentMonth = currentMonthCount > 0
    ? currentMonthSum / currentMonthCount
    : 0;
  
  const previousMonthSum = previousMonthTimes.reduce((a, b) => a + b, 0);
  const previousMonthCount = previousMonthTimes.length;
  const previousMonth = previousMonthCount > 0
    ? previousMonthSum / previousMonthCount
    : 0;
  
  // Calculate percentage change
  const percentageChange = previousMonth > 0 
    ? parseFloat((((currentMonth - previousMonth) / previousMonth) * 100).toFixed(1))
    : 0;
  
  return {
    data,
    currentMonth: parseFloat(currentMonth.toFixed(1)),
    previousMonth: parseFloat(previousMonth.toFixed(1)),
    percentageChange,
    trend: percentageChange < 0 ? 'improving' as const : percentageChange > 0 ? 'worsening' as const : 'stable' as const,
  };
}

// Process resolution time by service with trend analysis
// Uses closed date to categorize cases by month
// Duration = closed date - opened date (in hours)
export function processResolutionTimeByService(incidents: RawIncident[]): any[] {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  
  const serviceMap: { 
    [key: string]: { 
      currentMonthTimes: number[]; 
      lastMonthTimes: number[];
      category: string;
    } 
  } = {};
  
  // Only include closed/resolved incidents
  const resolvedIncidents = incidents.filter(inc => {
    const state = inc['State']?.toLowerCase() || '';
    return state === 'closed' || state === 'resolved';
  });
  
  resolvedIncidents.forEach(incident => {
    const serviceName = incident['Business Service'] || 'Unknown Service';
    
    // Get opened date
    const openedDate = parseDate(incident['Opened']);
    if (!openedDate) return;
    
    // Use closed_at date if available, otherwise use Updated date (when state is closed)
    const closedDate = parseDate(incident['closed_at'] || incident['Updated']);
    if (!closedDate) return;
    
    // Calculate duration: closed date - opened date (in hours)
    const duration = hoursBetween(openedDate, closedDate);
    if (duration <= 0) return; // Skip if invalid duration
    
    if (!serviceMap[serviceName]) {
      serviceMap[serviceName] = { 
        currentMonthTimes: [],
        lastMonthTimes: [],
        category: categorizeService(serviceName) 
      };
    }
    
    // Categorize by closed month (not opened month)
    if (closedDate >= currentMonthStart) {
      serviceMap[serviceName].currentMonthTimes.push(duration);
    } else if (closedDate >= lastMonthStart && closedDate <= lastMonthEnd) {
      serviceMap[serviceName].lastMonthTimes.push(duration);
    }
  });
  
  return Object.entries(serviceMap)
    .filter(([_, data]) => data.currentMonthTimes.length > 0 || data.lastMonthTimes.length > 0)
    .map(([serviceName, data]) => {
      const allTimes = [...data.currentMonthTimes, ...data.lastMonthTimes];
      const avgResolutionTime = allTimes.reduce((a, b) => a + b, 0) / allTimes.length;
      
      // Calculate trend
      const currentAvg = data.currentMonthTimes.length > 0
        ? data.currentMonthTimes.reduce((a, b) => a + b, 0) / data.currentMonthTimes.length
        : 0;
      
      const lastAvg = data.lastMonthTimes.length > 0
        ? data.lastMonthTimes.reduce((a, b) => a + b, 0) / data.lastMonthTimes.length
        : 0;
      
      let trend: 'improving' | 'worsening' | 'stable' | 'new' = 'stable';
      let trendPercentage = 0;
      
      if (lastAvg > 0) {
        trendPercentage = parseFloat((((currentAvg - lastAvg) / lastAvg) * 100).toFixed(1));
        if (trendPercentage < -5) trend = 'improving'; // Negative means time decreased
        else if (trendPercentage > 5) trend = 'worsening'; // Positive means time increased
      } else if (currentAvg > 0) {
        trend = 'new'; // New service this month
      }
      
      return {
        serviceName,
        avgResolutionTime: parseFloat(avgResolutionTime.toFixed(2)),
        currentMonthAvg: parseFloat(currentAvg.toFixed(2)),
        lastMonthAvg: parseFloat(lastAvg.toFixed(2)),
        ticketCount: allTimes.length,
        category: data.category,
        trend,
        trendPercentage,
      };
    })
    .sort((a, b) => b.avgResolutionTime - a.avgResolutionTime);
}

// Process metrics - Note: icons will be added in the component layer
export function processMetrics(incidents: RawIncident[], openTickets: any[], servicesWithSpikes: any[]): any[] {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  
  // Count tickets closed this month - use closed_at if available, otherwise use Updated when state is closed
  const closedThisMonth = incidents.filter(inc => {
    const state = inc['State']?.toLowerCase() || '';
    if (state !== 'closed' && state !== 'resolved') return false;
    
    // Prefer closed_at date, fallback to Updated date
    const closedDate = parseDate(inc['closed_at'] || inc['Updated']);
    if (!closedDate) return false;
    
    return closedDate >= thisMonthStart;
  }).length;
  
  // Count tickets closed last month
  const closedLastMonth = incidents.filter(inc => {
    const state = inc['State']?.toLowerCase() || '';
    if (state !== 'closed' && state !== 'resolved') return false;
    
    // Prefer closed_at date, fallback to Updated date
    const closedDate = parseDate(inc['closed_at'] || inc['Updated']);
    if (!closedDate) return false;
    
    return closedDate >= lastMonthStart && closedDate <= lastMonthEnd;
  }).length;
  
  const closedChange = closedLastMonth > 0 
    ? ((closedThisMonth - closedLastMonth) / closedLastMonth) * 100 
    : 0;
  
  // Calculate average resolution time for this month (using closed tickets from this month)
  const thisMonthClosed = incidents.filter(inc => {
    const state = inc['State']?.toLowerCase() || '';
    if (state !== 'closed' && state !== 'resolved') return false;
    
    const closedDate = parseDate(inc['closed_at'] || inc['Updated']);
    if (!closedDate) return false;
    
    return closedDate >= thisMonthStart;
  });
  
  const avgResolutionTime = thisMonthClosed.length > 0
    ? thisMonthClosed.reduce((sum, inc) => sum + parseDuration(inc['Reported by Duration'] || ''), 0) / thisMonthClosed.length
    : 0;
  
  const spikeServices = servicesWithSpikes.filter(s => s.spikeLevel === 'high' || s.spikeLevel === 'moderate');
  
  // Format month names for display (reuse existing getMonthName function)
  const thisMonthName = getMonthName(now);
  const lastMonthName = getMonthName(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  
  return [
    {
      title: 'Total Tickets Closed',
      value: String(closedThisMonth),
      change: `${thisMonthName}: ${closedThisMonth} | ${lastMonthName}: ${closedLastMonth} (${closedChange > 0 ? '+' : ''}${closedChange.toFixed(1)}%)`,
      changeType: closedChange >= 0 ? 'positive' as const : 'negative' as const,
    },
    {
      title: 'Open Tickets',
      value: String(openTickets.length),
      change: `${openTickets.filter(t => t.isBottleneck).length} bottlenecks (>5 days)`,
      changeType: 'neutral' as const,
    },
    {
      title: 'Avg Resolution Time',
      value: `${avgResolutionTime.toFixed(1)}h`,
      change: 'This month average',
      changeType: 'neutral' as const,
    },
    {
      title: 'Services with Spikes',
      value: String(spikeServices.length),
      change: spikeServices.length > 0 
        ? `${spikeServices.filter(s => s.spikeLevel === 'high').length} high, ${spikeServices.filter(s => s.spikeLevel === 'moderate').length} moderate (≥20% increase)`
        : 'No spikes detected',
      changeType: spikeServices.length > 0 ? 'negative' as const : 'neutral' as const,
    },
  ];
}
