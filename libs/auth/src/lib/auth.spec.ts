import { RbacService } from './services/rbac.service';

describe('Auth Library', () => {
  it('should export RbacService', () => {
    expect(RbacService).toBeDefined();
  });

  // For comprehensive RBAC testing, see rbac.spec.ts
});
