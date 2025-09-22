# 🚀 Task Management Backend

## Quick Setup

### Start the Server
```bash
# Start the complete task management server
node simple-nestjs-server.js
```

**Features:**
- ✅ Complete task management API
- ✅ JWT authentication
- ✅ RBAC enforcement
- ✅ Audit logging
- ✅ NestJS-style responses
- ✅ Production-ready structure

**Server starts on `http://localhost:3000`**

## Test the API

### Automated Testing
```bash
# Test the complete API
node test-nestjs-endpoints.js
```

## API Endpoints

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

## Example Usage

### 1. Register User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"user","password":"password123","firstName":"John","lastName":"Doe"}'
```

### 2. Login User
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### 3. Create Task
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Task","description":"Task description","priority":"high","isPublic":true}'
```

### 4. List Tasks
```bash
curl -X GET http://localhost:3000/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Update Task
```bash
curl -X PUT http://localhost:3000/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Task","status":"in_progress"}'
```

### 6. View Audit Logs (Admin/Owner only)
```bash
curl -X GET http://localhost:3000/tasks/audit-log \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Features

- ✅ JWT Authentication
- ✅ User Registration/Login
- ✅ Password Hashing
- ✅ Complete Task Management
- ✅ RBAC (Role-Based Access Control)
- ✅ Audit Logging
- ✅ NestJS-style Responses
- ✅ Pagination & Filtering
- ✅ Error Handling
- ✅ CORS Enabled
- ✅ Input Validation

**No database setup required - uses in-memory storage for simplicity.**

## Environment Configuration

### .env File Setup
Create a `.env` file in the project root with the following variables:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-long-and-complex
JWT_EXPIRES_IN=24h

# Password Hashing
BCRYPT_ROUNDS=10

# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (for future use)
# DATABASE_URL=sqlite:database.sqlite
# DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# CORS Configuration
CORS_ORIGIN=*

# Logging
LOG_LEVEL=info

# Security
SESSION_SECRET=your-session-secret-change-this-in-production
```

### Security Notes
- **JWT_SECRET**: Use a cryptographically secure random string (64+ characters)
- **Never commit .env to git** - Environment variables contain sensitive data
- **Generate different secrets** for different environments (dev/staging/prod)

### Generate Secure JWT Secret
```bash
# Generate a secure JWT secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```
