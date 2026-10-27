# FlowTask — Agile Task Workflow Application
## Full Stack MERN Stack Project
**Guidelines & Specification Compliance**: Information & Communication Technology Academy of Kerala (ICTAK)

---

## 1. Project Overview & Problem Statement

### 1.1 Problem Statement
In individual and team projects, tracking work items across disparate note-taking tools, chats, or spreadsheets leads to missed deadlines, lack of prioritization, and status opacity. **FlowTask** is a decoupled, modern Full Stack MERN (MongoDB, Express.js, React.js, Node.js) web application providing a centralized, interactive Kanban-style task workflow pipeline. Users can create, organize, filter, prioritize, and advance tasks through lifecycle stages (`To Do` ➔ `In Progress` ➔ `Review` ➔ `Completed`) with real-time feedback and secure cloud data persistence.

### 1.2 Target Users
- **Registered Team Member / Individual**: Creates personal tasks, specifies priorities (`Low`, `Medium`, `High`, `Urgent`), assigns due dates, and transitions tasks along workflow stages.
- **Admin**: Oversees platform operations and monitors system health.

### 1.3 MVP Scope
- **Must Have (MVP)**:
  - User registration & login with salted `bcrypt` password hashing and signed JWT authentication.
  - Complete CRUD for tasks (`title`, `description`, `status`, `priority`, `dueDate`, `tags`).
  - Strict ownership checking (users only see and edit their own tasks).
  - Four fundamental UI states: **Loading**, **Success**, **Empty**, **Error**.
  - Pipeline statistics ribbon and instant multi-criteria filtering (search, priority, stage).
- **Future Enhancements (Post-MVP)**:
  - Multi-user team boards with task assignment.
  - Drag-and-drop drag events using HTML5 Drag and Drop API.
  - Automated email deadline reminders using Nodemailer.

---

## 2. MERN Architecture & Request Flow

The application is structured into decoupled client and server tiers:

```text
[ Browser (React SPA) ] 
       │
       ▼  HTTP Request (JSON + Bearer Token)
[ Express.js / Node.js API Server ]
       │
       ├─► Middleware: CORS, Morgan Logging, JSON Body Parsing
       ├─► Auth Middleware: JWT Signature & Expiry Verification
       ├─► Controller: Input Validation & Business Logic
       ▼  Mongoose ODM Schema Queries
[ MongoDB Atlas (Cloud NoSQL Database) ]
```

### Request Flow Example: Creating a Task
1. The user fills out the task form in React and clicks "Create Task".
2. React validates the input on the client (ensuring title is present and under 120 chars) and disables the submit button during in-flight submission.
3. React sends `POST /api/tasks` with JSON payload and `Authorization: Bearer <token>`.
4. Express receives the request; `authMiddleware` validates the JWT token and attaches `req.user`.
5. `taskController.createTask` sets `user: req.user._id`, validates with Mongoose `Task` model, and saves to MongoDB.
6. Server responds with HTTP `201 Created` and the new task document.
7. React updates its state immediately and prepends the new task to the `To Do` column without requiring a manual page refresh.

---

## 3. Project Structure

```text
task-workflow-app/
├── client/                     # React Single Page Application (Vite)
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── components/         # Reusable UI pieces
│   │   │   ├── Navbar.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── WorkflowColumn.jsx
│   │   │   ├── TaskFilterBar.jsx
│   │   │   ├── TaskFormModal.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   └── ErrorMessage.jsx
│   │   ├── context/            # Shared state providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── TaskContext.jsx
│   │   ├── pages/              # Route screens
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── services/           # Centralized API client (All HTTP calls live here)
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── taskService.js
│   │   ├── styles/             # Application stylesheets
│   │   │   └── index.css
│   │   ├── App.jsx             # Root view coordinator
│   │   └── main.jsx            # Application entry mount
│   ├── .env.example            # Public frontend environment template
│   ├── index.html              # HTML5 entry template
│   ├── package.json            # Client dependencies
│   └── vite.config.js          # Vite config & API proxy
├── server/                     # Node.js & Express RESTful API
│   ├── src/
│   │   ├── config/             # Database connection & config
│   │   │   └── db.js
│   │   ├── controllers/        # Request handling logic
│   │   │   ├── authController.js
│   │   │   └── taskController.js
│   │   ├── middleware/         # Auth, validation, error handling
│   │   │   ├── authMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   ├── models/             # Mongoose schemas
│   │   │   ├── User.js
│   │   │   └── Task.js
│   │   ├── routes/             # Method & URL route mapping only
│   │   │   ├── authRoutes.js
│   │   │   └── taskRoutes.js
│   │   └── server.js           # Server bootstrap & middleware assembly
│   ├── .env.example            # Public backend environment template
│   └── package.json            # Server dependencies
├── .gitignore                  # Git ignore rules (node_modules, .env, dist)
└── README.md                   # Project documentation
```

---

## 4. API Contract

All endpoints reside under the `/api` namespace:

| Method | Endpoint Path | Access | Request Body | Success Code | Error Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public | JSON: `name`, `email`, `password` | `201 Created` with JWT token | `400` Missing field, `409` Email exists |
| **POST** | `/api/auth/login` | Public | JSON: `email`, `password` | `200 OK` with JWT token | `400` Invalid input, `401` Bad credentials |
| **GET** | `/api/auth/me` | Private | None | `200 OK` with User object | `401` Unauthorized |
| **GET** | `/api/tasks` | Private | Query: `status`, `priority`, `search` | `200 OK` with tasks array & count | `401` Unauthorized |
| **POST** | `/api/tasks` | Private | JSON: `title`, `description`, `priority`, `status`, `dueDate` | `201 Created` with task object | `400` Missing title, `401` Unauthorized |
| **GET** | `/api/tasks/stats` | Private | None | `200 OK` with counts per status | `401` Unauthorized |
| **GET** | `/api/tasks/:id` | Private | None | `200 OK` with task object | `401`, `403` Not owner, `404` Not found |
| **PUT** | `/api/tasks/:id` | Private | JSON: modified fields | `200 OK` with updated task | `400`, `403` Not owner, `404` Not found |
| **DELETE**| `/api/tasks/:id` | Private | None | `200 OK` with deleted ID | `401`, `403` Not owner, `404` Not found |

---

## 5. Getting Started & Local Setup

### Prerequisites
- Node.js (v18.0.0 or later)
- npm (v9.0.0 or later)
- MongoDB instance (MongoDB Atlas cluster URI or local `mongodb://localhost:27017`)

### 1. Clone Repository & Setup Environment
```bash
git clone <your-repo-url>
cd task-workflow-app
```

### 2. Configure Backend Server
```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB Atlas URI and JWT Secret
npm install
npm run dev
```
*The server will start at `http://localhost:5000`.*

### 3. Configure Frontend Client
In a separate terminal window:
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
*The React client will launch at `http://localhost:5173`.*

---

## 6. Security & Best Practices Implemented

1. **Password Hashing**: Stored passwords are never plaintext; they are securely salted and hashed using `bcryptjs` with salt rounds of 10.
2. **Secrets Protection**: All database strings and JWT keys reside in `.env` and are strictly excluded via `.gitignore`.
3. **Defense-in-Depth Validation**:
   - Frontend validation prevents invalid submissions before sending requests.
   - Backend validation sanitizes inputs and handles Mongoose constraint errors.
4. **Ownership Verification**: Before editing or deleting any task, the server strictly checks `task.user.toString() === req.user._id.toString()`.
5. **Safe Errors**: In production mode, database internals and stack traces are suppressed, returning clean JSON messages.
6. **Strict CORS**: Origin whitelist limits cross-origin access exclusively to the React client origin.

---

## 7. Submission Checklist Verification

- [x] Repository initialized with clean `.gitignore` (no `node_modules` or `.env` committed).
- [x] Clear separation of concerns between `client/` and `server/`.
- [x] RESTful API endpoints with appropriate status codes (`200`, `201`, `400`, `401`, `403`, `404`, `500`).
- [x] User registration, login, and authenticated JWT protected routes.
- [x] Four UI states verified on screens: Loading, Success, Empty, Error.
- [x] Responsive layout designed mobile-first and tested across breakpoints.
- [x] Comprehensive documentation and setup instructions provided.
