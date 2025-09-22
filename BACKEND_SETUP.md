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
