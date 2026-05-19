# 🎓 Student Management System

A premium, modern, and highly secure full-stack Student Management System. This application is engineered with a robust **ASP.NET Core (Web API) backend**, a responsive **React 18 frontend**, and a lightweight **SQLite database**. It features role-based access control (RBAC), secure JWT session management with auto-logout, interactive student dashboards, administrative attendance tracking, engineering course enrollment, and professional data exports.

---

## 🏗️ Architecture Overview

The project is structured as a single unified workspace divided into two main layers:
*   **Backend (`/`)**: ASP.NET Core Web API serving as the secure RESTful interface. Built with Entity Framework Core, JWT bearer authentication, and automatic SQLite migrations.
*   **Frontend (`/ClientApp`)**: A Single Page Application (SPA) powered by React 18, React Router v6, and modern styling. Employs axios interceptors and Context API for global state management and session tracking.

```
StudentManagementSystem/
├── ClientApp/                    # React 18 Frontend
│   ├── public/                   # Static public assets
│   ├── src/
│   │   ├── components/           # Core components (Dashboards, Auth, Attendance, Courses)
│   │   │   ├── AdminDashboard/   # Admin controls, Search, Filters, and Excel Export
│   │   │   ├── Attendance/       # Mark and track student attendance history
│   │   │   ├── Auth/             # Login and Signup forms
│   │   │   ├── CourseEnrollment/ # Course catalogs and registration
│   │   │   ├── StudentDashboard/ # Student profile management & viewing
│   │   │   ├── Sidebar.jsx       # Dynamic navigation sidebar (role-dependent)
│   │   │   └── StudentList.jsx   # Read-only student details view
│   │   ├── context/              # Context API (AuthContext for session timing)
│   │   ├── services/             # Axios API client integrations
│   │   ├── App.jsx               # Application routes & layout
│   │   └── index.js              # Entrypoint
│   └── package.json              # NPM dependencies & scripts
├── Controllers/                  # API Controllers (Auth, Students, Courses, Attendance)
├── Data/                         # Entity Framework DbContext
├── DTOs/                         # Data Transfer Objects for API contracts
├── Migrations/                   # EF Core Database migrations
├── Models/                       # Core database schema models
├── Services/                     # Business logic services (Auth, Token, Student)
├── Program.cs                    # Server bootstrap & services pipeline
├── app.db                        # SQLite database file (automatically created)
├── appsettings.json              # Server configurations (Connection Strings, JWT limits)
└── README.md                     # Documentation
```

---

## ✨ Key Features

### 🔐 1. Role-Based Access Control (RBAC) & Authentication
*   **Secure Sign Up & Log In**: Separate dashboards tailored automatically for **Students** and **Administrators**.
*   **BCrypt Password Hashing**: Passwords are saved using salt-hashed hashes (never as plaintext).
*   **Protected Frontend Routes**: React Router guards prevent unauthorized access to restricted views.

### ⏳ 2. 10-Minute JWT Session Expiration & Auto-Logout
*   **JWT Session Timing**: Configurable token expiration (configured to **10 minutes** in `appsettings.json`).
*   **Dynamic Warnings**: The frontend detects JWT token expiry and issues a toast warning **1 minute before** your session expires, asking you to save your work.
*   **Auto-Logout Security**: Instantly invalidates local session tokens and redirects to the login screen when time runs out.

### 👥 3. Separated Administrative Dashboards
*   **Dashboard (`/admin/dashboard`)**: Admin control panel for student directory administration. Features complete Create-Read-Update-Delete (CRUD) actions.
*   **Read-Only Student Details (`/students`)**: A clean read-only directory view for viewing student details without accidentally editing or deleting records.
*   **Edit/Update Directory (`/students/edit`)**: Dedicated interface for editing profile details (Address limit: 50 characters, Phone: 10 digits validation) and changing status (Active/Inactive).

### 📊 4. Daily Attendance Tracking
*   **Mark Daily Attendance**: Admins can select any student, pick a calendar date, and log them as **Present** or **Absent**.
*   **Historical Records**: A clean table showing full attendance logs, complete with status tags and deletion capability.
*   **Paginated History**: Limits display list to 10 entries per page.

### 🎓 5. Engineering Course Enrollment
*   **Course Catalog**: Students can view a catalog of available courses.
*   **One-Click Enrollment**: Students can register for standard courses directly.
*   **Enrollment History**: Displays the student's current enrollments and registration timestamps.

### 📥 6. Professional Excel Data Exports
*   **One-Click Download**: Admins can export the entire student directory to an Excel spreadsheet (`.xlsx`) at any time.
*   **Clean Formatting**: Generates columns for First Name, Last Name, Email, Phone, Address, Status, and Registration Date.

### 📑 7. Dynamic Data Pagination
*   **Pagination Control**: Admins can navigate large student rosters and attendance lists with ease.
*   **Limit**: Caps tables to **10 records per page**.

---

## 🗄️ Database Schema

The database runs on **SQLite** and is structured as follows:

### 1. `Users` Table
*   `UserId` (PK, Integer, Auto-increment)
*   `Email` (Text, Unique)
*   `PasswordHash` (Text)
*   `Role` (Text: "Admin" or "Student")
*   `CreatedAt`, `UpdatedAt` (DateTime)

### 2. `Students` Table
*   `StudentId` (PK, Integer, Auto-increment)
*   `UserId` (FK to `Users.UserId`)
*   `FirstName` (Text)
*   `LastName` (Text)
*   `Address` (Text, Max 50 Characters)
*   `PhoneNumber` (Text, Exact 10 Digits)
*   `IsActive` (Boolean)
*   `CreatedAt`, `UpdatedAt` (DateTime)

### 3. `Courses` Table
*   `CourseId` (PK, Integer, Auto-increment)
*   `CourseName` (Text)
*   `CourseCode` (Text)

### 4. `Enrollments` Table
*   `EnrollmentId` (PK, Integer, Auto-increment)
*   `StudentId` (FK to `Students.StudentId`)
*   `CourseId` (FK to `Courses.CourseId`)
*   `EnrolledAt` (DateTime)

### 5. `Attendances` Table
*   `AttendanceId` (PK, Integer, Auto-increment)
*   `StudentId` (FK to `Students.StudentId`)
*   `Date` (DateTime)
*   `IsPresent` (Boolean)

---

## 🚀 Setup & Execution Guide

Follow these steps to configure, build, and run the project locally.

### 📋 Prerequisites
*   [.NET Core SDK (v7.0 or v8.0)](https://dotnet.microsoft.com/download)
*   [Node.js (v16.0 or higher)](https://nodejs.org/) & npm

---

### 💻 Step 1: Backend Setup (ASP.NET Core Web API)

1.  Open your terminal and navigate to the project root:
    ```bash
    cd StudentManagementSystem
    ```
2.  Review configurations in `appsettings.json`:
    ```json
    {
      "ConnectionStrings": {
        "DefaultConnection": "Data Source=app.db"
      },
      "JwtSettings": {
        "Secret": "your-super-secret-key-min-32-characters-long-key-12345",
        "Issuer": "StudentManagementSystem",
        "Audience": "StudentManagementSystemUsers",
        "ExpirationMinutes": "10"
      }
    }
    ```
3.  **Restore packages & build the API**:
    ```bash
    dotnet restore
    dotnet build
    ```
4.  **Run migrations** (SQLite Database will automatically generate on launch. If you need to manually apply them, run the following):
    ```bash
    dotnet ef database update
    ```
5.  **Start the Backend server**:
    ```bash
    dotnet run
    ```
    *   The API server will launch and run locally (e.g., `http://localhost:5000` or `https://localhost:5001`).
    *   **Interactive Swagger Documentation** is available at: `http://localhost:5000/swagger` (or `https://localhost:5001/swagger`).

---

### 🎨 Step 2: Frontend Setup (React 18 SPA)

1.  Open a new terminal window and navigate to the React folder:
    ```bash
    cd StudentManagementSystem/ClientApp
    ```
2.  **Install frontend dependencies**:
    ```bash
    npm install
    ```
3.  **Start the React development server**:
    ```bash
    npm start
    ```
    *   This will boot up the React server on `http://localhost:3000` and automatically proxy API calls to the backend running on `http://localhost:5000`.

---

## 👤 Test Accounts & Credentials

To explore role-based permissions immediately without manual registrations:

| Role | Username / Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@test.com` | `Admin@1234` |
| **Student** | `student@test.com` | `Test@1234` |

*Note: You can register custom accounts for both roles at any time using the Signup route.*

---

## 🔌 Core API Endpoints

### 🔐 Authentication
*   `POST /api/auth/signup` - Register a new user (and auto-create Student profiles if role is "Student").
*   `POST /api/auth/login` - Authenticate users and return JWT Bearer token.

### 👥 Student Directory (Admin Only)
*   `GET /api/students` - Retrieve list of all students (with search, status filters, and pagination details).
*   `GET /api/students/{id}` - Retrieve details of a specific student.
*   `PUT /api/students/{id}` - Update student record (Address, Name, Phone, and Active status).
*   `DELETE /api/students/{id}` - Remove student profile and login credentials.

### 🧑‍🎓 Student Profile (Student Self-Service)
*   `GET /api/students/profile/me` - Retrieve authenticated student profile.
*   `PUT /api/students/profile/me` - Self-update personal info (First/Last Names, Phone, and Address).

### 🎓 Engineering Course Management
*   `GET /api/courses` - Fetch catalog of engineering courses.
*   `POST /api/courses/enroll` - Enroll in a course (requires CourseId).
*   `GET /api/courses/my-enrollments` - Fetch course registration history for the logged-in student.

### 📅 Attendance Logs
*   `POST /api/attendance` - Mark daily attendance status (Admin only).
*   `GET /api/attendance` - Fetch complete list of logged attendance records (Admin only).
*   `DELETE /api/attendance/{id}` - Delete a marked attendance entry (Admin only).

---

## 🧪 Testing Checklist

Verify your installation by completing the following test flows:

*   [ ] **SQLite Database Creation**: Run the backend and verify `app.db` was created in the project folder.
*   [ ] **User Onboarding**: Go to `/signup`, register a new user, and verify authentication succeeds.
*   [ ] **Dashboard Division**:
    *   Log in as `student@test.com` -> Verify you only see **Dashboard** and **Enroll in Courses** tabs.
    *   Log in as `admin@test.com` -> Verify you see **Dashboard**, **Viewing Student Details**, **Manage Enrollments**, and **Attendance Tracking**.
*   [ ] **Profile Limitations**: Try updating your student profile with an 11-digit phone number or a 60-character address. Check if client-side validation flags it.
*   [ ] **JWT Expiry Warnings**: Log in and wait 9 minutes. Verify that a yellow session-expiry toast notifies you 1 minute before the auto-logout trigger.
*   [ ] **Excel Export**: Log in as an administrator, click `📥 Export to Excel`, and confirm the `.xlsx` sheet downloads correctly.
*   [ ] **Roster Pagination**: Check that administrative tables show pagination controls when more than 10 records exist.

---

## 🛠️ Troubleshooting & Support

### ❌ Port Conflict (e.g., Port `3000` or `5000` is already in use)
Run the following commands to find and stop running instances on those ports:
*   **Windows**:
    ```powershell
    netstat -ano | findstr :5000
    taskkill /F /PID <PID>
    ```
*   **macOS / Linux**:
    ```bash
    lsof -i :5000
    kill -9 <PID>
    ```

### ❌ Database Migrations Incomplete / SQLite Locks
If you encounter database connectivity issues or schema mismatches:
1.  Stop the backend application.
2.  Delete the existing `app.db` file (if present) from your directory.
3.  Execute `dotnet ef database update` to rebuild the schema from scratch.

### ❌ Node Modules / Package Installs Fail
1.  Navigate to `ClientApp` folder: `cd ClientApp`
2.  Clean NPM cache and folders:
    ```bash
    npm cache clean --force
    rm -rf node_modules package-lock.json
    npm install
    ```

---

*Enjoy developing and managing with the Student Management System! 🚀*
