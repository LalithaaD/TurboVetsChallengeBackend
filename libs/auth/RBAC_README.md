# RBAC (Role-Based Access Control) System

This library provides a comprehensive Role-Based Access Control system with custom decorators, guards, and permission checking logic.

## Features

- **Role Hierarchy**: Owner > Admin > Viewer with inheritance
- **Permission-based Access Control**: Granular permissions for resources and actions
- **Organization-level Access Control**: Multi-tenant support
- **Ownership Validation**: Resource ownership checks
- **Audit Logging**: Comprehensive logging of access attempts
- **Custom Decorators**: Easy-to-use decorators for access control
- **Flexible Guards**: Multiple guard types for different access control scenarios

## Role Hierarchy

The system implements a three-tier role hierarchy:

1. **Owner** (Level 3) - Full access to all resources and permissions
2. **Admin** (Level 2) - Administrative access with most permissions
3. **Viewer** (Level 1) - Read-only access to most resources

Higher roles inherit permissions from lower roles.

## Permission Types

The system includes predefined permission types for common resources:

### Task Permissions
- `TASK_CREATE` - Create new tasks
- `TASK_READ` - View tasks
- `TASK_UPDATE` - Modify existing tasks
- `TASK_DELETE` - Delete tasks
- `TASK_ASSIGN` - Assign tasks to users

### User Permissions
- `USER_CREATE` - Create new users
- `USER_READ` - View user information
- `USER_UPDATE` - Modify user information
- `USER_DELETE` - Delete users

### Organization Permissions
- `ORGANIZATION_CREATE` - Create new organizations
- `ORGANIZATION_READ` - View organization information
- `ORGANIZATION_UPDATE` - Modify organization information
- `ORGANIZATION_DELETE` - Delete organizations

### Role Permissions
- `ROLE_CREATE` - Create new roles
- `ROLE_READ` - View role information
- `ROLE_UPDATE` - Modify role information
- `ROLE_DELETE` - Delete roles
- `ROLE_ASSIGN` - Assign roles to users

### Permission Management
- `PERMISSION_READ` - View permissions
- `PERMISSION_MANAGE` - Manage permissions

## Usage

### 1. Import the AuthModule

```typescript
import { AuthModule } from '@turbo-vets/auth';

@Module({
  imports: [AuthModule],
  // ...
})
export class YourModule {}
```

### 2. Using Decorators

#### Role-based Access Control

```typescript
import { RequireRoles } from '@turbo-vets/auth';
import { RoleType } from '@turbo-vets/data';

@Controller('admin')
export class AdminController {
  @Get('users')
  @RequireRoles(RoleType.ADMIN, RoleType.OWNER)
  async getUsers() {
    // Only admins and owners can access
  }
}
```

#### Permission-based Access Control

```typescript
import { RequirePermissions } from '@turbo-vets/auth';
import { PermissionType } from '@turbo-vets/data';

@Controller('tasks')
export class TaskController {
  @Post()
  @RequirePermissions(PermissionType.TASK_CREATE)
  async createTask() {
    // Only users with TASK_CREATE permission can access
  }
}
```

#### Resource and Action-based Access Control

```typescript
import { RequireResourceAction } from '@turbo-vets/auth';

@Controller('users')
export class UserController {
  @Put(':id')
  @RequireResourceAction('user', 'update')
  async updateUser() {
    // Only users with 'user:update' permission can access
  }
}
```

#### Ownership Validation

```typescript
import { RequireOwnership } from '@turbo-vets/auth';

@Controller('profile')
export class ProfileController {
  @Put(':id')
  @RequireOwnership('id')
  async updateProfile() {
    // Only the owner of the profile can update it
  }
}
```

#### Organization Access Control

```typescript
import { RequireOrganizationAccess } from '@turbo-vets/auth';

@Controller('organization')
export class OrganizationController {
  @Get(':organizationId/users')
  @RequireOrganizationAccess('organizationId')
  async getOrganizationUsers() {
    // Only users from the same organization can access
  }
}
```

#### Comprehensive Access Control

```typescript
import { AccessControl } from '@turbo-vets/auth';
import { RoleType, PermissionType } from '@turbo-vets/data';

@Controller('sensitive')
export class SensitiveController {
  @Delete(':id')
  @AccessControl({
    roles: [RoleType.ADMIN, RoleType.OWNER],
    permissions: [PermissionType.USER_DELETE],
    requireOwnership: true,
    ownershipParam: 'id',
    requireOrganizationAccess: true,
    organizationParam: 'organizationId',
  })
  async deleteUser() {
    // Complex access control with multiple requirements
  }
}
```

### 3. Using Guards

You can apply guards at the controller or application level:

```typescript
import { 
  RolesGuard, 
  PermissionsGuard, 
  OwnershipGuard,
  OrganizationAccessGuard,
  AccessControlGuard 
} from '@turbo-vets/auth';

@Controller('api')
@UseGuards(RolesGuard, PermissionsGuard)
export class ApiController {
  // All routes will be protected by these guards
}
```

### 4. Using the RBAC Service

```typescript
import { RbacService } from '@turbo-vets/auth';
import { RoleType, PermissionType } from '@turbo-vets/data';

@Injectable()
export class YourService {
  constructor(private rbacService: RbacService) {}

  async checkUserAccess(user: User) {
    // Check if user has a specific role
    const isAdmin = this.rbacService.hasRole(user, RoleType.ADMIN);
    
    // Check if user has any of the required roles
    const hasRequiredRole = this.rbacService.hasAnyRole(user, [RoleType.ADMIN, RoleType.OWNER]);
    
    // Check if user's role is higher than or equal to required role
    const hasRoleOrHigher = this.rbacService.hasRoleOrHigher(user, RoleType.ADMIN);
    
    // Check if user has a specific permission
    const canCreateTasks = this.rbacService.hasPermission(user, PermissionType.TASK_CREATE);
    
    // Check if user has any of the required permissions
    const hasAnyPermission = this.rbacService.hasAnyPermission(user, [
      PermissionType.TASK_CREATE,
      PermissionType.TASK_UPDATE
    ]);
    
    // Check if user has all required permissions
    const hasAllPermissions = this.rbacService.hasAllPermissions(user, [
      PermissionType.TASK_CREATE,
      PermissionType.TASK_UPDATE
    ]);
    
    // Check resource access
    const canAccessResource = this.rbacService.canAccessResource(user, 'task', 'create');
    
    // Check ownership
    const isOwner = this.rbacService.isOwner(user, 'resource-id');
    
    // Check organization access
    const hasOrgAccess = this.rbacService.canAccessOrganizationResource(user, 'org-id');
    
    // Get all user permissions
    const userPermissions = this.rbacService.getUserPermissions(user);
  }
}
```

### 5. Audit Logging

The system automatically logs all access attempts. You can retrieve audit logs:

```typescript
import { RbacService } from '@turbo-vets/auth';

@Injectable()
export class AuditService {
  constructor(private rbacService: RbacService) {}

  async getAuditLogs(userId?: string, organizationId?: string) {
    return this.rbacService.getAuditLogs(userId, organizationId);
  }
}
```

## Configuration

### Default Role Permissions

The system comes with predefined permissions for each role:

- **Owner**: All permissions
- **Admin**: Most permissions except user deletion and organization deletion
- **Viewer**: Read-only permissions

### Customizing Permissions

You can extend the system by:

1. Adding new permission types to the `PermissionType` enum
2. Updating the `defaultRolePermissions` in `RbacService`
3. Creating custom permission checking logic

## Error Handling

The system throws appropriate HTTP exceptions:

- `ForbiddenException` - When access is denied
- `BadRequestException` - When required parameters are missing
- `UnauthorizedException` - When user is not authenticated

## Best Practices

1. **Use the most specific decorator** for your use case
2. **Combine decorators** for complex access control scenarios
3. **Apply guards at the controller level** for consistent protection
4. **Use the RBAC service** for programmatic access checks
5. **Monitor audit logs** for security insights
6. **Test access control** thoroughly in your test suites

## Examples

See the test files and example controllers for more detailed usage examples.

## Security Considerations

1. Always validate user authentication before applying RBAC
2. Use HTTPS in production to protect sensitive data
3. Regularly review audit logs for suspicious activity
4. Implement rate limiting for sensitive operations
5. Consider implementing session management and token expiration
