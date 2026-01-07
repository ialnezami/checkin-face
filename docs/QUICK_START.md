# Quick Start Guide

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- PostgreSQL 14+ (if not using Docker)

## Getting Started

### 1. Clone and Setup

```bash
git clone <repository-url>
cd checkin-face
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your configuration:

```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Start with Docker

```bash
cd docker
docker-compose up --build -d
```

This will start:
- PostgreSQL database on port 5433
- Redis on port 6379
- Backend API on port 8000
- Frontend on port 3002

### 4. Initialize Database

The database schema is automatically created when PostgreSQL starts. To create an admin user:

```bash
# Connect to database
docker exec -it checkin-postgres psql -U postgres -d checkin_db

# Insert admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@example.com', '$2a$10$rOzJqKqKqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'admin');
```

### 5. Download Face Recognition Models

```bash
cd backend
mkdir -p models
cd models

# Download models (see backend/MODELS_SETUP.md for details)
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-weights_manifest.json
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-shard1
# ... (download other models)
```

### 6. Access the Application

- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:8000
- **Health Check**: http://localhost:8000/health
- **Admin Panel**: http://localhost:3002/admin

## Default Credentials

- **Username**: admin
- **Password**: admin123 (change in production!)

## Development

### Backend Development

```bash
cd backend
npm install
npm run dev
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - List employees
- `POST /api/employees` - Create employee
- `GET /api/employees/:id` - Get employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `POST /api/employees/:id/enroll` - Enroll auth method

### Attendance
- `POST /api/attendance/checkin/face` - Check-in with face
- `POST /api/attendance/checkin/rfid` - Check-in with RFID
- `POST /api/attendance/checkin/manual` - Manual check-in
- `POST /api/attendance/checkout/:employeeId` - Check-out
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/dashboard` - Get dashboard stats

### Reports
- `GET /api/reports/daily` - Daily report
- `GET /api/reports/weekly` - Weekly report
- `GET /api/reports/monthly` - Monthly report
- `GET /api/reports/department` - Department report
- `GET /api/reports/export/csv` - Export CSV
- `GET /api/reports/export/json` - Export JSON

### Admin
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `GET /api/admin/audit-logs` - Get audit logs
- `POST /api/admin/backup` - Create backup
- `GET /api/admin/backups` - List backups
- `POST /api/admin/restore` - Restore backup

## Troubleshooting

### Port Already in Use

If ports 3002, 8000, or 5433 are already in use, update `docker/docker-compose.yml` to use different ports.

### Database Connection Issues

Check that PostgreSQL container is running:
```bash
docker-compose ps
```

### Face Recognition Not Working

Ensure face recognition models are downloaded to `backend/models/` directory.

### Permission Denied

Make sure Docker has proper permissions and volumes are accessible.

## Next Steps

1. Create employees via Admin Panel
2. Enroll authentication methods for employees
3. Test check-in functionality
4. View reports and analytics
5. Configure system settings

For detailed documentation, see:
- [PRD.md](../prd.md) - Product Requirements
- [TASKS.md](../TASKS.md) - Implementation Tasks
- [README.md](../README.md) - Project Overview

