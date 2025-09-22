# Environment Configuration for JWT Authentication

Create a `.env` file in your API root directory (`/apps/api/.env`) with the following variables:

## Required Environment Variables

### 🔐 JWT Authentication Configuration
```env
# JWT Secret Key - CHANGE THIS IN PRODUCTION!
# Generate a strong secret: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-please-use-a-strong-random-key

# JWT Token Expiration Time
# Options: 15m, 1h, 24h, 7d, 30d
JWT_EXPIRES_IN=24h
```

### 🗄️ Database Configuration
```env
# Database Type (sqlite, postgres, mysql, etc.)
DB_TYPE=sqlite

# Database Connection
DB_DATABASE=database.sqlite

# For PostgreSQL/MySQL, use these instead:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=your_username
# DB_PASSWORD=your_password
# DB_DATABASE=your_database_name
```

### 🚀 Application Configuration
```env
# Server Port
PORT=3000

# Environment (development, production, test)
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:4200
```

### 🔒 Security Configuration
```env
# Password Hashing Salt Rounds (10-12 recommended)
BCRYPT_ROUNDS=10

# Rate Limiting (requests per minute)
RATE_LIMIT_MAX=100

# Session Configuration
SESSION_SECRET=your-session-secret-key-change-this-too
```

## Optional Environment Variables

### 📧 Email Configuration (for future use)
```env
# SMTP Configuration for password reset emails
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# FROM_EMAIL=noreply@yourapp.com
```

### 📊 Logging Configuration
```env
# Log Level (error, warn, info, debug)
LOG_LEVEL=info

# Enable request logging
ENABLE_REQUEST_LOGGING=true
```

### 🗃️ External Services (for future use)
```env
# Redis Configuration (for session storage)
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=

# File Upload Configuration
# MAX_FILE_SIZE=10485760
# UPLOAD_PATH=./uploads
```

### 🛠️ Development/Testing
```env
# Enable debug mode
DEBUG=false

# Seed database on startup
SEED_DATABASE=true

# Enable API documentation
ENABLE_SWAGGER=true
```

## How to Create Your .env File

1. **Copy the example:**
   ```bash
   cp env-config.md .env
   ```

2. **Edit the .env file:**
   ```bash
   nano .env
   # or
   code .env
   ```

3. **Generate a strong JWT secret:**
   ```bash
   # Using OpenSSL
   openssl rand -base64 32
   
   # Using Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

## Security Best Practices

### 🔐 JWT Secret
- **NEVER** use the default secret in production
- Generate a strong, random secret (at least 32 characters)
- Store it securely and never commit it to version control
- Use different secrets for different environments

### 🔒 Password Security
- Use at least 10 salt rounds for bcrypt
- Enforce strong password policies
- Consider implementing password complexity requirements

### 🌐 CORS Configuration
- Set specific origins instead of allowing all
- Use HTTPS in production
- Configure proper headers for security

### 📝 Logging
- Log authentication attempts
- Monitor for suspicious activity
- Use structured logging for better analysis

## Environment-Specific Configurations

### Development
```env
NODE_ENV=development
JWT_EXPIRES_IN=24h
LOG_LEVEL=debug
DEBUG=true
```

### Production
```env
NODE_ENV=production
JWT_EXPIRES_IN=1h
LOG_LEVEL=warn
DEBUG=false
JWT_SECRET=your-super-strong-production-secret
```

### Testing
```env
NODE_ENV=test
JWT_EXPIRES_IN=15m
LOG_LEVEL=error
DEBUG=false
```

## Loading Environment Variables

The current simple server automatically loads these variables:

```javascript
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
```

For the full NestJS application, use the `@nestjs/config` module:

```typescript
// In your module
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
})
```
