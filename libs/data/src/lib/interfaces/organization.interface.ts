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

export interface CreateOrganizationDto {
  name: string;
  description?: string;
  parentId?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
}
