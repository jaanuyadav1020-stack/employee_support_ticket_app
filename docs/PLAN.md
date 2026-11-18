# Implementation Plan: Employee Support Ticket Application

* **Document Version**: 1.0.0
* **Status**: Pending Approval
* **Reference Document**: [docs/SPEC.md](file:///c:/Users/jaanu/OneDrive/Projects/employee-support-ticket-app/docs/SPEC.md)

---

## Overview

This document outlines the step-by-step technical implementation plan for the **Employee Support Ticket Management Application**, divided into nine distinct, testable phases. Each phase defines the target files, implementation tasks, dependencies, testing requirements, and expected outcomes.

---

## Phase 1: Project Setup

### 1.1 Objective
Establish an organized, multi-package project structure with decoupled frontend (`/client`) and backend (`/server`) environments, root orchestration scripts, and development tooling.

### 1.2 Files to Create or Modify
* `package.json` (Root orchestration)
* `server/package.json` (Backend dependencies & scripts)
* `server/.env.example` (Backend environment template)
* `client/package.json` (Frontend dependencies & scripts)
* `.gitignore` (Ignore `node_modules`, `data/*.db`, build outputs, and `.env`)

### 1.3 Tasks to Complete
1. Initialize root workspace directory structure separating `/client` and `/server`.
2. Configure `server/package.json` with scripts (`start`, `dev`, `seed`, `test`) and core dependencies (`express`, `cors`, `dotenv`).
3. Configure `client/package.json` with scripts (`dev`, `build`, `preview`) and core dependencies (`react`, `react-dom`, `vite`, `tailwindcss`, `lucide-react`).
4. Set up root `package.json` scripts to run server, client, tests, and seed operations from a single top-level directory.
5. Define `.gitignore` rules to exclude runtime databases, logs, and build artifacts.

### 1.4 Dependencies
* Node.js runtime (v20+ or v24 recommended)
* npm package manager

### 1.5 Testing Requirements
* Run `npm install` in both `/server` and `/client` and verify zero fatal dependency conflicts.
* Verify root package scripts (`npm run dev:server`, `npm run dev:client`, etc.) resolve correctly.

### 1.6 Expected Outcome
Scaffolded, cleanly partitioned monorepo with verified script hooks ready for development.

---

## Phase 2: Frontend Development

### 2.1 Objective
Build a modern, responsive, and intuitive React SPA matching all functional requirements for Employees and Support Staff, including role-based visual states and navigation.

### 2.2 Files to Create or Modify
* `client/index.html` (Application HTML entry point)
* `client/vite.config.js` (Vite dev server and proxy configuration)
* `client/tailwind.config.js` & `client/postcss.config.js` (Tailwind styles)
* `client/src/index.css` (Tailwind directives and global styles)
* `client/src/main.jsx` (React entry point)
* `client/src/App.jsx` (Main layout, view coordination, and role banner)
* `client/src/context/UserContext.jsx` (Persona state management)
* `client/src/components/Navbar.jsx` (Branding, navigation, persona switcher)
* `client/src/components/UserSwitcher.jsx` (Instant role selector dropdown)
* `client/src/components/TicketList.jsx` (Ticket dashboard with search & filter pills)
* `client/src/components/TicketDetail.jsx` (Ticket view & Support status controller)
* `client/src/components/TicketForm.jsx` (Modal ticket creation form with validation)
* `client/src/components/StatusBadge.jsx` (Color-coded status pills)
* `client/src/components/PriorityBadge.jsx` (Color-coded priority tags)

### 2.3 Tasks to Complete
1. Set up Tailwind CSS styling, color palettes, and typography.
2. Build `UserContext` to hold active persona state (`emp-1`, `emp-2`, `staff-1`) and persist choices to `localStorage`.
3. Build `UserSwitcher` and `Navbar` showing current user role, avatar, and quick view toggles.
4. Implement `TicketList` component supporting:
   * Status filter pills (`All`, `Open`, `In Progress`, `Resolved`, `Closed`).
   * Category and Priority dropdown filters.
   * Search input for title, description, or creator name.
   * Role-aware empty states.
5. Implement `TicketForm` modal with input boundary counters (Title: 5–100 chars, Description: 10–1,000 chars) and error lists.
6. Implement `TicketDetail` view displaying complete issue information, creation metadata, and support staff status change dropdown.

### 2.4 Dependencies
* React 18, Vite, Tailwind CSS, Lucide React (Phase 1).

### 2.5 Testing Requirements
* Execute `npm run build` in `/client` to guarantee zero JSX or packaging syntax errors.
* Verify UI responsiveness on desktop and mobile viewport widths.
* Confirm that status update controls appear only when the active persona is Support Staff.

### 2.6 Expected Outcome
A complete, interactive frontend user interface ready to consume REST API endpoints.

---

## Phase 3: Backend Development

### 3.1 Objective
Construct a modular Express REST API implementing input validation, standardized JSON responses, persona identification middleware, and role access controls.

### 3.2 Files to Create or Modify
* `server/src/index.js` (HTTP server listener on port 5000)
* `server/src/app.js` (Express app factory, routing, and global middleware)
* `server/src/middleware/auth.js` (`x-user-id` verification and `requireRole` guard)
* `server/src/middleware/errorHandler.js` (Standardized JSON error formatting)
* `server/src/routes/users.js` (`GET /api/users`, `GET /api/users/me`)
* `server/src/routes/tickets.js` (Ticket listing, creation, details, and status updates)

### 3.3 Tasks to Complete
1. Build Express application instance configuring CORS, JSON body parser, and health check route `GET /api/health`.
2. Implement `auth.js` middleware:
   * Inspect `x-user-id` header; return `401 Unauthorized` if missing or unknown.
   * Attach `req.user` (`id`, `name`, `email`, `role`) to request context.
   * Implement `requireRole(...roles)` middleware returning `403 Forbidden` if unauthorized.
3. Implement `errorHandler.js` returning standardized `{ error, details }` payloads with appropriate HTTP status codes.
4. Implement `users.js` routes to provide persona listing for the switcher.
5. Implement `tickets.js` routes:
   * `GET /api/tickets`: Filter by creator for `EMPLOYEE`; return all for `SUPPORT`; apply query parameters (`status`, `priority`, `category`).
   * `POST /api/tickets`: Validate title (5–100 chars), description (10–1,000 chars), allowed category, and allowed priority; save with initial status `Open`.
   * `GET /api/tickets/:id`: Enforce that employees cannot view other employees' tickets (return `403`).
   * `PATCH /api/tickets/:id/status`: Restrict status updates to `SUPPORT` role; validate target status enum.

### 3.4 Dependencies
* Express, CORS, Dotenv (Phase 1).

### 3.5 Testing Requirements
* Test health check endpoint `GET /api/health` returns `{ status: "healthy" }`.
* Verify missing or invalid `x-user-id` returns HTTP 401.
* Verify `EMPLOYEE` attempting `PATCH /api/tickets/:id/status` returns HTTP 403.

### 3.6 Expected Outcome
Configured Express REST backend enforcing authentication and authorization logic on all ticket endpoints.

---

## Phase 4: Database Development

### 4.1 Objective
Implement a lightweight, persistent SQLite database layer using Node.js native `node:sqlite`, complete with schema initialization, foreign key constraints, indexes, and a repeatable seed utility.

### 4.2 Files to Create or Modify
* `server/src/db.js` (SQLite connection manager, schema definitions, and indexes)
* `server/src/seed.js` (Database seeder script)
* `server/data/support_tickets.db` (Default SQLite database file)

### 4.3 Tasks to Complete
1. Set up SQLite connection using `node:sqlite` (`DatabaseSync`), supporting both persistent file paths and in-memory instances (`:memory:`).
2. Enforce relational constraints via `PRAGMA foreign_keys = ON;`.
3. Create database tables with constraints matching `docs/SPEC.md`:
   * `users` (`id`, `name`, `email`, `role`, `created_at`)
   * `tickets` (`id`, `title`, `description`, `category`, `priority`, `status`, `created_by`, `created_at`, `updated_at`)
   * `comments` (`id`, `ticket_id`, `user_id`, `message`, `created_at`)
4. Create database indexes:
   * `idx_tickets_created_by` on `tickets(created_by)`
   * `idx_tickets_status` on `tickets(status)`
   * `idx_comments_ticket_id` on `comments(ticket_id)`
5. Implement `server/src/seed.js` with seed data:
   * Users: `emp-1` (Alice Johnson), `emp-2` (Charlie Brown), `staff-1` (Bob Smith).
   * Sample tickets across various categories, priorities, and statuses.

### 4.4 Dependencies
* Node.js built-in `node:sqlite` (zero native-compilation dependencies).

### 4.5 Testing Requirements
* Execute `npm run seed` from root or server and verify database file creation at `server/data/support_tickets.db`.
* Verify that foreign key constraints reject orphaned records.

### 4.6 Expected Outcome
Robust SQLite storage layer with schema integrity and instant sample data generation.

---

## Phase 5: API Integration

### 5.1 Objective
Connect the React frontend with the Express backend REST API, configuring reverse proxies, automated header injection, and client-side error handling.

### 5.2 Files to Create or Modify
* `client/src/services/api.js` (Centralized HTTP service layer)
* `client/vite.config.js` (Proxy `/api` to `http://localhost:5000`)
* `client/src/App.jsx` (API data hydration and error boundary)
* `client/src/components/TicketList.jsx` (Live ticket retrieval)
* `client/src/components/TicketForm.jsx` (Ticket submission integration)
* `client/src/components/TicketDetail.jsx` (Ticket detail and status change integration)

### 5.3 Tasks to Complete
1. Configure Vite development proxy forwarding all `/api` requests to `http://localhost:5000`.
2. Implement `client/src/services/api.js` request wrapper automatically injecting `x-user-id` header and parsing JSON errors.
3. Wire `UserContext` to fetch initial persona data from `/api/users`.
4. Connect `TicketList` to `api.getTickets(filters, userId)` to dynamically update when filters or personas change.
5. Connect `TicketForm` to `api.createTicket(...)` with server validation error display.
6. Connect `TicketDetail` to `api.getTicketById(...)` and `api.updateTicketStatus(...)`.

### 5.4 Dependencies
* Frontend components (Phase 2), Backend endpoints (Phase 3), Database (Phase 4).

### 5.5 Testing Requirements
* Switching personas in the UI immediately reflects the appropriate ticket visibility (Employee sees only own tickets; Support Staff sees all tickets).
* Submitting an invalid ticket displays specific validation errors returned from the server.
* Support Staff updating a status triggers an instant UI update on the ticket card and details view.

### 5.6 Expected Outcome
An integrated end-to-end full-stack application with live data synchronization between UI and database.

---

## Phase 6: Comment Feature

### 6.1 Objective
Implement ticket discussion and follow-up capabilities allowing employees and support staff to converse on tickets in chronological order.

### 6.2 Files to Create or Modify
* `server/src/routes/comments.js` (`GET` and `POST` `/api/tickets/:ticketId/comments`)
* `server/src/app.js` (Mount comments route under `/api/tickets/:ticketId/comments`)
* `client/src/components/CommentSection.jsx` (Discussion feed and input component)
* `client/src/components/TicketDetail.jsx` (Embed `CommentSection`)
* `client/src/services/api.js` (Add `getComments` and `addComment` methods)

### 6.3 Tasks to Complete
1. Backend: Implement access check helper ensuring Employees can only view/add comments on their own tickets.
2. Backend: Implement `GET /api/tickets/:ticketId/comments` returning comments with author name and role.
3. Backend: Implement `POST /api/tickets/:ticketId/comments` with message validation (1–500 characters).
4. Frontend: Implement `CommentSection` with author role badges (`Employee` vs `Staff`), timestamps, and character counter.
5. Frontend: Wire comment submission to update comment list immediately without requiring a full page reload.

### 6.4 Dependencies
* Ticket system (Phase 3, Phase 4, Phase 5).

### 6.5 Testing Requirements
* Support staff can post a comment on any ticket.
* Employee can post a comment on their own ticket.
* Employee receives HTTP 403 when attempting to post or view comments on another employee's ticket.
* Submitting an empty comment returns HTTP 400.

### 6.6 Expected Outcome
A complete, threaded comment system embedded in every ticket detail view with role-based access enforcement.

---

## Phase 7: Testing

### 7.1 Objective
Establish automated backend integration testing using Jest and Supertest against an isolated in-memory SQLite database to verify all business rules and acceptance criteria.

### 7.2 Files to Create or Modify
* `server/tests/tickets.test.js` (Ticket authorization, validation, and lifecycle tests)
* `server/tests/comments.test.js` (Comment authorization and validation tests)
* `server/package.json` (Jest runner configuration)

### 7.3 Tasks to Complete
1. Configure Jest test runner for Node environment with `--runInBand` and `--detectOpenHandles`.
2. Write integration tests in `tickets.test.js` covering:
   * Missing `x-user-id` returns 401.
   * Employee ticket isolation (own tickets only).
   * Support staff queue visibility (all tickets).
   * Query filtering by status, priority, and category.
   * Input boundary validation (short title, short description, invalid enums) returning 400.
   * Status change authorization (Employee receives 403; Support receives 200).
   * Cross-employee ticket inspection returns 403.
3. Write integration tests in `comments.test.js` covering:
   * Retrieval of chronological comment thread with author roles.
   * Employee commenting on own ticket returns 201.
   * Support staff commenting on any ticket returns 201.
   * Cross-employee comment inspection or submission returns 403.
   * Empty comment submission returns 400.
4. Ensure tests run against an isolated in-memory database (`initializeDb(':memory:')`) initialized before each test suite.

### 7.4 Dependencies
* Jest, Supertest (Phase 1).

### 7.5 Testing Requirements
* Run `npm test` from root or server.
* 100% of test suites must pass cleanly without lingering handles.

### 7.6 Expected Outcome
An automated test suite certifying application compliance with all acceptance criteria in `docs/SPEC.md`.

---

## Phase 8: Security Review

### 8.1 Objective
Audit the application against security requirements (SEC-01 through SEC-04) to prevent credential leakage, SQL injection, and authorization bypasses.

### 8.2 Files to Inspect or Modify
* `server/src/db.js`
* `server/src/middleware/auth.js`
* `server/src/routes/tickets.js`
* `server/src/routes/comments.js`
* `server/.env.example`
* `README.md`

### 8.3 Tasks to Complete
1. **Credential Audit**: Perform repository-wide search to confirm zero hardcoded passwords, tokens, API keys, or private certificates exist in code or configuration.
2. **SQL Injection Audit**: Verify that all SQL operations utilize parameterized placeholders (`?`) with `db.prepare()`, and that zero string interpolations/concatenations exist in SQL statements.
3. **Authorization Audit**: Verify that ticket status updates, ticket viewing, and comment operations enforce role and ownership checks server-side, preventing clients from bypassing UI restrictions.
4. **Input Boundary Audit**: Verify that all string inputs are trimmed and bounded to prevent buffer issues or malformed payloads.

### 8.4 Dependencies
* Completed backend and database implementation.

### 8.5 Testing Requirements
* Execute manual or automated exploit attempts:
  * Send SQL injection payloads (e.g., `' OR 1=1 --`) in ticket titles and search filters; verify they are treated as literal text.
  * Send forged `x-user-id` values; verify 401 response.
  * Attempt status update using employee persona header; verify 403 response.

### 8.6 Expected Outcome
Verified secure application conforming to all security specifications.

---

## Phase 9: Documentation

### 9.1 Objective
Deliver clear, concise documentation enabling any engineer or evaluator to install, run, test, and understand the application.

### 9.2 Files to Create or Modify
* `README.md` (Project overview, quick start, API reference, persona table)
* `docs/SPEC.md` (Product specification baseline)
* `docs/PLAN.md` (This implementation plan)

### 9.3 Tasks to Complete
1. Write top-level `README.md` documenting:
   * Architecture overview and technology stack.
   * Pre-seeded test personas and permissions matrix.
   * Quick start setup instructions (`npm run seed`, `npm run dev:server`, `npm run dev:client`).
   * Test execution instructions (`npm test`).
   * Full REST API endpoint documentation with example payloads and status codes.
2. Cross-reference `docs/SPEC.md` and `docs/PLAN.md` to ensure terminology and requirements are unified.

### 9.4 Dependencies
* Completed application and test verification.

### 9.5 Testing Requirements
* Follow instructions in `README.md` on a clean terminal session to confirm exact accuracy of setup and test steps.

### 9.6 Expected Outcome
Complete documentation package providing clear guidance for development, review, and maintenance.

---

## Approval Request

This plan is ready for your review and approval. Please confirm if you approve proceeding with the implementation according to this plan or if any adjustments are required.
