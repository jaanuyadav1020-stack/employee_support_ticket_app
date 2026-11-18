# Product Specification: Employee Support Ticket Management Application

* **Document Version**: 1.0.0
* **Status**: Approved / Baseline
* **Target Audience**: Engineering, QA, Product Stakeholders

---

## 1. Project Overview

The **Employee Support Ticket Management Application** is a lightweight, internal workplace issue reporting and resolution system. It provides a simple, structured channel for employees to submit workplace problems (such as IT, facility, and access issues) and allows dedicated support staff to triage, track, update, and resolve those issues through a centralized dashboard.

The solution consists of:
* A **React** single-page application (SPA) styled with **Tailwind CSS**.
* A **Node.js / Express** REST API backend.
* An embedded **SQLite** database.

---

## 2. Problem Statement

In workplace environments without a dedicated issue tracker:
* Employees report issues through scattered communication channels (email, chat, verbal requests), leading to lost or untracked requests.
* Employees lack visibility into the status and progress of their requests.
* Support personnel lack a centralized queue to prioritize, triage, and record resolution notes for workplace issues.

**Goal**: Deliver a simple, testable, and reliable ticketing system with clear role separation that requires minimal operational overhead.

---

## 3. Target Users

| Role | Description | Core Responsibility |
| :--- | :--- | :--- |
| **Employee** | Internal staff members encountering operational, hardware, software, or facilities issues. | Submit tickets, monitor progress of their own issues, and provide clarification via comments. |
| **Support Staff** | Dedicated workplace, IT, or facilities support agents responsible for resolving tickets. | Review incoming tickets across the organization, update ticket statuses, and communicate resolutions. |

---

## 4. Functional Requirements

### 4.1 Employee Capabilities
* **FR-EMP-01 (Ticket Submission)**: The system shall allow an employee to create a new ticket by providing:
  * Title (required)
  * Category (required, selected from predefined options)
  * Priority (required, selected from predefined options)
  * Description (required)
* **FR-EMP-02 (Own Ticket Listing)**: The system shall display a list containing **only** the tickets created by the authenticated employee.
* **FR-EMP-03 (Ticket Details)**: The system shall allow an employee to view details of their own tickets, including ID, title, description, category, priority, status, creation timestamp, and comment count.
* **FR-EMP-04 (Add Comments)**: The system shall allow an employee to submit follow-up comments on tickets they created.
* **FR-EMP-05 (View Comments)**: The system shall display all comments posted by the employee and support staff on that employee's ticket in chronological order.

### 4.2 Support Staff Capabilities
* **FR-STF-01 (Queue Visibility)**: The system shall display all submitted tickets across the organization in a unified support queue.
* **FR-STF-02 (Filtering & Search)**: The system shall allow support staff to filter the ticket queue by status, priority, and category, and search by keyword or creator name.
* **FR-STF-03 (Ticket Inspection)**: The system shall allow support staff to inspect full details of any ticket in the organization.
* **FR-STF-04 (Status Update)**: The system shall allow support staff to update the status of any ticket to one of the valid lifecycle states (`Open`, `In Progress`, `Resolved`, `Closed`).
* **FR-STF-05 (Add Comments)**: The system shall allow support staff to post comments and resolution updates on any ticket.

### 4.3 Shared / System Capabilities
* **FR-SYS-01 (User Identification)**: The system shall identify the active user context via the `x-user-id` HTTP header.
* **FR-SYS-02 (Persona Switching)**: The frontend shall provide an interface control allowing immediate switching between pre-seeded test accounts to facilitate testing both roles.

---

## 5. Non-Functional Requirements

### 5.1 Usability & Simplicity
* **NFR-USE-01**: The UI shall be responsive and intuitive, requiring zero onboarding or user manuals.
* **NFR-USE-02**: The UI shall visually distinguish between Employee and Support modes via status indicators and role badges.

### 5.2 Performance & Reliability
* **NFR-PERF-01**: API response times for CRUD and listing operations shall not exceed 200ms under standard local operating conditions.
* **NFR-PERF-02**: All database transactions shall use parameterized SQL queries to prevent SQL injection and preserve relational integrity.

### 5.3 Testability & Maintainability
* **NFR-TEST-01**: The backend shall support in-memory SQLite instances (`:memory:`) to allow fully isolated, rapid automated test suite runs.
* **NFR-TEST-02**: A dedicated database seed command (`npm run seed`) shall be provided to reset and populate realistic test data on demand.
* **NFR-TEST-03**: Backend endpoints shall maintain automated integration test coverage using Jest and Supertest.

### 5.4 Architectural Separation
* **NFR-ARCH-01**: The frontend (`/client`) and backend (`/server`) codebases shall be physically and logically separated into distinct directories.
* **NFR-ARCH-02**: The frontend shall communicate with the backend exclusively over standard HTTP REST JSON endpoints.

---

## 6. User Stories

1. **US-01 (Employee - Create Ticket)**:
   * *As an* Employee,
   * *I want to* fill out a form with a title, description, category, and priority,
   * *So that* I can formally report an issue to workplace support.
2. **US-02 (Employee - Track Issues)**:
   * *As an* Employee,
   * *I want to* see a dashboard displaying only my submitted tickets and their statuses,
   * *So that* I know whether my issues are being addressed without needing to message support staff directly.
3. **US-03 (Employee - Provide Follow-up Info)**:
   * *As an* Employee,
   * *I want to* add comments to my ticket,
   * *So that* I can answer questions from support or provide additional diagnostic information.
4. **US-04 (Support Staff - Triage Queue)**:
   * *As a* Support Staff member,
   * *I want to* view and filter all open tickets across all employees,
   * *So that* I can identify high-priority issues and manage workplace workload efficiently.
5. **US-05 (Support Staff - Update Progress)**:
   * *As a* Support Staff member,
   * *I want to* transition ticket statuses (e.g., from *Open* to *In Progress* to *Resolved*),
   * *So that* the submitter is kept informed of resolution progress.
6. **US-06 (Support Staff - Add Resolution Notes)**:
   * *As a* Support Staff member,
   * *I want to* post comments on tickets,
   * *So that* I can document troubleshooting steps and communicate instructions to employees.

---

## 7. Acceptance Criteria

### AC-01: Ticket Creation Validation
* **Given** an employee fills out the ticket form:
  * **When** the title has fewer than 5 characters or greater than 100 characters,
  * **Then** the system rejects submission with HTTP 400 and returns a clear validation error.
  * **When** the description has fewer than 10 characters or greater than 1,000 characters,
  * **Then** the system rejects submission with HTTP 400 and returns a clear validation error.
  * **When** valid title, description, category, and priority are submitted,
  * **Then** the ticket is saved with status `Open`, assigned to the employee's ID, and returns HTTP 201.

### AC-02: Employee Ticket Isolation
* **Given** an authenticated user with role `EMPLOYEE`:
  * **When** requesting `GET /api/tickets`,
  * **Then** only tickets where `created_by == currentUser.id` are returned.
  * **When** requesting `GET /api/tickets/:id` for a ticket created by a different user,
  * **Then** the API responds with `403 Forbidden`.

### AC-03: Support Staff Queue Access
* **Given** an authenticated user with role `SUPPORT`:
  * **When** requesting `GET /api/tickets`,
  * **Then** tickets from all employees are returned.
  * **When** requesting `GET /api/tickets/:id` for any ticket,
  * **Then** the ticket details and creator information are returned with HTTP 200.

### AC-04: Status Update Permissions
* **Given** a ticket with ID `T`:
  * **When** an `EMPLOYEE` attempts to send `PATCH /api/tickets/T/status`,
  * **Then** the server responds with `403 Forbidden` and the status remains unchanged.
  * **When** a `SUPPORT` user sends `PATCH /api/tickets/T/status` with status `In Progress`,
  * **Then** the server responds with HTTP 200, updates `status`, and updates `updated_at`.
  * **When** a `SUPPORT` user sends an unrecognized status value,
  * **Then** the server responds with HTTP 400.

### AC-05: Comment Submission & Isolation
* **Given** a ticket created by Employee A:
  * **When** Employee A posts a valid comment (1–500 characters),
  * **Then** the comment is saved and returns HTTP 201.
  * **When** Support Staff posts a valid comment on the ticket,
  * **Then** the comment is saved with author role `SUPPORT` and returns HTTP 201.
  * **When** Employee B (different employee) attempts to post a comment on Employee A's ticket,
  * **Then** the server responds with `403 Forbidden`.

---

## 8. Business Rules

### 8.1 Confirmed Business Rules
1. **BR-01 (Role Exclusivity)**:
   * Only users with the `SUPPORT` role are authorized to change ticket status.
   * Users with the `EMPLOYEE` role can only view and comment on tickets they personally created.
   * Users with the `SUPPORT` role can view and comment on tickets submitted by any user.
2. **BR-02 (Default Ticket State)**:
   * Every newly created ticket must initialize with the status `Open`.
3. **BR-03 (No Self-Registration or Credentials)**:
   * To prevent credential leakage and keep testing frictionless, accounts are pre-seeded and identified via the request context. No passwords or secret keys are stored or hardcoded.
4. **BR-04 (Referential Integrity)**:
   * A ticket cannot exist without a valid creator user.
   * A comment cannot exist without a valid ticket and author user.

### 8.2 Working Assumptions (Explicit Defaults)
1. **WA-01 (Predefined Categories)**:
   * Standard categories are fixed to: `Hardware`, `Software`, `Network`, `Facilities`, `Access & Accounts`, `Other`.
2. **WA-02 (Predefined Priorities)**:
   * Standard priority levels are fixed to: `Low`, `Medium`, `High`, `Urgent`.
3. **WA-03 (Ticket Lifecycle States)**:
   * Standard statuses are fixed to: `Open`, `In Progress`, `Resolved`, `Closed`.
4. **WA-04 (Input Boundaries)**:
   * Title: 5 to 100 characters.
   * Description: 10 to 1,000 characters.
   * Comment: 1 to 500 characters.
5. **WA-05 (Seed Accounts)**:
   * `emp-1`: Alice Johnson (Employee)
   * `emp-2`: Charlie Brown (Employee)
   * `staff-1`: Bob Smith (Support Staff)

---

## 9. Database Requirements

* **Engine**: SQLite 3 (utilizing Node.js native `node:sqlite`).
* **Foreign Keys**: Enabled (`PRAGMA foreign_keys = ON`).

### 9.1 Schema Definition

#### `users` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | Unique user identifier (e.g., `emp-1`, `staff-1`) |
| `name` | TEXT | NOT NULL | User full name |
| `email` | TEXT | NOT NULL, UNIQUE | User email address |
| `role` | TEXT | NOT NULL, CHECK(`role` IN ('EMPLOYEE', 'SUPPORT')) | System access role |
| `created_at` | TEXT | DEFAULT (datetime('now')) | Record creation timestamp |

#### `tickets` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique ticket identifier |
| `title` | TEXT | NOT NULL | Brief summary of workplace problem |
| `description`| TEXT | NOT NULL | Detailed problem description |
| `category` | TEXT | NOT NULL, CHECK(`category` IN (...)) | Issue classification |
| `priority` | TEXT | NOT NULL, CHECK(`priority` IN (...)) | Severity level |
| `status` | TEXT | NOT NULL DEFAULT 'Open', CHECK(`status` IN (...)) | Lifecycle stage |
| `created_by` | TEXT | NOT NULL, REFERENCES `users`(`id`) ON DELETE CASCADE | Submitter ID |
| `created_at` | TEXT | DEFAULT (datetime('now')) | Creation timestamp |
| `updated_at` | TEXT | DEFAULT (datetime('now')) | Last update timestamp |

#### `comments` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique comment identifier |
| `ticket_id` | INTEGER | NOT NULL, REFERENCES `tickets`(`id`) ON DELETE CASCADE | Target ticket ID |
| `user_id` | TEXT | NOT NULL, REFERENCES `users`(`id`) ON DELETE CASCADE | Commenter ID |
| `message` | TEXT | NOT NULL | Comment message text |
| `created_at` | TEXT | DEFAULT (datetime('now')) | Post timestamp |

### 9.2 Database Indexes
* `CREATE INDEX idx_tickets_created_by ON tickets(created_by);`
* `CREATE INDEX idx_tickets_status ON tickets(status);`
* `CREATE INDEX idx_comments_ticket_id ON comments(ticket_id);`

---

## 10. API Requirements

### 10.1 Authentication & Context
All protected endpoints require the HTTP header:
```http
x-user-id: <user_id>
```
If omitted or unrecognized, the API returns `401 Unauthorized`.

### 10.2 Endpoint Specification

| Method | Endpoint | Allowed Roles | Description | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Service health & liveness check | `200` |
| `GET` | `/api/users` | Public | List all seeded personas | `200` |
| `GET` | `/api/users/me` | Authenticated | Return profile of current user | `200`, `401` |
| `GET` | `/api/tickets` | Authenticated | List tickets (filtered by role and query params) | `200`, `401` |
| `POST` | `/api/tickets` | Authenticated | Submit new ticket (`title`, `description`, `category`, `priority`) | `201`, `400`, `401` |
| `GET` | `/api/tickets/:id` | Authenticated | Fetch details for a specific ticket | `200`, `400`, `401`, `403`, `404` |
| `PATCH`| `/api/tickets/:id/status` | `SUPPORT` only | Update ticket status (`status`) | `200`, `400`, `401`, `403`, `404` |
| `GET` | `/api/tickets/:ticketId/comments` | Authenticated | List comments on a ticket | `200`, `400`, `401`, `403`, `404` |
| `POST` | `/api/tickets/:ticketId/comments` | Authenticated | Add a comment to a ticket (`message`) | `201`, `400`, `401`, `403`, `404` |

### 10.3 Standardized Error Response Format
All error responses adhere to the standard schema:
```json
{
  "error": "Validation failed",
  "details": [
    "Title must be between 5 and 100 characters long"
  ]
}
```

---

## 11. Security Requirements

1. **SEC-01 (Zero Hardcoded Credentials)**:
   * The codebase and repository shall contain no hardcoded passwords, tokens, private keys, or credentials.
2. **SEC-02 (SQL Injection Protection)**:
   * All database queries interacting with user input shall strictly use SQLite prepared statements (`db.prepare(...).run/all/get`) with parameterized values.
3. **SEC-03 (Access Control Enforcement)**:
   * The backend shall enforce authorization checks on every state change and sensitive resource read, independently of frontend controls.
4. **SEC-04 (Input Sanitization)**:
   * String inputs (`title`, `description`, `message`) shall be trimmed of leading/trailing whitespace and validated against length boundaries before persistence.

---

## 12. Out-of-Scope Features

To maintain simplicity and adhere to constraints, the following features are explicitly out of scope for this version:

1. **Email / SMS Notifications**: No automated mailer or SMS integration.
2. **File & Image Attachments**: No binary upload handling or media storage.
3. **Self-Service User Registration / Password Resets**: No external authentication providers, OAuth2, or password hashing.
4. **SLA Timers & Automated Escalations**: No background cron jobs or overdue notifications.
5. **Audit Logs & Ticket Reassignment**: No multi-agent assignment workflows or historical revision logs.
6. **Ticket Deletion**: Tickets are preserved for record-keeping and cannot be deleted by users.
