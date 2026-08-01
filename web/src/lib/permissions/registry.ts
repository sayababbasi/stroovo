/**
 * STROOVO — Centralized Permission Registry
 * 
 * This is the SINGLE SOURCE OF TRUTH for all permission keys in the application.
 * Every sidebar item, tab, button, API endpoint, and route guard references this registry.
 * 
 * Format: {module}.{action}
 * 
 * DO NOT scatter raw permission strings throughout the codebase.
 * Import from this file instead.
 */

// ─────────────────────────────────────────────
// Permission Key Constants
// ─────────────────────────────────────────────

export const P = {
  // ── Users ──
  USERS_VIEW:        'users.view',
  USERS_CREATE:      'users.create',
  USERS_EDIT:        'users.edit',
  USERS_DELETE:      'users.delete',
  USERS_INVITE:      'users.invite',
  USERS_RESTORE:     'users.restore',
  USERS_SUSPEND:     'users.suspend',
  USERS_IMPERSONATE: 'users.impersonate',

  // ── Teams ──
  TEAMS_VIEW:           'teams.view',
  TEAMS_CREATE:         'teams.create',
  TEAMS_EDIT:           'teams.edit',
  TEAMS_DELETE:         'teams.delete',
  TEAMS_ARCHIVE:        'teams.archive',
  TEAMS_RESTORE:        'teams.restore',
  TEAMS_MANAGE_MEMBERS: 'teams.manage_members',

  // ── Projects ──
  PROJECTS_VIEW:    'projects.view',
  PROJECTS_CREATE:  'projects.create',
  PROJECTS_EDIT:    'projects.edit',
  PROJECTS_DELETE:  'projects.delete',
  PROJECTS_ARCHIVE: 'projects.archive',

  // ── Tasks ──
  TASKS_VIEW:     'tasks.view',
  TASKS_CREATE:   'tasks.create',
  TASKS_EDIT:     'tasks.edit',
  TASKS_DELETE:   'tasks.delete',
  TASKS_ASSIGN:   'tasks.assign',
  TASKS_COMPLETE: 'tasks.complete',

  // ── Roles ──
  ROLES_VIEW:          'roles.view',
  ROLES_CREATE:        'roles.create',
  ROLES_EDIT:          'roles.edit',
  ROLES_DELETE:        'roles.delete',
  ROLES_ASSIGN:        'roles.assign',
  ROLES_MANAGE_SYSTEM: 'roles.manage_system',

  // ── Permissions ──
  PERMISSIONS_VIEW:   'permissions.view',
  PERMISSIONS_GRANT:  'permissions.grant',
  PERMISSIONS_REVOKE: 'permissions.revoke',

  // ── Billing ──
  BILLING_VIEW:   'billing.view',
  BILLING_MANAGE: 'billing.manage',

  // ── Integrations ──
  INTEGRATIONS_VIEW:   'integrations.view',
  INTEGRATIONS_MANAGE: 'integrations.manage',

  // ── System Logs ──
  SYSTEM_LOGS_VIEW: 'system_logs.view',
  AUDIT_LOGS_VIEW:  'audit_logs.view',

  // ── Settings ──
  SETTINGS_VIEW:   'settings.view',
  SETTINGS_MANAGE: 'settings.manage',

  // ── Dashboards ──
  DASHBOARD_ADMIN_VIEW:    'dashboard.admin.view',
  DASHBOARD_EXECUTIVE_VIEW:'dashboard.executive.view',
  DASHBOARD_MANAGER_VIEW:  'dashboard.manager.view',
  DASHBOARD_EMPLOYEE_VIEW: 'dashboard.employee.view',

  // ── AI ──
  AI_VIEW:            'ai.view',
  AI_MANAGE:          'ai.manage',
  AI_MONITORING_VIEW: 'ai.monitoring.view',

  // ── Automations ──
  AUTOMATIONS_VIEW:   'automations.view',
  AUTOMATIONS_MANAGE: 'automations.manage',

  // ── Notifications ──
  NOTIFICATIONS_VIEW:   'notifications.view',
  NOTIFICATIONS_MANAGE: 'notifications.manage',

  // ── Goals ──
  GOALS_VIEW:   'goals.view',
  GOALS_CREATE: 'goals.create',
  GOALS_EDIT:   'goals.edit',
  GOALS_DELETE: 'goals.delete',

  // ── Reports ──
  REPORTS_VIEW:   'reports.view',
  REPORTS_EXPORT: 'reports.export',
} as const;

export type PermissionKey = (typeof P)[keyof typeof P];

// ─────────────────────────────────────────────
// Permission Definitions (for seeding)
// ─────────────────────────────────────────────

export interface PermissionDefinition {
  key: string;
  module: string;
  action: string;
  description: string;
}

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  // Users
  { key: P.USERS_VIEW,        module: 'users',        action: 'view',        description: 'View user profiles and directory' },
  { key: P.USERS_CREATE,      module: 'users',        action: 'create',      description: 'Create new user accounts' },
  { key: P.USERS_EDIT,        module: 'users',        action: 'edit',        description: 'Edit user profiles and settings' },
  { key: P.USERS_DELETE,      module: 'users',        action: 'delete',      description: 'Permanently delete user accounts' },
  { key: P.USERS_INVITE,      module: 'users',        action: 'invite',      description: 'Invite new users to the organization' },
  { key: P.USERS_RESTORE,     module: 'users',        action: 'restore',     description: 'Restore suspended or deactivated users' },
  { key: P.USERS_SUSPEND,     module: 'users',        action: 'suspend',     description: 'Suspend user accounts' },
  { key: P.USERS_IMPERSONATE, module: 'users',        action: 'impersonate', description: 'Impersonate another user for debugging' },

  // Teams
  { key: P.TEAMS_VIEW,           module: 'teams', action: 'view',           description: 'View teams and team details' },
  { key: P.TEAMS_CREATE,         module: 'teams', action: 'create',         description: 'Create new teams' },
  { key: P.TEAMS_EDIT,           module: 'teams', action: 'edit',           description: 'Edit team settings and details' },
  { key: P.TEAMS_DELETE,         module: 'teams', action: 'delete',         description: 'Delete teams permanently' },
  { key: P.TEAMS_ARCHIVE,        module: 'teams', action: 'archive',        description: 'Archive inactive teams' },
  { key: P.TEAMS_RESTORE,        module: 'teams', action: 'restore',        description: 'Restore archived teams' },
  { key: P.TEAMS_MANAGE_MEMBERS, module: 'teams', action: 'manage_members', description: 'Add, remove, and manage team members' },

  // Projects
  { key: P.PROJECTS_VIEW,    module: 'projects', action: 'view',    description: 'View projects and project details' },
  { key: P.PROJECTS_CREATE,  module: 'projects', action: 'create',  description: 'Create new projects' },
  { key: P.PROJECTS_EDIT,    module: 'projects', action: 'edit',    description: 'Edit project settings and details' },
  { key: P.PROJECTS_DELETE,  module: 'projects', action: 'delete',  description: 'Delete projects permanently' },
  { key: P.PROJECTS_ARCHIVE, module: 'projects', action: 'archive', description: 'Archive completed projects' },

  // Tasks
  { key: P.TASKS_VIEW,     module: 'tasks', action: 'view',     description: 'View tasks and task details' },
  { key: P.TASKS_CREATE,   module: 'tasks', action: 'create',   description: 'Create new tasks' },
  { key: P.TASKS_EDIT,     module: 'tasks', action: 'edit',     description: 'Edit task details and status' },
  { key: P.TASKS_DELETE,   module: 'tasks', action: 'delete',   description: 'Delete tasks permanently' },
  { key: P.TASKS_ASSIGN,   module: 'tasks', action: 'assign',   description: 'Assign tasks to team members' },
  { key: P.TASKS_COMPLETE, module: 'tasks', action: 'complete', description: 'Mark tasks as complete' },

  // Roles
  { key: P.ROLES_VIEW,          module: 'roles', action: 'view',          description: 'View roles and their permissions' },
  { key: P.ROLES_CREATE,        module: 'roles', action: 'create',        description: 'Create new custom roles' },
  { key: P.ROLES_EDIT,          module: 'roles', action: 'edit',          description: 'Edit role permissions and details' },
  { key: P.ROLES_DELETE,        module: 'roles', action: 'delete',        description: 'Delete custom roles' },
  { key: P.ROLES_ASSIGN,        module: 'roles', action: 'assign',        description: 'Assign roles to users' },
  { key: P.ROLES_MANAGE_SYSTEM, module: 'roles', action: 'manage_system', description: 'Modify system-protected roles' },

  // Permissions
  { key: P.PERMISSIONS_VIEW,   module: 'permissions', action: 'view',   description: 'View permission configurations' },
  { key: P.PERMISSIONS_GRANT,  module: 'permissions', action: 'grant',  description: 'Grant permissions to roles' },
  { key: P.PERMISSIONS_REVOKE, module: 'permissions', action: 'revoke', description: 'Revoke permissions from roles' },

  // Billing
  { key: P.BILLING_VIEW,   module: 'billing', action: 'view',   description: 'View billing information and invoices' },
  { key: P.BILLING_MANAGE, module: 'billing', action: 'manage', description: 'Manage subscriptions and payment methods' },

  // Integrations
  { key: P.INTEGRATIONS_VIEW,   module: 'integrations', action: 'view',   description: 'View connected integrations' },
  { key: P.INTEGRATIONS_MANAGE, module: 'integrations', action: 'manage', description: 'Connect, disconnect, and configure integrations' },

  // System Logs
  { key: P.SYSTEM_LOGS_VIEW, module: 'system_logs', action: 'view', description: 'View system logs and error reports' },
  { key: P.AUDIT_LOGS_VIEW,  module: 'audit_logs',  action: 'view', description: 'View audit trail and security events' },

  // Settings
  { key: P.SETTINGS_VIEW,   module: 'settings', action: 'view',   description: 'View organization settings' },
  { key: P.SETTINGS_MANAGE, module: 'settings', action: 'manage', description: 'Modify organization settings' },

  // Dashboards
  { key: P.DASHBOARD_ADMIN_VIEW,     module: 'dashboard', action: 'admin_view',     description: 'Access the Admin dashboard' },
  { key: P.DASHBOARD_EXECUTIVE_VIEW, module: 'dashboard', action: 'executive_view', description: 'Access the Executive dashboard' },
  { key: P.DASHBOARD_MANAGER_VIEW,   module: 'dashboard', action: 'manager_view',   description: 'Access the Manager dashboard' },
  { key: P.DASHBOARD_EMPLOYEE_VIEW,  module: 'dashboard', action: 'employee_view',  description: 'Access the Employee dashboard' },

  // AI
  { key: P.AI_VIEW,            module: 'ai', action: 'view',            description: 'Use AI assistant and features' },
  { key: P.AI_MANAGE,          module: 'ai', action: 'manage',          description: 'Configure AI settings and models' },
  { key: P.AI_MONITORING_VIEW, module: 'ai', action: 'monitoring_view', description: 'View AI usage monitoring and analytics' },

  // Automations
  { key: P.AUTOMATIONS_VIEW,   module: 'automations', action: 'view',   description: 'View automation workflows' },
  { key: P.AUTOMATIONS_MANAGE, module: 'automations', action: 'manage', description: 'Create and manage automation workflows' },

  // Notifications
  { key: P.NOTIFICATIONS_VIEW,   module: 'notifications', action: 'view',   description: 'View notifications' },
  { key: P.NOTIFICATIONS_MANAGE, module: 'notifications', action: 'manage', description: 'Manage notification settings and channels' },

  // Goals
  { key: P.GOALS_VIEW,   module: 'goals', action: 'view',   description: 'View organizational goals and OKRs' },
  { key: P.GOALS_CREATE, module: 'goals', action: 'create', description: 'Create new goals and key results' },
  { key: P.GOALS_EDIT,   module: 'goals', action: 'edit',   description: 'Edit existing goals' },
  { key: P.GOALS_DELETE, module: 'goals', action: 'delete', description: 'Delete goals' },

  // Reports
  { key: P.REPORTS_VIEW,   module: 'reports', action: 'view',   description: 'View performance reports' },
  { key: P.REPORTS_EXPORT, module: 'reports', action: 'export', description: 'Export reports as files' },
];

// ─────────────────────────────────────────────
// Default Role → Permission Matrix
// ─────────────────────────────────────────────

export type SystemRoleName = 'Admin' | 'CEO' | 'CTO' | 'COO' | 'Manager' | 'Employee';

/**
 * Default permission sets for system roles.
 * Used by the seed script to create initial role configurations.
 * Admins can later customize these via the Roles & Permissions UI.
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<SystemRoleName, {
  description: string;
  permissions: string[];
}> = {
  Admin: {
    description: 'Organization administration but subject to protected system controls.',
    permissions: Object.values(P), // Admin gets ALL permissions
  },

  CEO: {
    description: 'Executive level access. Strategic oversight and business decisions.',
    permissions: [
      // Users — view + invite only
      P.USERS_VIEW, P.USERS_INVITE,
      // Teams — full management
      P.TEAMS_VIEW, P.TEAMS_CREATE, P.TEAMS_EDIT, P.TEAMS_ARCHIVE, P.TEAMS_RESTORE, P.TEAMS_MANAGE_MEMBERS,
      // Projects
      P.PROJECTS_VIEW, P.PROJECTS_CREATE, P.PROJECTS_EDIT, P.PROJECTS_ARCHIVE,
      // Tasks
      P.TASKS_VIEW, P.TASKS_CREATE, P.TASKS_EDIT, P.TASKS_ASSIGN, P.TASKS_COMPLETE,
      // Roles — view only
      P.ROLES_VIEW,
      // Permissions — view only
      P.PERMISSIONS_VIEW,
      // Billing — view only
      P.BILLING_VIEW,
      // Integrations — view
      P.INTEGRATIONS_VIEW,
      // Logs
      P.SYSTEM_LOGS_VIEW, P.AUDIT_LOGS_VIEW,
      // Settings — view
      P.SETTINGS_VIEW,
      // Dashboards
      P.DASHBOARD_EXECUTIVE_VIEW, P.DASHBOARD_MANAGER_VIEW, P.DASHBOARD_EMPLOYEE_VIEW,
      // AI
      P.AI_VIEW, P.AI_MONITORING_VIEW,
      // Automations — view
      P.AUTOMATIONS_VIEW,
      // Notifications
      P.NOTIFICATIONS_VIEW, P.NOTIFICATIONS_MANAGE,
      // Goals
      P.GOALS_VIEW, P.GOALS_CREATE, P.GOALS_EDIT, P.GOALS_DELETE,
      // Reports
      P.REPORTS_VIEW, P.REPORTS_EXPORT,
    ],
  },

  CTO: {
    description: 'Technical/engineering access. System and project management.',
    permissions: [
      P.USERS_VIEW,
      P.TEAMS_VIEW, P.TEAMS_CREATE, P.TEAMS_EDIT, P.TEAMS_MANAGE_MEMBERS,
      P.PROJECTS_VIEW, P.PROJECTS_CREATE, P.PROJECTS_EDIT, P.PROJECTS_DELETE, P.PROJECTS_ARCHIVE,
      P.TASKS_VIEW, P.TASKS_CREATE, P.TASKS_EDIT, P.TASKS_DELETE, P.TASKS_ASSIGN, P.TASKS_COMPLETE,
      P.INTEGRATIONS_VIEW, P.INTEGRATIONS_MANAGE,
      P.SYSTEM_LOGS_VIEW,
      P.SETTINGS_VIEW,
      P.DASHBOARD_EXECUTIVE_VIEW, P.DASHBOARD_MANAGER_VIEW, P.DASHBOARD_EMPLOYEE_VIEW,
      P.AI_VIEW, P.AI_MANAGE, P.AI_MONITORING_VIEW,
      P.AUTOMATIONS_VIEW, P.AUTOMATIONS_MANAGE,
      P.NOTIFICATIONS_VIEW,
      P.GOALS_VIEW, P.GOALS_CREATE, P.GOALS_EDIT,
      P.REPORTS_VIEW,
    ],
  },

  COO: {
    description: 'Operations access. Team and process management.',
    permissions: [
      P.USERS_VIEW, P.USERS_INVITE,
      P.TEAMS_VIEW, P.TEAMS_CREATE, P.TEAMS_EDIT, P.TEAMS_ARCHIVE, P.TEAMS_RESTORE, P.TEAMS_MANAGE_MEMBERS,
      P.PROJECTS_VIEW, P.PROJECTS_CREATE, P.PROJECTS_EDIT, P.PROJECTS_ARCHIVE,
      P.TASKS_VIEW, P.TASKS_CREATE, P.TASKS_EDIT, P.TASKS_ASSIGN, P.TASKS_COMPLETE,
      P.BILLING_VIEW,
      P.SETTINGS_VIEW,
      P.DASHBOARD_EXECUTIVE_VIEW, P.DASHBOARD_MANAGER_VIEW, P.DASHBOARD_EMPLOYEE_VIEW,
      P.AUTOMATIONS_VIEW, P.AUTOMATIONS_MANAGE,
      P.NOTIFICATIONS_VIEW, P.NOTIFICATIONS_MANAGE,
      P.GOALS_VIEW, P.GOALS_CREATE, P.GOALS_EDIT, P.GOALS_DELETE,
      P.REPORTS_VIEW, P.REPORTS_EXPORT,
    ],
  },

  Manager: {
    description: 'Team management access. Manages assigned team and projects.',
    permissions: [
      P.USERS_VIEW,
      P.TEAMS_VIEW, P.TEAMS_EDIT, P.TEAMS_MANAGE_MEMBERS,
      P.PROJECTS_VIEW, P.PROJECTS_CREATE, P.PROJECTS_EDIT,
      P.TASKS_VIEW, P.TASKS_CREATE, P.TASKS_EDIT, P.TASKS_DELETE, P.TASKS_ASSIGN, P.TASKS_COMPLETE,
      P.DASHBOARD_MANAGER_VIEW, P.DASHBOARD_EMPLOYEE_VIEW,
      P.AI_VIEW,
      P.AUTOMATIONS_VIEW,
      P.NOTIFICATIONS_VIEW,
      P.GOALS_VIEW, P.GOALS_CREATE, P.GOALS_EDIT,
      P.REPORTS_VIEW,
    ],
  },

  Employee: {
    description: 'Standard employee access. View and work on assigned tasks.',
    permissions: [
      P.TEAMS_VIEW,
      P.PROJECTS_VIEW,
      P.TASKS_VIEW, P.TASKS_CREATE, P.TASKS_EDIT, P.TASKS_COMPLETE,
      P.DASHBOARD_EMPLOYEE_VIEW,
      P.AI_VIEW,
      P.NOTIFICATIONS_VIEW,
      P.GOALS_VIEW,
    ],
  },
};

// ─────────────────────────────────────────────
// Role Hierarchy (for privilege escalation checks)
// ─────────────────────────────────────────────

/**
 * Numeric privilege level. Higher = more privileged.
 * A user can only assign roles with level <= their own.
 */
export const ROLE_HIERARCHY: Record<string, number> = {
  'Admin':    100,
  'CEO':      90,
  'CTO':      85,
  'COO':      85,
  'Manager':  50,
  'Employee': 10,
};

export function getRoleLevel(roleName: string): number {
  return ROLE_HIERARCHY[roleName] ?? 0;
}

// ─────────────────────────────────────────────
// Route → Permission Mapping
// ─────────────────────────────────────────────

/**
 * Maps frontend routes to required permissions.
 * Used by route guards and sidebar visibility.
 */
export const ROUTE_PERMISSIONS: Record<string, string> = {
  '/admin':              P.DASHBOARD_ADMIN_VIEW,
  '/admin/users':        P.USERS_VIEW,
  '/admin/teams':        P.TEAMS_VIEW,
  '/admin/projects':     P.PROJECTS_VIEW,
  '/admin/roles':        P.ROLES_VIEW,
  '/admin/logs':         P.SYSTEM_LOGS_VIEW,
  '/admin/ai-monitoring':P.AI_MONITORING_VIEW,
  '/admin/billing':      P.BILLING_VIEW,
  '/admin/integrations': P.INTEGRATIONS_VIEW,
  '/admin/settings':     P.SETTINGS_VIEW,
  '/executive':          P.DASHBOARD_EXECUTIVE_VIEW,
};

/**
 * Maps admin team tabs to required permissions.
 */
export const ADMIN_TEAM_TAB_PERMISSIONS: Record<string, string> = {
  'Teams':               P.TEAMS_VIEW,
  'Members':             P.USERS_VIEW,
  'Roles & Permissions': P.ROLES_VIEW,
  'Access Policies':     P.PERMISSIONS_VIEW,
  'Invitations':         P.TEAMS_MANAGE_MEMBERS,
  'Team Hierarchy':      P.TEAMS_VIEW,
  'Audit Activity':      P.AUDIT_LOGS_VIEW,
};

/**
 * Normalize legacy permission keys to the canonical registry format.
 * e.g. 'tasks.read.own' → 'tasks.view', 'projects.read' → 'projects.view'
 * 'teams.read.all' → 'teams.view', 'users.read.own' → 'users.view'
 */
export function normalizePermissionKey(key: string): string {
  const ALIASES: Record<string, string> = {
    // Users
    'users.read.own':    P.USERS_VIEW,
    'users.read.all':    P.USERS_VIEW,
    'users.read':        P.USERS_VIEW,
    'users.update.all':  P.USERS_EDIT,
    'users.update.own':  P.USERS_EDIT,
    'users.update':      P.USERS_EDIT,
    'admin.users':       P.USERS_VIEW,
    
    // Teams
    'teams.read.all':    P.TEAMS_VIEW,
    'teams.read':        P.TEAMS_VIEW,
    
    // Projects
    'projects.read':     P.PROJECTS_VIEW,
    'projects.update':   P.PROJECTS_EDIT,
    
    // Tasks
    'tasks.read.own':    P.TASKS_VIEW,
    'tasks.read':        P.TASKS_VIEW,
    'tasks.update.own':  P.TASKS_EDIT,
    'tasks.update':      P.TASKS_EDIT,
    'tasks.delete.own':  P.TASKS_DELETE,
    
    // AI & Automations
    'ai.use':            P.AI_VIEW,
    'ai.read':           P.AI_VIEW,
    'automations.read':  P.AUTOMATIONS_VIEW,
    'automations.update':P.AUTOMATIONS_MANAGE,
    'automations.delete':P.AUTOMATIONS_MANAGE,
    'automations.create':P.AUTOMATIONS_MANAGE,
    'analytics.read':    P.DASHBOARD_MANAGER_VIEW,
    
    // Roles
    'roles.read':        P.ROLES_VIEW,
    
    // Dashboards
    'admin.dashboard':   P.DASHBOARD_ADMIN_VIEW,
    'executive.dashboard.view': P.DASHBOARD_EXECUTIVE_VIEW,
  };
  return ALIASES[key] ?? key;
}

