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

### Prerequisites
- Docker and Docker Compose (recommended)
- Node.js 18+ (for local development)
- PostgreSQL 14+ (if not using Docker)

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`
- **Access**: http://localhost:3002/admin

⚠️ **Change the default password after first login!**

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd checkin-face
```

2. Install dependencies
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install  # or pip install -r requirements.txt
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up database
```bash
# Run migrations
npm run migrate  # or python manage.py migrate
```

5. Create admin user
```bash
# Using Docker (recommended)
./scripts/create-admin-docker.sh

# Or with custom credentials
./scripts/create-admin-docker.sh username email@example.com password
```

6. Start development servers (if not using Docker)
```bash
# Frontend (from frontend directory)
npm run dev

# Backend (from backend directory)
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

