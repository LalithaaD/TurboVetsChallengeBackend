import { Controller, Get, UseGuards } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Get('me')
  async getCurrentUser(@CurrentUser() user: any) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organization: user.organization,
      isActive: user.isActive,
    };
  }

  @Get()
  async getAllUsers(@CurrentUser() currentUser: any) {
    // Only return users from the same organization
    const users = await this.userRepository.find({
      where: { organizationId: currentUser.organizationId },
      relations: ['role', 'organization'],
      select: ['id', 'email', 'username', 'firstName', 'lastName', 'isActive', 'createdAt'],
    });

    return users;
  }
}
