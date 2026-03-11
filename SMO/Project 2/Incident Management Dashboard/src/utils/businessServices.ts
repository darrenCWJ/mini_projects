// Actual business services extracted from GovTech incident management system
export const BUSINESS_SERVICES = [
  // Image 1
  "Agency App",
  "Agency Infra",
  "AI-EAS",
  "AMS - Mobile App",
  "AMS - Product team feedback",
  "AMS - Web Portal",
  "Application",
  "Bomgar",
  "BSE - Security",
  "BSE - User Incident",
  "Bug",
  "Central DLP Services - Endpoint",
  "Central EPP Services - Endpoint",
  "Cerberus - COMET",
  "Change",
  "Clarification",
  "COMET - Application Whitelisting",
  "COMET - Authentication",
  "COMET - COMET SCCM Task Sequence",
  "COMET - Company Portal",
  "COMET - Device Configuration",
  "COMET - Encryption",
  "COMET - Others",
  "COMET - Printing",
  "COMET - Scanning",
  "Comet Endpoint",
  "Comet-Endpoint",
  "Data Issue",
  "Enquiry",
  "FFE - Security",
  "FFE - User Incident-WOG",
  "GCSOC",
  "GDSCC",
  "GIS - UAM",
  "GIS - WOG User Account",
  "GOMAX - Agency Intranet Application",
  "GOMAX - Enquiry",
  "GOMAX - Agency Mobile Application",
  "GOMAX - Calendar",
  "GOMAX - Device Security",
  "GOMAX - Device Software Version",
  "GOMAX - Email",
  "GOMAX - Email, Contacts and Calendar",
  "GovTech-Hotline",
  
  // Image 2
  "GPKI- User Incident",
  "GSIB Endpoint",
  "Infra Issue",
  "ITSM - Application",
  "ITSM - Portal",
  "Microsoft Authenticator",
  "MS Authenticator",
  "Network Connectivity",
  "Nucleus - Azure AD",
  "Nucleus - Azure AD Identity Protection",
  "Nucleus - CDMS - GSSP",
  "Nucleus - CDMS - GPO",
  "Nucleus - CDMS - Others",
  "Nucleus - CDMS - Task Sequence",
  "Nucleus - ESDS - Distribution Services",
  "Nucleus - ESDS - Others",
  "Nucleus - ESDS - Reporting Services",
  "Others",
  "PCBT Hardware",
  "Portal/Mobile",
  "Printer",
  "Printer CPA",
  "QRU",
  "Request",
  "SaaS Portal",
  "SE3 - Security",
  "SE3 - User Incident SN",
  "SE3 - User Incident WOG",
  "Secure File Transfer",
  "Server",
  "Service Client (IRS)",
  "SG -VPN - Application",
  "SG -VPN - Endpoint",
  "SG -VPN - Enquiry",
  "SG-Mail ABRS",
  "SG-Mail AMR",
  "SG-Mail AMS",
  "SG-Mail AppSMS (Application SMS Relay Service)",
  "SG-Mail DCS",
  "SG-Mail Email Services",
  "SG-Mail IMCS",
  "SG-Mail Service Portal",
  "SG-Mail SMS (Short Message Service)",
  "SG-Mail-ABRS",
  
  // Image 3
  "SG-Mail-AMR",
  "SG-Mail-AMS",
  "SG-Mail-AppSMS",
  "SG-Mail-DCS",
  "SG-Mail-Email Services",
  "SG-Mail-EVS",
  "SG-Mail-IMCS",
  "SG-Mail-IMCS-Gomax",
  "SG-Mail-M365-AIP",
  "SG-Mail-M365-EVS SG-Teams Telephony",
  "SG-Mail-M365-EXO",
  "SG-Mail-M365-ODFB",
  "SG-Mail-M365-OPP",
  "SG-Mail-M365-Service Portal",
  "SG-Mail-M365-SG-Teams Room Service",
  "SG-Mail-M365-SPO",
  "SG-Mail-M365-Teams",
  "SG-Mail-Service Portal",
  "SG-VPN - Group management",
  "SG-VPN - Service Portal",
  "SG-Zoom (GoMax)",
  "SG-Zoom (Non-S GSIB)",
  "SIS - Endpoint",
  "SIS - Menlo RBI",
  "StellarNet Active Directory",
  "StellarNet Application Software - Migration incident",
  "StellarNet Application Software - Offboarding incident",
  "StellarNet CEPS",
  "StellarNet Delivery Incident",
  "StellarNet Hardware",
  "StellarNet Laptop Software",
  "StellarNet Outlook Email",
  "StellarNet Secure Repository",
  "Usage",
  "User Account (Legacy AD)",
  "VICA",
  "Zscaler"
];

// Categorize business services for better organization
export function categorizeBusinessService(serviceName: string): string {
  const lower = serviceName.toLowerCase();
  
  // Email services
  if (lower.includes('sg-mail') || lower.includes('email') || lower.includes('outlook')) {
    return 'Email & Communication';
  }
  
  // Security services
  if (lower.includes('security') || lower.includes('epp') || lower.includes('dlp') || 
      lower.includes('encryption') || lower.includes('authenticator') || lower.includes('gpki') ||
      lower.includes('azure ad') || lower.includes('identity')) {
    return 'Security';
  }
  
  // Network & VPN
  if (lower.includes('vpn') || lower.includes('network') || lower.includes('connectivity') ||
      lower.includes('zscaler')) {
    return 'Network & VPN';
  }
  
  // Device & Endpoint
  if (lower.includes('endpoint') || lower.includes('comet') || lower.includes('device') ||
      lower.includes('hardware') || lower.includes('printer') || lower.includes('pcbt')) {
    return 'Device & Endpoint';
  }
  
  // Applications & Portal
  if (lower.includes('application') || lower.includes('portal') || lower.includes('app') ||
      lower.includes('gomax') || lower.includes('itsm') || lower.includes('saas')) {
    return 'Applications & Portal';
  }
  
  // Infrastructure
  if (lower.includes('server') || lower.includes('infra') || lower.includes('stellarnet') ||
      lower.includes('nucleus') || lower.includes('cdms') || lower.includes('esds')) {
    return 'Infrastructure';
  }
  
  // Collaboration
  if (lower.includes('teams') || lower.includes('zoom') || lower.includes('calendar') ||
      lower.includes('m365')) {
    return 'Collaboration';
  }
  
  // Support & Service
  if (lower.includes('enquiry') || lower.includes('request') || lower.includes('hotline') ||
      lower.includes('support')) {
    return 'Support & Service';
  }
  
  return 'Other';
}
