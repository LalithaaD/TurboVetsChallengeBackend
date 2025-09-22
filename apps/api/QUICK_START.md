# 🚀 Quick Start Guide - JWT Authentication Backend

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn

## 🏃‍♂️ Quick Start (3 steps)

### 1. Install Dependencies
```bash
cd apps/api
npm install
```

### 2. Start the Server
```bash
node simple-server.js
```

### 3. Test the API
```bash
# Test in another terminal
node test-simple-auth.js
```

**That's it! Your JWT authentication backend is running on `http://localhost:3000`**

---

## 📋 Available Endpoints

### Public Endpoints (No authentication required)
- `GET /` - Health check
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Protected Endpoints (Require JWT token)
- `GET /auth/profile` - Get user profile
- `POST /auth/refresh` - Refresh JWT token
- `GET /users/me` - Get current user

---

## 🧪 Test the API

### Register a new user:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Access protected route (use token from login response):
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## 🔧 Optional: Environment Configuration

If you want to customize settings, create a `.env` file:

```bash
# Create .env file
echo "JWT_SECRET=my-custom-secret-key" > .env
echo "JWT_EXPIRES_IN=24h" >> .env
echo "PORT=3000" >> .env
```

**Note:** The server works fine without a `.env` file using default values.

---

## 🛠️ Development

### Start with auto-reload (if you have nodemon):
```bash
npx nodemon simple-server.js
```

### View logs:
The server shows all requests and responses in the console.

---

## ❓ Troubleshooting

### Port already in use:
```bash
# Kill existing process
pkill -f "node simple-server.js"
# Or change port in .env file
echo "PORT=3001" > .env
```

### Dependencies missing:
```bash
npm install
```

### Server not starting:
- Check if Node.js is installed: `node --version`
- Check if you're in the right directory: `pwd`
- Check for error messages in the console

---

## 📚 What's Included

- ✅ JWT Authentication
- ✅ User Registration & Login
- ✅ Password Hashing (bcrypt)
- ✅ Protected Routes
- ✅ Token Refresh
- ✅ CORS enabled
- ✅ Request validation
- ✅ Error handling

**Ready to use! No database setup required - uses in-memory storage for simplicity.**
