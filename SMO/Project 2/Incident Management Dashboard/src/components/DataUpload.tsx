import { useState, useCallback } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Upload, FileText, CheckCircle, XCircle, Download, ChevronDown, ChevronUp } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { BUSINESS_SERVICES, categorizeBusinessService } from "../utils/businessServices";
import * as XLSX from 'xlsx';

interface DataUploadProps {
  onDataParsed: (data: any) => void;
}

export function DataUpload({ onDataParsed }: DataUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFile = async (file: File) => {
    setUploadedFile(file);
    
    // Check file type
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const isCsv = file.name.endsWith('.csv');
    const isJson = file.name.endsWith('.json');

    if (!isExcel && !isCsv && !isJson) {
      setUploadStatus('error');
      setErrorMessage('Please upload an Excel (.xlsx, .xls), CSV, or JSON file');
      return;
    }

    try {
      let parsed;

      if (isExcel) {
        // Parse Excel file
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, dateNF: 'yyyy-mm-dd hh:mm:ss' });
        
        // Convert to our format
        const headers = (jsonData[0] as any[]).map(h => String(h));
        const data = (jsonData.slice(1) as any[][]).map(row => {
          const obj: any = {};
          headers.forEach((header, index) => {
            if (row[index] !== undefined) {
              // Handle dates properly
              if (row[index] instanceof Date) {
                obj[header] = row[index].toISOString().replace('T', ' ').substring(0, 19);
              } else {
                obj[header] = String(row[index]);
              }
            } else {
              obj[header] = '';
            }
          });
          return obj;
        });
        
        parsed = { headers, data };
      } else if (isCsv) {
        // Use XLSX library to parse CSV (handles quoted fields and multi-line values properly)
        const text = await file.text();
        let workbook;
        try {
          // Try parsing as CSV explicitly
          workbook = XLSX.read(text, { 
            type: 'string', 
            cellDates: true,
            sheetStubs: false,
            dense: false
          });
        } catch (error) {
          throw new Error(`Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('CSV file appears to be empty or invalid');
        }
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        if (!worksheet) {
          throw new Error('Could not read data from CSV file');
        }
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1, 
          raw: false, 
          dateNF: 'yyyy-mm-dd hh:mm:ss',
          defval: '' // Default value for empty cells
        });
        
        if (jsonData.length === 0) {
          throw new Error('CSV file is empty');
        }
        
        // Convert to our format
        const headers = (jsonData[0] as any[]).map(h => String(h || '').trim());
        const dataRows = (jsonData.slice(1) as any[][]).filter(row => row && row.length > 0);
        
        // Column mapping from CSV format to expected format
        const columnMapping: { [key: string]: string } = {
          'number': 'Ticket#',
          'opened_at': 'Opened',
          'state': 'State',
          'short_description': 'Short description',
          'assignment_group': 'Assignment group',
          'u_resolution_category_1': 'Resolution Category 1',
          'u_resolution_category_2': 'Resolution Category 2',
          'u_resolution_category_3': 'Resolution Category 3',
          'description': 'Description Resolver Notes',
          'u_resolution_notes': 'Description Resolver Notes',
          'work_notes': 'Work node Channel',
          'contact_type': 'Work node Channel',
          'priority': 'Priority',
          'u_application_name': 'Application Name',
          'u_resolution_code': 'Resolver Code',
          'sys_updated_by': 'Updated by',
          'calendar_duration': 'Reported by Duration', // Primary duration field
          'parent_incident': 'Parent Incident',
          'child_incidents': 'Child Dependent',
          'u_business_service': 'Business Service',
          'sys_updated_on': 'Updated',
          'u_affected_user': 'Affected User', // Primary field for affected user
          'assigned_to': 'Assignment group',
          // Note: caller_id will be used as fallback for Affected User in special handling below
          'closed_at': 'closed_at', // Keep closed_at as separate field to track when ticket was closed
        };

        // Map headers - normalize by removing quotes and converting to lowercase with underscores
        const mappedHeaders = headers.map(header => {
          const cleanHeader = header.replace(/^"|"$/g, '').toLowerCase().replace(/[^a-z0-9_]/g, '_');
          return columnMapping[cleanHeader] || columnMapping[header] || header;
        });

        // Map data rows
        const data = dataRows.map(row => {
          const obj: any = {};
          mappedHeaders.forEach((mappedHeader, index) => {
            let value = row[index] !== undefined ? String(row[index]) : '';
            value = value.trim();
            
            // Only set value if it doesn't already exist (prevent overwriting)
            if (!obj[mappedHeader] || obj[mappedHeader] === '') {
              obj[mappedHeader] = value;
            }
          });

          // Handle priority field - default to '3 - Medium' if not present
          if (!obj['Priority'] || obj['Priority'] === '') {
            obj['Priority'] = '3 - Medium'; // Default priority
          }
          
          // Handle duration field - ensure calendar_duration is used for Reported by Duration
          // Check original headers to find calendar_duration index
          const calendarDurationIndex = headers.findIndex(h => {
            const clean = h.replace(/^"|"$/g, '').toLowerCase().replace(/[^a-z0-9_]/g, '_');
            return clean === 'calendar_duration';
          });
          if (calendarDurationIndex >= 0 && row[calendarDurationIndex] && String(row[calendarDurationIndex]).trim() !== '') {
            obj['Reported by Duration'] = String(row[calendarDurationIndex]).trim();
          }
          
          // Handle Affected User - prefer u_affected_user, fallback to caller_id
          const affectedUserIndex = headers.findIndex(h => {
            const clean = h.replace(/^"|"$/g, '').toLowerCase().replace(/[^a-z0-9_]/g, '_');
            return clean === 'u_affected_user';
          });
          const callerIdIndex = headers.findIndex(h => {
            const clean = h.replace(/^"|"$/g, '').toLowerCase().replace(/[^a-z0-9_]/g, '_');
            return clean === 'caller_id';
          });
          
          if (!obj['Affected User'] || obj['Affected User'] === '') {
            if (affectedUserIndex >= 0 && row[affectedUserIndex]) {
              obj['Affected User'] = String(row[affectedUserIndex]).trim();
            } else if (callerIdIndex >= 0 && row[callerIdIndex]) {
              obj['Affected User'] = String(row[callerIdIndex]).trim();
            }
          }

          // Ensure closed_at field is set from CSV
          const closedAtIndex = headers.findIndex(h => 
            h.replace(/^"|"$/g, '').toLowerCase().replace(/[^a-z0-9_]/g, '_') === 'closed_at'
          );
          if (closedAtIndex >= 0 && row[closedAtIndex] && String(row[closedAtIndex]).trim() !== '') {
            obj['closed_at'] = String(row[closedAtIndex]).trim();
          }
          
          // Handle Updated field - prefer sys_updated_on, fallback to closed_at, then opened_at
          if (!obj['Updated'] || obj['Updated'] === '') {
            // Check if we have closed_at or opened_at as fallback
            const openedAtIndex = headers.findIndex(h => 
              h.replace(/^"|"$/g, '').toLowerCase().replace(/[^a-z0-9_]/g, '_') === 'opened_at'
            );
            
            // Use closed_at if available, otherwise use opened_at
            if (obj['closed_at']) {
              obj['Updated'] = obj['closed_at'];
            } else if (openedAtIndex >= 0 && row[openedAtIndex]) {
              obj['Updated'] = String(row[openedAtIndex]).trim();
            } else if (obj['Opened']) {
              obj['Updated'] = obj['Opened'];
            }
          }

          // Ensure Required fields have defaults
          if (!obj['Business Service'] || obj['Business Service'] === '') {
            obj['Business Service'] = 'Unknown Service';
          }
          if (!obj['State'] || obj['State'] === '') {
            obj['State'] = 'Open';
          }
          if (!obj['Assignment group'] || obj['Assignment group'] === '') {
            obj['Assignment group'] = 'Unassigned';
          }

          return obj;
        });

        parsed = { headers: mappedHeaders, data };
      } else {
        const text = await file.text();
        parsed = JSON.parse(text);
      }

      setParsedData(parsed);
      setUploadStatus('success');
      setErrorMessage('');
      onDataParsed(parsed);
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage('Error parsing file. Please check the format.');
      console.error('Parse error:', error);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const downloadTemplate = (format: 'csv' | 'excel' = 'excel') => {
    const headers = [
      'Ticket#', 'Opened', 'State', 'Short description', 'Assignment group', 
      'Resolution Category 1', 'Resolution Category 2', 'Resolution Category 3',
      'Description Resolver Notes', 'Work node Channel', 'Priority', 
      'Application Name', 'Resolver Code', 'Updated by', 'Reported by Duration',
      'Parent Incident', 'Child Dependent', 'Business Service', 'Updated', 'Affected User'
    ];
    const data = [
      ['INC0012345', '2025-09-15 10:30:15', 'Closed', 'MFA authentication timeout', 'Security Team', 
       'Security', 'Authentication', '', '', 'Phone', '2 - High', 
       'Microsoft Authenticator', 'SEC001', 'John Doe', '2.5', '', '', 'Microsoft Authenticator', '2025-09-15 13:00:00', 'user@govtech.gov.sg'],
      ['INC0012346', '2025-09-16 14:20:00', 'In Progress', 'Email delivery failure', 'Email Services Team',
       'Email', 'Delivery', 'SMTP', '', 'Email', '1 - Critical',
       'SG-Mail', 'EMAIL002', 'Jane Smith', '', '', '', 'SG-Mail Email Services', '2025-09-17 09:00:00', 'staff@govtech.gov.sg'],
      ['INC0012347', '2025-09-20 08:15:30', 'Pending', 'VPN connection drops', 'Network Team',
       'Network', 'VPN', '', '', 'Web', '3 - Medium',
       'SG-VPN', 'NET003', 'Mike Johnson', '1.2', '', '', 'SG-VPN - Application', '2025-09-20 10:00:00', 'officer@govtech.gov.sg'],
      ['INC0012348', '2025-10-01 11:45:00', 'Closed', 'AD account sync issue', 'Infrastructure Team',
       'Infrastructure', 'Active Directory', '', '', 'Phone', '2 - High',
       'StellarNet AD', 'INF001', 'Sarah Lee', '4.5', '', '', 'StellarNet Active Directory', '2025-10-01 16:15:00', 'admin@govtech.gov.sg'],
      ['INC0012349', '2025-10-05 16:30:00', 'In Progress', 'Device encryption not applied', 'Endpoint Team',
       'Security', 'Encryption', 'COMET', '', 'Email', '2 - High',
       'COMET Endpoint', 'END002', 'Tom Brown', '', '', '', 'COMET - Encryption', '2025-10-06 08:00:00', 'support@govtech.gov.sg'],
    ];

    if (format === 'excel') {
      // Create Excel file
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Incidents');
      XLSX.writeFile(workbook, 'incident_template.xlsx');
    } else {
      // Create CSV file
      const csvContent = [headers.join(','), ...data.map(row => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'incident_template.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="p-8">
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="mb-2">Upload Incident Dataset</h3>
          <p className="text-gray-600 mb-4">
            Drag and drop your Excel, CSV, or JSON file here, or click to browse
          </p>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".csv,.xlsx,.xls,.json"
            onChange={handleFileInput}
          />
          <label htmlFor="file-upload">
            <Button asChild variant="outline">
              <span>Browse Files</span>
            </Button>
          </label>
        </div>

        {uploadedFile && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm">{uploadedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(uploadedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            {uploadStatus === 'success' && (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
            {uploadStatus === 'error' && (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
          </div>
        )}

        {uploadStatus === 'error' && (
          <Alert variant="destructive" className="mt-4">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {uploadStatus === 'success' && parsedData && (
          <Alert className="mt-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              File uploaded successfully! Found {parsedData.data?.length || Object.keys(parsedData).length} records with {parsedData.headers?.length || 0} columns. Switch to the Dashboard tab to view your analytics.
            </AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Template Download */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="mb-2">Need a template?</h3>
            <p className="text-gray-600 mb-4">
              Download a template to ensure your data is in the correct format
            </p>
            <div className="flex gap-2">
              <Button onClick={() => downloadTemplate('excel')} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download Excel Template
              </Button>
              <Button onClick={() => downloadTemplate('csv')} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download CSV Template
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Format Guide */}
      <Card className="p-6">
        <h3 className="mb-4">Expected Data Format</h3>
        <div className="space-y-4">
          <div>
            <p className="mb-2">Expected Columns (Excel/CSV):</p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li><span className="text-gray-900">Ticket#</span> - Unique identifier for the incident (e.g., INC0012345)</li>
              <li><span className="text-gray-900">Opened</span> - When the incident was created (YYYY-MM-DD HH:MM:SS)</li>
              <li><span className="text-gray-900">State</span> - Current status (Open, Closed, Resolved, In Progress, Pending)</li>
              <li><span className="text-gray-900">Short description</span> - Brief description of the issue</li>
              <li><span className="text-gray-900">Assignment group</span> - Team or agent assigned to the ticket</li>
              <li><span className="text-gray-900">Priority</span> - Priority level (1 - Critical, 2 - High, 3 - Medium, 4 - Low)</li>
              <li><span className="text-gray-900">Business Service</span> - Name of the business service affected</li>
              <li><span className="text-gray-900">Updated</span> - Last update timestamp (YYYY-MM-DD HH:MM:SS)</li>
              <li><span className="text-gray-900">Reported by Duration</span> - Time to resolve in hours (optional)</li>
            </ul>
            <p className="text-sm text-gray-500 mt-2">
              Other columns like Resolution Category, Application Name, Affected User, etc. are optional but will be imported if present.
            </p>
          </div>
          <div className="pt-2 border-t space-y-2">
            <p className="text-sm text-gray-600">
              <strong>Supported formats:</strong> Excel (.xlsx, .xls), CSV (.csv), JSON (.json)
            </p>
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> The system will automatically process your data and map it to the dashboard charts. Make sure your column names match the expected format above.
            </p>
          </div>
        </div>
      </Card>

      {/* Data Processing Guide */}
      <Card className="p-6">
        <h3 className="mb-4">How Your Data Powers the Dashboard</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="text-gray-600">
              <strong className="text-gray-900">Ticket Trend Chart:</strong> Aggregates tickets by month using the "Opened" date and "State" columns
            </p>
            <p className="text-gray-600">
              <strong className="text-gray-900">Service Incident Table:</strong> Groups tickets by "Business Service" and compares current vs last month
            </p>
            <p className="text-gray-600">
              <strong className="text-gray-900">Open Tickets Panel:</strong> Shows all non-closed tickets with bottleneck detection ({'>'}5 days old)
            </p>
            <p className="text-gray-600">
              <strong className="text-gray-900">Agent Workload:</strong> Analyzes workload by "Assignment group" with capacity metrics
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">
              <strong className="text-gray-900">Top Issues:</strong> Identifies most common issues from "Short description" patterns
            </p>
            <p className="text-gray-600">
              <strong className="text-gray-900">Aging Tickets:</strong> Calculates ticket age from "Opened" date for open tickets
            </p>
            <p className="text-gray-600">
              <strong className="text-gray-900">Resolution Time:</strong> Tracks monthly average from "Reported by Duration" field
            </p>
            <p className="text-gray-600">
              <strong className="text-gray-900">Metrics Cards:</strong> Displays KPIs including total closed, open count, and service spikes
            </p>
          </div>
        </div>
      </Card>

      {/* Business Services Reference */}
      <Card className="p-6">
        <Collapsible open={isServicesOpen} onOpenChange={setIsServicesOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
              <h3 className="mb-0">GovTech Business Services Reference ({BUSINESS_SERVICES.length} services)</h3>
              {isServicesOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <p className="text-sm text-gray-600 mb-4">
              Below is the complete list of business services used in the GovTech incident management system. 
              Use these exact names in your "Business Service" column for accurate categorization.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(() => {
                // Group services by category
                const grouped: { [key: string]: string[] } = {};
                BUSINESS_SERVICES.forEach(service => {
                  const category = categorizeBusinessService(service);
                  if (!grouped[category]) {
                    grouped[category] = [];
                  }
                  grouped[category].push(service);
                });

                return Object.entries(grouped).map(([category, services]) => (
                  <div key={category} className="border rounded-lg p-4">
                    <h4 className="mb-3 text-sm text-blue-700">{category}</h4>
                    <ul className="space-y-1 text-xs text-gray-600 max-h-64 overflow-y-auto">
                      {services.sort().map((service, idx) => (
                        <li key={idx} className="truncate" title={service}>
                          {service}
                        </li>
                      ))}
                    </ul>
                  </div>
                ));
              })()}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Preview parsed data */}
      {parsedData && parsedData.data && (
        <Card className="p-6">
          <h3 className="mb-4">Data Preview</h3>
          <div className="overflow-auto max-h-64 border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {parsedData.headers?.map((header: string, index: number) => (
                    <th key={index} className="px-4 py-2 text-left border-b">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.data.slice(0, 10).map((row: any, rowIndex: number) => (
                  <tr key={rowIndex} className="border-b hover:bg-gray-50">
                    {parsedData.headers?.map((header: string, colIndex: number) => (
                      <td key={colIndex} className="px-4 py-2">
                        {row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsedData.data.length > 10 && (
            <p className="text-sm text-gray-500 mt-2">
              Showing first 10 of {parsedData.data.length} records
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
