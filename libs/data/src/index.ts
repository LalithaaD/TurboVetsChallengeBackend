// Core interfaces - exported from user.interface.ts to avoid duplicates
export { 
  User, 
  Organization, 
  Role, 
  Permission,
  CreateUserDto,
  UpdateUserDto 
} from './lib/interfaces/user.interface';

// Task interfaces
export { 
  Task, 
  TaskStatus, 
  TaskPriority,
  CreateTaskDto,
  UpdateTaskDto 
} from './lib/interfaces/task.interface';

// Organization DTOs
export { 
  CreateOrganizationDto,
  UpdateOrganizationDto 
} from './lib/interfaces/organization.interface';

// Role interfaces
export { 
  RoleType,
  CreateRoleDto,
  UpdateRoleDto 
} from './lib/interfaces/role.interface';

// Permission interfaces
export { 
  PermissionType,
  CreatePermissionDto,
  UpdatePermissionDto 
} from './lib/interfaces/permission.interface';
