import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleType } from '@turbo-vets/data';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RbacService } from '../services/rbac.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      this.logAccessAttempt(user, 'role_check', 'unknown', false, 'No user found');
      throw new ForbiddenException('User not authenticated');
    }

    const hasRequiredRole = this.rbacService.hasAnyRole(user, requiredRoles);
    
    this.logAccessAttempt(
      user,
      'role_check',
      'unknown',
      hasRequiredRole,
      hasRequiredRole ? undefined : `User does not have required role(s): ${requiredRoles.join(', ')}`,
      request.ip,
      request.headers['user-agent'],
    );

    if (!hasRequiredRole) {
      throw new ForbiddenException(`Access denied. Required roles: ${requiredRoles.join(', ')}`);
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
