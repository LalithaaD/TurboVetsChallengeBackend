# JWT Authentication System

This NestJS application implements a complete JWT-based authentication system with secure password hashing and route protection.

## Features

- ✅ **Real JWT Authentication** - No mock authentication
- ✅ **Secure Password Hashing** - Using bcryptjs with salt rounds
- ✅ **Token-based Authentication** - JWT tokens for stateless authentication
- ✅ **Route Protection** - Global JWT guard with public route exceptions
- ✅ **User Registration & Login** - Complete user management
- ✅ **Token Refresh** - Endpoint to refresh JWT tokens
- ✅ **User Profile Management** - Protected user endpoints

## Architecture

### Core Components

1. **AuthModule** - Main authentication module
2. **AuthService** - Handles user validation, registration, and login
3. **AuthController** - Exposes authentication endpoints
4. **JwtStrategy** - Passport strategy for JWT validation
5. **LocalStrategy** - Passport strategy for local authentication
6. **JwtAuthGuard** - Global guard for protecting routes
7. **LocalAuthGuard** - Guard for login endpoint

### Security Features

- **Password Hashing**: Automatic bcrypt hashing in User entity
- **JWT Secret**: Configurable via environment variables
- **Token Expiration**: Configurable token lifetime
- **Route Protection**: Global guard with public route exceptions
- **User Validation**: Active user checks and organization-based access

## API Endpoints

### Public Endpoints (No Authentication Required)

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with email and password
- `GET /` - Health check endpoint

### Protected Endpoints (JWT Token Required)

- `GET /auth/profile` - Get current user profile
- `POST /auth/refresh` - Refresh JWT token
- `GET /users/me` - Get current user details
- `GET /users` - Get all users in organization

## Usage

### 1. Environment Configuration

Create a `.env` file in the API root:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Database Configuration
DB_TYPE=sqlite
DB_DATABASE=database.sqlite

# Application Configuration
PORT=3000
NODE_ENV=development
```

### 2. Starting the Server

```bash
npm run start:dev
```

### 3. Testing Authentication

Use the provided test script:

```bash
npx ts-node src/test-auth.ts
```

Or test manually with curl/Postman:

#### Register a new user:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

#### Login:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### Access protected route:
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Request/Response Examples

### Registration Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User",
    "role": null,
    "organization": null,
    "isActive": true
  }
}
```

### Login Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User",
    "role": null,
    "organization": null,
    "isActive": true
  }
}
```

## Security Considerations

### JWT Token Structure
```json
{
  "email": "user@example.com",
  "sub": "user-uuid",
  "username": "testuser",
  "role": "admin",
  "organizationId": "org-uuid",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Password Security
- Passwords are automatically hashed using bcryptjs with 10 salt rounds
- Password validation is handled in the User entity
- No plain text passwords are stored

### Route Protection
- All routes are protected by default via global JWT guard
- Use `@Public()` decorator to make routes accessible without authentication
- JWT tokens must be sent in the `Authorization: Bearer <token>` header

## Error Handling

### Common Error Responses

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### 409 Conflict (User already exists)
```json
{
  "statusCode": 409,
  "message": "User with this email or username already exists"
}
```

#### 400 Bad Request (Validation errors)
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

## Integration with Frontend

### Storing JWT Token
```javascript
// After successful login
const { access_token } = await login(credentials);
localStorage.setItem('token', access_token);
```

### Making Authenticated Requests
```javascript
const token = localStorage.getItem('token');
const response = await fetch('/api/protected-route', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Token Refresh
```javascript
const refreshToken = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const { access_token } = await response.json();
  localStorage.setItem('token', access_token);
};
```

## Database Schema

The authentication system uses the existing User entity with the following key fields:

- `id` - UUID primary key
- `email` - Unique email address
- `username` - Unique username
- `password` - Hashed password (bcrypt)
- `firstName` - User's first name
- `lastName` - User's last name
- `organizationId` - Reference to organization
- `roleId` - Reference to user role
- `isActive` - Account status flag

## Production Considerations

1. **Change JWT Secret**: Use a strong, random secret in production
2. **Environment Variables**: Store sensitive configuration in environment variables
3. **HTTPS**: Always use HTTPS in production
4. **Token Expiration**: Consider shorter token lifetimes for better security
5. **Rate Limiting**: Implement rate limiting for auth endpoints
6. **Logging**: Add comprehensive logging for security events
7. **Database**: Use a production database (PostgreSQL, MySQL) instead of SQLite

## Troubleshooting

### Common Issues

1. **"User not found" error**: Ensure user exists and is active
2. **"Invalid credentials" error**: Check email/password combination
3. **"Unauthorized" error**: Verify JWT token is valid and not expired
4. **Database connection issues**: Check database configuration and connectivity

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will provide detailed error messages and stack traces.
