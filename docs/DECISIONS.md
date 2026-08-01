# Architectural & Design Decisions

## Phase 1 UI Overhaul
- **Decision**: Maintained single font family constraint.
  - **Reason**: To match the clean aesthetics of top-tier SaaS tools, we rely strictly on font-weights (500, 600, 700) and sizes rather than mixing serif/sans-serif or display fonts, reducing visual clutter.
- **Decision**: Avoided heavy borders and drop shadows.
  - **Reason**: Heavy shadows make a UI feel dated and "boxed in". Utilizing 1px borders (`#DFE1E6`) and restricting shadows to hover states only elevates the interface and makes data the primary focus.
- **Decision**: Text + Dot Status/Priority Indicators.
  - **Reason**: Using large heavily colored blocks for status (like `#FFEBE6` with red text) draws too much attention away from the task name. A subtle colored dot next to text accomplishes the same visual cue without overpowering the row.
- **Decision**: No backend modifications.
  - **Reason**: To limit scope strictly to UI/UX, we decoupled the visual redesign from any API or data-fetching logic. The existing props and data structures in `page.tsx` and `TaskRow.tsx` were reused exactly as is.
