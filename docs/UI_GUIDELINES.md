# UI Guidelines (Phase 1)

## Design System & Theme
- **Primary Aesthetics**: Clean, Minimal, Professional SaaS (e.g. Linear, ClickUp).
- **Colors**:
  - Backgrounds: `#FFFFFF` (surfaces), `#FAFBFC`, `#F4F5F7` (sections/hovers).
  - Text: `#172B4D` (primary text), `#6B778C` (secondary/labels).
  - Accents: `#0052CC` (primary blue), `#22A06B` (success), `#AE2A19` (danger), `#FFAB00` (warning).
- **Typography**: Single Font Family (Inherited Poppins/Geist). 
  - Do not mix fonts.
  - Establish hierarchy via weights (500 for normal, 600 for headers).
  - Use uppercase with letter spacing for sub-labels (`0.04em`).
- **Borders & Shadows**:
  - Borders: Strict 1px borders using `#DFE1E6` or `#E8EAED`.
  - Shadows: Avoid heavy drop shadows. Use subtle `box-shadow: 0 4px 12px rgba(9,30,66,0.06)` strictly for active or hovered interactive cards.
- **Interactions**:
  - Micro-interactions only (150ms-200ms background or color transitions).
  - No bouncing, glowing, or flashy animations.

## Board Module UI Enhancements
- **Kanban Columns**: Use very light neutral backgrounds (`#F8FAFC`) with subtle dashed borders (`1px dashed #E2E8F0`).
- **Empty States**: Present simple, centered icons and text instead of heavy dashed outlines. 
- **Task Cards**: Prominent hierarchy prioritizing task titles. Use strict semantic colors for priority (Urgent: Red, High: Orange, Medium: Yellow, Low: Blue). Elevated shadow state on drag (`box-shadow: 0 16px 32px rgba(9, 30, 66, 0.08)` and `scale(1.02)`).
