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
  - **No backend logic, API integration, or functionality was changed.**
