# 🔐 JWT Authentication Backend

## Quick Setup

### 1. Navigate to API directory
```bash
cd apps/api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the server
```bash
node simple-server.js
```

**Server will start on `http://localhost:3000`**

## Test the API
```bash
# Run the test script
node test-simple-auth.js
```

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Health check | No |
| POST | `/auth/register` | Register user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/profile` | Get profile | Yes |
| POST | `/auth/refresh` | Refresh token | Yes |
| GET | `/users/me` | Get current user | Yes |

## Example Usage

### Register
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"user","password":"password123","firstName":"John","lastName":"Doe"}'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Access Protected Route
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Features
- ✅ JWT Authentication
- ✅ User Registration/Login
- ✅ Password Hashing
- ✅ Protected Routes
- ✅ Token Refresh
- ✅ CORS Enabled
- ✅ Input Validation

**No database setup required - uses in-memory storage for simplicity.**
