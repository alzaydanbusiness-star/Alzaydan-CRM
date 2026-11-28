// Al Zaydan CRM - Team Lead (Tier 3) Mock Data & Operational Model

export const activeTeam = {
  id: 'team-1',
  name: 'Team 1 (Alpha)',
  lead: 'Sarah Al-Mansoor',
  leadEmail: 'sarah@alzaydan.com',
  leadPhone: '+971 50 888 1234',
  division: 'GCC Commercial Enterprise Division',
  target: 500000,
  closedSales: 485000,
  pipelineValue: 1250000,
  dealsWon: 19,
  winRate: 36.4,
  status: 'Exceeding Pace',
  monthlyPace: '+14% vs Q3 pace',
};

export const initialTeamReps = [
  {
    id: 'se-101',
    name: 'Tariq Al-Nuaimi',
    role: 'Senior Sales Executive',
    email: 'tariq@alzaydan.com',
    phone: '+971 50 111 2233',
    target: 200000,
    sales: 215000,
    dealsWon: 8,
    activeLeads: 14,
    demosToday: 3,
    demosTarget: 3,
    proposalsToday: 2,
    slaRate: '99.1%',
    winRate: 42.1,
    status: 'Exceeded Quota',
    avatar: 'TN',
    recentActivity: 'Sent revised contract to Baraka Oil ($185k)',
    deals: [
      { id: 'd-1', client: 'Baraka Oil & Gas', stage: 'Negotiation', value: 185000, probability: 85 },
      { id: 'd-2', client: 'Al Noor Petrochemicals', stage: 'Won', value: 120000, probability: 100 },
      { id: 'd-3', client: 'Qatar Freight Lines', stage: 'Proposal', value: 95000, probability: 60 }
    ]
  },
  {
    id: 'se-102',
    name: 'Layla Al-Sayed',
    role: 'Sales Executive',
    email: 'layla@alzaydan.com',
    phone: '+971 52 222 3344',
    target: 160000,
    sales: 152000,
    dealsWon: 6,
    activeLeads: 18,
    demosToday: 2,
    demosTarget: 2,
    proposalsToday: 2,
    slaRate: '98.4%',
    winRate: 33.3,
    status: 'On Target',
    avatar: 'LA',
    recentActivity: 'Product demo completed for Emirates Cargo ($110k)',
    deals: [
      { id: 'd-4', client: 'Emirates Global Cargo', stage: 'Proposal Sent', value: 110000, probability: 70 },
      { id: 'd-5', client: 'Sharjah Asset Mgmt', stage: 'Won', value: 85000, probability: 100 },
      { id: 'd-6', client: 'Oasis Trading LLC', stage: 'Qualified', value: 67000, probability: 40 }
    ]
  },
  {
    id: 'se-103',
    name: 'Dr. Bilal Qureshi',
    role: 'Key Account Executive',
    email: 'bilal@alzaydan.com',
    phone: '+971 54 333 4455',
    target: 140000,
    sales: 118000,
    dealsWon: 5,
    activeLeads: 11,
    demosToday: 2,
    demosTarget: 3,
    proposalsToday: 1,
    slaRate: '97.2%',
    winRate: 31.2,
    status: 'Needs Coaching',
    avatar: 'BQ',
    recentActivity: 'Negotiating payment terms with Zayed Pharma ($90k)',
    deals: [
      { id: 'd-7', client: 'Zayed Horizon Pharma', stage: 'Negotiation', value: 90000, probability: 80 },
      { id: 'd-8', client: 'Gulf Medical Supplies', stage: 'Won', value: 72000, probability: 100 },
      { id: 'd-9', client: 'Kuwait Central Hospital', stage: 'Qualified', value: 130000, probability: 50 }
    ]
  },
];

export const initialRoutingQueue = [];

export const todayTeamMetrics = {
  demosCompleted: 7,
  demosTarget: 8,
  proposalsSent: 5,
  proposalsTarget: 4,
  activeFollowups: 26,
  slaCompliance: '98.2%',
};

export const teamLeadNotifications = [];

