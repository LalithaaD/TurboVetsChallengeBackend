import { SetMetadata } from '@nestjs/common';
import { RoleType, PermissionType } from '../../../data/src';

export const ACCESS_CONTROL_KEY = 'access_control';

export interface AccessControlConfig {
  roles?: RoleType[];
  permissions?: PermissionType[];
  resource?: string;
  action?: string;
  requireOwnership?: boolean;
  requireOrganizationAccess?: boolean;
  ownershipParam?: string;
  organizationParam?: string;
  allowInheritance?: boolean;
}

/**
 * Comprehensive access control decorator that combines roles, permissions, and ownership checks
 * @param config Access control configuration
 */
export const AccessControl = (config: AccessControlConfig) => 
  SetMetadata(ACCESS_CONTROL_KEY, config);

/**
 * Decorator for public routes that don't require authentication
 */
export const Public = () => SetMetadata('isPublic', true);

/**
 * Decorator for routes that require authentication but no specific permissions
 */
export const Authenticated = () => SetMetadata('isAuthenticated', true);
