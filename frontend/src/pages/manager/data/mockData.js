// Al Zaydan CRM - Sales Manager Mock Data & Multi-Team Structure

export const initialTeams = [
  {
    id: 'team-1',
    name: 'Team 1 (Alpha)',
    lead: 'Sarah Al-Mansoor',
    leadEmail: 'sarah@alzaydan.com',
    leadPhone: '+971 50 234 5678',
    target: 500000,
    closedSales: 485000,
    pipelineValue: 1250000,
    dealsCount: 22,
    winRate: 36.4,
    status: 'Exceeding Pace',
    department: 'Commercial & High-Rise HVAC',
    executives: [
      { id: 'se-101', name: 'Tariq Al-Nuaimi', role: 'Sales Executive (Senior)', email: 'tariq@alzaydan.com', target: 200000, sales: 215000, dealsWon: 8, activeLeads: 14, winRate: 42.1, phone: '+971 50 111 2233' },
      { id: 'se-102', name: 'Layla Al-Sayed', role: 'Sales Executive', email: 'layla@alzaydan.com', target: 160000, sales: 152000, dealsWon: 6, activeLeads: 18, winRate: 33.3, phone: '+971 52 222 3344' },
      { id: 'se-103', name: 'Dr. Bilal Qureshi', role: 'Key Account Executive', email: 'bilal@alzaydan.com', target: 140000, sales: 118000, dealsWon: 5, activeLeads: 11, winRate: 31.2, phone: '+971 54 333 4455' },
    ]
  },
  {
    id: 'team-2',
    name: 'Team 2 (Beta)',
    lead: 'Ahmed Rafiq',
    leadEmail: 'ahmed@alzaydan.com',
    leadPhone: '+971 55 345 6789',
    target: 450000,
    closedSales: 420000,
    pipelineValue: 1100000,
    dealsCount: 18,
    winRate: 33.8,
    status: 'On Target',
    department: 'Enterprise & Industrial Cooling',
    executives: [
      { id: 'se-201', name: 'Khalid Bin Walid', role: 'Sales Executive (Senior)', email: 'khalid@alzaydan.com', target: 180000, sales: 175000, dealsWon: 7, activeLeads: 16, winRate: 38.5, phone: '+971 55 444 5566' },
      { id: 'se-202', name: 'Mona Al-Sabah', role: 'Sales Executive', email: 'mona@alzaydan.com', target: 150000, sales: 140000, dealsWon: 5, activeLeads: 15, winRate: 31.0, phone: '+971 56 555 6677' },
      { id: 'se-203', name: 'Nasser Al-Hajri', role: 'Sales Executive', email: 'nasser@alzaydan.com', target: 120000, sales: 105000, dealsWon: 4, activeLeads: 12, winRate: 28.6, phone: '+971 50 666 7788' },
    ]
  },
  {
    id: 'team-3',
    name: 'Team 3 (Gamma)',
    lead: 'Omar Al-Hassan',
    leadEmail: 'omar@alzaydan.com',
    leadPhone: '+971 52 456 7890',
    target: 380000,
    closedSales: 360000,
    pipelineValue: 920000,
    dealsCount: 14,
    winRate: 31.5,
    status: 'On Target',
    department: 'Government & Hospitality Projects',
    executives: [
      { id: 'se-301', name: 'Zaid Al-Khatib', role: 'Sales Executive', email: 'zaid@alzaydan.com', target: 140000, sales: 135000, dealsWon: 5, activeLeads: 13, winRate: 35.7, phone: '+971 52 777 8899' },
      { id: 'se-302', name: 'Mariam Qasim', role: 'Sales Executive', email: 'mariam@alzaydan.com', target: 130000, sales: 125000, dealsWon: 4, activeLeads: 14, winRate: 30.8, phone: '+971 54 888 9900' },
      { id: 'se-303', name: 'Faisal Mansoor', role: 'Junior Sales Executive', email: 'faisal@alzaydan.com', target: 110000, sales: 100000, dealsWon: 4, activeLeads: 10, winRate: 27.5, phone: '+971 56 999 0011' },
    ]
  }
];

export const initialPendingApprovals = [
  {
    id: 'appr-01',
    client: 'Emaar Properties PJSC',
    country: 'Dubai, UAE',
    type: 'Enterprise Discount (15%)',
    requestDetail: 'Client demands 15% discount for bulk chiller procurement across Downtown Tower 3. Policy threshold is 8%.',
    repName: 'Ahmed Rafiq',
    repRole: 'Team Lead',
    teamName: 'Team 2 (Beta)',
    dealValue: 320000,
    priority: 'High',
    status: 'Pending',
    requestedAt: '35 mins ago',
    requesterType: 'Team Lead'
  },
  {
    id: 'appr-02',
    client: 'Damac Lagoons Commercial Phase',
    country: 'Dubai, UAE',
    type: 'High-Value Contract Sign-Off',
    requestDetail: 'Commercial HVAC plant installation contract exceeds Team Lead authorization threshold of AED 250,000.',
    repName: 'Sarah Al-Mansoor',
    repRole: 'Team Lead',
    teamName: 'Team 1 (Alpha)',
    dealValue: 480000,
    priority: 'High',
    status: 'Pending',
    requestedAt: '1 hour ago',
    requesterType: 'Team Lead'
  },
  {
    id: 'appr-03',
    client: 'Abu Dhabi Industrial City (ICAD)',
    country: 'Abu Dhabi, UAE',
    type: 'Site Survey & Engineering Expense',
    requestDetail: 'Specialized acoustic and mechanical vibration site survey expense (AED 3,800) required before tender submission.',
    repName: 'Omar Farooq',
    repRole: 'Sales Executive',
    teamName: 'Team 1 (Alpha)',
    dealValue: 85000,
    priority: 'Medium',
    status: 'Pending',
    requestedAt: '2 hours ago',
    requesterType: 'Employee'
  },
  {
    id: 'appr-04',
    client: 'Sobha Realty - Central Park',
    country: 'Dubai, UAE',
    type: 'Extended LC Payment Terms (90 Days)',
    requestDetail: 'Client requests 90-day post-delivery Letter of Credit terms instead of standard 30-day payment schedule.',
    repName: 'Omar Al-Hassan',
    repRole: 'Team Lead',
    teamName: 'Team 3 (Gamma)',
    dealValue: 210000,
    priority: 'Medium',
    status: 'Pending',
    requestedAt: '4 hours ago',
    requesterType: 'Team Lead'
  },
  {
    id: 'appr-05',
    client: 'Nakheel Palm Villas Project',
    country: 'Dubai, UAE',
    type: '3-Year Extended Warranty Clause',
    requestDetail: 'Customer requests 3-year comprehensive warranty coverage in lieu of standard 1-year manufacturer guarantee.',
    repName: 'Tariq Al-Nuaimi',
    repRole: 'Sales Executive',
    teamName: 'Team 1 (Alpha)',
    dealValue: 145000,
    priority: 'Low',
    status: 'Pending',
    requestedAt: '5 hours ago',
    requesterType: 'Employee'
  }
];

export const initialTeamLeadActivities = [
  {
    id: 'act-01',
    leadName: 'Sarah Al-Mansoor',
    leadEmail: 'sarah@alzaydan.com',
    teamName: 'Team 1 (Alpha)',
    type: 'proposal',
    title: 'Commercial Tender Submitted',
    description: 'Submitted formal commercial proposal & engineering compliance sheet for Damac Lagoons Commercial Phase (AED 480,000).',
    timestamp: '25 mins ago',
    dealValue: 'AED 480,000',
    client: 'Damac Properties'
  },
  {
    id: 'act-02',
    leadName: 'Ahmed Rafiq',
    leadEmail: 'ahmed@alzaydan.com',
    teamName: 'Team 2 (Beta)',
    type: 'meeting',
    title: 'Technical Coordination Meeting',
    description: 'Conducted 45-minute on-site engineering review with Chief Mechanical Consultant for Emaar Downtown chillers.',
    timestamp: '1 hour ago',
    client: 'Emaar Properties'
  },
  {
    id: 'act-03',
    leadName: 'Omar Al-Hassan',
    leadEmail: 'omar@alzaydan.com',
    teamName: 'Team 3 (Gamma)',
    type: 'deal_won',
    title: 'Closed Won Contract Signed',
    description: 'Finalized contract signing for Dubai Creek Harbour Tower HVAC maintenance package. Initial deposit confirmed.',
    timestamp: '2 hours ago',
    dealValue: 'AED 165,000',
    client: 'Emaar Hospitality'
  },
  {
    id: 'act-04',
    leadName: 'Sarah Al-Mansoor',
    leadEmail: 'sarah@alzaydan.com',
    teamName: 'Team 1 (Alpha)',
    type: 'assignment',
    title: 'Distributed Inbound Enterprise Leads',
    description: 'Reassigned 4 qualified inbound RFP inquiries from Nakheel and Meraas to Senior Sales Rep Tariq Al-Nuaimi.',
    timestamp: '3 hours ago',
    client: 'Nakheel & Meraas'
  },
  {
    id: 'act-05',
    leadName: 'Ahmed Rafiq',
    leadEmail: 'ahmed@alzaydan.com',
    teamName: 'Team 2 (Beta)',
    type: 'approval',
    title: 'Submitted Discount Approval Request',
    description: 'Requested Manager authorization for 15% enterprise volume discount against competitor Carrier pricing.',
    timestamp: '4 hours ago',
    dealValue: 'AED 320,000',
    client: 'Emaar Properties'
  },
  {
    id: 'act-06',
    leadName: 'Omar Al-Hassan',
    leadEmail: 'omar@alzaydan.com',
    teamName: 'Team 3 (Gamma)',
    type: 'call',
    title: 'VIP Client Review Call',
    description: 'Completed executive follow-up with Sobha Realty Procurement General Manager regarding 90-day LC payment structure.',
    timestamp: '5 hours ago',
    client: 'Sobha Realty'
  },
  {
    id: 'act-07',
    leadName: 'Sarah Al-Mansoor',
    leadEmail: 'sarah@alzaydan.com',
    teamName: 'Team 1 (Alpha)',
    type: 'demo',
    title: 'Factory Acoustic Demo Scheduled',
    description: 'Scheduled live sound level testing & acoustic demo at Al Zaydan JAFZA facility for engineering consultant sign-off.',
    timestamp: '6 hours ago',
    client: 'Al Futtaim Engineering'
  }
];

export const pipelineStages = [
  { id: 'new', name: 'New Inquiries', count: 142, value: 'AED 1,840,000', color: '#063056', percentage: 100 },
  { id: 'qualified', name: 'Qualified Leads', count: 98, value: 'AED 1,420,000', color: '#1D4ED8', percentage: 69 },
  { id: 'proposal', name: 'Proposal Sent', count: 46, value: 'AED 980,000', color: '#2563EB', percentage: 32 },
  { id: 'negotiation', name: 'Negotiation / Legal', count: 22, value: 'AED 650,000', color: '#F59E0B', percentage: 15 },
  { id: 'won', name: 'Closed Won (MTD)', count: 16, value: 'AED 1,265,000', color: '#10B981', percentage: 11 },
];

export const managerNotifications = [
  { id: 'n1', title: 'New Approval Request', desc: 'Ahmed Rafiq submitted 15% discount for Emaar Properties', time: '35m ago', unread: true },
  { id: 'n2', title: 'High-Value Contract', desc: 'Sarah Al-Mansoor submitted AED 480k Damac contract sign-off', time: '1h ago', unread: true },
  { id: 'n3', title: 'Deal Closed Won', desc: 'Omar Al-Hassan closed Dubai Creek Harbour (AED 165,000)', time: '2h ago', unread: false },
];
