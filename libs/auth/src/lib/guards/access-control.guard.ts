import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleType, PermissionType } from '@turbo-vets/data';
import { AccessControlConfig } from '../decorators/access-control.decorator';
import { RbacService } from '../services/rbac.service';

@Injectable()
export class AccessControlGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logAccessAttempt(user, 'access_control_check', 'unknown', false, 'No user found');
      throw new ForbiddenException('User not authenticated');
    }

    // Get access control configuration
    const config = this.reflector.getAllAndOverride<AccessControlConfig>(
      'access_control',
      [context.getHandler(), context.getClass()],
    );

    if (!config) {
      return true; // No access control requirements
    }

    let hasAccess = true;
    let reason = '';

    // Check roles
    if (config.roles && config.roles.length > 0) {
      const hasRequiredRole = config.allowInheritance 
        ? this.rbacService.hasRoleOrHigher(user, config.roles[0]) // Use highest role for inheritance
        : this.rbacService.hasAnyRole(user, config.roles);
      
      if (!hasRequiredRole) {
        hasAccess = false;
        reason = `User does not have required role(s): ${config.roles.join(', ')}`;
      }
    }

    // Check permissions
    if (hasAccess && config.permissions && config.permissions.length > 0) {
      const hasRequiredPermissions = this.rbacService.hasAnyPermission(user, config.permissions);
      if (!hasRequiredPermissions) {
        hasAccess = false;
        reason = `User does not have required permission(s): ${config.permissions.join(', ')}`;
      }
    }

    // Check resource and action
    if (hasAccess && config.resource && config.action) {
      const canAccessResource = this.rbacService.canAccessResource(user, config.resource, config.action);
      if (!canAccessResource) {
        hasAccess = false;
        reason = `User cannot perform '${config.action}' on '${config.resource}'`;
      }
    }

    // Check ownership
    if (hasAccess && config.requireOwnership) {
      const resourceId = this.getResourceId(request, config.ownershipParam || 'id');
      if (!resourceId) {
        hasAccess = false;
        reason = `Resource ID not found for ownership check`;
      } else {
        const isOwner = this.rbacService.isOwner(user, resourceId);
        if (!isOwner) {
          hasAccess = false;
          reason = 'User is not the owner of the resource';
        }
      }
    }

    // Check organization access
    if (hasAccess && config.requireOrganizationAccess) {
      const organizationId = this.getOrganizationId(request, config.organizationParam || 'organizationId');
      if (!organizationId) {
        hasAccess = false;
        reason = `Organization ID not found for access check`;
      } else {
        const hasOrgAccess = this.rbacService.canAccessOrganizationResource(user, organizationId);
        if (!hasOrgAccess) {
          hasAccess = false;
          reason = 'User does not belong to the specified organization';
        }
      }
    }

    this.logAccessAttempt(
      user,
      'access_control_check',
      config.resource || 'unknown',
      hasAccess,
      hasAccess ? undefined : reason,
      request.ip,
      request.headers['user-agent'],
    );

    if (!hasAccess) {
      throw new ForbiddenException(reason);
    }

    return true;
  }

  private getResourceId(request: any, paramName: string): string | null {
    // Check route parameters first
    if (request.params && request.params[paramName]) {
      return request.params[paramName];
    }

    // Check query parameters
    if (request.query && request.query[paramName]) {
      return request.query[paramName];
    }

    // Check body parameters
    if (request.body && request.body[paramName]) {
      return request.body[paramName];
    }

    return null;
  }

  private getOrganizationId(request: any, paramName: string): string | null {
    // Check route parameters first
    if (request.params && request.params[paramName]) {
      return request.params[paramName];
    }

    // Check query parameters
    if (request.query && request.query[paramName]) {
      return request.query[paramName];
    }

    // Check body parameters
    if (request.body && request.body[paramName]) {
      return request.body[paramName];
    }

    // Check if the paramName is 'organizationId' and try common variations
    if (paramName === 'organizationId') {
      const commonNames = ['orgId', 'organization', 'org'];
      for (const name of commonNames) {
        if (request.params && request.params[name]) {
          return request.params[name];
        }
        if (request.query && request.query[name]) {
          return request.query[name];
        }
        if (request.body && request.body[name]) {
          return request.body[name];
        }
      }
    }

    return null;
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
