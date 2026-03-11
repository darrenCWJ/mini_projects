import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

type TicketTrendEntry = {
  month: string;
  opened: number;
  closed: number;
  resolved: number;
};

type ServiceEntry = {
  name: string;
  currentMonth: number;
  lastMonth: number;
  spikeLevel?: string;
  category?: string;
  averageResolutionTime?: string;
};

type OpenTicketEntry = {
  severity: string;
  statusDuration?: number;
  businessService?: string;
  assignmentGroup?: string;
};

type AgentEntry = {
  name: string;
  totalAssigned: number;
  open: number;
  inProgress: number;
  resolved: number;
  capacity: number;
  workloadStatus?: string;
};

type TopIssueEntry = {
  issueType: string;
  count: number;
  percentageOfTotal?: number;
  category?: string;
};

type AgingEntry = {
  ageRange: string;
  count: number;
  severity?: string;
};

type ResolutionTimeEntry = {
  month: string;
  avgResolutionTime: number;
  target: number;
};

type ResolutionByServiceEntry = {
  serviceName: string;
  avgResolutionTime: number;
  currentMonthAvg: number;
  lastMonthAvg: number;
  ticketCount: number;
  trend: string;
  category?: string;
  trendPercentage?: number;
};

type MetricEntry = {
  title: string;
  value: string;
  change: string;
  changeType: string;
};

type ChartCalculationsProps = {
  data: {
    ticketTrendData: TicketTrendEntry[];
    serviceData: ServiceEntry[];
    openTicketsData: OpenTicketEntry[];
    agentData: AgentEntry[];
    topIssuesData: TopIssueEntry[];
    agingTicketsData: {
      agingData: AgingEntry[];
      totalTickets: number;
      averageAge: number;
      oldestTicket: number;
    };
    resolutionTimeData: {
      data: ResolutionTimeEntry[];
      currentMonth: number;
      previousMonth: number;
      percentageChange: number;
      trend: string;
    };
    resolutionTimeByServiceData: ResolutionByServiceEntry[];
    metricsData: MetricEntry[];
  };
};

const formatNumber = (value: number, digits = 0) => {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

const formatDeltaPercentage = (value: number) => {
  if (!Number.isFinite(value)) return "0%";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
};

const formatSharePercentage = (value: number) => {
  if (!Number.isFinite(value)) return "0%";
  return `${value.toFixed(1)}%`;
};

const FormulaList = ({ items }: { items: string[] }) => (
  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-600">
    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Formulas</p>
    <ul className="list-inside list-disc space-y-1">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  </div>
);

export function ChartCalculations({ data }: ChartCalculationsProps) {
  const {
    ticketTrendData = [],
    serviceData = [],
    openTicketsData = [],
    agentData = [],
    topIssuesData = [],
    agingTicketsData,
    resolutionTimeData,
    resolutionTimeByServiceData = [],
    metricsData = [],
  } = data;

  const totalOpened = ticketTrendData.reduce((sum, month) => sum + (month.opened || 0), 0);
  const totalClosed = ticketTrendData.reduce((sum, month) => sum + (month.closed || 0), 0);
  const totalResolved = ticketTrendData.reduce((sum, month) => sum + (month.resolved || 0), 0);
  const monthCount = ticketTrendData.length || 1;
  const busiestMonth = ticketTrendData.reduce<TicketTrendEntry | null>((best, entry) => {
    if (!best || entry.opened > best.opened) return entry;
    return best;
  }, null);

  const resolutionSeries = resolutionTimeData?.data ?? [];
  const serviceTotals = serviceData.reduce(
    (acc, service) => {
      acc.current += service.currentMonth || 0;
      acc.last += service.lastMonth || 0;
      return acc;
    },
    { current: 0, last: 0 },
  );
  const highestSpike = serviceData.reduce<{ service: ServiceEntry | null; delta: number }>(
    (acc, service) => {
      const delta = (service.currentMonth || 0) - (service.lastMonth || 0);
      if (!acc.service || delta > acc.delta) {
        return { service, delta };
      }
      return acc;
    },
    { service: null, delta: -Infinity },
  );

  const severityBreakdown = openTicketsData.reduce<Record<string, number>>((acc, ticket) => {
    const key = ticket.severity || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const avgStatusDuration =
    openTicketsData.length > 0
      ? openTicketsData.reduce((sum, ticket) => sum + (ticket.statusDuration || 0), 0) /
        openTicketsData.length
      : 0;

  const agentTotals = agentData.reduce(
    (acc, agent) => {
      acc.totalAssigned += agent.totalAssigned || 0;
      acc.open += agent.open || 0;
      acc.inProgress += agent.inProgress || 0;
      acc.resolved += agent.resolved || 0;
      acc.capacity += agent.capacity || 0;
      if (agent.workloadStatus === "overloaded") acc.overloaded += 1;
      return acc;
    },
    { totalAssigned: 0, open: 0, inProgress: 0, resolved: 0, capacity: 0, overloaded: 0 },
  );
  const avgCapacity =
    agentData.length > 0 ? agentTotals.capacity / agentData.length : 0;

  const totalIssues = topIssuesData.reduce((sum, issue) => sum + (issue.count || 0), 0);
  const topContributors = [...topIssuesData]
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .slice(0, 3);

  const fastestService = resolutionTimeByServiceData.reduce<ResolutionByServiceEntry | null>(
    (best, service) => {
      if (!best || service.avgResolutionTime < best.avgResolutionTime) return service;
      return best;
    },
    null,
  );

  const slowestService = resolutionTimeByServiceData.reduce<ResolutionByServiceEntry | null>(
    (worst, service) => {
      if (!worst || service.avgResolutionTime > worst.avgResolutionTime) return service;
      return worst;
    },
    null,
  );

  const totalAgingTickets = agingTicketsData?.totalTickets || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Metrics Cards</CardTitle>
          <CardDescription>
            Underlying values rendered in the dashboard&apos;s summary cards.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Change vs Last Month</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metricsData.map((metric) => (
                <TableRow key={metric.title}>
                  <TableCell>{metric.title}</TableCell>
                  <TableCell className="font-semibold">{metric.value}</TableCell>
                  <TableCell className="text-muted-foreground">{metric.change}</TableCell>
                </TableRow>
              ))}
              {metricsData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No metrics calculated yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <FormulaList
            items={[
              'Closed_this_month = count(incidents where state in {closed,resolved} and closed_at >= start_of_month)',
              'Closed_change% = ((Closed_this_month - Closed_last_month) / Closed_last_month) * 100',
              'Open_tickets = count(incidents where state not in {closed,resolved})',
              'Avg_resolution_time = average(parseDuration("Reported by Duration")) for closed tickets this month',
              'Services_with_spikes = count(services where ((currentMonth - lastMonth) / max(1,lastMonth)) * 100 >= 20)',
            ]}
          />
        </CardFooter>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Trend Chart</CardTitle>
            <CardDescription>
              Monthly opened/closed/resolved counts used for the line chart.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">Total opened (6 mo)</dt>
                <dd className="text-lg font-semibold">{formatNumber(totalOpened)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Avg opened / month</dt>
                <dd className="text-lg font-semibold">
                  {formatNumber(totalOpened / monthCount, 1)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Total closed (6 mo)</dt>
                <dd className="text-lg font-semibold">{formatNumber(totalClosed)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Busiest month</dt>
                <dd className="text-lg font-semibold">
                  {busiestMonth ? `${busiestMonth.month} (${busiestMonth.opened})` : "—"}
                </dd>
              </div>
            </dl>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Opened</TableHead>
                  <TableHead>Closed</TableHead>
                  <TableHead>Resolved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ticketTrendData.map((month) => (
                  <TableRow key={month.month}>
                    <TableCell>{month.month}</TableCell>
                    <TableCell>{month.opened}</TableCell>
                    <TableCell>{month.closed}</TableCell>
                    <TableCell>{month.resolved}</TableCell>
                  </TableRow>
                ))}
                {ticketTrendData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No time series available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <FormulaList
              items={[
                'Opened_m = count(incidents where month(Open) = m)',
                'Closed_m = count(incidents where month(Open) = m and state = Closed)',
                'Resolved_m = count(incidents where month(Open) = m and state in {Resolved, Closed})',
                'Totals (6 mo) = sum of the last six monthly values after sorting by month(Open)',
              ]}
            />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resolution Time Reduction</CardTitle>
            <CardDescription>
              Values plotted on the improvement chart with month-over-month targets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">Current month</dt>
                <dd className="text-lg font-semibold">
                  {formatNumber(resolutionTimeData?.currentMonth ?? 0, 1)}h
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Previous month</dt>
                <dd className="text-lg font-semibold">
                  {formatNumber(resolutionTimeData?.previousMonth ?? 0, 1)}h
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Change</dt>
                <dd className="text-lg font-semibold">
                  {formatDeltaPercentage(resolutionTimeData?.percentageChange ?? 0)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Trend</dt>
                <dd className="text-lg font-semibold">
                  {resolutionTimeData?.trend ? resolutionTimeData.trend : "—"}
                </dd>
              </div>
            </dl>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Avg Resolution</TableHead>
                  <TableHead>Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resolutionSeries.map((entry) => (
                  <TableRow key={entry.month}>
                    <TableCell>{entry.month}</TableCell>
                    <TableCell>{formatNumber(entry.avgResolutionTime, 1)}h</TableCell>
                    <TableCell>{formatNumber(entry.target, 1)}h</TableCell>
                  </TableRow>
                ))}
                {resolutionSeries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No resolution data uploaded.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <FormulaList
              items={[
                'Avg_resolution_month = average(hoursBetween(Open, Closed)) for tickets closed in that month',
                'Current_month = average(hoursBetween(Open, Closed)) for tickets with closed_at >= start_of_month',
                'Previous_month = average(hoursBetween(Open, Closed)) for tickets closed in prior month',
                'Percentage_change = ((Current_month - Previous_month) / Previous_month) * 100 (defaults to 0 when Previous_month = 0)',
                'Target line fixed at 2.5 hours across the series',
              ]}
            />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resolution Time by Service</CardTitle>
            <CardDescription>
              Aggregations powering the comparative service bar chart.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">Fastest service</dt>
                <dd className="text-lg font-semibold">
                  {fastestService
                    ? `${fastestService.serviceName} (${formatNumber(
                        fastestService.avgResolutionTime,
                        1,
                      )}h)`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Slowest service</dt>
                <dd className="text-lg font-semibold">
                  {slowestService
                    ? `${slowestService.serviceName} (${formatNumber(
                        slowestService.avgResolutionTime,
                        1,
                      )}h)`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Services tracked</dt>
                <dd className="text-lg font-semibold">{resolutionTimeByServiceData.length}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Tickets covered</dt>
                <dd className="text-lg font-semibold">
                  {formatNumber(
                    resolutionTimeByServiceData.reduce(
                      (sum, service) => sum + (service.ticketCount || 0),
                      0,
                    ),
                  )}
                </dd>
              </div>
            </dl>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Avg (h)</TableHead>
                  <TableHead>Δ vs Last</TableHead>
                  <TableHead>Tickets</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resolutionTimeByServiceData.map((service) => (
                  <TableRow key={service.serviceName}>
                    <TableCell>{service.serviceName}</TableCell>
                    <TableCell>{formatNumber(service.avgResolutionTime, 1)}</TableCell>
                    <TableCell>
                      {formatNumber(
                        (service.currentMonthAvg || 0) - (service.lastMonthAvg || 0),
                        1,
                      )}
                      h
                    </TableCell>
                    <TableCell>{service.ticketCount}</TableCell>
                  </TableRow>
                ))}
                {resolutionTimeByServiceData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No service-level resolution data calculated.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <FormulaList
              items={[
                'Avg_resolution_service = average(hoursBetween(Open, Closed)) for all closed tickets belonging to that service',
                'Delta_vs_last = Current_month_avg - Last_month_avg',
                'Ticket_count = number of closed tickets considered for the service (current + last month windows)',
                'Trend% = ((Current_month_avg - Last_month_avg) / Last_month_avg) * 100 (or "new" if last month had 0 cases)',
              ]}
            />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Incident Table</CardTitle>
            <CardDescription>
              Incident spikes and totals driving the service ranking widget.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">Incidents this month</dt>
                <dd className="text-lg font-semibold">
                  {formatNumber(serviceTotals.current)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Incidents last month</dt>
                <dd className="text-lg font-semibold">
                  {formatNumber(serviceTotals.last)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Tracked services</dt>
                <dd className="text-lg font-semibold">{serviceData.length}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Largest spike</dt>
                <dd className="text-lg font-semibold">
                  {highestSpike.service
                    ? `${highestSpike.service.name} (+${formatNumber(highestSpike.delta)})`
                    : "—"}
                </dd>
              </div>
            </dl>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>Last</TableHead>
                  <TableHead>Spike Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceData.map((service) => (
                  <TableRow key={service.name}>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.currentMonth}</TableCell>
                    <TableCell>{service.lastMonth}</TableCell>
                    <TableCell className="capitalize">
                      {service.spikeLevel || "none"}
                    </TableCell>
                  </TableRow>
                ))}
                {serviceData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No business services available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <FormulaList
              items={[
                'Current_month = count(incidents where Business Service = service and Opened >= start_of_month)',
                'Last_month = count(incidents where Business Service = service and Opened within previous month)',
                'Spike_level = "high" if percentChange >= 50, "moderate" if 20 <= percentChange < 50, else "none"',
                'PercentChange = ((Current_month - Last_month) / max(1, Last_month)) * 100',
                'Average_resolution_time = average(hoursBetween(Open, Closed)) for closed tickets by service',
              ]}
            />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Issues Chart</CardTitle>
            <CardDescription>
              Counts and percentages shown in the Top 10 Issues bar chart.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">Total issues tracked</dt>
                <dd className="text-lg font-semibold">{formatNumber(totalIssues)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Top contributor</dt>
                <dd className="text-lg font-semibold">
                  {topContributors[0]
                    ? `${topContributors[0].issueType} (${formatNumber(
                        topContributors[0].count,
                      )})`
                    : "—"}
                </dd>
              </div>
            </dl>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Issue</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>% of Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topIssuesData.map((issue) => (
                  <TableRow key={issue.issueType}>
                    <TableCell>{issue.issueType}</TableCell>
                    <TableCell>{issue.category || "—"}</TableCell>
                    <TableCell>{issue.count}</TableCell>
                    <TableCell>
                      {issue.percentageOfTotal !== undefined
                        ? formatSharePercentage(issue.percentageOfTotal)
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {topIssuesData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No issue categorization calculated.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <FormulaList
              items={[
                'Issue_count(issueType) = count(incidents grouped by extracted issue keyword)',
                'Percentage_of_total = (Issue_count / Total_incidents) * 100',
                'Categories inherit from categorizeBusinessService(Business Service)',
              ]}
            />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aging Tickets Chart</CardTitle>
            <CardDescription>
              Bucketed counts that populate the stacked bar visualization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-muted-foreground">Total tickets</dt>
                <dd className="text-lg font-semibold">
                  {formatNumber(totalAgingTickets)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Average age</dt>
                <dd className="text-lg font-semibold">
                  {formatNumber(agingTicketsData?.averageAge ?? 0, 1)} days
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Oldest ticket</dt>
                <dd className="text-lg font-semibold">
                  {formatNumber(agingTicketsData?.oldestTicket ?? 0)} days
                </dd>
              </div>
            </dl>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bucket</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>% Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agingTicketsData?.agingData?.map((bucket) => (
                  <TableRow key={bucket.ageRange}>
                    <TableCell>{bucket.ageRange}</TableCell>
                    <TableCell>{bucket.count}</TableCell>
                    <TableCell className="capitalize">{bucket.severity || "—"}</TableCell>
                    <TableCell>
                      {totalAgingTickets > 0
                        ? formatSharePercentage((bucket.count / totalAgingTickets) * 100)
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {(!agingTicketsData || agingTicketsData.agingData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No aging distribution to display.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <FormulaList
              items={[
                'Age_days = daysBetween(Open, now) for incidents where state not in {closed,resolved}',
                'Bucket counts incremented based on Age_days ranges (0-5, 6-10, 11-20, 20+)',
                'Average_age = sum(Age_days) / total open incidents',
                'Oldest_ticket = max(Age_days)',
                '% Share(bucket) = (Bucket_count / Total_open_incidents) * 100',
              ]}
            />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Tickets Panel</CardTitle>
            <CardDescription>
              Severity mix and work-in-progress stats used for the right-hand panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">Tickets displayed</dt>
                <dd className="text-lg font-semibold">{openTicketsData.length}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Avg hours in current status</dt>
                <dd className="text-lg font-semibold">
                  {formatNumber(avgStatusDuration, 1)}h
                </dd>
              </div>
            </dl>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severity</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(severityBreakdown).map(([severity, count]) => (
                  <TableRow key={severity}>
                    <TableCell>{severity}</TableCell>
                    <TableCell>{count}</TableCell>
                    <TableCell>
                      {openTicketsData.length > 0
                        ? formatSharePercentage((count / openTicketsData.length) * 100)
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {openTicketsData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No open tickets after filtering.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <FormulaList
              items={[
                'Severity derived from Priority text: P1 -> Critical, P2 -> High, P3 -> Medium, P4 -> Low',
                'Avg_status_duration = sum(statusDuration_hours) / total open tickets (statusDuration = hours since last update)',
                'Severity_share = (count_by_severity / total open tickets) * 100',
              ]}
            />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agent Workload Board</CardTitle>
            <CardDescription>
              Aggregated counts backing the workload heatmap and table.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">Assignments</dt>
                <dd className="text-lg font-semibold">
                  {formatNumber(agentTotals.totalAssigned)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Avg capacity</dt>
                <dd className="text-lg font-semibold">
                  {formatNumber(avgCapacity, 1)}%
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Queues</dt>
                <dd className="text-lg font-semibold">
                  {formatNumber(agentTotals.open)} open /{" "}
                  {formatNumber(agentTotals.inProgress)} progress /{" "}
                  {formatNumber(agentTotals.resolved)} resolved
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Overloaded teams</dt>
                <dd className="text-lg font-semibold">{agentTotals.overloaded}</dd>
              </div>
            </dl>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Capacity%</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agentData.map((agent) => (
                  <TableRow key={agent.name}>
                    <TableCell>{agent.name}</TableCell>
                    <TableCell>{agent.totalAssigned}</TableCell>
                    <TableCell>{formatNumber(agent.capacity, 0)}%</TableCell>
                    <TableCell className="capitalize">
                      {agent.workloadStatus || "normal"}
                    </TableCell>
                  </TableRow>
                ))}
                {agentData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No assignment data calculated.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <FormulaList
              items={[
                'Total_assigned(team) = count(incidents mapped to that assignment group)',
                'Capacity% = min(100, (Total_assigned / 20) * 100)',
                'Open/In Progress/Resolved counts split by incident State',
                'Overdue = count(incidents where daysBetween(Open, now) > 5)',
                'Workload_status = "overloaded" if Capacity >= 85%, "light" if < 50%, else "normal"',
              ]}
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default ChartCalculations;

