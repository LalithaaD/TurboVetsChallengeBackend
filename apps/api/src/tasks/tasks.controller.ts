import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
  HttpStatus,
  HttpException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions, RbacService } from '../../../../libs/auth/src';
import { PermissionType } from '../../../../libs/data/src/lib/interfaces/permission.interface';
import { RoleType } from '../../../../libs/data/src/lib/interfaces/role.interface';
import { CreateTaskDto, TaskPriority } from './dto/create-task.dto';
import { UpdateTaskDto, TaskStatus } from './dto/update-task.dto';
import { TaskListQueryDto, AuditLogQueryDto, TaskStatus as TaskStatusFromQuery, TaskPriority as TaskPriorityFromQuery } from './dto/task-query.dto';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private rbacService: RbacService,
  ) {}

  /**
   * POST /tasks – Create task (with permission check)
   */
  @Post()
  @RequirePermissions(PermissionType.TASK_CREATE)
  async createTask(
    @Body(ValidationPipe) createTaskDto: CreateTaskDto,
    @CurrentUser() currentUser: User,
  ) {
    try {
      // Validate assignee if provided
      if (createTaskDto.assigneeId) {
        const assignee = await this.userRepository.findOne({
          where: { id: createTaskDto.assigneeId, organizationId: currentUser.organizationId },
        });
        
        if (!assignee) {
          throw new BadRequestException('Assignee not found or not in the same organization');
        }

        // Check if user has permission to assign tasks
        if (!this.rbacService.hasPermission(currentUser, PermissionType.TASK_ASSIGN)) {
          throw new ForbiddenException('You do not have permission to assign tasks');
        }
      }

      const task = this.taskRepository.create({
        ...createTaskDto,
        createdById: currentUser.id,
        organizationId: currentUser.organizationId,
        tags: createTaskDto.tags || [],
      });

      const savedTask = await this.taskRepository.save(task);

      // Log the action
      this.rbacService.logAccessAttempt({
        userId: currentUser.id,
        action: 'create',
        resource: 'task',
        resourceId: savedTask.id,
        organizationId: currentUser.organizationId,
        success: true,
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Task created successfully',
        data: savedTask,
      };
    } catch (error) {
      this.rbacService.logAccessAttempt({
        userId: currentUser.id,
        action: 'create',
        resource: 'task',
        organizationId: currentUser.organizationId,
        success: false,
        reason: error.message,
      });

      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to create task');
    }
  }

  /**
   * GET /tasks – List accessible tasks (scoped to role/org)
   */
  @Get()
  @RequirePermissions(PermissionType.TASK_READ)
  async getTasks(
    @Query(ValidationPipe) query: TaskListQueryDto,
    @CurrentUser() currentUser: User,
  ) {
    try {
      const page = query.page || 1;
      const limit = Math.min(query.limit || 20, 100); // Max 100 items per page
      const offset = (page - 1) * limit;

      // Build query with proper scoping based on user role and organization
      const queryBuilder = this.taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.assignee', 'assignee')
        .leftJoinAndSelect('task.createdBy', 'createdBy')
        .leftJoinAndSelect('task.organization', 'organization')
        .where('task.organizationId = :organizationId', { 
          organizationId: currentUser.organizationId 
        });

      // Apply role-based visibility
      if (currentUser.role?.type === RoleType.VIEWER) {
        // Viewers can only see public tasks or tasks assigned to them
        queryBuilder.andWhere(
          '(task.isPublic = true OR task.assigneeId = :userId OR task.createdById = :userId)',
          { userId: currentUser.id }
        );
      } else if (currentUser.role?.type === RoleType.ADMIN) {
        // Admins can see all tasks in their organization
        // No additional restrictions needed
      } else if (currentUser.role?.type === RoleType.OWNER) {
        // Owners can see all tasks in their organization
        // No additional restrictions needed
      } else {
        // Default: users can see public tasks or tasks they're involved with
        queryBuilder.andWhere(
          '(task.isPublic = true OR task.assigneeId = :userId OR task.createdById = :userId)',
          { userId: currentUser.id }
        );
      }

      // Apply filters
      if (query.status) {
        queryBuilder.andWhere('task.status = :status', { status: query.status });
      }

      if (query.priority) {
        queryBuilder.andWhere('task.priority = :priority', { priority: query.priority });
      }

      if (query.assigneeId) {
        queryBuilder.andWhere('task.assigneeId = :assigneeId', { assigneeId: query.assigneeId });
      }

      if (query.createdById) {
        queryBuilder.andWhere('task.createdById = :createdById', { createdById: query.createdById });
      }

      if (query.isPublic !== undefined) {
        queryBuilder.andWhere('task.isPublic = :isPublic', { isPublic: query.isPublic });
      }

      if (query.search) {
        queryBuilder.andWhere(
          '(task.title ILIKE :search OR task.description ILIKE :search)',
          { search: `%${query.search}%` }
        );
      }

      // Add ordering
      queryBuilder.orderBy('task.createdAt', 'DESC');

      // Get total count
      const total = await queryBuilder.getCount();

      // Apply pagination
      queryBuilder.skip(offset).take(limit);

      const tasks = await queryBuilder.getMany();

      // Log the action
      this.rbacService.logAccessAttempt({
        userId: currentUser.id,
        action: 'read',
        resource: 'task',
        organizationId: currentUser.organizationId,
        success: true,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Tasks retrieved successfully',
        data: tasks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.rbacService.logAccessAttempt({
        userId: currentUser.id,
        action: 'read',
        resource: 'task',
        organizationId: currentUser.organizationId,
        success: false,
        reason: error.message,
      });

      throw new BadRequestException('Failed to retrieve tasks');
    }
  }

  /**
   * PUT /tasks/:id – Edit task (if permitted)
   */
  @Put(':id')
  @RequirePermissions(PermissionType.TASK_UPDATE)
  async updateTask(
    @Param('id') taskId: string,
    @Body(ValidationPipe) updateTaskDto: UpdateTaskDto,
    @CurrentUser() currentUser: User,
  ) {
    try {
      // Find the task
      const task = await this.taskRepository.findOne({
        where: { id: taskId, organizationId: currentUser.organizationId },
        relations: ['assignee', 'createdBy', 'organization'],
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      // Check if user can modify this task
      if (!task.canBeModifiedBy(currentUser)) {
        throw new ForbiddenException('You do not have permission to modify this task');
      }

      // Validate assignee if being updated
      if (updateTaskDto.assigneeId !== undefined && updateTaskDto.assigneeId !== null) {
        if (updateTaskDto.assigneeId) {
          const assignee = await this.userRepository.findOne({
            where: { id: updateTaskDto.assigneeId, organizationId: currentUser.organizationId },
          });
          
          if (!assignee) {
            throw new BadRequestException('Assignee not found or not in the same organization');
          }
        }

        // Check if user has permission to assign tasks
        if (!this.rbacService.hasPermission(currentUser, PermissionType.TASK_ASSIGN)) {
          throw new ForbiddenException('You do not have permission to assign tasks');
        }
      }

      // Update the task
      Object.assign(task, updateTaskDto);
      const updatedTask = await this.taskRepository.save(task);

      // Log the action
      this.rbacService.logAccessAttempt({
        userId: currentUser.id,
        action: 'update',
        resource: 'task',
        resourceId: taskId,
        organizationId: currentUser.organizationId,
        success: true,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Task updated successfully',
        data: updatedTask,
      };
    } catch (error) {
      this.rbacService.logAccessAttempt({
        userId: currentUser.id,
        action: 'update',
        resource: 'task',
        resourceId: taskId,
        organizationId: currentUser.organizationId,
        success: false,
        reason: error.message,
      });

      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to update task');
    }
  }

  /**
   * DELETE /tasks/:id – Delete task (if permitted)
   */
  @Delete(':id')
  @RequirePermissions(PermissionType.TASK_DELETE)
  async deleteTask(
    @Param('id') taskId: string,
    @CurrentUser() currentUser: User,
  ) {
    try {
      // Find the task
      const task = await this.taskRepository.findOne({
        where: { id: taskId, organizationId: currentUser.organizationId },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      // Check if user can modify this task
      if (!task.canBeModifiedBy(currentUser)) {
        throw new ForbiddenException('You do not have permission to delete this task');
      }

      // Soft delete the task
      await this.taskRepository.softDelete(taskId);

      // Log the action
      this.rbacService.logAccessAttempt({
        userId: currentUser.id,
        action: 'delete',
        resource: 'task',
        resourceId: taskId,
        organizationId: currentUser.organizationId,
        success: true,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Task deleted successfully',
      };
    } catch (error) {
      this.rbacService.logAccessAttempt({
        userId: currentUser.id,
        action: 'delete',
        resource: 'task',
        resourceId: taskId,
        organizationId: currentUser.organizationId,
        success: false,
        reason: error.message,
      });

      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete task');
    }
  }

  /**
   * GET /audit-log – View access logs (Owner/Admin only)
   */
  @Get('audit-log')
  @RequirePermissions(PermissionType.PERMISSION_READ)
  async getAuditLogs(
    @Query(ValidationPipe) query: AuditLogQueryDto,
    @CurrentUser() currentUser: User,
  ) {
    try {
      // Check if user has permission to view audit logs
      // Only owners and admins can view audit logs
      if (!this.rbacService.hasAnyRole(currentUser, [RoleType.OWNER, RoleType.ADMIN])) {
        throw new ForbiddenException('Only owners and admins can view audit logs');
      }

      const page = query.page || 1;
      const limit = Math.min(query.limit || 50, 100); // Max 100 items per page
      const offset = (page - 1) * limit;

      // Get audit logs from RBAC service
      let auditLogs = this.rbacService.getAuditLogs(query.userId, currentUser.organizationId);

      // Apply filters
      if (query.action) {
        auditLogs = auditLogs.filter((log: any) => log.action.includes(query.action));
      }

      if (query.resource) {
        auditLogs = auditLogs.filter((log: any) => log.resource.includes(query.resource));
      }

      if (query.startDate) {
        auditLogs = auditLogs.filter((log: any) => log.timestamp >= query.startDate!);
      }

      if (query.endDate) {
        auditLogs = auditLogs.filter((log: any) => log.timestamp <= query.endDate!);
      }

      // Sort by timestamp descending
      auditLogs.sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime());

      const total = auditLogs.length;
      const paginatedLogs = auditLogs.slice(offset, offset + limit);

      // Log the action
      this.rbacService.logAccessAttempt({
        userId: currentUser.id,
        action: 'read',
        resource: 'audit_log',
        organizationId: currentUser.organizationId,
        success: true,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Audit logs retrieved successfully',
        data: paginatedLogs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.rbacService.logAccessAttempt({
        userId: currentUser.id,
        action: 'read',
        resource: 'audit_log',
        organizationId: currentUser.organizationId,
        success: false,
        reason: error.message,
      });

      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve audit logs');
    }
  }
}
