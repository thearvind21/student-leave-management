
# Student Leave Management System Documentation

## Project Overview

The Student Leave Management System is a comprehensive web application designed to streamline and automate the process of applying for and managing student leave requests in educational institutions. The system provides different interfaces for students and administrators, allowing students to submit leave applications and administrators to review and manage these requests.

## Purpose

The purpose of this application is to:
- Replace manual paper-based leave request systems with a digital solution
- Provide a transparent system for students to track their leave application status
- Give administrators an efficient tool to manage and respond to student leave requests
- Maintain a digital record of all leave applications for future reference
- Reduce administrative overhead in the leave management process

## Technical Stack

- **Frontend**: React with TypeScript
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State Management**: Context API and React Query
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner Toast

## Application Structure

### Project Folder Structure

```
project-root/
├── public/               # Static assets and favicon
│   ├── favicon.ico       # Application favicon
│   ├── placeholder.svg   # Placeholder image
│   └── robots.txt        # SEO robots file
├── src/                  # Source code directory
│   ├── components/       # React components (organized by feature)
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   ├── pages/            # Page components
│   ├── services/         # Service layer for API calls
│   ├── App.tsx           # Root application component
│   ├── App.css           # Root styles
│   ├── main.tsx          # Application entry point
│   ├── index.css         # Global styles
│   └── vite-env.d.ts     # Type declarations
├── documentation.md      # Project documentation (this file)
├── README.md             # GitHub repository readme
├── index.html            # HTML entry point
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
├── tsconfig.json         # TypeScript configuration
├── tsconfig.node.json    # Node-specific TS config
├── tsconfig.app.json     # App-specific TS config
├── eslint.config.js      # ESLint configuration
├── components.json       # shadcn/ui component configuration
├── package.json          # Project dependencies and scripts
├── package-lock.json     # Locked dependencies versions
└── bun.lockb             # Bun package manager lockfile
```

## Detailed File Structure

### Source Directory (`src/`)

#### Components (`src/components/`)

##### Admin Components (`src/components/admin/`)
- `Dashboard.tsx`: Displays admin dashboard with analytics and charts for leave applications
- `LeaveManagement.tsx`: Interface for admins to review, approve, or reject leave applications

##### Authentication Components (`src/components/auth/`)
- `ForgotPassword.tsx`: Form for users to request password reset
- `Login.tsx`: Login form with tabs for student and admin access
- `Signup.tsx`: Registration form for new student accounts

##### Layout Components (`src/components/layout/`)
- `Footer.tsx`: Application footer with copyright and information
- `Layout.tsx`: Main layout wrapper for consistent page structure
- `Navbar.tsx`: Navigation bar with links and user account menu

##### Leave Management Components (`src/components/leave/`)
- `EmptyLeaveState.tsx`: Empty state display when no leaves are found
- `LeaveApplicationForm.tsx`: Form for students to submit new leave requests
- `LeaveFilters.tsx`: Search and filter controls for leave history
- `LeaveHistory.tsx`: Component to display student's leave history
- `LeaveStatusBadge.tsx`: Badge component showing leave status (pending, approved, rejected)
- `LeavesTable.tsx`: Table displaying leave applications with their details

##### UI Components (`src/components/ui/`)
Shadcn UI components collection including but not limited to:
- `accordion.tsx`: Collapsible accordion component
- `alert-dialog.tsx`: Alert dialog component
- `alert.tsx`: Alert component
- `avatar.tsx`: User avatar component
- `badge.tsx`: Badge/tag component
- `button.tsx`: Button component with variants
- `calendar.tsx`: Date picker calendar
- `card.tsx`: Card component with header, content, footer
- `checkbox.tsx`: Checkbox input component
- `dialog.tsx`: Modal dialog component
- `dropdown-menu.tsx`: Dropdown menu component
- `form.tsx`: Form utilities and components
- `input.tsx`: Text input component
- `label.tsx`: Form label component
- `select.tsx`: Dropdown select component
- `table.tsx`: Table component with header, body, rows
- `tabs.tsx`: Tabbed interface component
- `textarea.tsx`: Multiline text input component
- `toast.tsx`: Toast notification component
- And many more UI components

#### Context (`src/context/`)
- `AuthContext.tsx`: Authentication context provider for user login state and methods

#### Hooks (`src/hooks/`)
- `useLeaveHistory.ts`: Custom hook for leave history data and operations
- `use-mobile.tsx`: Hook to detect mobile viewport
- `use-toast.ts`: Hook for toast notifications
- Other utility hooks

#### Library (`src/lib/`)
- `utils.ts`: General utility functions used across the application

#### Pages (`src/pages/`)
- `Index.tsx`: Landing/home page
- `Login.tsx`: Login page
- `Signup.tsx`: Registration page
- `ForgotPassword.tsx`: Password recovery page
- `ApplyLeave.tsx`: Page for submitting leave applications
- `MyLeaves.tsx`: Page showing student's leave history
- `NotFound.tsx`: 404 error page

##### Admin Pages (`src/pages/admin/`)
- `Dashboard.tsx`: Admin dashboard page
- `Leaves.tsx`: Admin leave management page

#### Services (`src/services/`)
- `authService.ts`: Authentication service for login, signup, etc.
- `leaveService.ts`: Service for leave application CRUD operations

### Root Files
- `App.tsx`: Main application component with routing configuration
- `App.css`: Root-level styles
- `main.tsx`: Application entry point that renders the App component
- `index.css`: Global CSS styles including Tailwind imports
- `vite-env.d.ts`: TypeScript declaration file for Vite environment

## User Roles and Workflows

### Student Workflow
1. Student registers or logs in using student credentials
2. Student navigates to "Apply for Leave" page
3. Student fills leave application form with dates, type, and reason
4. Student submits the application
5. Student can view application status in "My Leaves" page

### Admin Workflow
1. Admin logs in using admin credentials
2. Admin views dashboard with leave statistics
3. Admin navigates to "Manage Leaves" to see pending applications
4. Admin reviews individual applications and approves or rejects them
5. Admin can add comments to explain decision

## Data Models

### User
- ID
- Name
- Email
- Password (hashed)
- Role (student/admin)
- Student ID (for students)

### Leave Application
- ID
- Student ID
- Student Name
- Start Date
- End Date
- Leave Type (medical, family emergency, etc.)
- Reason
- Status (pending, approved, rejected)
- Applied On (date)
- Comments (from admin)
- Attachments (optional)

## Current Status and Future Enhancements

### Current Status
The application currently has a fully functional UI with mock data integration. The frontend implements all required views and interactions for both students and administrators.

### Planned Enhancements
1. Integration with Supabase for database and authentication
2. Email notifications for leave status changes
3. File upload for supporting documents
4. Calendar view for leave applications
5. Mobile application version
6. Export functionality for reports
7. Integration with academic calendar
8. Automated leave balance calculation

## Installation and Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`
4. Build for production with `npm run build`

## Deployment

The application can be deployed to any static hosting service:
1. Build the application
2. Deploy the build directory
3. Configure environment variables if needed
4. Set up Supabase connection for database functionality

## Contributing

When contributing to this project, please follow the established coding standards:
1. Use TypeScript for all new code
2. Follow the component structure for new features
3. Write unit tests for business logic
4. Use the existing UI component library for consistency
