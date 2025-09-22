import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../services/rbac.service';

@Injectable()
export class OrganizationAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logAccessAttempt(user, 'organization_access_check', 'unknown', false, 'No user found');
      throw new ForbiddenException('User not authenticated');
    }

    // Check if organization access is required
    const organizationParam = this.reflector.getAllAndOverride<string>(
      'require_organization_access',
      [context.getHandler(), context.getClass()],
    );

    if (!organizationParam) {
      return true; // No organization access requirement
    }

    // Get the organization ID from the request
    const organizationId = this.getOrganizationId(request, organizationParam);
    
    if (!organizationId) {
      this.logAccessAttempt(user, 'organization_access_check', 'unknown', false, `Organization ID not found in parameter: ${organizationParam}`);
      throw new BadRequestException(`Organization ID not found in parameter: ${organizationParam}`);
    }

    // Check organization access
    const hasAccess = this.rbacService.canAccessOrganizationResource(user, organizationId);
    
    this.logAccessAttempt(
      user,
      'organization_access_check',
      organizationId,
      hasAccess,
      hasAccess ? undefined : 'User does not belong to the specified organization',
      request.ip,
      request.headers['user-agent'],
    );

    if (!hasAccess) {
      throw new ForbiddenException('You can only access resources within your organization');
    }

    return true;
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
      // Try different common parameter names
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
