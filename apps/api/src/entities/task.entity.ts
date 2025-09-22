import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeUpdate,
} from 'typeorm';
import { TaskStatus, TaskPriority } from '@my-personal-project/data';
import { User } from './user.entity';
import { Organization } from './organization.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Column({ nullable: true })
  assigneeId?: string;

  @Column()
  createdById: string;

  @Column()
  organizationId: string;

  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column('simple-array', { default: '' })
  tags: string[];

  @Column({ default: false })
  isPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.assignedTasks, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'assigneeId' })
  assignee?: User;

  @ManyToOne(() => User, (user) => user.createdTasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @ManyToOne(() => Organization, (organization) => organization.tasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  // Lifecycle hooks
  @BeforeUpdate()
  updateCompletedAt() {
    if (this.status === TaskStatus.DONE && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== TaskStatus.DONE && this.completedAt) {
      this.completedAt = undefined;
    }
  }

  // Utility methods
  get isOverdue(): boolean {
    if (!this.dueDate || this.status === TaskStatus.DONE) return false;
    return new Date() > this.dueDate;
  }

  get isAssigned(): boolean {
    return !!this.assigneeId;
  }

  get daysUntilDue(): number | null {
    if (!this.dueDate) return null;
    const now = new Date();
    const diffTime = this.dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  canBeAccessedBy(user: User): boolean {
    // Public tasks can be accessed by anyone in the organization
    if (this.isPublic) {
      return user.canAccessOrganization(this.organizationId);
    }

    // Private tasks can only be accessed by:
    // 1. The creator
    // 2. The assignee
    // 3. Users with appropriate permissions in the same organization
    return (
      this.createdById === user.id ||
      this.assigneeId === user.id ||
      (user.organizationId === this.organizationId && 
       user.hasPermission('task:read'))
    );
  }

  canBeModifiedBy(user: User): boolean {
    // Only users with task update permissions can modify tasks
    if (!user.hasPermission('task:update')) return false;

    // Must be in the same organization
    if (user.organizationId !== this.organizationId) return false;

    // Creator can always modify their tasks
    if (this.createdById === user.id) return true;

    // Assignee can modify if they have permission
    if (this.assigneeId === user.id) return true;

    // Admins and owners can modify any task in their organization
    return user.role?.type === 'admin' || user.role?.type === 'owner';
  }
}