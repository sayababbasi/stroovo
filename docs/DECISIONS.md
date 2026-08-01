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

## Calendar Module UI Overhaul
- **Decision**: Preserve existing backend interactions.
  - **Reason**: We strictly separated the UI layer upgrade from the data mutation layer to prevent functional regressions in Calendar scheduling.

## Teams Module UI Overhaul & RBAC
- **Decision**: Componentized Teams architecture.
  - **Reason**: We broke the monolithic Teams `page.tsx` into distinct enterprise-grade sub-components (`MembersTab.tsx`, `RolesTab.tsx`, `PermissionMatrix.tsx`) because the scale of an enterprise Roles & Permissions matrix is too complex for a single file.
- **Decision**: Implemented full-array permission sync over incremental endpoints.
  - **Reason**: Enterprise RBAC matrices update frequently across many checkboxes. Sending the complete array via `PUT /api/admin/roles/[id]/permissions` eliminates race conditions and edge cases compared to patching individual permission grants/revokes.
- **Decision**: TypeScript Interface over Discriminated Union for `AuthResult`.
  - **Reason**: Adjusted `AuthResult` to a standard interface to maintain compatibility across API routes when strict mode narrowing behaves unexpectedly in complex Next.js middleware setups.
- **Decision**: Centralized Permission Registry for strict RBAC.
  - **Reason**: To enforce security-by-default, all frontend and backend code MUST reference the `P` constant exported from `src/lib/permissions/registry.ts`. We removed the legacy role-based wildcard bypass in `authorization.ts` because it caused insecure false positives in edge cases. API endpoints now evaluate DB-driven effective permissions rather than static frontend state.
