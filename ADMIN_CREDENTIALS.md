# Admin Credentials

## Default Admin Account

**Username**: `admin`  
**Password**: `admin123`  
**Email**: `admin@example.com`  
**Role**: `admin`

## Access Points

- **Admin Panel**: http://localhost:3002/admin
- **Dashboard**: http://localhost:3002/dashboard
- **Check-In Page**: http://localhost:3002/checkin
- **Backend API**: http://localhost:8000

## ⚠️ Security Warning

**IMPORTANT**: Change the default password immediately after first login!

The default password is for development/testing purposes only. In production, you must:
1. Change the admin password
2. Use strong, unique passwords
3. Enable additional security measures

## Creating Additional Admin Users

### Option 1: Using the Script (Recommended)

```bash
./scripts/create-admin-docker.sh [username] [email] [password]
```

Example:
```bash
./scripts/create-admin-docker.sh manager manager@example.com SecurePass123!
```

### Option 2: Via Admin Panel

1. Login to http://localhost:3002/admin
2. Go to Admin Dashboard
3. Navigate to User Management (when implemented)
4. Create new admin user

### Option 3: Direct SQL (Advanced)

```bash
docker exec -it checkin-postgres psql -U postgres -d checkin_db
```

Then run:
```sql
-- Hash password first (use Node.js or bcrypt)
-- Then insert:
INSERT INTO users (username, email, password_hash, role)
VALUES ('newadmin', 'newadmin@example.com', '<hashed_password>', 'admin');
```

## User Roles

- **admin**: Full access to all features
- **manager**: Can manage employees and view reports
- **viewer**: Read-only access

## Troubleshooting

If you cannot login:
1. Verify the database is running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify user exists: Check database directly
4. Try resetting password using the script

## Password Reset

To reset the admin password:

```bash
./scripts/create-admin-docker.sh admin admin@example.com newpassword123
```

This will update the existing admin user's password.

