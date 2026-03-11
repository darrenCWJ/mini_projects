import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Badge } from "./ui/badge";
import { CalendarIcon, X, Filter, Building2 } from "lucide-react";
import { useState } from "react";

function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export interface DashboardFiltersState {
  dateRange: { from: Date | null; to: Date | null };
  businessServices: string[];
  priorities: string[];
  states: string[];
  assignmentGroups: string[];
  primaryBusinessService?: string; // For the prominent single-select filter
}

interface DashboardFiltersProps {
  filters: DashboardFiltersState;
  onFiltersChange: (filters: DashboardFiltersState) => void;
  availableBusinessServices: string[];
  availablePriorities: string[];
  availableStates: string[];
  availableAssignmentGroups: string[];
}

export function DashboardFilters({
  filters,
  onFiltersChange,
  availableBusinessServices,
  availablePriorities,
  availableStates,
  availableAssignmentGroups,
}: DashboardFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDateRangeChange = (type: 'from' | 'to', date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type]: date || null,
      },
    });
  };

  const handleMultiSelectChange = (
    field: 'businessServices' | 'priorities' | 'states' | 'assignmentGroups',
    value: string
  ) => {
    const currentValues = filters[field];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFiltersChange({
      ...filters,
      [field]: newValues,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      dateRange: { from: null, to: null },
      businessServices: [],
      priorities: [],
      states: [],
      assignmentGroups: [],
      primaryBusinessService: 'all',
    });
  };

  const handlePrimaryBusinessServiceChange = (value: string) => {
    onFiltersChange({
      ...filters,
      primaryBusinessService: value,
    });
  };

  const hasActiveFilters = 
    filters.dateRange.from !== null ||
    filters.dateRange.to !== null ||
    filters.businessServices.length > 0 ||
    filters.priorities.length > 0 ||
    filters.states.length > 0 ||
    filters.assignmentGroups.length > 0 ||
    (filters.primaryBusinessService && filters.primaryBusinessService !== 'all');

  const activeFilterCount = 
    (filters.dateRange.from ? 1 : 0) +
    (filters.dateRange.to ? 1 : 0) +
    filters.businessServices.length +
    filters.priorities.length +
    filters.states.length +
    filters.assignmentGroups.length +
    (filters.primaryBusinessService && filters.primaryBusinessService !== 'all' ? 1 : 0);

  return (
    <Card className="p-4 mb-6">
      {/* Primary Business Service Filter - Always Visible */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <Label className="text-sm mb-2 block">Filter by Business Service</Label>
            <Select 
              value={filters.primaryBusinessService || 'all'} 
              onValueChange={handlePrimaryBusinessServiceChange}
            >
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="All Business Services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span>All Business Services</span>
                </SelectItem>
                {availableBusinessServices.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {filters.primaryBusinessService && filters.primaryBusinessService !== 'all' && (
            <Badge variant="default" className="self-end mb-2">
              Service Filter Active
            </Badge>
          )}
        </div>
      </div>

      {/* Advanced Filters Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3>Advanced Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount} active</Badge>
          )}
        </div>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Date Range - From */}
          <div>
            <Label className="text-xs mb-2 block">Date From</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? formatDate(filters.dateRange.from) : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.from || undefined}
                  onSelect={(date) => handleDateRangeChange('from', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Date Range - To */}
          <div>
            <Label className="text-xs mb-2 block">Date To</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.to ? formatDate(filters.dateRange.to) : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.to || undefined}
                  onSelect={(date) => handleDateRangeChange('to', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Business Service */}
          <div>
            <Label className="text-xs mb-2 block">Business Service</Label>
            <Select onValueChange={(value) => handleMultiSelectChange('businessServices', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {availableBusinessServices.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.businessServices.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.businessServices.map((service) => (
                  <Badge key={service} variant="secondary" className="text-xs">
                    {service}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() => handleMultiSelectChange('businessServices', service)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Priority */}
          <div>
            <Label className="text-xs mb-2 block">Priority</Label>
            <Select onValueChange={(value) => handleMultiSelectChange('priorities', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {availablePriorities.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.priorities.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.priorities.map((priority) => (
                  <Badge key={priority} variant="secondary" className="text-xs">
                    {priority}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() => handleMultiSelectChange('priorities', priority)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* State */}
          <div>
            <Label className="text-xs mb-2 block">State</Label>
            <Select onValueChange={(value) => handleMultiSelectChange('states', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {availableStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.states.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.states.map((state) => (
                  <Badge key={state} variant="secondary" className="text-xs">
                    {state}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() => handleMultiSelectChange('states', state)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Assignment Group */}
          <div className="md:col-span-2 lg:col-span-1">
            <Label className="text-xs mb-2 block">Assignment Group</Label>
            <Select onValueChange={(value) => handleMultiSelectChange('assignmentGroups', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                {availableAssignmentGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.assignmentGroups.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.assignmentGroups.map((group) => (
                  <Badge key={group} variant="secondary" className="text-xs">
                    {group}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() => handleMultiSelectChange('assignmentGroups', group)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
