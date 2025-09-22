export enum RoleType {
  OWNER = 'owner',
  ADMIN = 'admin',
  VIEWER = 'viewer'
}

export interface CreateRoleDto {
  name: string;
  type: RoleType;
  description?: string;
  organizationId: string;
  permissionIds?: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissionIds?: string[];
  isActive?: boolean;
}
