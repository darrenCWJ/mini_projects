# Incident Management Dashboard - Widget Logic & Criteria Documentation

## Overview
This document details the calculation logic, criteria, and thresholds used by each widget in the Incident Management Dashboard.

---

## 1. METRICS CARDS (Top KPI Cards)

### 1.1 Total Tickets Closed
**Location:** `processMetrics()` in `dataProcessor.ts` (lines 546-573)

**Calculation Logic:**
- Counts incidents with state = "Closed" OR "Resolved" opened during the **current month**
- Compares with previous month to calculate percentage change

**Criteria:**
```javascript
State: "Closed" OR "Resolved"
Opened Date: >= First day of current month
```

**Change Calculation:**
```javascript
percentageChange = ((closedThisMonth - closedLastMonth) / closedLastMonth) * 100
```

**Display:**
- Value: Count of closed tickets
- Change: Percentage change from last month (green if positive)

---

### 1.2 Open Tickets
**Location:** `processMetrics()` in `dataProcessor.ts` (lines 602-604)

**Calculation Logic:**
- Counts all tickets where state ≠ "Closed" and ≠ "Resolved"
- Shows count of bottleneck tickets (open > 5 days)

**Criteria:**
```javascript
State: NOT "Closed" AND NOT "Resolved"
Bottleneck: daysSinceCreated > 5
```

**Display:**
- Value: Total count of open tickets
- Change: Number of bottleneck tickets with ">5 days" indicator

---

### 1.3 Avg Resolution Time
**Location:** `processMetrics()` in `dataProcessor.ts` (lines 576-589)

**Calculation Logic:**
- Calculates average resolution time for tickets closed this month
- Uses "Reported by Duration" field from incident data

**Criteria:**
```javascript
State: "Closed" OR "Resolved"
Opened Date: >= First day of current month
Resolution Time: Parsed from "Reported by Duration" field
```

**Calculation:**
```javascript
avgResolutionTime = sum(allResolutionTimes) / count(closedTickets)
```

**Display:**
- Value: Average hours (e.g., "2.3h")
- Change: "This month average"

---

### 1.4 Services with Spikes
**Location:** `processMetrics()` in `dataProcessor.ts` (lines 591-616)

**Calculation Logic:**
- Counts business services with spike level = "High" or "Moderate"
- Lists top 2 services with spikes

**Spike Detection Criteria:**
```javascript
High Spike: percentageChange > 50%
Moderate Spike: percentageChange > 20%
None: percentageChange <= 20%

where percentageChange = ((currentMonth - lastMonth) / lastMonth) * 100
```

**Display:**
- Value: Count of services with spikes
- Change: Names of top 2 services with spikes

---

## 2. TICKET TREND CHART

**Location:** `processTicketTrend()` in `dataProcessor.ts` (lines 50-89)

### Calculation Logic:
1. Groups all incidents by month using the "Opened" date
2. For each month, counts:
   - **Opened:** All tickets opened in that month
   - **Closed:** Tickets with State = "Closed"
   - **Resolved:** Tickets with State = "Resolved" OR "Closed"

### Time Period:
- Shows last **6 months** of data
- Sorted chronologically

### Data Structure:
```javascript
{
  month: "Oct",           // Month abbreviation
  opened: 176,           // Count of tickets opened
  closed: 198,           // Count of closed tickets
  resolved: 192          // Count of resolved tickets
}
```

### Visual Elements:
- Red line: Opened tickets
- Green line: Closed tickets
- Blue line: Resolved tickets

---

## 3. SERVICE INCIDENT TABLE (Business Services)

**Location:** `processServiceData()` in `dataProcessor.ts` (lines 92-156)

### Calculation Logic:

#### Current Month vs Last Month:
```javascript
Current Month Start: First day of current month
Last Month Start: First day of previous month

For each Business Service:
  - currentMonth: Tickets opened >= currentMonthStart
  - lastMonth: Tickets opened >= lastMonthStart AND < currentMonthStart
```

#### Trend Detection:
```javascript
percentageChange = ((currentMonth - lastMonth) / lastMonth) * 100

Trend Assignment:
  - "up": percentageChange > 5%
  - "down": percentageChange < -5%
  - "stable": -5% <= percentageChange <= 5%
```

#### Spike Level Detection:
```javascript
Spike Levels:
  - "high": percentageChange > 50%
  - "moderate": 20% < percentageChange <= 50%
  - "none": percentageChange <= 20%
```

#### Average Resolution Time:
```javascript
For each service:
  - Parse all "Reported by Duration" values
  - Calculate average: sum(times) / count(times)
  - Display in hours (e.g., "2.4h")
```

### Sorting:
Services are sorted by spike level priority:
1. High spikes first
2. Moderate spikes second
3. Normal/None last

### Category Assignment:
Services are categorized using `categorizeBusinessService()` function from `businessServices.ts`

---

## 4. TOP 10 ISSUES FACED BY GOVTECHIES

**Location:** `processTopIssues()` in `dataProcessor.ts` (lines 309-336)

### Calculation Logic:

#### Issue Type Extraction:
From "Short description" field, issues are categorized using pattern matching:

```javascript
Pattern Matching Rules:
  - "login" OR "sign in" → "Login Issues"
  - "payment" OR "transaction" → "Payment Issues"
  - "timeout" OR "slow" → "Performance Issues"
  - "error" OR "failed" → "Error Messages"
  - "access" OR "permission" → "Access Issues"
  - "email" OR "notification" → "Email/Notification Issues"
  - "database" OR "data" → "Database Issues"
  - "api" → "API Issues"
  - "mobile" OR "app" → "Mobile App Issues"
  - "report" OR "export" → "Reporting Issues"
  - No match → First 3 words of description
```

#### Aggregation:
```javascript
For each issue type:
  - count: Number of incidents matching this issue type
  - category: Derived from Business Service
  - percentageOfTotal: (count / totalIncidents) * 100
```

### Display:
- Shows **top 10 issues** by count (descending)
- Horizontal bar chart with counts
- Percentage of total shown in tooltip

---

## 5. AGING TICKETS ANALYSIS

**Location:** `processAgingTickets()` in `dataProcessor.ts` (lines 359-397)

### Calculation Logic:

#### Filter Criteria:
```javascript
Include only tickets where:
  State: NOT "Closed" AND NOT "Resolved"
```

#### Age Calculation:
```javascript
age (days) = daysBetween(openedDate, currentDate)
```

#### Age Range Distribution:
```javascript
Age Ranges with Severity:
  - "0-5 days": age <= 5 (severity: low)
  - "6-10 days": 6 <= age <= 10 (severity: moderate)
  - "11-20 days": 11 <= age <= 20 (severity: high)
  - "20+ days": age > 20 (severity: critical)
```

#### Summary Statistics:
```javascript
totalTickets: Count of all open tickets
averageAge: sum(allAges) / count(openTickets)
oldestTicket: max(allAges)
```

### Visual Elements:
- Pie chart showing distribution across age ranges
- Color coding:
  - Green (#10b981): 0-5 days
  - Orange (#f59e0b): 6-10 days
  - Red (#ef4444): 11-20 days
  - Dark Red (#dc2626): 20+ days

---

## 6. RESOLUTION TIME REDUCTION

**Location:** `processResolutionTime()` in `dataProcessor.ts` (lines 399-460)

### Calculation Logic:

#### Filter Criteria:
```javascript
Include only tickets where:
  State: "Closed" OR "Resolved"
  
Optional Business Service Filter:
  If primaryBusinessService != "all":
    Filter by specific Business Service
```

#### Monthly Aggregation:
1. Group tickets by month (using "Opened" date)
2. For each month, collect all resolution times from "Reported by Duration"
3. Calculate average resolution time per month
4. Show last **6 months**

#### Trend Detection:
```javascript
currentMonth: avgResolutionTime of most recent month
previousMonth: avgResolutionTime of second most recent month

percentageChange = ((currentMonth - previousMonth) / previousMonth) * 100

Trend Assignment:
  - "improving": percentageChange < 0 (time decreased)
  - "worsening": percentageChange > 0 (time increased)
  - "stable": percentageChange == 0
```

### Target Line:
- Default target: **2.5 hours**
- Displayed as dashed reference line on chart

### Visual Indicators:
```javascript
Color Coding:
  - Green: Improving trend
  - Red: Worsening trend
  - Gray: Stable trend
```

---

## 7. RESOLUTION TIME BY BUSINESS SERVICE

**Location:** `processResolutionTimeByService()` in `dataProcessor.ts` (lines 462-543)

### Calculation Logic:

#### Filter Criteria:
```javascript
Include only tickets where:
  State: "Closed" OR "Resolved"
  "Reported by Duration" exists and > 0
```

#### Per-Service Analysis:
For each Business Service:

```javascript
currentMonthTimes[]: Resolution times for tickets opened this month
lastMonthTimes[]: Resolution times for tickets opened last month

avgResolutionTime: average of all times (current + last month)
currentMonthAvg: average of currentMonthTimes
lastMonthAvg: average of lastMonthTimes
ticketCount: total count of resolved tickets
```

#### Trend Detection:
```javascript
If lastMonthAvg > 0:
  trendPercentage = ((currentMonthAvg - lastMonthAvg) / lastMonthAvg) * 100
  
  Trend Assignment:
    - "improving": trendPercentage < -5% (time decreased)
    - "worsening": trendPercentage > 5% (time increased)
    - "stable": -5% <= trendPercentage <= 5%
    
If lastMonthAvg == 0 AND currentMonthAvg > 0:
  Trend: "new" (new service this month)
```

#### Performance Thresholds:
```javascript
Bar Color Coding:
  - Green (#10b981): avgResolutionTime <= targetTime (2.5h)
  - Orange (#f59e0b): targetTime < avgResolutionTime <= targetTime * 1.5 (3.75h)
  - Red (#ef4444): avgResolutionTime > targetTime * 1.5
```

#### Statistics Displayed:
```javascript
Overall Avg: Weighted average across all services
Meeting Target: Count of services with avgResolutionTime <= 2.5h
Above Target: Count of services with avgResolutionTime > 2.5h
Improving: Count of services with trend = "improving"
Worsening: Count of services with trend = "worsening"
```

### Sorting Options:
- **Sort by Time:** Descending by avgResolutionTime (slowest first)
- **Sort by Volume:** Descending by ticketCount (highest first)

### Filtering Options:
- **Category Filter:** Filter by service category
- **Trend Filter:** Filter by trend type (improving/worsening/stable/new)

### Display:
- Default: Top 10 services
- Option to "Show All" services
- Trend icons displayed next to service names on Y-axis

---

## 8. OPEN TICKETS PANEL (Right Sidebar)

**Location:** `processOpenTickets()` in `dataProcessor.ts` (lines 179-218)

### Calculation Logic:

#### Filter Criteria:
```javascript
Include tickets where:
  State: NOT "Closed" AND NOT "Resolved"
```

#### Severity Mapping:
Maps "Priority" field to severity levels:
```javascript
Priority → Severity Mapping:
  "1" OR contains "critical" → "Critical"
  "2" OR contains "high" → "High"
  "3" OR contains "medium" → "Medium"
  "4" OR contains "low" → "Low"
  Default → "Medium"
```

#### Bottleneck Detection:
```javascript
isBottleneck: daysSinceCreated > 5

Bottleneck Severity (visual indicator):
  - critical: statusDuration > 48 hours
  - high: statusDuration > 24 hours
  - medium: statusDuration <= 24 hours
```

#### Overdue Tickets:
```javascript
Overdue Criteria: daysSinceCreated > 5 days
```

#### Time Calculations:
```javascript
daysSinceCreated: daysBetween(openedDate, now)
statusDuration: hoursBetween(lastUpdated, now)
lastUpdated: Time since "Updated" date
```

### Sorting:
Tickets sorted by `daysSinceCreated` (descending) - oldest tickets first

### Visual Indicators:
```javascript
Severity Colors:
  - Critical: Red (#ef4444)
  - High: Orange (#f97316)
  - Medium: Yellow (#eab308)
  - Low: Blue (#3b82f6)

Border Colors:
  - Overdue (>5 days): Red border with red background
  - Bottleneck: Red border
  - Normal: Gray border
```

### Charts Displayed:
1. **By Severity:** Pie chart of ticket distribution by severity
2. **By Assignment Group:** Horizontal bar chart of top 5 groups
3. **By Business Service:** Horizontal bar chart of services

---

## 9. AGENT WORKLOAD TAB

**Location:** `processAgentWorkload()` in `dataProcessor.ts` (lines 220-307)

### Calculation Logic:

#### Grouping:
Tickets are grouped by "Assignment group" field

#### Status Counts:
For each assignment group:
```javascript
Status Categorization:
  - resolved: State = "Resolved" OR "Closed"
  - inProgress: State = "In Progress"
  - open: All other states (not resolved, not in progress)
```

#### Capacity Calculation:
```javascript
Assumes max capacity = 20 tickets per agent/group

capacity = min(100, (totalAssigned / 20) * 100)

Workload Status:
  - "overloaded": capacity >= 85%
  - "light": capacity < 50%
  - "normal": 50% <= capacity < 85%
```

#### Average Resolution Time:
```javascript
For each group:
  1. Extract all "Reported by Duration" values
  2. Filter out 0 or null values
  3. Calculate: sum(resolutionTimes) / count(validTimes)
```

#### Overdue Tickets:
```javascript
overdueTickets: Count where daysBetween(openedDate, now) > 5
```

#### Priority Distribution:
For each group, count tickets by priority:
```javascript
Priority Mapping:
  - critical: Priority contains "1" OR "critical"
  - high: Priority contains "2" OR "high"
  - medium: Priority contains "3" OR "medium"
  - low: All others
```

### Summary Metrics:
```javascript
Total Agents: Count of unique assignment groups
Total Assigned: Sum of all tickets across all groups
Avg Workload: totalAssigned / agentCount
Total Overdue: Sum of overdue tickets across all groups
Overloaded Agents: Count where workloadStatus = "overloaded"
```

### Charts:
1. **Workload Distribution:** Stacked bar chart showing Open/In Progress/Resolved per agent
2. **Capacity Overview:** Pie chart showing distribution of Overloaded/Normal/Light workload

### Performance Trend:
Currently set to "stable" for all agents (placeholder for future enhancement)

---

## 10. DASHBOARD FILTERS

**Location:** `filterIncidents()` in `filterData.ts` (lines 20-62)

### Filter Types:

#### 10.1 Primary Business Service Filter
**Location:** Top of dashboard (always visible)
```javascript
Behavior: Single-select dropdown
Effect: Filters ALL dashboard widgets
Value "all": Shows all business services (no filtering)
```

Special application to Resolution Time Reduction widget:
- Directly passed to `processResolutionTime()` function
- Recalculates trends for selected service only

#### 10.2 Date Range Filter
```javascript
Fields: "from" and "to" dates
Applied to: "Opened" field

Logic:
  If both from AND to are set:
    Include: from <= openedDate <= to
  If only from is set:
    Include: openedDate >= from
  If only to is set:
    Include: openedDate <= to
  If neither is set:
    Include: all dates
```

#### 10.3 Business Service Filter (Advanced)
```javascript
Type: Multi-select
Applied to: "Business Service" field

Logic:
  If businessServices.length > 0:
    Include ONLY incidents where Business Service is in selected list
  Else:
    Include all
```

#### 10.4 Priority Filter
```javascript
Type: Multi-select
Applied to: "Priority" field

Logic:
  If priorities.length > 0:
    Include ONLY incidents where Priority is in selected list
  Else:
    Include all
```

#### 10.5 State Filter
```javascript
Type: Multi-select
Applied to: "State" field

Logic:
  If states.length > 0:
    Include ONLY incidents where State is in selected list
  Else:
    Include all
```

#### 10.6 Assignment Group Filter
```javascript
Type: Multi-select
Applied to: "Assignment group" field

Logic:
  If assignmentGroups.length > 0:
    Include ONLY incidents where Assignment group is in selected list
  Else:
    Include all
```

### Filter Combination:
All filters are applied using **AND logic**:
```javascript
Incident is included IF:
  dateRangeFilter 
  AND businessServiceFilter 
  AND priorityFilter 
  AND stateFilter 
  AND assignmentGroupFilter
  ALL evaluate to TRUE
```

### Filter Application Order:
1. Filters applied to raw incident data
2. Filtered dataset passed to all processing functions
3. Each widget processes the already-filtered data
4. Primary Business Service filter additionally affects Resolution Time Reduction

---

## 11. DATA FIELD MAPPINGS

### Expected Dataset Structure:
```javascript
{
  "Ticket#": string,                    // Incident ID
  "Opened": string (date),              // When ticket was opened
  "State": string,                      // Current state
  "Short description": string,          // Brief description
  "Assignment group": string,           // Team/agent assigned to
  "Priority": string,                   // Priority level
  "Business Service": string,           // Service affected
  "Updated": string (date),             // Last update time
  "Reported by Duration": string,       // Resolution time
  "Resolution Category 1": string,      // Optional
  "Resolution Category 2": string,      // Optional
  "Resolution Category 3": string,      // Optional
  "Affected User": string,              // Optional
  ...other fields
}
```

### Duration Parsing:
```javascript
Function: parseDuration(duration: string): number

Logic:
  1. Extract first number from string using regex: /(\d+(?:\.\d+)?)/
  2. Convert to float
  3. Return as hours
  
Example:
  "2.5 hours" → 2.5
  "3h" → 3
  "1.8" → 1.8
```

---

## 12. KEY THRESHOLDS SUMMARY

| Metric | Threshold | Meaning |
|--------|-----------|---------|
| **Bottleneck Ticket** | > 5 days open | Ticket stuck in process |
| **Overdue Ticket** | > 5 days open | Same as bottleneck |
| **High Spike** | > 50% increase | Significant incident increase |
| **Moderate Spike** | > 20% increase | Notable incident increase |
| **Trend Up** | > 5% change | Increasing trend |
| **Trend Down** | < -5% change | Decreasing trend |
| **Target Resolution Time** | 2.5 hours | Goal for resolution |
| **Agent Overloaded** | >= 85% capacity | Too many tickets |
| **Agent Light Load** | < 50% capacity | Has capacity for more |
| **Resolution Improving** | < -5% change | Time is decreasing |
| **Resolution Worsening** | > 5% change | Time is increasing |
| **Bottleneck Critical** | > 48 hours in status | Severe bottleneck |
| **Bottleneck High** | > 24 hours in status | High priority bottleneck |

---

## 13. COLOR CODING STANDARDS

### Severity Levels:
```javascript
Critical: #ef4444 (Red)
High: #f97316 (Orange) 
Medium: #eab308 (Yellow)
Low: #3b82f6 (Blue)
```

### Trend Indicators:
```javascript
Improving/Good: #10b981 (Green)
Worsening/Bad: #ef4444 (Red)
Stable/Neutral: #6b7280 (Gray)
New: #3b82f6 (Blue)
```

### Spike Levels:
```javascript
High Spike: Red badge with AlertTriangle icon
Moderate Spike: Orange outline badge with AlertTriangle icon
None: Gray "Normal" badge
```

### Workload Status:
```javascript
Overloaded: Red (#ef4444)
Normal: Blue (#3b82f6)
Light: Green (#10b981)
```

---

## 14. CHART CONFIGURATIONS

### Line Charts (Ticket Trends, Resolution Time):
- Grid: Light gray (#e5e7eb), dashed
- Axes: Gray (#6b7280)
- Line Width: 2-3px
- Dots: Filled circles, radius 4-5px

### Bar Charts (Top Issues, Resolution by Service):
- Horizontal orientation for service comparisons
- Vertical orientation for time series
- Rounded corners: 4px radius
- Spacing: 2-5px padding angle

### Pie Charts (Aging Tickets, Severity Distribution):
- Inner radius: 30-40px (donut style)
- Outer radius: 50-100px
- Padding angle: 2px
- Labels show percentage

---

## 15. PERFORMANCE NOTES

### Data Aggregation:
- All calculations performed client-side
- Uses JavaScript array methods (filter, map, reduce)
- Efficient grouping using object maps

### Time Calculations:
- All dates converted to JavaScript Date objects
- Millisecond precision for time differences
- Converted to days/hours as needed

### Sorting Priority:
1. Spike level (high → moderate → none)
2. Resolution time (descending)
3. Ticket count (descending)
4. Age (descending for open tickets)

---

## END OF DOCUMENTATION
