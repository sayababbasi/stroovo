# Routes

This document lists the primary routes for the Stroovo application.

## Authentication Routes
- `/login`: User login page.
- `/register`: User registration page.
- `/forgot-password`: Password reset request.
- `/reset-password`: Password reset confirmation.

## Main Application Routes
- `/dashboard`: Main overview dashboard.
- `/tasks`: Comprehensive task list and filtering.
- `/board`: Kanban board view of tasks.
- `/timeline`: Gantt chart and timeline view of tasks.
- `/calendar`: Monthly/Weekly calendar view of tasks.
- `/teams`: Team management (Members, Roles & Permissions) for non-admin users.

## Administration Routes (Requires ADMIN/SUPER_ADMIN role)
- `/admin`: Admin Control Center overview.
- `/admin/users`: Manage all users across the organization.
- `/admin/teams`: Enterprise team management (Archiving, Ownership transfers, Deletions).
- `/admin/projects`: Global project administration.
- `/admin/roles`: Global roles and security policies.
- `/admin/logs`: Audit activity logs.
- `/admin/billing`: Subscription and billing management.
- `/admin/settings`: Global organization settings.

### Admin Teams Routes
- /admin/teams: Added 'Roles & Permissions' tab rendering AdminRolesTab.

