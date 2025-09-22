import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { RbacService } from '../../../../libs/auth/src';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, User]),
  ],
  controllers: [TasksController],
  providers: [RbacService],
  exports: [RbacService],
})
export class TasksModule {}
