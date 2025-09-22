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
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Organization } from './organization.entity';
import { Role } from './role.entity';
import { Task } from './task.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  organizationId: string;

  @Column()
  roleId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Relationships
  @ManyToOne(() => Organization, (organization) => organization.users, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ManyToOne(() => Role, (role) => role.users, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @OneToMany(() => Task, (task) => task.createdBy)
  createdTasks?: Task[];

  @OneToMany(() => Task, (task) => task.assignee)
  assignedTasks?: Task[];

  // Password hashing
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  // Utility methods
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  hasPermission(permissionType: string): boolean {
    return this.role?.hasPermission(permissionType) || false;
  }

  canManageUser(otherUser: User): boolean {
    if (this.organizationId !== otherUser.organizationId) return false;
    return this.role?.canManageRole(otherUser.role) || false;
  }

  canAccessOrganization(organizationId: string): boolean {
    // Users can access their own organization and parent organizations
    return this.organizationId === organizationId || 
           this.isInOrganizationHierarchy(organizationId);
  }

  private isInOrganizationHierarchy(organizationId: string): boolean {
    // This would need to be implemented with a recursive check
    // For now, we'll assume users can only access their direct organization
    return this.organizationId === organizationId;
  }
}
