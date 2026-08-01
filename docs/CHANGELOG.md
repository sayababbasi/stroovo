# Changelog

## [Unreleased]
### Changed
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
- **Bug Fix**: Fixed a 500 Internal Server Error in the file upload route caused by an undefined variable (`fileName`) in the activity log payload.

### 2026-08-01: Delete Confirmation Flow
  - Added conditional logic to `TaskDetailsPanel.tsx` to display a Facebook icon dynamically if a task is named 'Facebook', matching the exact design spec for this content change.
  - Implemented interactive logic for TaskDetailsPanel header icons (expand/collapse sidebar, star/favorite toggle, paperclip attachment, copy link).
  - Integrated `emoji-picker-react` to provide a full keyboard-style emoji picker for the comment section.
  - Added role-based comment management, allowing only ADMIN, SUPER_ADMIN, PROJECT_MANAGER, and CEO roles to edit or delete comments in the activity feed.
  - Replaced native browser `confirm` dialogs with custom Radix UI Dialog popups for comment deletion.
  - **No backend logic, API integration, or functionality was changed, except for adding PATCH to comments API for role-based editing.**
