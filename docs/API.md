# API Documentation

## Base URL

```
http://localhost:8000/api
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

Response:
```json
{
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Employees

#### List Employees
```http
GET /api/employees?limit=50&offset=0&search=john
Authorization: Bearer <token>
```

#### Create Employee
```http
POST /api/employees
Authorization: Bearer <token>
Content-Type: application/json

{
  "employee_id": "EMP001",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "department": "Engineering",
  "position": "Developer"
}
```

#### Enroll Authentication Method
```http
POST /api/employees/:id/enroll
Authorization: Bearer <token>
Content-Type: application/json

{
  "method_type": "face",
  "method_data": "base64_image_data",
  "is_primary": true
}
```

### Attendance

#### Check-In with Face
```http
POST /api/attendance/checkin/face
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,..."
}
```

#### Check-In with RFID
```http
POST /api/attendance/checkin/rfid
Content-Type: application/json

{
  "tag_id": "RFID123456"
}
```

#### Manual Check-In
```http
POST /api/attendance/checkin/manual
Content-Type: application/json

{
  "employee_id": "EMP001",
  "pin": "1234"
}
```

#### Check-Out
```http
POST /api/attendance/checkout/:employeeId
```

#### Get Attendance Records
```http
GET /api/attendance?employee_id=uuid&start_date=2025-01-01&end_date=2025-01-31
```

#### Get Dashboard Data
```http
GET /api/attendance/dashboard
```

### Reports

#### Daily Report
```http
GET /api/reports/daily?date=2025-01-07
Authorization: Bearer <token>
```

#### Weekly Report
```http
GET /api/reports/weekly?start_date=2025-01-01
Authorization: Bearer <token>
```

#### Monthly Report
```http
GET /api/reports/monthly?year=2025&month=1
Authorization: Bearer <token>
```

#### Department Report
```http
GET /api/reports/department?date=2025-01-07
Authorization: Bearer <token>
```

#### Export CSV
```http
GET /api/reports/export/csv?start_date=2025-01-01&end_date=2025-01-31
Authorization: Bearer <token>
```

### Admin

#### List Users
```http
GET /api/admin/users
Authorization: Bearer <token>
```

#### Create User
```http
POST /api/admin/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "manager",
  "email": "manager@example.com",
  "password": "password123",
  "role": "manager"
}
```

#### Get Audit Logs
```http
GET /api/admin/audit-logs?limit=100&offset=0&action=employee.created
Authorization: Bearer <token>
```

#### Create Backup
```http
POST /api/admin/backup
Authorization: Bearer <token>
```

#### List Backups
```http
GET /api/admin/backups
Authorization: Bearer <token>
```

#### Restore Backup
```http
POST /api/admin/restore
Authorization: Bearer <token>
Content-Type: application/json

{
  "backup_path": "/path/to/backup.json"
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "errors": [
    {
      "msg": "Validation error",
      "param": "email"
    }
  ]
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

