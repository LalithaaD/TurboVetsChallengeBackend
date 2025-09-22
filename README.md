# TurboVets - Task Management System

A complete task management system with JWT authentication, RBAC, and audit logging.

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd my-personal-project
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Generate secure JWT secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Update .env file with the generated secret
```

### 3. Start Server
```bash
node simple-nestjs-server.js
```

### 4. Test API
```bash
node test-nestjs-endpoints.js
```

## 📋 Features

- ✅ **Complete Task Management** - CRUD operations for tasks
- ✅ **JWT Authentication** - Secure user authentication
- ✅ **RBAC** - Role-based access control
- ✅ **Audit Logging** - Track all user actions
- ✅ **NestJS-style API** - Production-ready responses
- ✅ **Input Validation** - Comprehensive request validation
- ✅ **CORS Support** - Cross-origin resource sharing
- ✅ **Pagination & Filtering** - Advanced query capabilities

## 🔗 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Health check | No |
| POST | `/auth/register` | Register user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/profile` | Get profile | Yes |
| POST | `/tasks` | Create task | Yes |
| GET | `/tasks` | List tasks | Yes |
| PUT | `/tasks/:id` | Update task | Yes |
| DELETE | `/tasks/:id` | Delete task | Yes |
| GET | `/tasks/audit-log` | View audit logs | Yes (Admin/Owner) |

## 🔐 Security

- **JWT Secret**: Cryptographically secure random generation
- **Password Hashing**: bcrypt with configurable rounds
- **RBAC**: Role-based permissions (Owner > Admin > Viewer)
- **Audit Logging**: Complete action tracking
- **Environment Variables**: Secure configuration management

## 📚 Documentation

- [Backend Setup Guide](BACKEND_SETUP.md)
- [Complete Project Documentation](DATA_MODELS.md)
- [API Documentation](TASK_API_DOCUMENTATION.md)

## 🛠 Development

### Environment Variables
See `.env.example` for required environment variables.

### Generate Secure JWT Secret
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

### Testing
```bash
# Run comprehensive test suite
node test-nestjs-endpoints.js

# Manual testing
curl -X GET http://localhost:3000/
```

## 📄 License

This project is licensed under the MIT License.
