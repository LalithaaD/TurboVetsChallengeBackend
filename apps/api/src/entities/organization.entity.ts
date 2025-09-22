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
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';
import { Task } from './task.entity';

@Entity('organizations')
@Tree('closure-table')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @TreeParent()
  parent?: Organization;

  @TreeChildren()
  children?: Organization[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Relationships
  @OneToMany(() => User, (user) => user.organization)
  users?: User[];

  @OneToMany(() => Role, (role) => role.organization)
  roles?: Role[];

  @OneToMany(() => Task, (task) => task.organization)
  tasks?: Task[];
}
