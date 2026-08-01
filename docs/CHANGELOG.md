# Changelog

## [Unreleased]
### Changed
- **Admin Teams Module Construction**
  - Built the complete Enterprise Admin Teams Management module (`/admin/teams`), accessible exclusively by `SUPER_ADMIN` and `ADMIN`.
  - Appended `status` field (`String @default("ACTIVE")`) to `Team` model to track Active, Restricted, and Archived states securely.
  - Created `/api/admin/teams/route.ts` to fetch all teams system-wide and forcefully create teams bypassing user-level checks.
  - Created `/api/admin/teams/[id]/route.ts` (GET, PATCH, DELETE) to support high-risk administrative operations: archiving teams, transferring Team Lead ownership, and permanently deleting teams.
  - Built `page.tsx` layout containing the KPI statistics overview, Teams administrative navigation, and inline filters for the teams datatable.
  - Implemented `AdminTeamTable.tsx` for a clean, scalable data table showcasing robust member metrics, health statuses, and team leads.
  - Designed `AdminCreateTeamModal.tsx` capturing Team Name, Description, Lead Selection, Status, and Access/Visibility policies.
  - Engineered `AdminTeamDetailDrawer.tsx` providing granular visibility into team descriptions, administrative actions (transfer, archive, delete), and a nested members list.
  - Implemented `AdminTransferOwnershipModal.tsx` & `AdminDeleteTeamModal.tsx` confirmation-gated modals for high-risk destructive and state-changing actions.
- **Teams Module UI/UX Upgrade**
  - Completely redesigned `/teams` route focusing on Members and Roles & Permissions tabs.
  - Built an enterprise-grade `MembersTab.tsx` with user list, activity status, project count, and inline role editing.
  - Implemented `MemberDrawer.tsx` for viewing detailed user profiles and modifying user permissions directly.
  - Rebuilt the Roles tab (`RolesTab.tsx`, `RoleDetail.tsx`, `PermissionMatrix.tsx`) for granular access control visualization.
  - Updated legacy backend API routes to strictly type RBAC checks and sync full permission arrays via PUT.
- **Calendar Module UI/UX Upgrade**
  - Redesigned `/calendar` route (`page.tsx`) to match the clean light premium SaaS aesthetic.
  - Updated layout with crisp 1px borders, subtle drop shadows, and modern enterprise typography.
- **Timeline Module UI/UX Upgrade**
  - Completely redesigned the `/timeline` route (`page.tsx`) to match the premium SaaS aesthetics.
  - Added new summary metric cards (Total Tasks, Overdue, In Progress, Completed, Completion).
  - Redesigned the left-side task list with a clean hierarchy, task type badges, and clear avatars.
  - Revamped the Gantt chart area with a detailed top control bar, "Today" line indicator, and pastel-colored task bars.
  - Moved the task progress indicator to the outside of the Gantt bar and displayed task names cleanly inside the bars.
  - Added a comprehensive legend at the bottom of the timeline view.
  - Maintained all existing functionality (drag-and-drop, grouping, filters, views).
- **Board Module UI/UX Upgrade**
  - Completely redesigned the `/board` route (`page.tsx`) header and view/filter bar.
  - Reduced heavy borders and updated Kanban columns (`KanbanBoard.tsx`) to use subtle light-neutral backgrounds with soft borders and minimal empty states.
  - Refined Task Cards (`KanbanCard.tsx`) hierarchy, increasing task title prominence, aligning metadata neatly at the bottom, and updating priority styles (Urgent=Red, High=Orange, Medium=Yellow, Low=Blue).
  - Maintained all existing functionality including drag-and-drop, grouping, sorting, filtering, and quick actions.
- **Task Module UI/UX Upgrade (Phase 1)**
  - Redesigned `page.tsx` Header, Quick Filters, Stat Cards, and Table Headers to match premium SaaS aesthetics.
  - Replaced heavy borders and background gradients with subtle 1px borders (`#DFE1E6`) and clean backgrounds.
  - Refined `TaskRow.tsx` Status and Priority pills to be text + dot indicators rather than heavy color blocks.
  - Made the Progress bar thinner (4px).
  - Cleaned up `AIInsightsBanner.tsx` to resemble a subtle context banner rather than a large gradient alert.
  - Updated interactions to feature 150ms subtle background color transitions without heavy shadows or animations.
  - Enforced single font family rule using font weights (500, 600, 700) instead of multiple fonts.

### 2026-08-01: File Management Roles
- **File Update & Delete**: Added functionality for ADMIN and CEO users to rename and permanently delete files from tasks.
- **File Delete Modal**: Introduced a confirmation popup for file deletions to match task and subtask deletion flows.
- **Backend Authorization**: Implemented a PATCH route for renaming files and updated the DELETE route to include CEO role verification.
- **Bug Fixes**: 
  - Fixed a 500 Internal Server Error in the file upload route caused by an undefined variable (`fileName`) in the activity log payload.
  - Fixed task deletion failing due to foreign key constraints on `Comment`, `TaskFile`, and other related tables.

### 2026-08-01: Delete Confirmation Flow
  - Added conditional logic to `TaskDetailsPanel.tsx` to display a Facebook icon dynamically if a task is named 'Facebook', matching the exact design spec for this content change.
  - Implemented interactive logic for TaskDetailsPanel header icons (expand/collapse sidebar, star/favorite toggle, paperclip attachment, copy link).
  - Integrated `emoji-picker-react` to provide a full keyboard-style emoji picker for the comment section.
  - Added role-based comment management, allowing only ADMIN, SUPER_ADMIN, PROJECT_MANAGER, and CEO roles to edit or delete comments in the activity feed.
  - Replaced native browser `confirm` dialogs with custom Radix UI Dialog popups for comment deletion.
  - **No backend logic, API integration, or functionality was changed, except for adding PATCH to comments API for role-based editing.**
