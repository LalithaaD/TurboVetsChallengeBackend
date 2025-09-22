import { SetMetadata } from '@nestjs/common';
import { RoleType } from '@turbo-vets/data';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for a route
 * @param roles Array of role types required
 */
export const RequireRoles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Legacy decorator for backward compatibility
 * @deprecated Use RequireRoles instead
 */
export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles);