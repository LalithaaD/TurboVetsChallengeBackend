import { Test, TestingModule } from '@nestjs/testing';
import { RbacService } from './services/rbac.service';
import { RoleType, PermissionType, User, Role, Organization } from '@turbo-vets/data';

describe('RbacService', () => {
  let service: RbacService;

  const mockOrganization: Organization = {
    id: 'org-1',
    name: 'Test Organization',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRole: Role = {
    id: 'role-1',
    name: 'Test Role',
    type: RoleType.ADMIN,
    organizationId: 'org-1',
    organization: mockOrganization,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    organizationId: 'org-1',
    organization: mockOrganization,
    roleId: 'role-1',
    role: mockRole,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RbacService],
    }).compile();

    service = module.get<RbacService>(RbacService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Role checking', () => {
    it('should check if user has specific role', () => {
      expect(service.hasRole(mockUser, RoleType.ADMIN)).toBe(true);
      expect(service.hasRole(mockUser, RoleType.OWNER)).toBe(false);
    });

    it('should check if user has any of the required roles', () => {
      expect(service.hasAnyRole(mockUser, [RoleType.ADMIN, RoleType.OWNER])).toBe(true);
      expect(service.hasAnyRole(mockUser, [RoleType.VIEWER])).toBe(false);
    });

    it('should check role hierarchy', () => {
      expect(service.hasRoleOrHigher(mockUser, RoleType.VIEWER)).toBe(true);
      expect(service.hasRoleOrHigher(mockUser, RoleType.ADMIN)).toBe(true);
      expect(service.hasRoleOrHigher(mockUser, RoleType.OWNER)).toBe(false);
    });
  });

  describe('Permission checking', () => {
    it('should check if user has specific permission', () => {
      expect(service.hasPermission(mockUser, PermissionType.TASK_CREATE)).toBe(true);
      expect(service.hasPermission(mockUser, PermissionType.USER_DELETE)).toBe(false);
    });

    it('should check if user has any of the required permissions', () => {
      expect(service.hasAnyPermission(mockUser, [PermissionType.TASK_CREATE, PermissionType.USER_DELETE])).toBe(true);
      expect(service.hasAnyPermission(mockUser, [PermissionType.USER_DELETE, PermissionType.ORGANIZATION_DELETE])).toBe(false);
    });

    it('should check if user has all required permissions', () => {
      expect(service.hasAllPermissions(mockUser, [PermissionType.TASK_CREATE, PermissionType.TASK_READ])).toBe(true);
      expect(service.hasAllPermissions(mockUser, [PermissionType.TASK_CREATE, PermissionType.USER_DELETE])).toBe(false);
    });
  });

  describe('Resource access', () => {
    it('should check resource access', () => {
      expect(service.canAccessResource(mockUser, 'task', 'create')).toBe(true);
      expect(service.canAccessResource(mockUser, 'user', 'delete')).toBe(false);
    });
  });

  describe('Ownership and organization access', () => {
    it('should check ownership', () => {
      expect(service.isOwner(mockUser, 'user-1')).toBe(true);
      expect(service.isOwner(mockUser, 'user-2')).toBe(false);
    });

    it('should check organization access', () => {
      expect(service.canAccessOrganizationResource(mockUser, 'org-1')).toBe(true);
      expect(service.canAccessOrganizationResource(mockUser, 'org-2')).toBe(false);
    });
  });

  describe('User permissions', () => {
    it('should get all user permissions', () => {
      const permissions = service.getUserPermissions(mockUser);
      expect(permissions).toContain(PermissionType.TASK_CREATE);
      expect(permissions).toContain(PermissionType.TASK_READ);
      expect(permissions).not.toContain(PermissionType.USER_DELETE);
    });
  });

  describe('Audit logging', () => {
    it('should log access attempts', () => {
      service.logAccessAttempt({
        userId: 'user-1',
        action: 'test_action',
        resource: 'test_resource',
        organizationId: 'org-1',
        success: true,
      });

      const logs = service.getAuditLogs('user-1');
      expect(logs).toHaveLength(1);
      expect(logs[0].userId).toBe('user-1');
      expect(logs[0].action).toBe('test_action');
      expect(logs[0].success).toBe(true);
    });

    it('should clear audit logs', () => {
      service.logAccessAttempt({
        userId: 'user-1',
        action: 'test_action',
        resource: 'test_resource',
        organizationId: 'org-1',
        success: true,
      });

      service.clearAuditLogs();
      const logs = service.getAuditLogs();
      expect(logs).toHaveLength(0);
    });
  });
});
