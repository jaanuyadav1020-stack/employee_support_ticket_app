# Employee Support Ticket Management Application

A full-stack, lightweight workplace issue reporting and ticket tracking application built with **React**, **Node.js/Express**, and **SQLite**.

---

## Features

### For Employees
* **Submit Support Tickets**: Provide problem title, category, priority, and detailed description with client and server-side validation.
* **View Own Tickets**: Clean dashboard displaying only tickets submitted by the authenticated employee.
* **Ticket Detail View**: Inspect current status, category, timestamps, and full problem description.
* **Comment & Activity Thread**: Follow up on open issues, answer technician questions, and see updates.

### For Support Staff
* **Support Queue (All Tickets)**: View and search across all submitted workplace issues in the organization.
* **Filter & Search**: Quickly filter tickets by Status (`Open`, `In Progress`, `Resolved`, `Closed`), Category, and Priority, or search by keyword and submitter name.
* **Update Ticket Status**: Change issue states (`Open` $\rightarrow$ `In Progress` $\rightarrow$ `Resolved` $\rightarrow$ `Closed`) with instant UI feedback.
* **Add Staff Guidance**: Post resolution notes and instructions directly on any ticket.

---

## Tech Stack & Architecture

* **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons.
* **Backend**: Node.js, Express REST API, SQLite (native zero-dependency `node:sqlite`), parameterized SQL queries.
* **Testing**: Automated integration test suite with **Jest** and **Supertest** running against an isolated in-memory SQLite database.
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
*Executes all 18 test cases across ticket authorization, validation rules, status transitions, and comment threads.*

---

## REST API Reference

All protected endpoints require the `x-user-id` header (e.g. `x-user-id: emp-1` or `x-user-id: staff-1`).

### Users
* `GET /api/users` - List all users (for persona switching and attribution).
* `GET /api/users/me` - Get currently authenticated user details.

### Tickets
* `GET /api/tickets` - List tickets (filtered to creator if Employee, all tickets if Support Staff).
  * Optional query params: `?status=Open&priority=High&category=Hardware`
* `POST /api/tickets` - Submit new ticket (Requires: `title`, `description`, `category`, `priority`).
* `GET /api/tickets/:id` - View single ticket details (403 if Employee views another user's ticket).
* `PATCH /api/tickets/:id/status` - Update ticket status (Restricted to `SUPPORT` role).

### Comments
* `GET /api/tickets/:ticketId/comments` - List comment history for a ticket.
* `POST /api/tickets/:ticketId/comments` - Post comment (Requires: `message` [1–500 chars]).

---

## Validation & Business Rules

* **Title**: String between 5 and 100 characters.
* **Description**: String between 10 and 1,000 characters.
* **Allowed Categories**: `Hardware`, `Software`, `Network`, `Facilities`, `Access & Accounts`, `Other`.
* **Allowed Priorities**: `Low`, `Medium`, `High`, `Urgent`.
* **Allowed Statuses**: `Open`, `In Progress`, `Resolved`, `Closed`.
* **Role Enforcement**:
  * Only `SUPPORT` can update ticket status.
  * `EMPLOYEE` can only view and comment on tickets they created.
