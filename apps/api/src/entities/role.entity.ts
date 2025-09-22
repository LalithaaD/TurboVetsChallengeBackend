import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { RoleType } from '@my-personal-project/data';
import { Organization } from './organization.entity';
import { Permission } from './permission.entity';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: RoleType,
  })
  type: RoleType;

  @Column({ nullable: true })
  description?: string;

  @Column()
  organizationId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Relationships
  @ManyToOne(() => Organization, (organization) => organization.roles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
  })
  permissions?: Permission[];

  @OneToMany(() => User, (user) => user.role)
  users?: User[];

  // Role hierarchy methods
  hasPermission(permissionType: string): boolean {
    if (!this.permissions) return false;
    return this.permissions.some(permission => 
      permission.type === permissionType && permission.isActive
    );
  }

  isHigherThan(otherRole: Role): boolean {
    const hierarchy = {
      [RoleType.OWNER]: 3,
      [RoleType.ADMIN]: 2,
      [RoleType.VIEWER]: 1,
    };
    return hierarchy[this.type] > hierarchy[otherRole.type];
  }

  canManageRole(otherRole: Role): boolean {
    return this.isHigherThan(otherRole) && this.organizationId === otherRole.organizationId;
  }
}
