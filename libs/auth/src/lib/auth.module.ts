import { Module } from '@nestjs/common';
import { RbacService } from './services/rbac.service';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { OwnershipGuard } from './guards/ownership.guard';
import { OrganizationAccessGuard } from './guards/organization-access.guard';
import { AccessControlGuard } from './guards/access-control.guard';

@Module({
  providers: [
    RbacService,
    RolesGuard,
    PermissionsGuard,
    OwnershipGuard,
    OrganizationAccessGuard,
    AccessControlGuard,
  ],
  exports: [
    RbacService,
    RolesGuard,
    PermissionsGuard,
    OwnershipGuard,
    OrganizationAccessGuard,
    AccessControlGuard,
  ],
})
export class AuthModule {}
