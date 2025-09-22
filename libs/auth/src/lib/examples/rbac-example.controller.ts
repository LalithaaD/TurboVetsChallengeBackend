import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { 
  RequireRoles, 
  RequirePermissions, 
  RequireResourceAction,
  RequireOwnership,
  RequireOrganizationAccess,
  AccessControl,
  RolesGuard,
  PermissionsGuard,
  OwnershipGuard,
  OrganizationAccessGuard,
  AccessControlGuard,
  RbacService
} from '../auth';
import { RoleType, PermissionType } from '@turbo-vets/data';

/**
 * Example controller demonstrating various RBAC decorators and guards
 * This is for documentation purposes and should not be used in production
 */
@Controller('example')
@UseGuards(RolesGuard, PermissionsGuard) // Apply guards at controller level
export class RbacExampleController {
  constructor(private rbacService: RbacService) {}

  // Example 1: Role-based access control
  @Get('admin-only')
  @RequireRoles(RoleType.ADMIN, RoleType.OWNER)
  async adminOnlyEndpoint() {
    return { message: 'Only admins and owners can access this endpoint' };
  }

  // Example 2: Permission-based access control
  @Post('tasks')
  @RequirePermissions(PermissionType.TASK_CREATE)
  async createTask(@Body() taskData: any) {
    return { message: 'Task created successfully', data: taskData };
  }

  // Example 3: Resource and action-based access control
  @Put('users/:id')
  @RequireResourceAction('user', 'update')
  async updateUser(@Param('id') id: string, @Body() userData: any) {
    return { message: 'User updated successfully', id, data: userData };
  }

  // Example 4: Ownership validation
  @Delete('profile/:id')
  @RequireOwnership('id')
  async deleteProfile(@Param('id') id: string) {
    return { message: 'Profile deleted successfully', id };
  }

  // Example 5: Organization access control
  @Get('organization/:organizationId/data')
  @RequireOrganizationAccess('organizationId')
  async getOrganizationData(@Param('organizationId') organizationId: string) {
    return { message: 'Organization data retrieved', organizationId };
  }

  // Example 6: Comprehensive access control
  @Delete('users/:id')
  @AccessControl({
    roles: [RoleType.ADMIN, RoleType.OWNER],
    permissions: [PermissionType.USER_DELETE],
    requireOwnership: true,
    ownershipParam: 'id',
    requireOrganizationAccess: true,
    organizationParam: 'organizationId',
  })
  async deleteUser(@Param('id') id: string, @Param('organizationId') organizationId: string) {
    return { message: 'User deleted successfully', id, organizationId };
  }

  // Example 7: Multiple permission requirements
  @Put('tasks/:id/assign')
  @RequirePermissions(PermissionType.TASK_UPDATE, PermissionType.TASK_ASSIGN)
  async assignTask(@Param('id') taskId: string, @Body() assignmentData: any) {
    return { message: 'Task assigned successfully', taskId, data: assignmentData };
  }

  // Example 8: Role hierarchy demonstration
  @Get('sensitive-data')
  @RequireRoles(RoleType.VIEWER) // Viewers can access, but so can Admins and Owners due to hierarchy
  async getSensitiveData() {
    return { message: 'Sensitive data retrieved' };
  }

  // Example 9: Programmatic access check
  @Get('user-permissions')
  async getUserPermissions(@Body() user: any) {
    const permissions = this.rbacService.getUserPermissions(user);
    const canCreateTasks = this.rbacService.hasPermission(user, PermissionType.TASK_CREATE);
    const isAdmin = this.rbacService.hasRole(user, RoleType.ADMIN);
    
    return {
      permissions,
      canCreateTasks,
      isAdmin,
      message: 'User permissions retrieved'
    };
  }

  // Example 10: Audit logs
  @Get('audit-logs')
  @RequireRoles(RoleType.ADMIN, RoleType.OWNER)
  async getAuditLogs(@Param('userId') userId?: string, @Param('organizationId') organizationId?: string) {
    const logs = this.rbacService.getAuditLogs(userId, organizationId);
    return { logs, message: 'Audit logs retrieved' };
  }
}
