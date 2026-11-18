# Employee Support Ticket Management Application

A full-stack, lightweight workplace issue reporting and ticket tracking application built with **React**, **Node.js/Express**, and **SQLite**.

---

## Features

### For Employees
* **Employee Dashboard**: Comprehensive overview displaying active tickets, summary KPI cards (Total Submitted, Open & Pending, In Progress, Resolved), and status filters.
* **Create Ticket Page**: Dedicated submission interface with real-time character counting and boundary validation (Title: 5–100 chars, Description: 10–1,000 chars, Category, Priority).
* **Ticket Details Page**: Full problem description, current lifecycle status badge, priority tag, category, and creation metadata.
* **Threaded Comment System**: Follow up on open issues, answer support questions, and view updates in chronological order with author role attribution and relative timestamps.

### For Support Staff
* **Support Staff Dashboard**: Centralized queue displaying all workplace tickets across the organization.
* **Triage & Filtering**: Filter queue by Status (`Open`, `In Progress`, `Resolved`, `Closed`), Category, and Priority, or search by keyword and submitter name.
* **Status Updates**: Update ticket statuses (`Open` $\rightarrow$ `In Progress` $\rightarrow$ `Resolved` $\rightarrow$ `Closed`) with instant UI feedback.
* **Staff Guidance & Resolution Notes**: Post troubleshooting steps and official resolutions directly into the ticket discussion thread.

---

## Comment Feature Highlights

The integrated ticket discussion system provides:
1. **Threaded Chronological History**: Comments are ordered chronologically (`ASC`) so participants see the complete discussion progression.
2. **Role Badges & User Attribution**: Comments clearly indicate author name and role badge (`Employee` vs `Staff`).
3. **Data Integrity & Isolation**:
   * Comments belong strictly to their target ticket via `ticket_id` foreign key.
   * Employees are strictly forbidden from viewing or commenting on tickets created by other employees (`403 Forbidden`).
   * Support staff can inspect and comment on any ticket across the organization.
4. **Validation & Error Handling**:
   * Empty comments or whitespace-only inputs are rejected with `400 Validation failed`.
   * Comments are bounded between 1 and 500 characters.
   * Accessing or commenting on a non-existent ticket returns `404 Ticket not found`.

---

## Tech Stack & Architecture

* **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons.
* **Backend**: Node.js, Express REST API, SQLite (native zero-dependency `node:sqlite`), parameterized SQL queries (`db.prepare()`).
* **Architecture**: Strict separation of concerns — routes (`server/src/routes/`) delegate to dedicated controllers (`server/src/controllers/`).
* **Testing**: Automated integration test suite with **Jest** and **Supertest** running against an isolated in-memory SQLite database (`:memory:`).
* **Persona Switcher**: Seamless switching between Employee and Support Staff personas in both the UI and via the `x-user-id` request header.

---

## Pre-Seeded Personas

| User ID | Name | Role | Email | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| `emp-1` | Alice Johnson | `EMPLOYEE` | alice.johnson@company.com | Submit tickets, view own tickets, comment on own tickets |
| `emp-2` | Charlie Brown | `EMPLOYEE` | charlie.brown@company.com | Submit tickets, view own tickets, comment on own tickets |
| `staff-1` | Bob Smith | `SUPPORT` | bob.smith@support.com | View all tickets, update statuses, comment on any ticket |

---

## Quick Start Guide

### 1. Initialize & Seed Database
From the root directory:
```bash
npm run seed
```
*Creates the SQLite database at `server/data/support_tickets.db` and populates sample tickets, users, and comments.*

---

### 2. Run the Backend API Server
```bash
npm run dev:server
```
*Backend runs on `http://localhost:5000`.*
*Health check endpoint: `http://localhost:5000/api/health`.*

---

### 3. Run the Frontend Development Server
In a separate terminal:
```bash
npm run dev:client
```
*Frontend runs on `http://localhost:3000` (automatically proxies `/api` requests to port 5000).*

---

### 4. Run Automated Backend Integration Tests
```bash
npm test
```
*Executes all **23 automated test cases** across ticket authorization, validation rules, status transitions, and comment threads.*

---

## REST API Reference

All protected endpoints require the `x-user-id` header (e.g., `x-user-id: emp-1` or `x-user-id: staff-1`).

### Users
* `GET /api/users` - List all users (for persona switching and attribution).
* `GET /api/users/me` - Get currently authenticated user details.

### Tickets
* `GET /api/tickets` - List tickets (filtered to creator if Employee, all tickets if Support Staff).
  * Query params: `?status=Open&priority=High&category=Hardware&employeeId=emp-1`
* `POST /api/tickets` - Submit new ticket (Requires: `title`, `description`, `category`, `priority`).
* `GET /api/tickets/:id` - View single ticket details (403 if Employee views another user's ticket).
* `PATCH /api/tickets/:id/status` - Update ticket status (Restricted to `SUPPORT` role).

### Comments
* `GET /api/tickets/:ticketId/comments` - List comments for a ticket in chronological order.
  * Response: `{ comments: [{ id, ticket_id, user_id, message, created_at, author_name, author_role }] }`
  * Returns `404` if ticket does not exist; `403` if unauthorized employee.
* `POST /api/tickets/:ticketId/comments` - Post comment on a ticket.
  * Request Body: `{ "message": "Follow-up note..." }`
  * Response: `201 Created` with comment object.
  * Returns `400` if message is empty; `404` if ticket does not exist; `403` if unauthorized employee.

---

## Validation & Business Rules

* **Title**: String between 5 and 100 characters.
* **Description**: String between 10 and 1,000 characters.
* **Comment**: String between 1 and 500 characters (non-empty, non-whitespace).
* **Allowed Categories**: `Hardware`, `Software`, `Network`, `Facilities`, `Access & Accounts`, `Other`.
* **Allowed Priorities**: `Low`, `Medium`, `High`, `Urgent`.
* **Allowed Statuses**: `Open`, `In Progress`, `Resolved`, `Closed`.
* **Role Enforcement**:
  * Only `SUPPORT` can update ticket status.
  * `EMPLOYEE` can only view and comment on tickets they created.
  * `SUPPORT` can view and comment on any ticket.
