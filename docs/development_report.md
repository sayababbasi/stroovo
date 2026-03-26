# Development Report: "Workflow" Platform

## 1. 📌 Executive Summary
**Workflow** is a modern, web-based Role-Based Access Control (RBAC) work management platform. 

**CRITICAL NOTE ON TECH STACK:** While the prompt described the platform as "Django-based," the actual source code provided is exclusively a **Next.js (React) application using TypeScript, Tailwind CSS, and Prisma ORM** with a PostgreSQL database. There is **no Python or Django code** present in the dump at all.

Based strictly on the provided code, the product functions as a comprehensive enterprise work management tool (similar to Jira/Asana). It supports hierarchical OKRs (Objectives and Key Results), project tracking, Kanban boards, sprint planning, team management, and granular task tracking with sub-tasks.

## 2. ⚙️ Features Actually Built
Based on the API routes, UI components, and Prisma seeding scripts, the following features are actively implemented:

*   **Authentication & Authorization:** JWT-based login, signup, logout, and token refresh mechanisms (`api/auth/*`), with secure HTTP-only cookies.
*   **Hierarchical OKR Management:** Supports Company and Team-level Objectives (`Goal` model) with measurable Key Results (`KeyResult`), tied to specific timeframes (`Cycle`).
*   **Project Oversight:** Creation and tracking of projects (`Project`), assigning project managers, and viewing project progress stats.
*   **Advanced Task Management:**
    *   Creation of tasks with types (`STORY`, `BUG`, `FEATURE`, `DESIGN`, `TASK`).
    *   Statuses (`TODO`, `IN_PROGRESS`, `DONE`, `BACKLOG`, `BLOCKED`).
    *   Priorities (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
    *   Task hierarchy (parent tasks and sub-tasks).
    *   Inline editing capabilities and progress tracking (0-100%).
*   **Multiple Work Views (UI):**
    *   Board View (Kanban style).
    *   List/Table View (DataGrid).
    *   Calendar View.
    *   Timeline/Gantt View.
*   **RBAC (Role-Based Access Control):** Enforcement of user roles including `ADMIN`, `PROJECT_MANAGER`, `TEAM_MEMBER`, and `USER`.
*   **AI Integration Placeholder:** An AI insights page evaluating sprint loads, priority adjustments, and deadline risks (currently using hardcoded suggestion data in the UI).
*   **Tenant Support:** Multi-tenant architecture (evidenced by `Tenant` model and `tenantId` fields in the seed script).

## 3. 🗂️ Actual File Structure
The project is split into frontend and backend directories, though some files appear at the root, suggesting it might be shifting toward a centralized Next.js monorepo or standard Next.js full-stack app.

**Key Directories:**
*   `backend/` - Contains API routes, Prisma configurations, and database seeding scripts.
    *   `src/app/api/` - REST API endpoints (auth, cycles, goals, projects, tasks, users).
    *   `prisma/` - `seed.ts`, `seed-okrs.ts`, configuration.
*   `frontend/` or root `src/` - React frontend components and pages.
    *   `src/app/` - Next.js App Router pages (`/login`, `/board`, `/admin`, `/tasks`, `/goals`, `/timeline`, etc.).
    *   `src/components/` - Reusable React UI components (`Sidebar.tsx`, `BoardView.tsx`, `ProjectModal.tsx`, etc.).
    *   `src/contexts/` - React context providers (`AuthContext.tsx`).

## 4. 🧱 Database Schema (Inferred from Prisma Seed Scripts)
*(Note: As there is no `models.py`, this schema is extracted directly from the Prisma adapter and seeders in the code).*

| Model | Fields / Relationships | Description |
| :--- | :--- | :--- |
| **User** | `id`, `name`, `email`, `password`, `role`, `title`, `contact`, `image`, `tenantId`, `createdAt` | System users and their profiles. |
| **Tenant** | `id`, `name`, `domain` | Supports multi-tenancy (e.g., "Acme Corp"). |
| **Role (Enum)** | `ADMIN`, `PROJECT_MANAGER`, `TEAM_MEMBER`, `USER` | Defined permission tiers. |
| **Cycle** | `id`, `name`, `startDate`, `endDate`, `status`, `tenantId` | Time periods for OKRs (e.g., "Q1 2026"). |
| **Goal** | `id`, `title`, `description`, `type` (COMPANY/TEAM), `status` (ON_TRACK/AT_RISK), `progress`, `targetDate`, `ownerId` (User), `cycleId`, `tenantId`, `parentId` (Goal) | Objectives/OKRs with hierarchical parent-child linking. |
| **KeyResult** | `title`, `initialValue`, `currentValue`, `targetValue`, `unit` (CURRENCY/NUMBER/PERCENTAGE), `weight`, `goalId` | Measurable metrics tied to a specific Goal. |
| **Project** | `id`, `name`, `description`, `managerId` (User), `goalId` (Goal), `startDate`, `status` | High-level initiatives aligned to Goals. |
| **Task** | `id`, `title`, `description`, `status` (Enum), `priority` (Enum), `type` (Enum), `progress`, `projectId`, `assigneeId` (User), `parentId` (Task), `dueDate` | Granular action items with sub-task support. |

## 5. 🔐 RBAC & Permissions
The system relies on a User `role` enum. Based on standard checks in the routing and UI:
1.  **ADMIN:** Full system access. Can view the `/admin` dashboard, manage users, and oversee all projects across the platform. (e.g., System Administrator, CEO).
2.  **PROJECT_MANAGER:** High-level access to create and modify Projects, assign tasks, and manage Goals/OKRs.
3.  **TEAM_MEMBER:** Standard access to view boards, update assigned task statuses (`IN_PROGRESS`, `DONE`), and collaborate on projects.
4.  **USER:** Default fallback role (used in the signup route) likely with restricted read-only or limited base access. 

*(Note: Granular permission enforcement logic inside individual API routes wasn't fully detailed in the dump snippet, but the Context/Auth routing heavily depends on these roles).*

## 6. 🎨 UI/UX (from templates & CSS)
The application utilizes a heavy sidebar-driven layout with several modular Next.js (`page.tsx`) pages and dedicated React components.

**Main Pages Developed:**
*   `/login`, `/signup`: Authentication entry points.
*   `/activity`: Activity feed showing recent events and task status changes.
*   `/admin/*`: User and Project oversight tables.
*   `/board`, `/tasks`, `/my-tasks`: Kanban and list-based task management.
*   `/calendar`, `/timeline`: Date-driven visual project planning.
*   `/goals`, `/roadmap`: Strategy, OKR planning, and milestone tracking.
*   `/ai`: Prototype AI insights dashboard.
*   `/messages`: Team communication placeholder UI.
*   `/sprints`: Sprint timeline and progress tracking.

**Key Components:**
*   `Sidebar.tsx`: Global navigation.
*   `BoardView.tsx`: Kanban drag-and-drop columns.
*   `TaskModal.tsx` & `ProjectModal.tsx`: Slide-over or modal forms for creation/editing.
*   `ProjectTable.tsx` & `UserTable.tsx`: Data grids for administrative oversight.

## 7. 🔄 What Has Been Developed
*   **Full Next.js App Router scaffolding** with dozens of initialized layout and page files.
*   **Fully functional Prisma Database layer**, complete with exhaustive seeding scripts (`seed.ts`, `seed-okrs.ts`) that instantiate realistic mock data, relationships, and hashed passwords.
*   **Complete Authentication Flow**, including JWT token generation, secure HTTP-only cookie setting, and a `useAuth` React context for client-side state.
*   **Core CRUD API Endpoints** for Users, Projects, Tasks, Goals, and Cycles.
*   Extensive **UI structural components** for Kanban boards, lists, and administration tables.

## 8. 🚧 What Appears Incomplete or Missing
*   **Missing Django Backbone:** As noted, if a Python/Django backend was expected, it has not been included or developed here.
*   **Dummy UI Data:** Several pages (like `/activity`, `/messages`, `/reports`, `/roadmap`, `/ai`) contain hardcoded mock data arrays rather than fetching from the database.
*   **Backend File Replication:** There appear to be overlapping directories (e.g., `frontend/src/app` vs `src/app` vs `backend/src/app`), implying a messy migration or structural refactoring is currently mid-flight.
*   **Granular API Permissions:** While roles exist, deeply enforced authorization middleware (e.g., ensuring a Project Manager can only edit *their* projects) is not overtly visible in the base API routes provided.

## 9. 🛣️ Suggested Next Steps
1.  **Resolve Monorepo Structure:** Clean up the duplicate `src/app` directories. Consolidate into a single standard Next.js directory structure or use a formal monorepo tool (like Turborepo).
2.  **Connect Stubbed UI Pages:** Hook up the hardcoded `/activity`, `/messages`, and `/reports` pages to real Prisma database queries via Server Actions or dedicated API routes.
3.  **Implement RBAC Middleware:** Add strict Next.js Edge middleware to protect API routes and UI pages based on the JWT `role` payload.
4.  **Confirm Tech Stack Choice:** Ensure all stakeholders are aware the project is running on Next.js/Node/Prisma and not Django.

## 10. 🛠️ Setup & Run Guide
Based on the file configurations (`package.json`, `next.config.ts`, `prisma.config.ts`), here is the environment setup:

**Prerequisites:**
*   Node.js (v18+)
*   PostgreSQL database instance

**Setup Steps:**
1.  **Environment Variables:** Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/workflow_db"
    JWT_SECRET="your_jwt_access_secret"
    JWT_REFRESH_SECRET="your_jwt_refresh_secret"
    NEXT_PUBLIC_API_URL="http://localhost:5001"
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    # or npm ci
    ```
3.  **Database Migration & Seeding:**
    ```bash
    npx prisma db push
    # or npx prisma migrate dev
    
    npx ts-node backend/prisma/seed.ts
    npx ts-node backend/prisma/seed-okrs.ts
    ```
4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    *The app will be available at `http://localhost:3000` (Frontend) and `http://localhost:5001` (Backend/API if running on split ports, as seen in `NEXT_PUBLIC_API_URL` environment calls).*
