import { DashboardFiltersState } from "../components/DashboardFilters";

// Helper to check if a date is within range
function isDateInRange(date: Date | null, from: Date | null, to: Date | null): boolean {
  if (!date) return true; // If no date, don't filter
  if (!from && !to) return true; // If no date range filter, include all
  
  if (from && to) {
    return date >= from && date <= to;
  } else if (from) {
    return date >= from;
  } else if (to) {
    return date <= to;
  }
  
  return true;
}

// Generic filter function for any incident data
export function filterIncidents(incidents: any[], filters: DashboardFiltersState): any[] {
  return incidents.filter(incident => {
    // Date range filter
    const openedDate = incident['Opened'] ? new Date(incident['Opened']) : null;
    if (!isDateInRange(openedDate, filters.dateRange.from, filters.dateRange.to)) {
      return false;
    }

    // Business Service filter
    if (filters.businessServices.length > 0) {
      const businessService = incident['Business Service'] || '';
      if (!filters.businessServices.includes(businessService)) {
        return false;
      }
    }

    // Priority filter
    if (filters.priorities.length > 0) {
      const priority = incident['Priority'] || '';
      if (!filters.priorities.includes(priority)) {
        return false;
      }
    }

    // State filter
    if (filters.states.length > 0) {
      const state = incident['State'] || '';
      if (!filters.states.includes(state)) {
        return false;
      }
    }

    // Assignment Group filter
    if (filters.assignmentGroups.length > 0) {
      const assignmentGroup = incident['Assignment group'] || '';
      if (!filters.assignmentGroups.includes(assignmentGroup)) {
        return false;
      }
    }

    return true;
  });
}

// Extract unique values from incidents for filter options
export function extractFilterOptions(incidents: any[]): {
  businessServices: string[];
  priorities: string[];
  states: string[];
  assignmentGroups: string[];
} {
  const businessServicesSet = new Set<string>();
  const prioritiesSet = new Set<string>();
  const statesSet = new Set<string>();
  const assignmentGroupsSet = new Set<string>();

  incidents.forEach(incident => {
    if (incident['Business Service']) businessServicesSet.add(incident['Business Service']);
    if (incident['Priority']) prioritiesSet.add(incident['Priority']);
    if (incident['State']) statesSet.add(incident['State']);
    if (incident['Assignment group']) assignmentGroupsSet.add(incident['Assignment group']);
  });

  return {
    businessServices: Array.from(businessServicesSet).sort(),
    priorities: Array.from(prioritiesSet).sort(),
    states: Array.from(statesSet).sort(),
    assignmentGroups: Array.from(assignmentGroupsSet).sort(),
  };
}
