# Employee Portal Documentation

## Overview

The Employee Portal allows employees to:
- Login with Employee ID + PIN or Username + Password
- View their attendance records and statistics
- See presence and absence counts
- Request leave/vacation (congé/vacances)
- Track leave request status

## Features

### 1. Employee Login
- **Quick Login**: Employee ID + PIN (4-6 digits)
- **Full Login**: Username + Password
- Secure JWT token authentication

### 2. Employee Dashboard
- **Attendance Statistics**:
  - Attendance rate percentage
  - Present days count
  - Absent days count
  - Check-in/check-out counts
- **Visual Charts**: Progress bars showing presence vs absence
- **Month/Year Selection**: View stats for any month/year

### 3. Leave Requests
- **Request Types**:
  - Vacation (Congé/Vacances)
  - Sick Leave
  - Personal
  - Other
- **Features**:
  - Select start and end dates
  - Automatic day calculation
  - Optional reason field
  - View request status (pending, approved, rejected)
  - Track approved leave days

### 4. Attendance Records
- View personal attendance history
- Filter by date range
- See check-in/check-out times
- View authentication method used

## Access

**URL**: http://localhost:3002/employee/login

## Setup Employee Credentials

### Option 1: Create Employee Credentials via Admin Panel
1. Login as admin
2. Go to Employee Management
3. Select an employee
4. Add PIN or username/password credentials

### Option 2: Direct Database Insert
```sql
-- Insert employee credentials
INSERT INTO employee_credentials (employee_id, pin_code)
SELECT id, '1234'  -- Set PIN
FROM employees
WHERE employee_id = 'EMP001';
```

## API Endpoints

### Employee Authentication
- `POST /api/employee/auth/login` - Employee login
- `GET /api/employee/auth/me` - Get current employee (authenticated)

### Attendance (Employee)
- `GET /api/attendance/my-attendance` - Get my attendance records
- `GET /api/attendance/my-stats` - Get my attendance statistics

### Leave Requests
- `POST /api/leave-requests` - Create leave request
- `GET /api/leave-requests/my-requests` - Get my leave requests
- `GET /api/leave-requests/my-stats` - Get my leave statistics

## Usage Examples

### Login Request
```bash
# PIN Login
curl -X POST http://localhost:8000/api/employee/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "EMP001",
    "pin": "1234"
  }'

# Username/Password Login
curl -X POST http://localhost:8000/api/employee/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.doe",
    "password": "password123"
  }'
```

### Create Leave Request
```bash
curl -X POST http://localhost:8000/api/leave-requests \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "leave_type": "vacation",
    "start_date": "2025-02-01",
    "end_date": "2025-02-05",
    "reason": "Family vacation"
  }'
```

## Database Schema

### Leave Requests Table
```sql
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY,
    employee_id UUID REFERENCES employees(id),
    leave_type VARCHAR(50) CHECK (leave_type IN ('vacation', 'sick', 'personal', 'other')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT
);
```

### Employee Credentials Table
```sql
CREATE TABLE employee_credentials (
    id UUID PRIMARY KEY,
    employee_id UUID UNIQUE REFERENCES employees(id),
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    pin_code VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP
);
```

## Admin Features

Admins can:
- View all leave requests
- Approve/reject leave requests
- Set employee PINs
- Create employee usernames/passwords
- View employee attendance statistics

## Security

- JWT token-based authentication
- PIN codes are stored securely
- Passwords are hashed with bcrypt
- Employee tokens expire after 24 hours
- Role-based access control

## Future Enhancements

- Email notifications for leave approvals
- Calendar view of leave requests
- Leave balance tracking
- Multi-language support (French/English)
- Mobile app support

