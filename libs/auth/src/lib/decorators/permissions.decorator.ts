import { SetMetadata } from '@nestjs/common';
import { PermissionType } from '../../../data/src';

export const PERMISSIONS_KEY = 'permissions';
export const PERMISSION_RESOURCE_KEY = 'permission_resource';
export const PERMISSION_ACTION_KEY = 'permission_action';

/**
 * Decorator to specify required permissions for a route
 * @param permissions Array of permission types required
 */
export const RequirePermissions = (...permissions: PermissionType[]) => 
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Decorator to specify a specific resource and action for permission checking
 * @param resource The resource being accessed
 * @param action The action being performed
 */
export const RequireResourceAction = (resource: string, action: string) => {
  return (target: any, propertyKey: string | symbol, descriptor?: any) => {
    // Apply both metadata decorators
    (SetMetadata(PERMISSION_RESOURCE_KEY, resource) as any)(target, propertyKey, descriptor);
    (SetMetadata(PERMISSION_ACTION_KEY, action) as any)(target, propertyKey, descriptor);
  };
};

/**
 * Decorator to require ownership of a resource
 * @param resourceParam The parameter name that contains the resource ID
 */
export const RequireOwnership = (resourceParam: string = 'id') => 
  SetMetadata('require_ownership', resourceParam);

/**
 * Decorator to require organization-level access
 * @param organizationParam The parameter name that contains the organization ID
 */
export const RequireOrganizationAccess = (organizationParam: string = 'organizationId') => 
  SetMetadata('require_organization_access', organizationParam);
