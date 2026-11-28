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
    isImage: true,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
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
    isImage: true,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
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
    isImage: true,
    image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80',
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
    isImage: true,
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
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
    isImage: true,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
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

const DELETED_KEY = 'alzaydan_deleted_employees';

/**
 * Get list of deleted user emails and IDs
 */
export function getDeletedUserIdentifiers() {
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Record a deleted user permanently so canonical users never reappear on refresh
 */
export function deleteStoredUser(id, email, name) {
  try {
    const deleted = getDeletedUserIdentifiers();
    // Only track clean email for deletion to prevent canonical user reappearance.
    // Pure numeric IDs (like "5", "6") MUST NOT be stored as deletion targets,
    // otherwise newly created users with sequential or numeric IDs will be falsely deleted!
    const emailClean = email ? String(email).toLowerCase().trim() : null;
    const toAdd = [emailClean].filter(Boolean);

    let changed = false;
    for (const item of toAdd) {
      if (!deleted.includes(item)) {
        deleted.push(item);
        changed = true;
      }
    }

    // Clean up any pure numeric IDs in deleted list
    const cleanedDeleted = deleted.filter((item) => !/^\d+$/.test(String(item)));
    if (changed || cleanedDeleted.length !== deleted.length) {
      localStorage.setItem(DELETED_KEY, JSON.stringify(cleanedDeleted));
    }

    // Also update custom employees immediately in localStorage
    const raw = localStorage.getItem('alzaydan_custom_employees');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const idMatch = id !== undefined && id !== null ? String(id) : null;
        const updated = parsed.filter((u) => {
          if (idMatch && String(u.id) === idMatch) return false;
          if (emailClean && (u.email || '').toLowerCase().trim() === emailClean) return false;
          return true;
        });
        localStorage.setItem('alzaydan_custom_employees', JSON.stringify(updated));
      }
    }
    window.dispatchEvent(new Event('alzaydan_user_updated'));
  } catch {}
}

/**
 * Un-delete a user identifier when creating or re-registering an account
 */
export function unDeleteUser(id, email, name) {
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    if (!raw) return;
    const deleted = JSON.parse(raw);
    if (!Array.isArray(deleted)) return;

    const emailLower = email ? String(email).toLowerCase().trim() : null;
    const nameLower = name ? String(name).toLowerCase().trim() : null;
    const idStr = id !== undefined && id !== null ? String(id) : null;

    const updated = deleted.filter((item) => {
      const itemStr = String(item).toLowerCase().trim();
      // Remove any numeric IDs from deleted list
      if (/^\d+$/.test(itemStr)) return false;
      if (emailLower && itemStr === emailLower) return false;
      if (nameLower && itemStr === nameLower) return false;
      if (idStr && itemStr === idStr) return false;
      return true;
    });

    localStorage.setItem(DELETED_KEY, JSON.stringify(updated));
  } catch {}
}

/**
 * Save users list to localStorage safely, keep current user profile synced, and notify listeners
 */
export function saveStoredUsers(users) {
  try {
    if (!Array.isArray(users)) return;
    localStorage.setItem('alzaydan_custom_employees', JSON.stringify(users));

    // Keep logged-in user profile picture and info synced with users table
    try {
      const storedCurrent = JSON.parse(localStorage.getItem('alzaydan_current_user') || '{}');
      const currentEmail = (storedCurrent?.email || '').toLowerCase().trim();
      const currentTier = (storedCurrent?.roleTier || '').toLowerCase().trim();

      const matched = users.find(
        (u) =>
          (u.email && u.email.toLowerCase().trim() === currentEmail) ||
          (currentTier === 'super-admin' &&
            (u.email?.toLowerCase().trim() === 'al@gmail.com' || u.roleTier === 'super-admin'))
      );

      if (matched) {
        const updatedCurrent = {
          ...storedCurrent,
          name: matched.name || storedCurrent.name,
          email: matched.email || storedCurrent.email,
          image: matched.image || matched.avatar || null,
          avatar: matched.avatar || matched.image || null,
          isImage: Boolean(matched.image || matched.avatar),
          avatarText: matched.avatarText || storedCurrent.avatarText || 'SA',
          role: matched.role || storedCurrent.role,
          designation: matched.designation || storedCurrent.designation,
          department: matched.department || storedCurrent.department
        };
        localStorage.setItem('alzaydan_current_user', JSON.stringify(updatedCurrent));
      }
    } catch {}

    window.dispatchEvent(new Event('alzaydan_user_updated'));
  } catch (err) {
    console.error('Failed to save users to localStorage', err);
  }
}

/**
 * Add a new user to storage safely, un-deleting their email/id and persisting
 */
export function addStoredUser(newUser) {
  if (!newUser || !newUser.name) return getStoredUsers();

  // 1. Un-delete user so no past deletion filter affects them
  unDeleteUser(newUser.id, newUser.email, newUser.name);

  // 2. Retrieve existing users
  const current = getStoredUsers();
  const cleanEmail = (newUser.email || '').toLowerCase().trim();

  // 3. Deduplicate
  const filtered = current.filter((u) => {
    if (u.id === newUser.id) return false;
    if (cleanEmail && (u.email || '').toLowerCase().trim() === cleanEmail) return false;
    return true;
  });

  const updated = [newUser, ...filtered];
  saveStoredUsers(updated);
  return updated;
}

/**
 * Retrieve active current users from localStorage (or initialize with canonical users)
 */
export function getStoredUsers() {
  try {
    // Purge any accidental numeric IDs (e.g. "5", "6") from deletedList so numbers never block real users
    let deletedList = getDeletedUserIdentifiers();
    if (deletedList.some((item) => /^\d+$/.test(String(item)))) {
      deletedList = deletedList.filter((item) => !/^\d+$/.test(String(item)));
      try {
        localStorage.setItem(DELETED_KEY, JSON.stringify(deletedList));
      } catch {}
    }

    const raw = localStorage.getItem('alzaydan_custom_employees');

    // If first time ever opening the app, initialize with canonical users minus deleted
    if (!raw) {
      const initial = CANONICAL_SYSTEM_USERS.filter((u) => {
        const uEmail = (u.email || '').toLowerCase().trim();
        return !deletedList.includes(uEmail);
      });
      localStorage.setItem('alzaydan_custom_employees', JSON.stringify(initial));
      return initial;
    }

    let parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      parsed = [];
    }

    // Filter out dummy legacy test entries (e.g. hamdan)
    let filtered = parsed.filter((u) => {
      const nameLower = (u.name || '').toLowerCase().trim();
      const emailLower = (u.email || '').toLowerCase().trim();
      if (DUMMY_NAMES_TO_FILTER.includes(nameLower)) return false;
      if (emailLower.includes('hamdan@')) return false;
      return true;
    });

    // Ensure all active users have valid profile photos from canonical if missing
    let hasUpdates = filtered.length !== parsed.length;
    filtered = filtered.map((u) => {
      const canonical = CANONICAL_SYSTEM_USERS.find(
        (c) => c.id === u.id || (c.email && c.email.toLowerCase() === (u.email || '').toLowerCase())
      );
      if (canonical && (!u.image || !u.avatar)) {
        hasUpdates = true;
        return {
          ...u,
          image: u.image || canonical.image,
          avatar: u.avatar || canonical.avatar,
          isImage: true
        };
      }
      return u;
    });

    if (hasUpdates) {
      localStorage.setItem('alzaydan_custom_employees', JSON.stringify(filtered));
    }

    return filtered;
  } catch {
    const deletedList = getDeletedUserIdentifiers().filter((item) => !/^\d+$/.test(String(item)));
    return CANONICAL_SYSTEM_USERS.filter((u) => {
      const uEmail = (u.email || '').toLowerCase().trim();
      return !deletedList.includes(uEmail);
    });
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
      const u = JSON.parse(raw);
      const canonical = CANONICAL_SYSTEM_USERS.find(
        (c) => c.id === u.id || (c.email && c.email.toLowerCase() === (u.email || '').toLowerCase())
      ) || CANONICAL_SYSTEM_USERS[0];
      return {
        ...u,
        image: u.image || u.avatar || canonical.image,
        avatar: u.avatar || u.image || canonical.avatar,
        isImage: true
      };
    }
  } catch {}
  return CANONICAL_SYSTEM_USERS[0];
}

/**
 * Check if the user is a Sales Executive / Frontline Staff
 */
export function isSalesExecutive(user) {
  const u = user || getLoggedInUser();
  if (!u) return false;
  const roleTier = (u.roleTier || '').toLowerCase().trim();
  const role = (u.role || '').toLowerCase().trim();
  const designation = (u.designation || '').toLowerCase().trim();
  
  if (
    roleTier === 'super-admin' ||
    roleTier === 'manager' ||
    role.includes('admin') ||
    role.includes('ceo') ||
    role.includes('manager')
  ) {
    return false;
  }
  return (
    roleTier === 'staff' ||
    role.includes('sales executive') ||
    role.includes('commercial operations') ||
    designation.includes('sales executive') ||
    (u.email && u.email.toLowerCase().includes('shibil')) ||
    (u.name && u.name.toLowerCase().includes('shibil'))
  );
}

/**
 * Determine the user role tier: 'super-admin' | 'manager' | 'team-lead' | 'staff'
 */
export function getUserTier(user) {
  const u = user || getLoggedInUser();
  if (!u) return 'super-admin';
  const roleTier = (u.roleTier || '').toLowerCase().trim();
  const role = (u.role || '').toLowerCase().trim();
  const desig = (u.designation || '').toLowerCase().trim();
  const crmProfile = (u.crmProfile || '').toLowerCase().trim();
  const email = (u.email || '').toLowerCase().trim();

  if (
    roleTier === 'super-admin' ||
    role.includes('super admin') ||
    role.includes('ceo') ||
    email === 'al@gmail.com'
  ) {
    return 'super-admin';
  }

  if (
    roleTier === 'manager' ||
    role.includes('manager') ||
    desig.includes('manager') ||
    crmProfile.includes('manager') ||
    email === 'shemin@gmail.com'
  ) {
    return 'manager';
  }

  if (
    roleTier === 'team-lead' ||
    role.includes('team lead') ||
    role.includes('lead') ||
    desig.includes('team lead') ||
    crmProfile.includes('team lead') ||
    email === 'lead@alzaydan.com'
  ) {
    return 'team-lead';
  }

  return 'staff';
}

/**
 * Filter tasks according to the organizational hierarchy rules:
 * - Super Admin: Sees all tasks enterprise-wide (created by anyone, assigned to anyone, or unassigned).
 * - Manager: Sees Super Admin tasks, Manager tasks, and subordinate tasks down the department.
 * - Team Lead: Sees tasks created by/for Manager & Lead, and tasks assigned to their Sales Executives.
 * - Sales Executive (Staff): ONLY sees tasks assigned directly to them (or created by them).
 */
export function filterTasksByRole(tasks, user) {
  if (!Array.isArray(tasks)) return [];
  const u = user || getLoggedInUser();
  const tier = getUserTier(u);

  // 1. Super Admin: full access to 100% of tasks
  if (tier === 'super-admin') {
    return tasks;
  }

  const userEmail = (u?.email || '').toLowerCase().trim();
  const userName = (u?.name || '').toLowerCase().trim();
  const username = (u?.username || '').toLowerCase().trim();
  const userLastName = userName.split(' ').slice(1).join(' ') || '';

  const isAssignedToUser = (task) => {
    const assignee = (task.assignee || '').toLowerCase().trim();
    if (!assignee) return false;
    return (
      assignee === userName ||
      assignee === userEmail ||
      (username && (assignee === username || assignee.includes(username))) ||
      (userLastName && assignee.includes(userLastName)) ||
      (task.assigneeEmail && task.assigneeEmail.toLowerCase().trim() === userEmail)
    );
  };

  const isCreatedByUser = (task) => {
    const createdBy = (task.createdBy || '').toLowerCase().trim();
    if (!createdBy) return false;
    return (
      createdBy === userName ||
      createdBy === userEmail ||
      (username && (createdBy === username || createdBy.includes(username))) ||
      (userLastName && createdBy.includes(userLastName))
    );
  };

  // 2. Sales Executive (Staff): STRICTLY tasks assigned to them (or created by them)
  if (tier === 'staff') {
    return tasks.filter((t) => isAssignedToUser(t) || isCreatedByUser(t));
  }

  // 3. Team Lead: Tasks assigned to them, created by them, or assigned to subordinate Sales Executives
  if (tier === 'team-lead') {
    return tasks.filter((t) => {
      if (isAssignedToUser(t) || isCreatedByUser(t)) return true;
      const assignee = (t.assignee || '').toLowerCase().trim();
      const creator = (t.createdBy || '').toLowerCase().trim();
      // Can see tasks assigned to frontline staff
      if (
        assignee.includes('shibil') ||
        assignee.includes('shaheer') ||
        assignee.includes('rep') ||
        assignee.includes('staff') ||
        assignee.includes('executive')
      ) {
        return true;
      }
      // Tasks from Manager / Admin targeted to Team Lead or team
      if (creator.includes('manager') || creator.includes('shemin') || creator.includes('super admin')) {
        if (!assignee || assignee === 'team lead' || assignee.includes('riswan') || assignee === 'all') {
          return true;
        }
      }
      return false;
    });
  }

  // 4. Manager: Sees Super Admin tasks, Manager tasks, and all team tasks
  if (tier === 'manager') {
    return tasks.filter(() => true);
  }

  return tasks;
}

/**
 * Check if the user can manage users / view employee directory
 */
export function canManageUsers(user) {
  const u = user || getLoggedInUser();
  if (!u) return true;
  return !isSalesExecutive(u);
}

/**
 * Check if the user has access to system settings (Only Super Admin and Manager)
 */
export function canAccessSettings(user) {
  const u = user || getLoggedInUser();
  if (!u) return false;
  const tier = getUserTier(u);
  return tier === 'super-admin' || tier === 'manager';
}

/**
 * Check if the user has access to commercial reports (Only Super Admin and Manager)
 */
export function canAccessReports(user) {
  const u = user || getLoggedInUser();
  if (!u) return false;
  const tier = getUserTier(u);
  return tier === 'super-admin' || tier === 'manager';
}

/**
 * Filter leads according to organizational hierarchy rules:
 * - Super Admin & Manager: Full enterprise visibility over 100% of leads.
 * - Team Lead: Leads assigned to them, owned by them, or assigned to subordinate Sales Executives.
 * - Sales Executive (Staff): STRICTLY leads assigned directly to them, owned by them, or created by them.
 */
export function filterLeadsByRole(leads, user) {
  if (!Array.isArray(leads)) return [];
  const u = user || getLoggedInUser();
  const tier = getUserTier(u);

  // 1. Super Admin & Manager: full visibility over all leads
  if (tier === 'super-admin' || tier === 'manager') {
    return leads;
  }

  const userEmail = (u?.email || '').toLowerCase().trim();
  const userName = (u?.name || '').toLowerCase().trim();
  const username = (u?.username || '').toLowerCase().trim();
  const userLastName = userName.split(' ').slice(1).join(' ') || '';

  const isAssignedOrOwnedByUser = (lead) => {
    const assigned = (lead.assignedTo || '').toLowerCase().trim();
    const owner = (lead.owner || '').toLowerCase().trim();
    const creator = (lead.createdBy || '').toLowerCase().trim();

    const matchesUser = (field) => {
      if (!field) return false;
      if (field === userName || field === userEmail) return true;
      if (username && (field === username || field.includes(username))) return true;
      if (userLastName && field.includes(userLastName)) return true;
      return false;
    };

    return matchesUser(assigned) || matchesUser(owner) || matchesUser(creator);
  };

  // 2. Sales Executive (Staff): ONLY leads assigned to or owned by them
  if (tier === 'staff') {
    return leads.filter((l) => isAssignedOrOwnedByUser(l));
  }

  // 3. Team Lead: Leads assigned to them, owned by them, or assigned to subordinate Sales Executives
  if (tier === 'team-lead') {
    return leads.filter((l) => {
      if (isAssignedOrOwnedByUser(l)) return true;
      const assigned = (l.assignedTo || '').toLowerCase().trim();
      const owner = (l.owner || '').toLowerCase().trim();
      // Subordinate staff check
      if (
        assigned.includes('shibil') ||
        assigned.includes('shaheer') ||
        assigned.includes('arafath') ||
        assigned.includes('rep') ||
        assigned.includes('staff') ||
        owner.includes('shibil') ||
        owner.includes('shaheer') ||
        owner.includes('arafath')
      ) {
        return true;
      }
      return false;
    });
  }

  return leads;
}
