export enum RoleType {
  OWNER = 'owner',
  ADMIN = 'admin',
  VIEWER = 'viewer'
}

export interface Role {
  id: string;
  name: string;
  type: RoleType;
  description?: string;
  organizationId: string;
  organization?: Organization;
  permissions?: Permission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
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

export interface Organization {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parent?: Organization;
  children?: Organization[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
