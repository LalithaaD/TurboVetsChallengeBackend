import { Injectable } from '@nestjs/common';
import { RoleType, PermissionType, User, Role, Permission } from '@turbo-vets/data';

export interface AuditLogEntry {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  organizationId: string;
  timestamp: Date;
  success: boolean;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class RbacService {
  private auditLogs: AuditLogEntry[] = [];

  /**
   * Role hierarchy: Owner > Admin > Viewer
   * Higher roles inherit permissions from lower roles
   */
  private readonly roleHierarchy: Record<RoleType, number> = {
    [RoleType.OWNER]: 3,
    [RoleType.ADMIN]: 2,
    [RoleType.VIEWER]: 1,
  };

  /**
   * Default permissions for each role type
   */
  private readonly defaultRolePermissions: Record<RoleType, PermissionType[]> = {
    [RoleType.OWNER]: [
      // All permissions
      PermissionType.TASK_CREATE,
      PermissionType.TASK_READ,
      PermissionType.TASK_UPDATE,
      PermissionType.TASK_DELETE,
      PermissionType.TASK_ASSIGN,
      PermissionType.USER_CREATE,
      PermissionType.USER_READ,
      PermissionType.USER_UPDATE,
      PermissionType.USER_DELETE,
      PermissionType.ORGANIZATION_CREATE,
      PermissionType.ORGANIZATION_READ,
      PermissionType.ORGANIZATION_UPDATE,
      PermissionType.ORGANIZATION_DELETE,
      PermissionType.ROLE_CREATE,
      PermissionType.ROLE_READ,
      PermissionType.ROLE_UPDATE,
      PermissionType.ROLE_DELETE,
      PermissionType.ROLE_ASSIGN,
      PermissionType.PERMISSION_READ,
      PermissionType.PERMISSION_MANAGE,
    ],
    [RoleType.ADMIN]: [
      PermissionType.TASK_CREATE,
      PermissionType.TASK_READ,
      PermissionType.TASK_UPDATE,
      PermissionType.TASK_DELETE,
      PermissionType.TASK_ASSIGN,
      PermissionType.USER_CREATE,
      PermissionType.USER_READ,
      PermissionType.USER_UPDATE,
      PermissionType.ORGANIZATION_READ,
      PermissionType.ORGANIZATION_UPDATE,
      PermissionType.ROLE_READ,
      PermissionType.ROLE_ASSIGN,
      PermissionType.PERMISSION_READ,
    ],
    [RoleType.VIEWER]: [
      PermissionType.TASK_READ,
      PermissionType.USER_READ,
      PermissionType.ORGANIZATION_READ,
      PermissionType.ROLE_READ,
      PermissionType.PERMISSION_READ,
    ],
  };

  /**
   * Check if a user has a specific role
   */
  hasRole(user: User, requiredRole: RoleType): boolean {
    if (!user.role) {
      return false;
    }
    return user.role.type === requiredRole;
  }

  /**
   * Check if a user has any of the required roles
   */
  hasAnyRole(user: User, requiredRoles: RoleType[]): boolean {
    if (!user.role) {
      return false;
    }
    return requiredRoles.includes(user.role.type);
  }

  /**
   * Check if a user's role is higher than or equal to the required role
   */
  hasRoleOrHigher(user: User, requiredRole: RoleType): boolean {
    if (!user.role) {
      return false;
    }
    return this.roleHierarchy[user.role.type] >= this.roleHierarchy[requiredRole];
  }

  /**
   * Check if a user has a specific permission
   */
  hasPermission(user: User, permission: PermissionType): boolean {
    if (!user.role) {
      return false;
    }

    // Check explicit permissions first
    if (user.role.permissions) {
      const hasExplicitPermission = user.role.permissions.some(
        (p) => p.type === permission && p.isActive
      );
      if (hasExplicitPermission) {
        return true;
      }
    }

    // Check default role permissions
    const defaultPermissions = this.defaultRolePermissions[user.role.type] || [];
    return defaultPermissions.includes(permission);
  }

  /**
   * Check if a user has any of the required permissions
   */
  hasAnyPermission(user: User, permissions: PermissionType[]): boolean {
    return permissions.some((permission) => this.hasPermission(user, permission));
  }

  /**
   * Check if a user has all of the required permissions
   */
  hasAllPermissions(user: User, permissions: PermissionType[]): boolean {
    return permissions.every((permission) => this.hasPermission(user, permission));
  }

  /**
   * Check if a user can access a specific resource and action
   */
  canAccessResource(user: User, resource: string, action: string): boolean {
    const permissionType = this.getPermissionType(resource, action);
    if (!permissionType) {
      return false;
    }
    return this.hasPermission(user, permissionType);
  }

  /**
   * Check if a user owns a resource (by ID comparison)
   */
  isOwner(user: User, resourceOwnerId: string): boolean {
    return user.id === resourceOwnerId;
  }

  /**
   * Check if a user belongs to the same organization
   */
  belongsToOrganization(user: User, organizationId: string): boolean {
    return user.organizationId === organizationId;
  }

  /**
   * Check if a user can access a resource within their organization
   */
  canAccessOrganizationResource(user: User, resourceOrganizationId: string): boolean {
    return this.belongsToOrganization(user, resourceOrganizationId);
  }

  /**
   * Get all permissions for a user (including inherited ones)
   */
  getUserPermissions(user: User): PermissionType[] {
    if (!user.role) {
      return [];
    }

    const permissions = new Set<PermissionType>();

    // Add explicit role permissions
    if (user.role.permissions) {
      user.role.permissions
        .filter((p) => p.isActive)
        .forEach((p) => permissions.add(p.type));
    }

    // Add default role permissions
    const defaultPermissions = this.defaultRolePermissions[user.role.type] || [];
    defaultPermissions.forEach((p) => permissions.add(p));

    return Array.from(permissions);
  }

  /**
   * Get permission type from resource and action
   */
  private getPermissionType(resource: string, action: string): PermissionType | null {
    const permissionKey = `${resource}:${action}`.toUpperCase();
    return PermissionType[permissionKey as keyof typeof PermissionType] || null;
  }

  /**
   * Log access attempt for audit purposes
   */
  logAccessAttempt(entry: Omit<AuditLogEntry, 'timestamp'>): void {
    const logEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date(),
    };

    this.auditLogs.push(logEntry);
    
    // Log to console for development
    console.log(`[RBAC Audit] ${logEntry.success ? 'ALLOWED' : 'DENIED'}: ${entry.userId} attempted ${entry.action} on ${entry.resource} at ${logEntry.timestamp.toISOString()}`);
    
    if (!logEntry.success && entry.reason) {
      console.log(`[RBAC Audit] Reason: ${entry.reason}`);
    }
  }

  /**
   * Get audit logs for a specific user
   */
  getAuditLogs(userId?: string, organizationId?: string): AuditLogEntry[] {
    return this.auditLogs.filter((log) => {
      if (userId && log.userId !== userId) return false;
      if (organizationId && log.organizationId !== organizationId) return false;
      return true;
    });
  }

  /**
   * Clear audit logs (useful for testing)
   */
  clearAuditLogs(): void {
    this.auditLogs = [];
  }
}
