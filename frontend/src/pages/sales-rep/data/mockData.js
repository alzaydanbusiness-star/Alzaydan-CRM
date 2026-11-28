// Mock Data for Tier 4: Sales Executive (SE) Personal Dashboard
// Representative: Omar Farooq (Senior Sales Executive, Team 1 Alpha)

export const repProfile = {
  id: 'rep-1',
  name: 'Omar Farooq',
  role: 'Senior Sales Executive',
  department: 'Commercial Enterprise (Team 1 Alpha)',
  teamLead: 'Sarah Al-Mansoor',
  salesManager: 'Khalid Al-Mansoor',
  avatar: 'OF',
  email: 'omar@alzaydan.com',
  phone: '+971 50 812 4390',
  monthlyQuota: 500000,
  achievedRevenue: 420000,
  quotaProgress: 84,
  commissionRate: 5,
  earnedCommission: 21000,
  projectedCommission: 26500,
  winRate: 28.5,
  avgDealCycleDays: 19,
  activeLeadsCount: 18,
  dealsInPipeline: 8
};

export const summaryMetrics = [
  {
    id: 'quota-progress',
    title: 'Monthly Quota Progress',
    value: 'AED 420,000',
    subtitle: 'Target: AED 500,000 (84.0%)',
    change: '+14% vs last month',
    isPositive: true,
    progress: 84
  },
  {
    id: 'active-pipeline',
    title: 'Active Deal Pipeline',
    value: 'AED 1,120,000',
    subtitle: '6 active opportunities',
    change: '3 in final negotiation',
    isPositive: true
  },
  {
    id: 'earned-commission',
    title: 'Earned Commission (M-T-D)',
    value: 'AED 21,000',
    subtitle: 'Projected: AED 26,500',
    change: '5.0% tier rate active',
    isPositive: true
  },
  {
    id: 'win-rate',
    title: 'Personal Win Rate',
    value: '28.5%',
    subtitle: 'Team Avg: 24.2%',
    change: '+4.3% above team avg',
    isPositive: true
  }
];

export const pipelineStages = [
  { id: 'discovery', label: 'Discovery & Qualification', color: 'border-blue-500 bg-blue-50/50' },
  { id: 'proposal', label: 'Proposal & Demo', color: 'border-amber-500 bg-amber-50/50' },
  { id: 'negotiation', label: 'Contract & Negotiation', color: 'border-purple-500 bg-purple-50/50' },
  { id: 'won', label: 'Closed Won', color: 'border-emerald-500 bg-emerald-50/50' }
];

export const initialDeals = [];

export const todayCalls = [];

export const dailyTasks = [];

export const commissionHistory = [];

export const repNotifications = [];

