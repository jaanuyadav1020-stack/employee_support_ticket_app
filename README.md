# Employee Support Ticket Management Application

---

## 1. Project Title
**Employee Support Ticket Management Application** (SupportHub)

---

## 2. Project Overview
The Employee Support Ticket Management Application is a lightweight, responsive, full-stack workplace issue reporting and resolution system. It provides a formal, auditable channel for employees to report workplace problems (such as IT, facility, hardware, and account access issues) and enables dedicated support staff to triage, prioritize, update, and resolve those issues with clear accountability and status transparency.

---

## 3. Problem Statement
In workplace environments without a dedicated issue management tool:
* Workplace problems are communicated through fragmented, informal channels (email, instant messages, hallway conversations), leading to lost requests and lack of accountability.
* Employees lack visibility into the resolution status and cannot easily provide follow-up diagnostic information.
* Support personnel lack a centralized triage queue to organize, categorize, prioritize, and record troubleshooting notes.

SupportHub resolves this by providing a unified portal with explicit role separation between reporting Employees and resolving Support Staff.

---

## 4. Features

### For Employees
* **Employee Dashboard**: Visual KPI summary cards (Total Submitted, Open & Pending, In Progress, Resolved Issues) and ticket listing filtered strictly to the employee's own submissions.
* **Create Ticket Page**: Dedicated submission form with input validation, real-time character counters (Title: 5–100 chars, Description: 10–1,000 chars), category classification, and priority selection.
* **Ticket Details Page**: Full problem description, current status badge, priority tag, category, and creation metadata.
* **Threaded Comment Discussion**: Chronological discussion thread to respond to technician inquiries, attach diagnostic details, and monitor updates.

### For Support Staff
* **Support Staff Dashboard**: Global triage queue showing all workplace tickets submitted across the entire organization.
* **Multi-Filter & Search**: Filter by Status (`Open`, `In Progress`, `Resolved`, `Closed`), Category, and Priority, or perform text search across titles, descriptions, and employee names.
* **Status Lifecycle Management**: Fast status transitions (`Open` $\rightarrow$ `In Progress` $\rightarrow$ `Resolved` $\rightarrow$ `Closed`) with instant UI feedback.
* **Resolution Notes**: Post official staff instructions and troubleshooting guidance directly onto any ticket.

### System & Testing Features
* **One-Click Persona Switcher**: Top navigation control enabling instant role-switching between test personas (`emp-1`, `emp-2`, `staff-1`) without login friction.
* **Automated Integration Testing**: 26 integration tests executing against an in-memory SQLite database (`:memory:`).

---

## 5. Technology Stack

* **Frontend**:
  * React 18 (Single Page Application)
  * Vite (Build tool & development server with API proxy)
  * Tailwind CSS (Responsive styling)
  * Lucide React (Icons)
* **Backend**:
  * Node.js (v20+ / v24)
  * Express (REST API framework)
  * CORS & Dotenv
* **Database**:
  * SQLite 3 via Node.js native `node:sqlite` (zero-dependency native module)
  * Parameterized SQL queries with foreign keys and check constraints
* **Testing**:
  * Jest & Supertest (Automated REST integration testing)

---

## 6. Project Folder Structure

```
employee-support-ticket-app/
├── client/                               # React Single Page Application
│   ├── public/                           # Static assets
│   ├── src/
│   │   ├── components/                   # Reusable UI components
│   │   │   ├── Navbar.jsx                # Header with navigation & branding
│   │   │   ├── UserSwitcher.jsx          # Persona switcher dropdown
│   │   │   ├── StatusBadge.jsx           # Color-coded status badge
│   │   │   ├── PriorityBadge.jsx         # Color-coded priority tag
│   │   │   └── CommentSection.jsx        # Threaded discussion component
│   │   ├── context/
│   │   │   └── UserContext.jsx           # Global user & role state management
│   │   ├── pages/                        # Dedicated page views
│   │   │   ├── EmployeeDashboard.jsx     # Employee tickets & KPI dashboard
│   │   │   ├── CreateTicketPage.jsx      # Ticket creation form
│   │   │   ├── TicketDetailsPage.jsx     # Problem details & discussion
│   │   │   └── SupportStaffDashboard.jsx # Support queue & triage management
│   │   ├── services/
│   │   │   └── api.js                    # Centralized REST API client
│   │   ├── App.jsx                       # Page routing & state synchronization
│   │   ├── main.jsx                      # React DOM root entry
│   │   └── index.css                     # Tailwind CSS directives
│   ├── index.html                        # Application HTML entry point
│   ├── vite.config.js                    # Vite configuration & /api proxy
│   ├── tailwind.config.js                # Tailwind theme configuration
│   ├── postcss.config.js                 # PostCSS configuration
│   └── package.json                      # Frontend dependencies
│
├── server/                               # Node.js Express REST Backend
│   ├── data/                             # SQLite persistent storage directory
│   │   └── support_tickets.db            # SQLite database file (gitignored)
│   ├── src/
│   │   ├── controllers/                  # Business logic & SQL queries
│   │   │   ├── ticketsController.js      # Ticket CRUD & status logic
│   │   │   ├── commentsController.js     # Comment thread logic
│   │   │   └── usersController.js        # Persona listing & profile
│   │   ├── middleware/                   # Express middlewares
│   │   │   ├── auth.js                   # Header-based auth & role guards
│   │   │   └── errorHandler.js           # Standardized JSON error response
│   │   ├── routes/                       # REST endpoint declarations
│   │   │   ├── tickets.js                # /api/tickets routes
│   │   │   ├── comments.js               # /api/tickets/:id/comments routes
│   │   │   └── users.js                  # /api/users routes
│   │   ├── app.js                        # Express app factory
│   │   ├── db.js                         # SQLite initialization & schema
│   │   ├── index.js                      # Server listener (port 5000)
│   │   └── seed.js                       # Database seeder script
│   ├── tests/                            # Automated integration test suite
│   │   ├── tickets.test.js               # Ticket API integration tests
│   │   └── comments.test.js              # Comment API integration tests
│   ├── .env.example                      # Environment variables template
│   └── package.json                      # Backend dependencies & test scripts
│
├── docs/                                 # Project documentation
│   ├── SPEC.md                           # Product specification baseline
│   └── PLAN.md                           # Phased implementation plan
│
├── .gitignore                            # Excluded files (node_modules, db files, logs)
├── AGENTS.md                             # Agent development & testing rules
├── package.json                          # Top-level workspace script orchestration
└── README.md                             # Complete project documentation
```

---

## 7. Installation Instructions

### Prerequisites
* **Node.js**: Version 20.0.0 or higher (Node 24 recommended).
* **npm**: Version 10.0.0 or higher.
* **Operating System**: Windows 10/11 (PowerShell or Command Prompt).

### Clone and Install Dependencies
From PowerShell in the project directory:

```powershell
# 1. Install backend dependencies
cd server
npm install
cd ..

# 2. Install frontend dependencies
cd client
npm install
cd ..
```

---

## 8. Frontend Setup

The frontend runs on port `3000` via Vite and proxies all `/api` requests to `http://localhost:5000`.

To start the frontend development server:
```powershell
# From the project root:
npm run dev:client
```
*Or directly from `/client`:*
```powershell
cd client
npm run dev
```

The application will be accessible at: **`http://localhost:3000`**

---

## 9. Backend Setup

The Express server runs on port `5000`.

To start the backend in development watch mode:
```powershell
# From the project root:
npm run dev:server
```
*Or directly from `/server`:*
```powershell
cd server
npm run dev
```

* Health Check Endpoint: `http://localhost:5000/api/health`

---

## 10. Database Setup

The database uses SQLite with zero native-compilation requirements.

### Database Initialization & Seeding
To initialize the SQLite database file (`server/data/support_tickets.db`) with pre-seeded personas, sample tickets, and comments:

```powershell
# From the project root:
npm run seed
```
*Or directly from `/server`:*
```powershell
cd server
npm run seed
```

### Pre-Seeded Accounts

| User ID | Full Name | Role | Email | Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| `emp-1` | Alice Johnson | `EMPLOYEE` | alice.johnson@company.com | Submit tickets, view own tickets, add comments on own tickets |
| `emp-2` | Charlie Brown | `EMPLOYEE` | charlie.brown@company.com | Submit tickets, view own tickets, add comments on own tickets |
| `staff-1` | Bob Smith | `SUPPORT` | bob.smith@support.com | View all tickets, filter queue, update status, comment on any ticket |

---

## 11. API Endpoints

All authenticated endpoints require the `x-user-id` header (e.g., `x-user-id: emp-1`).

### Users Endpoints
| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Service health status check |
| `GET` | `/api/users` | Public | List all available personas for switching |
| `GET` | `/api/users/me` | Authenticated | Return profile of currently authenticated user |

### Tickets Endpoints
| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tickets` | Authenticated | List tickets (filtered by creator for `EMPLOYEE`; all tickets for `SUPPORT`). Query params: `?status=Open&priority=High&category=Hardware&employeeId=emp-1` |
| `POST` | `/api/tickets` | Authenticated | Create a new ticket (`title`, `description`, `category`, `priority`) |
| `GET` | `/api/tickets/:id` | Authenticated | Retrieve ticket details by ID (returns `403` if employee attempts to view another's ticket) |
| `PATCH`| `/api/tickets/:id/status` | `SUPPORT` only | Update ticket status (`status`: `'Open'\|'In Progress'\|'Resolved'\|'Closed'`) |

### Comments Endpoints
| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tickets/:ticketId/comments` | Authenticated | Retrieve chronological comments for a ticket |
| `POST` | `/api/tickets/:ticketId/comments` | Authenticated | Add a comment to a ticket (`message`: 1–500 chars) |

---

## 12. Testing Instructions

Automated backend integration tests run using **Jest** and **Supertest** against an isolated in-memory SQLite database (`:memory:`).

To execute the test suite:
```powershell
# From the project root:
npm test
```
*Or directly from `/server`:*
```powershell
cd server
npm test
```

### Test Coverage Highlights
* **Authentication**: Missing or invalid `x-user-id` returns `401 Unauthorized`.
* **Authorization**: Employees cannot view (`403`) or comment on (`403`) another employee's ticket; employees cannot update ticket status (`403`).
* **Input Validation**: Empty title (`400`), whitespace-only title (`400`), short title (`400`), empty comment (`400`), invalid categories/priorities/statuses (`400`).
* **Data Isolation**: Ensures comments created on Ticket A do not leak into Ticket B.

---

## 13. Known Limitations

1. **Header-Based Authentication**: The application identifies users via the `x-user-id` HTTP header for frictionless testing and role evaluation without password overhead. It does not use signed JWT tokens or session cookies, meaning headers can be forged if exposed directly to untrusted networks.
2. **Local Storage Single Session**: Active persona is persisted in browser `localStorage`. Opening multiple tabs shares the same active persona across all tabs.
3. **No File Attachments**: The current specification supports text-based descriptions and comments only; binary attachments (images, PDF logs) are not supported.
4. **No Real-Time Push**: Updates require a manual view refresh or navigation transition rather than WebSockets or Server-Sent Events (SSE).

---

## 14. Future Improvements

1. **Production Authentication**: Implement JWT or OAuth2/OpenID Connect with bcrypt password hashing and refresh tokens.
2. **File & Screenshot Attachments**: Support diagnostic image uploads and log attachments using local disk or S3-compatible cloud storage.
3. **Real-Time Updates**: Integrate WebSockets (e.g. Socket.io) to instantly notify employees when ticket status changes or when staff comments.
4. **Audit Log & SLA Tracking**: Track chronological status change history with timestamps and assign resolution deadline timers based on priority levels.
5. **Email / Slack Notifications**: Automated webhook dispatch when tickets are submitted, assigned, or resolved.
#   e m p l o y e e - s u p p o r t - t i c k e t - a p p  
 