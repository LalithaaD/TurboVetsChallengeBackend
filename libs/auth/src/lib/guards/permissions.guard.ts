import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionType } from '@turbo-vets/data';
import { PERMISSIONS_KEY, PERMISSION_RESOURCE_KEY, PERMISSION_ACTION_KEY } from '../decorators/permissions.decorator';
import { RbacService } from '../services/rbac.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logAccessAttempt(user, 'permission_check', 'unknown', false, 'No user found');
      throw new ForbiddenException('User not authenticated');
    }

    // Get required permissions from decorator
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionType[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Get resource and action from decorator
    const resource = this.reflector.getAllAndOverride<string>(
      PERMISSION_RESOURCE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const action = this.reflector.getAllAndOverride<string>(
      PERMISSION_ACTION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions are required, allow access
    if (!requiredPermissions && !resource && !action) {
      return true;
    }

    let hasPermission = false;
    let reason = '';

    // Check specific resource and action
    if (resource && action) {
      hasPermission = this.rbacService.canAccessResource(user, resource, action);
      if (!hasPermission) {
        reason = `User does not have permission to perform '${action}' on '${resource}'`;
      }
    }

    // Check required permissions
    if (requiredPermissions && requiredPermissions.length > 0) {
      hasPermission = this.rbacService.hasAnyPermission(user, requiredPermissions);
      if (!hasPermission) {
        reason = `User does not have any of the required permissions: ${requiredPermissions.join(', ')}`;
      }
    }

    this.logAccessAttempt(
      user,
      'permission_check',
      resource || 'unknown',
      hasPermission,
      hasPermission ? undefined : reason,
      request.ip,
      request.headers['user-agent'],
    );

    if (!hasPermission) {
      throw new ForbiddenException(reason);
    }

    return true;
  }

  private logAccessAttempt(
    user: any,
    action: string,
    resource: string,
    success: boolean,
    reason?: string,
    ipAddress?: string,
    userAgent?: string,
  ): void {
    this.rbacService.logAccessAttempt({
      userId: user.id,
      action,
      resource,
      organizationId: user.organizationId,
      success,
      reason,
      ipAddress,
      userAgent,
    });
  }
}
