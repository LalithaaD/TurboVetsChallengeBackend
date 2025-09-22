# Project Documentation

This document provides comprehensive information about the personal project management system, including repository structure, server setup instructions, and data model architecture.

## Repository Structure

```
my-personal-project/
├── apps/                          # Application code
│   ├── api/                       # NestJS API application
│   │   ├── src/
│   │   │   ├── app/               # Main app module
│   │   │   ├── auth/              # Authentication module
│   │   │   ├── users/             # User management
│   │   │   ├── tasks/             # Task management (NEW)
│   │   │   ├── entities/          # TypeORM entities
│   │   │   ├── config/            # Configuration files
│   │   │   ├── migrations/        # Database migrations
│   │   │   └── seed/              # Database seeding
│   │   ├── simple-server.js       # Simple Express server (auth only)
│   │   └── test-simple-auth.js    # Auth testing script
│   ├── api-e2e/                   # End-to-end tests
│   └── dashboard/                 # Angular frontend
├── libs/                          # Shared libraries
│   ├── auth/                      # RBAC authentication library
│   │   ├── src/lib/
│   │   │   ├── decorators/        # Permission decorators
│   │   │   ├── guards/            # Authentication guards
│   │   │   ├── services/          # RBAC service
│   │   │   └── examples/          # Usage examples
│   │   └── RBAC_README.md         # RBAC documentation
│   └── data/                      # Data interfaces library
│       └── src/lib/interfaces/    # TypeScript interfaces
├── dist/                          # Build output
├── node_modules/                  # Dependencies
├── simple-nestjs-server.js        # NestJS-style production server (NEW)
├── test-nestjs-endpoints.js       # NestJS server testing script (NEW)
├── TASK_API_DOCUMENTATION.md      # API documentation (NEW)
├── BACKEND_SETUP.md               # Backend setup guide
├── package.json                   # Root package configuration
├── nx.json                        # Nx workspace configuration
└── tsconfig.base.json             # TypeScript configuration
```

## Server Setup Instructions

### 🚀 Quick Start

Start the complete task management server:

```bash
# Start the complete task management server
node simple-nestjs-server.js
```

**Available Endpoints:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user  
- `GET /auth/profile` - Get user profile (protected)
- `POST /tasks` - Create task (protected)
- `GET /tasks` - List tasks (protected)
- `PUT /tasks/:id` - Update task (protected)
- `DELETE /tasks/:id` - Delete task (protected)
- `GET /tasks/audit-log` - View audit logs (protected, admin/owner only)

**Features:**
- ✅ Complete task management API
- ✅ JWT authentication
- ✅ RBAC enforcement
- ✅ Audit logging
- ✅ NestJS-style responses
- ✅ Production-ready structure

### 🧪 Testing the API

#### Manual Testing with curl
```bash
# 1. Register a user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123","firstName":"Test","lastName":"User"}'

# 2. Login to get token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 3. Create a task (replace TOKEN with actual token)
curl -X POST http://localhost:3000/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"This is a test task","priority":"high","isPublic":true}'

# 4. List tasks
curl -X GET http://localhost:3000/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Automated Testing
```bash
# Run the comprehensive test suite
node test-nestjs-endpoints.js
```

### 🔐 Authentication Flow

1. **Register/Login** → Get JWT token
2. **Include token** in Authorization header: `Bearer <token>`
3. **Access protected endpoints** with valid token
4. **Token expires** in 24 hours (configurable)

### 📊 Server Features

| Feature | Status |
|---------|--------|
| **Task Management** | ✅ Complete |
| **Authentication** | ✅ Full |
| **RBAC** | ✅ Working |
| **Audit Logging** | ✅ Working |
| **Build Complexity** | ✅ None |
| **Development Speed** | ✅ Fast |
| **Production Ready** | ✅ Enterprise |
| **NestJS Responses** | ✅ Standard |

### 🛠 Environment Setup

#### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Git (for version control)

#### Installation
```bash
# Clone the repository
git clone <repository-url>
cd my-personal-project

# Install dependencies
npm install

# Build shared libraries (optional, for NestJS)
npx nx build auth
npx nx build data
```

#### Environment Variables
Create a `.env` file in the project root:
```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-long-and-complex
JWT_EXPIRES_IN=24h

# Password Hashing
BCRYPT_ROUNDS=10

# Server Configuration
PORT=3000
NODE_ENV=development

# Database (for NestJS)
DATABASE_URL=sqlite:database.sqlite
# or for PostgreSQL:
# DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# CORS Configuration
CORS_ORIGIN=*

# Logging
LOG_LEVEL=info

# Security
SESSION_SECRET=your-session-secret-change-this-in-production
```

#### Generate Secure JWT Secret
```bash
# Generate a cryptographically secure JWT secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

### 🐛 Troubleshooting

#### Common Issues

**1. Port Already in Use**
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 node test-server-with-tasks.js
```

**2. Build System**
- ✅ Working NestJS-style server (`simple-nestjs-server.js`)
- ✅ All task management features working
- ✅ Standard NestJS response format
- ✅ Production-ready implementation

**3. JWT Token Issues**
- Ensure JWT_SECRET is set in environment
- Check token expiration (default: 24 hours)
- Verify Authorization header format: `Bearer <token>`

**4. Database Connection Issues**
- SQLite file is created automatically
- Ensure write permissions in project directory
- For PostgreSQL, verify connection string and database exists

#### Getting Help

**Check Server Status:**
```bash
# Health check
curl http://localhost:3000/

# Should return: {"message":"Task API Server is running!"}
```

**View Server Logs:**
- Test server shows detailed audit logs in console
- Look for `[AUDIT]` messages for debugging
- Check for error messages in server output

**Test Authentication:**
```bash
# Test registration
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123","firstName":"Test","lastName":"User"}'
```

## Overview

The system implements a hierarchical organization structure with role-based access control (RBAC) and comprehensive task management capabilities.

## Entity Relationships

```
Organizations (Tree Structure)
├── Users (belongs to Organization)
│   └── Role (belongs to Organization)
│       └── Permissions (many-to-many)
└── Tasks (belongs to Organization)
    ├── CreatedBy (User)
    └── AssignedTo (User, optional)
```

## Entities

### 1. Permission Entity

**Purpose**: Defines granular permissions for system resources.

**Key Features**:
- Unique permission types for each action
- Resource-action based permissions
- Soft delete support
- Many-to-many relationship with roles

**Permission Types**:
- Task permissions: `task:create`, `task:read`, `task:update`, `task:delete`, `task:assign`
- User permissions: `user:create`, `user:read`, `user:update`, `user:delete`
- Organization permissions: `organization:create`, `organization:read`, `organization:update`, `organization:delete`
- Role permissions: `role:create`, `role:read`, `role:update`, `role:delete`, `role:assign`
- Permission management: `permission:read`, `permission:manage`

### 2. Organization Entity

**Purpose**: Implements 2-level organizational hierarchy using TypeORM's tree structure.

**Key Features**:
- Self-referencing parent-child relationships
- Closure table for efficient tree queries
- Soft delete support
- One-to-many relationships with users, roles, and tasks

**Hierarchy Rules**:
- Root organizations have no parent
- Child organizations inherit permissions from parent
- Users can access parent organization resources

### 3. Role Entity

**Purpose**: Defines user roles with permission inheritance logic.

**Key Features**:
- Three role types: Owner, Admin, Viewer
- Role hierarchy: Owner > Admin > Viewer
- Organization-scoped roles
- Many-to-many relationship with permissions
- Business logic methods for role comparison

**Role Hierarchy**:
- **Owner**: Full access to all resources in the organization
- **Admin**: Administrative access to most resources (except organization management)
- **Viewer**: Read-only access to resources

**Business Logic Methods**:
- `hasPermission(permissionType)`: Check if role has specific permission
- `isHigherThan(otherRole)`: Compare role hierarchy levels
- `canManageRole(otherRole)`: Check if role can manage another role

### 4. User Entity

**Purpose**: Represents system users with authentication and authorization.

**Key Features**:
- Password hashing with bcrypt
- Organization and role relationships
- Soft delete support
- Business logic methods for access control

**Authentication**:
- Email and username uniqueness
- Password hashing on insert/update
- Password validation method

**Authorization Methods**:
- `hasPermission(permissionType)`: Check user permissions through role
- `canManageUser(otherUser)`: Check if user can manage another user
- `canAccessOrganization(organizationId)`: Check organization access

### 5. Task Entity

**Purpose**: Main resource for project management functionality.

**Key Features**:
- Status and priority enums
- Assignee and creator relationships
- Organization scoping
- Due date and completion tracking
- Tag system
- Public/private visibility

**Task Statuses**:
- `TODO`: Initial state
- `IN_PROGRESS`: Currently being worked on
- `IN_REVIEW`: Under review
- `DONE`: Completed
- `CANCELLED`: Cancelled

**Task Priorities**:
- `LOW`: Low priority
- `MEDIUM`: Medium priority (default)
- `HIGH`: High priority
- `URGENT`: Urgent priority

**Business Logic Methods**:
- `isOverdue`: Check if task is past due date
- `isAssigned`: Check if task has an assignee
- `daysUntilDue`: Calculate days until due date
- `canBeAccessedBy(user)`: Check if user can view task
- `canBeModifiedBy(user)`: Check if user can modify task

## Database Configuration

### SQLite (Development)
- File-based database: `database.sqlite`
- Synchronize schema automatically
- Full logging enabled

### PostgreSQL (Production)
- Environment-based configuration
- Connection pooling
- Migration-based schema updates

## Data Seeding

The system includes a comprehensive seeding script that creates:

1. **All Permission Types**: Complete set of granular permissions
2. **Sample Organizations**: Root organization with child organization
3. **Default Roles**: Owner, Admin, and Viewer roles with appropriate permissions
4. **Admin User**: Default system administrator account

## Access Control Logic

### Organization Access
- Users can access their own organization
- Users can access parent organizations in the hierarchy
- Cross-organization access is restricted

### Task Access
- **Public Tasks**: Accessible by any user in the organization
- **Private Tasks**: Only accessible by creator, assignee, or users with `task:read` permission

### Task Modification
- Creator can always modify their tasks
- Assignee can modify if they have `task:update` permission
- Admins and owners can modify any task in their organization

### Role Management
- Users can only manage roles in their organization
- Higher-level roles can manage lower-level roles
- Owners can manage all roles in their organization

## Usage Examples

### Creating a User with Role
```typescript
const user = userRepository.create({
  email: 'user@example.com',
  username: 'johndoe',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  organizationId: organization.id,
  roleId: adminRole.id,
});
```

### Checking User Permissions
```typescript
if (user.hasPermission('task:create')) {
  // User can create tasks
}
```

### Task Access Control
```typescript
if (task.canBeAccessedBy(user)) {
  // User can view this task
}
```

## Migration and Deployment

1. **Development**: Use `synchronize: true` for automatic schema updates
2. **Production**: Use migrations for controlled schema changes
3. **Seeding**: Run seed script after initial deployment

## Security Considerations

- All passwords are hashed using bcrypt with salt rounds of 10
- Soft deletes preserve data integrity
- Foreign key constraints ensure referential integrity
- Role-based access control prevents unauthorized access
- Organization scoping isolates data between organizations

## 🚀 Quick Reference

### Start Development Server
```bash
# Start the complete task management server
node simple-nestjs-server.js
```

### Test API Endpoints
```bash
# Automated testing
node test-nestjs-endpoints.js

# Manual testing
curl -X GET http://localhost:3000/
```

### Key Files
- `simple-nestjs-server.js` - **Main production server** (NestJS-style)
- `test-nestjs-endpoints.js` - API testing script
- `TASK_API_DOCUMENTATION.md` - Complete API documentation
- `apps/api/src/tasks/` - NestJS task controller (complex build)
- `libs/auth/` - RBAC authentication library
- `libs/data/` - Data interfaces library

### Default Admin User
- **Email**: test@example.com
- **Username**: testuser  
- **Password**: password123
- **Role**: Admin (full access)

### Server URLs
- **Development**: http://localhost:3000
- **Health Check**: http://localhost:3000/
- **API Base**: http://localhost:3000/api (NestJS only)

### Environment Files
- `.env` - Environment variables
- `package.json` - Dependencies and scripts
- `tsconfig.base.json` - TypeScript configuration
- `nx.json` - Nx workspace configuration
