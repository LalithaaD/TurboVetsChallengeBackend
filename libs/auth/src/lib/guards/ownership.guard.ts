import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../services/rbac.service';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logAccessAttempt(user, 'ownership_check', 'unknown', false, 'No user found');
      throw new ForbiddenException('User not authenticated');
    }

    // Check if ownership is required
    const ownershipParam = this.reflector.getAllAndOverride<string>(
      'require_ownership',
      [context.getHandler(), context.getClass()],
    );

    if (!ownershipParam) {
      return true; // No ownership requirement
    }

    // Get the resource ID from the request
    const resourceId = this.getResourceId(request, ownershipParam);
    
    if (!resourceId) {
      this.logAccessAttempt(user, 'ownership_check', 'unknown', false, `Resource ID not found in parameter: ${ownershipParam}`);
      throw new BadRequestException(`Resource ID not found in parameter: ${ownershipParam}`);
    }

    // Check ownership
    const isOwner = this.rbacService.isOwner(user, resourceId);
    
    this.logAccessAttempt(
      user,
      'ownership_check',
      resourceId,
      isOwner,
      isOwner ? undefined : 'User is not the owner of the resource',
      request.ip,
      request.headers['user-agent'],
    );

    if (!isOwner) {
      throw new ForbiddenException('You can only access your own resources');
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
