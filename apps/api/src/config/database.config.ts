import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Permission } from '../entities/permission.entity';
import { Organization } from '../entities/organization.entity';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { Task } from '../entities/task.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [Permission, Organization, Role, User, Task],
  synchronize: true, // Only for development
  logging: true,
  // For PostgreSQL, use this configuration instead:
  // type: 'postgres',
  // host: process.env.DB_HOST || 'localhost',
  // port: parseInt(process.env.DB_PORT) || 5432,
  // username: process.env.DB_USERNAME || 'postgres',
  // password: process.env.DB_PASSWORD || 'password',
  // database: process.env.DB_NAME || 'my_personal_project',
  // entities: [Permission, Organization, Role, User, Task],
  // synchronize: process.env.NODE_ENV !== 'production',
  // logging: process.env.NODE_ENV === 'development',
};
