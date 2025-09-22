import { DataSource } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { Organization } from '../entities/organization.entity';
import { Role } from '../entities/role.entity';
import { PermissionType } from '../../../../libs/data/src/lib/interfaces/permission.interface';
import { RoleType } from '../../../../libs/data/src/lib/interfaces/role.interface';
import { User } from '../entities/user.entity';

export async function seedDatabase(dataSource: DataSource) {
  const permissionRepository = dataSource.getRepository(Permission);
  const organizationRepository = dataSource.getRepository(Organization);
  const roleRepository = dataSource.getRepository(Role);
  const userRepository = dataSource.getRepository(User);

  // Create permissions
  const permissions = [
    // Task permissions
    { name: 'Create Task', type: PermissionType.TASK_CREATE, resource: 'task', action: 'create' },
    { name: 'Read Task', type: PermissionType.TASK_READ, resource: 'task', action: 'read' },
    { name: 'Update Task', type: PermissionType.TASK_UPDATE, resource: 'task', action: 'update' },
    { name: 'Delete Task', type: PermissionType.TASK_DELETE, resource: 'task', action: 'delete' },
    { name: 'Assign Task', type: PermissionType.TASK_ASSIGN, resource: 'task', action: 'assign' },
    
    // User permissions
    { name: 'Create User', type: PermissionType.USER_CREATE, resource: 'user', action: 'create' },
    { name: 'Read User', type: PermissionType.USER_READ, resource: 'user', action: 'read' },
    { name: 'Update User', type: PermissionType.USER_UPDATE, resource: 'user', action: 'update' },
    { name: 'Delete User', type: PermissionType.USER_DELETE, resource: 'user', action: 'delete' },
    
    // Organization permissions
    { name: 'Create Organization', type: PermissionType.ORGANIZATION_CREATE, resource: 'organization', action: 'create' },
    { name: 'Read Organization', type: PermissionType.ORGANIZATION_READ, resource: 'organization', action: 'read' },
    { name: 'Update Organization', type: PermissionType.ORGANIZATION_UPDATE, resource: 'organization', action: 'update' },
    { name: 'Delete Organization', type: PermissionType.ORGANIZATION_DELETE, resource: 'organization', action: 'delete' },
    
    // Role permissions
    { name: 'Create Role', type: PermissionType.ROLE_CREATE, resource: 'role', action: 'create' },
    { name: 'Read Role', type: PermissionType.ROLE_READ, resource: 'role', action: 'read' },
    { name: 'Update Role', type: PermissionType.ROLE_UPDATE, resource: 'role', action: 'update' },
    { name: 'Delete Role', type: PermissionType.ROLE_DELETE, resource: 'role', action: 'delete' },
    { name: 'Assign Role', type: PermissionType.ROLE_ASSIGN, resource: 'role', action: 'assign' },
    
    // Permission management
    { name: 'Read Permission', type: PermissionType.PERMISSION_READ, resource: 'permission', action: 'read' },
    { name: 'Manage Permission', type: PermissionType.PERMISSION_MANAGE, resource: 'permission', action: 'manage' },
  ];

  for (const permData of permissions) {
    const existingPermission = await permissionRepository.findOne({ where: { type: permData.type } });
    if (!existingPermission) {
      const permission = permissionRepository.create(permData);
      await permissionRepository.save(permission);
    }
  }

  // Create root organization
  let rootOrg = await organizationRepository.findOne({ where: { name: 'Root Organization' } });
  if (!rootOrg) {
    rootOrg = organizationRepository.create({
      name: 'Root Organization',
      description: 'The root organization for the system',
    });
    await organizationRepository.save(rootOrg);
  }

  // Create child organization
  let childOrg = await organizationRepository.findOne({ where: { name: 'Development Team' } });
  if (!childOrg) {
    childOrg = organizationRepository.create({
      name: 'Development Team',
      description: 'Development team organization',
      parent: rootOrg,
    });
    await organizationRepository.save(childOrg);
  }

  // Create roles
  const allPermissions = await permissionRepository.find();
  
  // Owner role - all permissions
  let ownerRole = await roleRepository.findOne({ where: { type: RoleType.OWNER } });
  if (!ownerRole) {
    ownerRole = roleRepository.create({
      name: 'Organization Owner',
      type: RoleType.OWNER,
      description: 'Full access to all resources',
      organization: rootOrg,
      permissions: allPermissions,
    });
    await roleRepository.save(ownerRole);
  }

  // Admin role - most permissions except organization management
  let adminRole = await roleRepository.findOne({ where: { type: RoleType.ADMIN } });
  if (!adminRole) {
    const adminPermissions = allPermissions.filter(p => 
      !p.type.includes('organization:') && 
      !p.type.includes('permission:manage')
    );
    adminRole = roleRepository.create({
      name: 'Organization Admin',
      type: RoleType.ADMIN,
      description: 'Administrative access to most resources',
      organization: rootOrg,
      permissions: adminPermissions,
    });
    await roleRepository.save(adminRole);
  }

  // Viewer role - read-only permissions
  let viewerRole = await roleRepository.findOne({ where: { type: RoleType.VIEWER } });
  if (!viewerRole) {
    const viewerPermissions = allPermissions.filter(p => 
      p.action === 'read' || p.type === PermissionType.TASK_READ
    );
    viewerRole = roleRepository.create({
      name: 'Organization Viewer',
      type: RoleType.VIEWER,
      description: 'Read-only access to resources',
      organization: rootOrg,
      permissions: viewerPermissions,
    });
    await roleRepository.save(viewerRole);
  }

  // Create default admin user
  let adminUser = await userRepository.findOne({ where: { email: 'admin@example.com' } });
  if (!adminUser) {
    adminUser = userRepository.create({
      email: 'admin@example.com',
      username: 'admin',
      password: 'admin123', // This will be hashed by the entity
      firstName: 'System',
      lastName: 'Administrator',
      organization: rootOrg,
      role: ownerRole,
    });
    await userRepository.save(adminUser);
  }

  console.log('Database seeded successfully!');
}
