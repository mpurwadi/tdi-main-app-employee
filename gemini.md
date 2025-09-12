**Database Configuration**
DB_HOST=localhost
DB_USER=mpurwadi
DB_PASSWORD=pratista17
DB_NAME=opsapps
DB_PORT=5432
DB_SSLMODE=disable

## TDI Employee Management System - Full Stack Implementation

### New Features Implemented

#### 1. Landing Page
A new landing page has been created at the root path (`/`) with the following elements:
- **Title (h1)**: "Sistem Manajemen Karyawan TDI"
- **Subtitle (p)**: "Solusi terintegrasi untuk manajemen absensi, logbook, dan operasional kantor."
- **Description**: "Memungkinkan karyawan dan admin mengelola absensi, logbook harian, dan jadwal kerja remote dalam satu platform yang mudah digunakan."
- **CTA Buttons**:
  - "Login": Redirects users to the login page (`/auth/boxed-signin`)
  - "Daftar": Redirects users to the registration page (`/auth/boxed-signup`)

The landing page features:
- Modern design with Tailwind CSS
- Responsive layout for all device sizes
- Features section showcasing main capabilities
- Footer with "Made with Love by mpurwadi"

#### 2. Custom Registration Form
A new custom registration form has been implemented with the following fields:
- Full Name
- Email
- Password (with strength validation)
- Password Confirmation (with match validation)
- Student ID
- Campus
- Division (dropdown with options: BA, QA, Developer, UIUX, Multimedia, Helpdesk)

The form includes:
- Comprehensive validation for all fields
- Visual error indicators
- Password strength requirements (8+ characters, uppercase, lowercase, number)
- Integration with the existing Vristo template design
- Backend API integration for user registration

#### 3. User Approval Workflow
A complete user registration and approval workflow has been implemented:
- New users register through the custom form
- All new users have a default status of "pending"
- Admin users can approve or reject pending users
- Only approved users can log in to the system

#### 4. Role-Based Access Control
Three user roles have been implemented:
- **Super Admin**: Full system access
- **Admin**: Can approve/reject users and manage system settings
- **User**: Regular employee with access to their dashboard


### API Endpoints
- `POST /api/auth/register` - Register a new user
- `GET /api/admin/users` - Get all pending users (admin only)
- `PUT /api/admin/users/status` - Update user status (admin only)

### Technical Specifications
- **Framework**: Next.js App Router (using Vristo template)
- **Styling**: Tailwind CSS v3
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **UI Components**: Custom components built with Tailwind CSS following Vristo design patterns
- **Validation**: Client-side and server-side validation with real-time feedback
- **Responsiveness**: Mobile-first approach with responsive design for all screen sizes
- **Security**: Password hashing, JWT tokens, and role-based access control

### Component Structure
- `components/landing/landing-page.tsx` - Main landing page component
- `components/auth/custom-register-form.tsx` - Custom registration form component
- `components/admin/user-approval.tsx` - Admin user approval component

### Database Schema
The system uses a PostgreSQL database with the following schema:

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    student_id VARCHAR(50),
    campus VARCHAR(100),
    division VARCHAR(50),
    full_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    role VARCHAR(20) DEFAULT 'user', -- superadmin, admin, user
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Form Validation Rules
- Full Name: Required field
- Email: Must be a valid email format
- Password: Minimum 8 characters with at least one uppercase letter, one lowercase letter, and one number
- Password Confirmation: Must match the password field
- Student ID: Required field
- Campus: Required field
- Division: Required selection from dropdown options

### Database Setup
The database has been successfully initialized with:
- Users table created
- Indexes for email, status, and role created
- Super admin user created (admin@tdi.com / AdminPassword123!)

See `DATABASE_SETUP.md` for detailed setup instructions.

### Testing
See `TESTING.md` for detailed instructions on testing the full registration and approval workflow.

The implementation maintains consistency with the existing Vristo template while adding the required custom functionality for a complete employee management system.

