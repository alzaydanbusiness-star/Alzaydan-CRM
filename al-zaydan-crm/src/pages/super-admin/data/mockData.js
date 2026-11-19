// Mock Data for Super Admin Dashboard (Exact match to enterprise specification)

export const superAdminMetrics = [
  { id: 'employees', title: 'Employees', value: '0', change: '0%', subtitle: 'Active across departments', iconType: 'employees' },
  { id: 'leads', title: 'Leads', value: '0', change: '0%', subtitle: 'New (This Month)', iconType: 'leads' },
  { id: 'customers', title: 'Customers', value: '0', change: '0%', subtitle: 'Enterprise & SME clients', iconType: 'customers' },
  { id: 'sales', title: 'Sales (YTD)', value: 'AED 0', change: '0%', subtitle: 'Total revenue', iconType: 'sales' }
];

export const crmModules = [
  {
    id: 'pipeline',
    name: 'Pipeline',
    desc: 'Track sales deals & velocity',
    icon: 'TrendingUp',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    tab: 'Sales'
  },
  {
    id: 'employees',
    name: 'Employees',
    desc: 'Manage team & roles',
    icon: 'UserCheck',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    tab: 'Employees'
  },
  {
    id: 'leads',
    name: 'Leads',
    desc: 'Capture & track leads',
    icon: 'Filter',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    tab: 'Leads'
  },
  {
    id: 'customers',
    name: 'Customers',
    desc: 'Manage customer details',
    icon: 'Users',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    tab: 'Customers'
  },
  {
    id: 'tasks',
    name: 'Tasks',
    desc: 'Assign & track tasks',
    icon: 'CheckSquare',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    tab: 'Tasks'
  },
  {
    id: 'sales',
    name: 'Sales',
    desc: 'Quotations, orders & invoices',
    icon: 'ShoppingCart',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    tab: 'Sales'
  },
  {
    id: 'targets',
    name: 'Targets',
    desc: 'Set and track targets',
    icon: 'Target',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    tab: 'Targets'
  },
  {
    id: 'reports',
    name: 'Reports',
    desc: 'Business & team reports',
    icon: 'BarChart2',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    tab: 'Reports'
  }
];

export const initialPendingTasks = [];

export const initialRecentLeads = [];

export const initialRecentActivities = [];

export const dateRangeOptions = [
  'Nov 1, 2026 – Nov 9, 2026',
  'Today (Live)',
  'Yesterday',
  'Last 7 Days',
  'This Month (MTD)',
  'Last Quarter (Q3)',
  'Year to Date (YTD)'
];

export const initialEmployees = [];

export const initialCustomers = [];

export const initialOpportunities = [];

export const initialSalesTransactions = [];
