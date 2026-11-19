// Al Zaydan CRM - Canonical Current Users & Directory Synchronization Service
// Provides real active users for all modules (Leads, Customers, Sales, Tasks, Overview)
// and eliminates hardcoded dummy users.

export const CANONICAL_SYSTEM_USERS = [
  {
    id: 1,
    name: 'Super Admin',
    email: 'al@gmail.com',
    username: 'superadmin',
    password: 'al@123',
    role: 'Super Admin',
    roleTier: 'super-admin',
    crmProfile: 'Super Admin',
    organizationalPosition: 'Executive / CEO',
    designation: 'Chief Executive Officer (CEO)',
    department: 'Executive Management',
    reportsTo: 'Board of Directors',
    reportingManager: 'Board of Directors',
    employeeType: 'Super Admin',
    status: 'Active',
    avatarBg: 'bg-[#011635] text-white',
    avatarText: 'SA',
    isImage: false,
    image: null,
    avatar: null,
    phone: '+971 50 123 4567',
    mobileNumber: '50 123 4567',
    mobilePrefix: '+971',
    dob: '01-01-1985',
    joinDate: '01-01-2024'
  },
  {
    id: 2,
    name: 'Muhammed shemin',
    email: 'shemin@gmail.com',
    username: 'shemin',
    password: 'al@123',
    role: 'Sales Manager',
    roleTier: 'manager',
    crmProfile: 'Manager',
    organizationalPosition: 'Department Manager',
    designation: 'Sales Manager',
    department: 'Sales & Marketing',
    reportsTo: 'Super Admin (CEO)',
    reportingManager: 'Super Admin (CEO)',
    employeeType: 'Manager',
    status: 'Active',
    avatarBg: 'bg-emerald-600 text-white',
    avatarText: 'MS',
    isImage: false,
    image: null,
    avatar: null,
    phone: '+971 56 789 0987',
    mobileNumber: '56 789 0987',
    mobilePrefix: '+971',
    dob: '06-01-2000',
    joinDate: '01-02-2024'
  },
  {
    id: 3,
    name: 'muhammed riswan',
    email: 'lead@alzaydan.com',
    username: 'riswan',
    password: 'lead@123',
    role: 'Team Lead',
    roleTier: 'team-lead',
    crmProfile: 'Team Lead',
    organizationalPosition: 'Team Lead',
    designation: 'Commercial Team Lead (Team 1 Alpha)',
    department: 'Sales & Marketing',
    reportsTo: 'Manager',
    reportingManager: 'Manager',
    employeeType: 'Team Lead',
    status: 'Active',
    avatarBg: 'bg-blue-600 text-white',
    avatarText: 'MR',
    isImage: false,
    image: null,
    avatar: null,
    phone: '+971 50 888 1234',
    mobileNumber: '50 888 1234',
    mobilePrefix: '+971',
    dob: '15-05-1996',
    joinDate: '15-02-2024'
  },
  {
    id: 4,
    name: 'muhammed shibil',
    email: 'shibil@gmail.com',
    username: 'shibil',
    password: 'al@123',
    role: 'Sales Executive',
    roleTier: 'staff',
    crmProfile: 'Sales Executive',
    organizationalPosition: 'Sales Executive',
    designation: 'Sales Executive',
    department: 'Sales & Marketing',
    reportsTo: 'Team Lead',
    reportingManager: 'Team Lead',
    employeeType: 'Sales Executive',
    status: 'Active',
    avatarBg: 'bg-indigo-600 text-white',
    avatarText: 'MS',
    isImage: false,
    image: null,
    avatar: null,
    phone: '+971 55 556 7890',
    mobileNumber: '55 556 7890',
    mobilePrefix: '+971',
    dob: '06-01-2000',
    joinDate: '01-03-2024'
  },
  {
    id: 5,
    name: 'Shaheer',
    email: 'shaheer@gmail.com',
    username: 'shaheer',
    password: 'shaheer@123',
    role: 'Commercial Operations',
    roleTier: 'staff',
    crmProfile: 'Sales Executive',
    organizationalPosition: 'Commercial Operations',
    designation: 'Commercial Operations Specialist',
    department: 'Sales & Marketing',
    reportsTo: 'Team Lead',
    reportingManager: 'Team Lead',
    employeeType: 'Commercial Operations',
    status: 'Active',
    avatarBg: 'bg-teal-600 text-white',
    avatarText: 'SH',
    isImage: false,
    image: null,
    avatar: null,
    phone: '+971 50 777 8899',
    mobileNumber: '50 777 8899',
    mobilePrefix: '+971',
    dob: '12-08-1998',
    joinDate: '01-04-2024'
  }
];

// Names of dummy users to clean up
const DUMMY_NAMES_TO_FILTER = [
  'hamdan',
  'hamdan (employee)',
  'tariq (employee)',
  'muhammed k (employee)',
  'sajid a (employee)',
  'ramees s (employee)',
  'fatima al hassan (employee)'
];

/**
 * Retrieve active current users from localStorage (or initialize with canonical users)
 */
export function getStoredUsers() {
  try {
    const raw = localStorage.getItem('alzaydan_custom_employees');
    let parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem('alzaydan_custom_employees', JSON.stringify(CANONICAL_SYSTEM_USERS));
      return CANONICAL_SYSTEM_USERS;
    }

    // Filter out dummy test entries (like "hamdan (EMPLOYEE)")
    let filtered = parsed.filter((u) => {
      const nameLower = (u.name || '').toLowerCase().trim();
      const emailLower = (u.email || '').toLowerCase().trim();
      if (DUMMY_NAMES_TO_FILTER.includes(nameLower)) return false;
      if (emailLower.includes('hamdan@')) return false;
      return true;
    });

    // Make sure all canonical users are present
    let added = false;
    for (const canonical of CANONICAL_SYSTEM_USERS) {
      const exists = filtered.some(
        (u) =>
          (u.email && u.email.toLowerCase() === canonical.email.toLowerCase()) ||
          u.name.toLowerCase() === canonical.name.toLowerCase()
      );
      if (!exists) {
        filtered.push(canonical);
        added = true;
      }
    }

    if (added || filtered.length !== parsed.length) {
      localStorage.setItem('alzaydan_custom_employees', JSON.stringify(filtered));
    }

    return filtered;
  } catch {
    return CANONICAL_SYSTEM_USERS;
  }
}

/**
 * Get distinct list of current user names for dropdowns
 */
export function getStoredUserNames() {
  const users = getStoredUsers();
  return users.map((u) => u.name).filter(Boolean);
}

/**
 * Get user options formatted for form selects
 */
export function getUserSelectOptions() {
  const users = getStoredUsers();
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role || u.crmProfile || u.designation || 'Sales Executive',
    roleTier: u.roleTier || 'staff',
    displayName: `${u.name} (${u.role || u.crmProfile || 'Employee'})`
  }));
}

/**
 * Get the currently logged in user info (or fallback to Super Admin)
 */
export function getLoggedInUser() {
  try {
    const raw = localStorage.getItem('alzaydan_current_user');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return CANONICAL_SYSTEM_USERS[0];
}
