# Employee Check-In System

A comprehensive multi-modal employee check-in system supporting face recognition, fingerprint scanning, RFID/NFC tags, and manual name search.

## Features

- 🔐 **Multi-Modal Authentication**: Face recognition, fingerprint, RFID/NFC tags, and name search
- ⏰ **Real-Time Check-In/Out**: Instant attendance tracking
- 📊 **Dashboard & Reports**: Comprehensive attendance analytics
- 👥 **Employee Management**: Complete CRUD operations for employee profiles
- 🔒 **Secure & Private**: Encrypted biometric data storage
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React.js / Next.js
- TypeScript
- Tailwind CSS / Material-UI
- Redux Toolkit / Zustand

### Backend
- Node.js / Python (FastAPI)
- PostgreSQL
- Redis
- JWT Authentication

### Face Recognition
- face-api.js / MediaPipe
- face_recognition (Python)

## Getting Started

### Quick Start (Recommended - Using Docker)

1. **Start Docker containers**:
   ```bash
   cd docker
   docker-compose up -d
   ```

2. **Create admin user**:
   ```bash
   cd ..
   ./scripts/create-admin-docker.sh
   ```

3. **Access the application**:
   - Frontend: http://localhost:3002
   - Admin Panel: http://localhost:3002/admin
   - Default credentials: `admin` / `admin123`

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`
- **Access**: http://localhost:3002/admin

⚠️ **Change the default password after first login!**

### Manual Installation (Without Docker)

1. Install dependencies
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

2. Set up PostgreSQL database
```bash
# Create database
createdb checkin_db

# Run schema
psql -d checkin_db -f database/schema.sql
```

3. Configure environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Create admin user
```bash
cd backend
npm run seed  # Creates default admin user
```

5. Start servers
```bash
# Backend (from backend directory)
npm run dev

# Frontend (from frontend directory, new terminal)
npm run dev
```

## Project Structure

See [PRD.md](./prd.md) for complete project structure and implementation details.

## Documentation

- [PRD](./prd.md) - Product Requirements Document
- [API Documentation](./docs/api.md) - API endpoints and usage
- [Setup Guide](./docs/setup.md) - Detailed setup instructions
- [Deployment Guide](./docs/deployment.md) - Production deployment

## Development Tasks

See [PRD.md](./prd.md#62-implementation-tasks) for the complete list of implementation tasks organized by phase.

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit a pull request

## License

[Your License Here]

## Support

For issues and questions, please open an issue in the repository.

