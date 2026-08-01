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
