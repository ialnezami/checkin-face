# Complete Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Start Docker Containers

```bash
cd docker
docker-compose up -d
```

Wait for all containers to be healthy (check with `docker-compose ps`).

### Step 2: Create Admin User

```bash
cd ..
./scripts/create-admin-docker.sh
```

Default credentials:
- **Username**: `admin`
- **Password**: `admin123`

### Step 3: Access the Application

- **Frontend**: http://localhost:3002
- **Admin Panel**: http://localhost:3002/admin
- **Check-In**: http://localhost:3002/checkin
- **Dashboard**: http://localhost:3002/dashboard

## 📋 Detailed Setup

### Prerequisites

- Docker Desktop installed and running
- At least 4GB RAM available
- Ports 3002, 8000, 5433, 6379 available

### Step-by-Step Instructions

#### 1. Clone and Navigate

```bash
cd /Users/ibrahimalnezami/Desktop/checkin-face
```

#### 2. Configure Environment (Optional)

Edit `docker/docker-compose.yml` if you need to change:
- Database credentials
- Port mappings
- Environment variables

#### 3. Start Services

```bash
cd docker
docker-compose up --build -d
```

This will:
- Build frontend and backend containers
- Start PostgreSQL database
- Start Redis cache
- Initialize database schema

#### 4. Verify Services

```bash
docker-compose ps
```

All services should show "Up" and "healthy" status.

#### 5. Create Admin User

```bash
cd ..
./scripts/create-admin-docker.sh
```

Or create custom admin:
```bash
./scripts/create-admin-docker.sh myadmin admin@company.com MySecurePass123
```

#### 6. (Optional) Download Face Recognition Models

For face recognition to work, download models:

```bash
cd backend
mkdir -p models
cd models

# Download required models (see backend/MODELS_SETUP.md)
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-weights_manifest.json
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-shard1
# ... (download other models)
```

#### 7. Test the System

1. **Login to Admin Panel**: http://localhost:3002/admin
   - Username: `admin`
   - Password: `admin123`

2. **Create an Employee**:
   - Go to Employee Management tab
   - Click "Add Employee"
   - Fill in details and save

3. **Enroll Authentication Method**:
   - Go to Enrollment tab
   - Select employee
   - Choose method (Face, RFID, or PIN)
   - Complete enrollment

4. **Test Check-In**:
   - Go to http://localhost:3002/checkin
   - Select authentication method
   - Test check-in

## 🔧 Troubleshooting

### Port Already in Use

If ports are occupied, edit `docker/docker-compose.yml`:

```yaml
ports:
  - "3003:3000"  # Change frontend port
  - "8001:8000"  # Change backend port
  - "5434:5432"  # Change database port
```

### Database Connection Error

```bash
# Check if database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Backend Not Starting

```bash
# Check backend logs
docker-compose logs backend

# Rebuild backend
docker-compose build backend
docker-compose up -d backend
```

### Frontend Not Loading

```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

### Cannot Create Admin User

```bash
# Verify database is accessible
docker exec -it checkin-postgres psql -U postgres -d checkin_db -c "SELECT COUNT(*) FROM users;"

# Try creating user directly
docker exec -it checkin-postgres psql -U postgres -d checkin_db
# Then run SQL commands from ADMIN_CREDENTIALS.md
```

## 📊 Verify Installation

### Check All Services

```bash
# Check container status
docker-compose ps

# Check backend health
curl http://localhost:8000/health

# Check frontend
curl http://localhost:3002
```

### Test API Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Login (get token)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 🎯 Next Steps After Setup

1. **Change Admin Password**: Login and update default password
2. **Add Employees**: Create employee records via admin panel
3. **Enroll Methods**: Set up authentication methods for employees
4. **Configure Settings**: Adjust system settings as needed
5. **Test Check-In**: Verify all authentication methods work
6. **Set Up Reports**: Configure reporting preferences

## 📚 Additional Resources

- [API Documentation](./docs/API.md) - Complete API reference
- [Quick Start Guide](./docs/QUICK_START.md) - Quick reference
- [Admin Credentials](./ADMIN_CREDENTIALS.md) - Login information
- [PRD](./prd.md) - Product requirements
- [Tasks](./TASKS.md) - Implementation tasks

## 🆘 Getting Help

If you encounter issues:

1. Check logs: `docker-compose logs [service-name]`
2. Verify containers: `docker-compose ps`
3. Restart services: `docker-compose restart`
4. Rebuild if needed: `docker-compose up --build -d`

## ✅ Success Checklist

- [ ] All Docker containers running
- [ ] Admin user created
- [ ] Can access frontend (http://localhost:3002)
- [ ] Can login to admin panel
- [ ] Can create employee
- [ ] Can enroll authentication method
- [ ] Can test check-in
- [ ] Can view dashboard

Once all items are checked, your system is ready to use! 🎉

