# Data Models Documentation

This document describes the complete data model architecture for the personal project management system, including TypeORM entities, relationships, and business logic.

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
