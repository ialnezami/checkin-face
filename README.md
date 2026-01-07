# AttendHub

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)

**A modern, comprehensive multi-modal employee attendance management system**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [API](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**AttendHub** is a production-ready employee attendance management system that supports multiple authentication methods including face recognition, RFID/NFC tags, fingerprint scanning, and manual name search. Built with modern web technologies, it provides real-time attendance tracking, comprehensive analytics, and a user-friendly interface.

### Key Highlights

- ✅ **Multi-Modal Authentication** - Support for face recognition, RFID/NFC, fingerprint, and manual check-in
- ✅ **Real-Time Tracking** - Instant attendance updates with live dashboard
- ✅ **Advanced Analytics** - Visual charts and reports for attendance insights
- ✅ **Secure & Private** - Encrypted biometric data storage
- ✅ **Mobile Responsive** - Works seamlessly on desktop and mobile devices
- ✅ **Docker Ready** - One-command deployment with Docker Compose

---

## ✨ Features

### 🔐 Authentication Methods
- **Face Recognition** - Advanced facial recognition using face-api.js
- **RFID/NFC Tags** - Quick tap-to-check-in with RFID/NFC cards
- **Fingerprint** - Biometric fingerprint scanning (hardware ready)
- **Manual Search** - Name or employee ID search with PIN verification

### 📊 Dashboard & Analytics
- Real-time attendance dashboard with live statistics
- Interactive charts (line, bar, pie) for attendance trends
- Department-wise attendance analytics
- Late arrival tracking and alerts
- Attendance history with date range filtering

### 👥 Employee Management
- Complete CRUD operations for employee profiles
- Multi-method enrollment wizard
- Employee search and filtering
- Status management (active/inactive)
- Face image management (multiple images per employee)

### 📈 Reporting
- Daily, weekly, and monthly attendance reports
- Department-wise reports
- Export to CSV and JSON formats
- Customizable date ranges
- Late arrival statistics

### 🔒 Security & Administration
- JWT-based authentication
- Encrypted biometric data storage (AES-256-GCM)
- Role-based access control (Admin, Manager, Viewer)
- Comprehensive audit logging
- Backup and restore functionality
- Rate limiting and security headers

### 🏢 Multi-Site Support
- Site-based configuration
- Manager-site assignments
- Site-specific authentication methods
- Work schedule management per site

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **State Management**: React Hooks, Zustand
- **HTTP Client**: Axios

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) 20+
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: TypeScript
- **Database**: [PostgreSQL](https://www.postgresql.org/) 15
- **Cache**: [Redis](https://redis.io/) 7
- **Authentication**: JWT (JSON Web Tokens)
- **Face Recognition**: [face-api.js](https://github.com/justadudewhohacks/face-api.js) + TensorFlow.js

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL with UUID extension
- **Cache**: Redis for session management

---

## 🚀 Quick Start

### Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Node.js](https://nodejs.org/) 18+ (for manual installation)
- [PostgreSQL](https://www.postgresql.org/download/) 15+ (for manual installation)

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd checkin-face
   ```

2. **Start all services**
   ```bash
   cd docker
   docker-compose up -d --build
   ```

3. **Create admin user**
   ```bash
   cd ..
   ./scripts/create-admin-docker.sh
   ```

4. **Access the application**
   - Frontend: http://localhost:3002
   - Admin Panel: http://localhost:3002/admin
   - API: http://localhost:8000
   - API Health: http://localhost:8000/health

5. **Login credentials**
   - Username: `admin`
   - Password: `admin123`
   
   ⚠️ **Important**: Change the default password after first login!

### Verify Installation

```bash
# Check container status
cd docker
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Test API health
curl http://localhost:8000/health
```

---

## 📦 Installation

### Manual Installation (Without Docker)

#### 1. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

#### 2. Set Up Database

```bash
# Create PostgreSQL database
createdb checkin_db

# Run database schema
psql -d checkin_db -f ../database/schema.sql

# Run migrations (if any)
psql -d checkin_db -f ../database/migrations/add_sites.sql
psql -d checkin_db -f ../database/migrations/add_work_schedules.sql
psql -d checkin_db -f ../database/migrations/add_manager_site_assignment.sql
```

#### 3. Configure Environment

Create `.env` files in both `frontend` and `backend` directories:

**Backend `.env`:**
```env
NODE_ENV=development
PORT=8000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=checkin_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key
FRONTEND_URL=http://localhost:3002
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### 4. Download Face Recognition Models

```bash
cd backend
npm run download-models
# Or manually download models to backend/models/ directory
```

#### 5. Create Admin User

```bash
cd backend
npm run seed
# Or use the script
../scripts/create-admin.sh
```

#### 6. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## ⚙️ Configuration

### Environment Variables

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed configuration options.

### Site Configuration

Configure sites and authentication methods:
- Access Admin Panel → Sites
- Create sites and enable authentication methods
- Assign managers to sites
- Set up work schedules

See [SITE_CONFIGURATION.md](./docs/SITE_CONFIGURATION.md) for details.

---

## 💻 Usage

### For Administrators

1. **Login** to http://localhost:3002/admin
2. **Create Employees** via Employee Management
3. **Enroll Authentication Methods** via Enrollment tab
4. **View Reports** via Reports tab
5. **Monitor Activity** via Audit Logs
6. **Backup Data** via Backup/Restore tab

### For Employees

1. Navigate to http://localhost:3002/checkin
2. Select authentication method:
   - Face Recognition (if enrolled)
   - RFID Tag (if enrolled)
   - Name Search (always available)
3. Complete check-in process
4. View attendance history on dashboard

### Employee Portal

Employees can access their portal at http://localhost:3002/employee/login to:
- View personal attendance history
- Request leave
- View attendance statistics

See [EMPLOYEE_PORTAL.md](./docs/EMPLOYEE_PORTAL.md) for details.

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Main Endpoints

#### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

#### Attendance
- `POST /api/attendance/checkin/face` - Face recognition check-in
- `POST /api/attendance/checkin/rfid` - RFID check-in
- `POST /api/attendance/checkin/manual` - Manual check-in
- `POST /api/attendance/checkout/:id` - Check-out
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/dashboard` - Dashboard statistics

#### Employees
- `GET /api/employees` - List employees
- `GET /api/employees/:id` - Get employee details
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `POST /api/employees/:id/enroll` - Enroll authentication method

#### Reports
- `GET /api/reports/daily` - Daily report
- `GET /api/reports/weekly` - Weekly report
- `GET /api/reports/monthly` - Monthly report
- `GET /api/reports/department` - Department report
- `GET /api/reports/export/csv` - Export CSV
- `GET /api/reports/export/json` - Export JSON

For complete API documentation, see [API.md](./docs/API.md).

---

## 📁 Project Structure

```
checkin-face/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   │   ├── admin/       # Admin pages
│   │   │   ├── checkin/     # Check-in page
│   │   │   ├── dashboard/  # Dashboard page
│   │   │   └── employee/   # Employee portal
│   │   ├── components/      # React components
│   │   │   ├── admin/       # Admin components
│   │   │   ├── analytics/   # Analytics components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── common/      # Common components
│   │   │   └── reports/     # Report components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   └── services/        # API services
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                 # Express.js backend API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── config/          # Configuration files
│   │   └── utils/           # Utilities
│   ├── logs/                # Application logs
│   └── package.json
│
├── database/                # Database scripts
│   ├── schema.sql           # Main database schema
│   └── migrations/         # Database migrations
│
├── docker/                  # Docker configuration
│   ├── docker-compose.yml   # Docker Compose config
│   └── Dockerfile.*         # Dockerfiles
│
├── docs/                    # Documentation
│   ├── API.md              # API documentation
│   ├── QUICK_START.md      # Quick start guide
│   ├── SITE_CONFIGURATION.md
│   └── EMPLOYEE_PORTAL.md
│
├── scripts/                 # Utility scripts
│   ├── create-admin.sh
│   ├── create-admin-docker.sh
│   └── start-docker.sh
│
└── Documentation files
    ├── prd.md              # Product Requirements Document
    ├── TASKS.md            # Implementation tasks
    ├── PROGRESS.md         # Progress tracking
    └── SETUP_GUIDE.md      # Setup guide
```

---

## 🔧 Development

### Running in Development Mode

```bash
# Backend (with hot reload)
cd backend
npm run dev

# Frontend (with hot reload)
cd frontend
npm run dev
```

### Building for Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

### Code Quality

```bash
# Linting
cd frontend && npm run lint
cd backend && npm run lint

# Type checking
cd frontend && npm run type-check
```

### Database Migrations

```bash
# Run migrations
psql -d checkin_db -f database/migrations/<migration-file>.sql
```

---

## 🐛 Troubleshooting

### Common Issues

#### Docker Issues

**Problem**: Containers won't start
```bash
# Check Docker status
docker ps

# View logs
cd docker && docker-compose logs

# Rebuild containers
docker-compose up -d --build
```

**Problem**: Port already in use
```bash
# Change ports in docker-compose.yml or stop conflicting services
lsof -ti:8000 | xargs kill -9  # Kill process on port 8000
lsof -ti:3002 | xargs kill -9  # Kill process on port 3002
```

#### Database Issues

**Problem**: Cannot connect to database
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check connection
psql -h localhost -p 5433 -U postgres -d checkin_db
```

#### Face Recognition Issues

**Problem**: Face recognition not working
- Ensure models are downloaded to `backend/models/`
- Check browser console for errors
- Verify camera permissions are granted
- See [MODELS_SETUP.md](./backend/MODELS_SETUP.md) for details

#### Frontend Build Issues

**Problem**: Module not found (recharts)
```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

- Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions
- Review [API.md](./docs/API.md) for API usage
- Open an issue in the repository

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow the existing code style
   - Write clear commit messages
   - Add tests if applicable
4. **Test your changes**
   ```bash
   npm test  # Run tests
   npm run lint  # Check code quality
   ```
5. **Submit a pull request**
   - Provide a clear description
   - Reference any related issues

### Development Guidelines

- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [face-api.js](https://github.com/justadudewhohacks/face-api.js) for face recognition capabilities
- [Next.js](https://nextjs.org/) for the amazing React framework
- [Express.js](https://expressjs.com/) for the robust backend framework
- All contributors and users of AttendHub

---

## 📞 Support

- **Documentation**: See [docs/](./docs/) directory
- **Issues**: Open an issue on GitHub
- **Email**: [Your Support Email]

---

<div align="center">

**Made with ❤️ for modern workforce management**

[⬆ Back to Top](#attendhub)

</div>
