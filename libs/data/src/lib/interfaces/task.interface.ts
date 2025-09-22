// Forward declarations to avoid circular imports
import { User, Organization } from './user.interface';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  assignee?: User;
  createdById: string;
  createdBy: User;
  organizationId: string;
  organization?: Organization;
  dueDate?: Date;
  completedAt?: Date;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  DONE = 'done',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface CreateTaskDto {
  title: string;
  description: string;
  priority: TaskPriority;
  assigneeId?: string;
  organizationId: string;
  dueDate?: Date;
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  dueDate?: Date;
  tags?: string[];
  isPublic?: boolean;
}
