# Project Memory

## Phase 1: Task Module UI/UX Upgrade
- **Scope**: Redesign of the main "All Tasks" page to match premium SaaS aesthetics.
- **Rules Followed**: Preserved 100% of existing functionality. Kept light theme. Maintained single typography rule. Simplified borders and removed heavy shadows.
- **Key Changes**:
  - Overhauled Task Header and Filter Navigation with cleaner alignment and subtle active states.
  - Refined AI Insights Banner into a contextual element.
  - Redesigned Statistic Cards.
  - Modernized the Task Table with better typography, hierarchy, and 1px borders.
  - Revamped `TaskRow.tsx` Status and Priority pills to be minimal.

## Phase 2: Board Module UI/UX Upgrade
- **Scope**: Complete redesign of the Kanban Board view (`/board`) matching the premium SaaS reference design.
- **Key Changes**:
  - Restructured `page.tsx` header layout to separate title, search, and action buttons cleanly.
  - Updated `KanbanBoard.tsx` to feature light neutral backgrounds and removed heavy board-level scrollbars in favor of clean internal scrolling.
  - Revamped `KanbanCard.tsx` with a focus on typography hierarchy, semantic priority colors (Red, Orange, Yellow, Blue), and clear drag state shadows.
  - Re-styled the View/Filter bar to use sleek, active-state segment controls rather than blocky buttons.
  - Applied the strict single font-family rule, eliminating typography inconsistencies.

## Phase 3: Timeline Module UI/UX Upgrade
- **Scope**: Complete redesign of the Timeline view (`/timeline`) matching the premium SaaS reference design.
- **Key Changes**:
  - Restructured `page.tsx` header layout to separate title, search, and action buttons cleanly, adding new metric cards.
  - Redesigned the left-side task list with a clean hierarchy, task type badges, and clear avatars.
  - Revamped the Gantt chart area with a detailed top control bar, "Today" line indicator, and pastel-colored task bars.
  - Moved the task progress indicator to the outside of the Gantt bar and displayed task names cleanly inside the bars.
  - Added a comprehensive legend at the bottom of the timeline view.
  - Preserved all existing timeline functionality including drag-and-drop, grouping, filters, and views.

## Recent Task Detail UI Changes
- **Change**: Conditionally rendering a Facebook icon next to the task name in `TaskDetailsPanel.tsx`.
- **Where**: `web/src/components/tasks/TaskDetailsPanel.tsx` (Task title display header).
- **Why**: To add dynamic support for project-specific branding (e.g. Facebook) in the task detail header, matching the user's explicit request without hardcoding the title or breaking the existing dynamic task data system.

## Task Details Functionality Upgrades
- **Sidebar Interaction**: Added expand/collapse logic to toggle the TaskDetailsPanel width between 420px and 800px.
- **Emoji Picker**: Installed and integrated `emoji-picker-react` for a native-like emoji selection experience in comments.
- **Role-Based Comment Management**: Added frontend and backend logic to strictly allow only high-level roles (ADMIN, SUPER_ADMIN, CEO, PROJECT_MANAGER) to edit and delete comments. Regular users are restricted.
- **Custom Popups**: Replaced native browser `confirm()` and `alert()` dialogs with custom styled Radix UI Dialog components for improved UX during destructive actions (e.g., deleting a comment).

## Component Details
### TaskDetailsPanel.tsx
- **File Management**: Implemented functionality where files can be attached and downloaded by all users, but renaming and deleting files are restricted to ADMIN, SUPER_ADMIN, PROJECT_MANAGER, and CEO roles. File deletion uses a custom confirmation modal.
- **Comment Section**: Only Admin and CEO level users can edit and delete comments. All other users can only post comments. Includes emoji picker and rich text placeholders.
- **Modals**: Subtask and Task deletions have custom confirmation popups using Radix UI Dialogs. components for improved UX during destructive actions (e.g., deleting a comment).

## Phase 4: Calendar Module UI/UX Upgrade
- **Scope**: Redesign the Calendar module to match the premium SaaS design system with refined spacing, typography, and clean interaction models.
- **Key Changes**:
  - Overhauled layout and aesthetic structure of the Calendar module.
  - Implemented crisp 1px borders, subtle drop shadows, and modern enterprise typography.

## Phase 5: Teams Module UI/UX Upgrade
- **Scope**: Complete redesign of the Teams module (`/teams`), focusing specifically on the Members list and Roles & Permissions matrix.
- **Key Changes**:
  - Maintained the core layout structure but overhauled the design language.
  - Rebuilt the Members Tab (`MembersTab.tsx`) with an enterprise-grade table for users, displaying clear roles, project counts, and activity statuses.
  - Implemented `MemberDrawer.tsx` for viewing detailed user profiles and assigning permissions directly.
  - Rebuilt the Roles & Permissions Tab (`RolesTab.tsx` and `RoleDetail.tsx`), complete with an advanced `PermissionMatrix.tsx` to handle granular access control across multiple modules (Tasks, Projects, Team, Billing).
  - Migrated legacy backend APIs to cleanly support full permission set syncing (via `PUT /api/admin/roles/[id]/permissions`) and role creation.
  - Wired up top-level main tabs ("Teams", "Members", "Roles & Permissions") with strict typing to switch content cleanly.

## Phase 6: Admin Teams Module Construction
- **Scope**: Built the complete Enterprise Admin Teams Management module (`/admin/teams`), accessible exclusively by `SUPER_ADMIN` and `ADMIN`.
- **Database/Prisma Changes**:
  - Appended `status` field (`String @default("ACTIVE")`) to `Team` model to track Active, Restricted, and Archived states securely.
- **Backend API Routes**:
  - Created `/api/admin/teams/route.ts` to fetch all teams system-wide (GET) and forcefully create teams (POST) bypassing user-level checks.
  - Created `/api/admin/teams/[id]/route.ts` (GET, PATCH, DELETE) to support high-risk administrative operations: archiving teams, transferring Team Lead ownership, and permanently deleting teams.
  - Created `/api/admin/teams/[id]/members/route.ts` (POST) to allow admins to assign users to teams directly from the UI.
  - Created `/api/admin/users/[id]/activity/route.ts` (GET) to fetch user profiles alongside their activity logs (ActivityLog).
- **Frontend Components (`src/app/admin/teams/`)**:
  - `page.tsx`: Built the layout containing the KPI statistics overview, Teams administrative navigation, and inline filters for the teams datatable. Mounted `AdminMembersTab.tsx` for the Members section.
  - `AdminTeamTable.tsx`: Implemented a clean, scalable data table showcasing robust member metrics, health statuses, and team leads.
  - `AdminCreateTeamModal.tsx`: Designed an exhaustive modal capturing Team Name, Description, Lead Selection, Status, and Access/Visibility policies.
  - `AdminTeamDetailDrawer.tsx`: Engineered a slide-out drawer providing granular visibility into team descriptions, administrative actions (transfer, archive, delete), and a nested members list. Integrated `AdminAddTeamMemberModal`.
  - `AdminTransferOwnershipModal.tsx` & `AdminDeleteTeamModal.tsx`: Implemented confirmation-gated modals specifically designed for high-risk destructive and state-changing actions.
  - `AdminMembersTab.tsx`: The primary container for the enterprise Members module, including KPI statistic cards, global user search, status/role filtering, and pagination controls.
  - `AdminMemberTable.tsx`: An enterprise data table rendering members with their Global Role, Team count, Project count, Status, Last Active timestamp, and Joined date.
  - `AdminMemberDetailDrawer.tsx`: A comprehensive 360-degree view slide-out drawer displaying a member's Profile Info, Administrative Controls (Edit, Suspend), Team Memberships, Project Access, and Recent Administrative Activity.
  - `AdminInviteMemberModal.tsx`: A form to invite a new user to the organization (name, email, role).
  - `AdminSuspendMemberModal.tsx`: A high-risk confirmation modal to safely suspend a member's account, with clear warnings about the impact (revoking active sessions).
