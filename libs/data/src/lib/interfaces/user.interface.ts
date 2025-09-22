import { RoleType } from './role.interface';
import { PermissionType } from './permission.interface';

// Forward declarations to avoid circular imports
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

export interface Permission {
  id: string;
  name: string;
  type: PermissionType;
  description?: string;
  resource: string;
  action: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface User {
  id: string;
  email: string;
  username: string;
  password?: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  organization?: Organization;
  roleId: string;
  role?: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  roleId: string;
}

export interface UpdateUserDto {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  organizationId?: string;
  roleId?: string;
  isActive?: boolean;
}
