-- Initial database schema for the personal project management system

-- Create permissions table
CREATE TABLE IF NOT EXISTS "permissions" (
    "id" varchar PRIMARY KEY,
    "name" varchar NOT NULL UNIQUE,
    "type" varchar NOT NULL UNIQUE,
    "description" varchar,
    "resource" varchar NOT NULL,
    "action" varchar NOT NULL,
    "isActive" boolean NOT NULL DEFAULT true,
    "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
    "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
    "deletedAt" datetime
);

-- Create organizations table with tree structure
CREATE TABLE IF NOT EXISTS "organizations" (
    "id" varchar PRIMARY KEY,
    "name" varchar NOT NULL,
    "description" varchar,
    "isActive" boolean NOT NULL DEFAULT true,
    "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
    "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
    "deletedAt" datetime
);

-- Create organization closure table for tree structure
CREATE TABLE IF NOT EXISTS "organizations_closure" (
    "id_ancestor" varchar NOT NULL,
    "id_descendant" varchar NOT NULL,
    PRIMARY KEY ("id_ancestor", "id_descendant"),
    FOREIGN KEY ("id_ancestor") REFERENCES "organizations"("id") ON DELETE CASCADE,
    FOREIGN KEY ("id_descendant") REFERENCES "organizations"("id") ON DELETE CASCADE
);

-- Create roles table
CREATE TABLE IF NOT EXISTS "roles" (
    "id" varchar PRIMARY KEY,
    "name" varchar NOT NULL,
    "type" varchar NOT NULL,
    "description" varchar,
    "organizationId" varchar NOT NULL,
    "isActive" boolean NOT NULL DEFAULT true,
    "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
    "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
    "deletedAt" datetime,
    FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS "role_permissions" (
    "roleId" varchar NOT NULL,
    "permissionId" varchar NOT NULL,
    PRIMARY KEY ("roleId", "permissionId"),
    FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE,
    FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE
);

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" varchar PRIMARY KEY,
    "email" varchar NOT NULL UNIQUE,
    "username" varchar NOT NULL UNIQUE,
    "password" varchar NOT NULL,
    "firstName" varchar NOT NULL,
    "lastName" varchar NOT NULL,
    "organizationId" varchar NOT NULL,
    "roleId" varchar NOT NULL,
    "isActive" boolean NOT NULL DEFAULT true,
    "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
    "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
    "deletedAt" datetime,
    FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE,
    FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS "tasks" (
    "id" varchar PRIMARY KEY,
    "title" varchar NOT NULL,
    "description" text NOT NULL,
    "status" varchar NOT NULL DEFAULT 'todo',
    "priority" varchar NOT NULL DEFAULT 'medium',
    "assigneeId" varchar,
    "createdById" varchar NOT NULL,
    "organizationId" varchar NOT NULL,
    "dueDate" datetime,
    "completedAt" datetime,
    "tags" text NOT NULL DEFAULT '',
    "isPublic" boolean NOT NULL DEFAULT false,
    "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
    "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
    "deletedAt" datetime,
    FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL,
    FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "IDX_organizations_name" ON "organizations" ("name");
CREATE INDEX IF NOT EXISTS "IDX_organizations_isActive" ON "organizations" ("isActive");
CREATE INDEX IF NOT EXISTS "IDX_roles_organizationId" ON "roles" ("organizationId");
CREATE INDEX IF NOT EXISTS "IDX_roles_type" ON "roles" ("type");
CREATE INDEX IF NOT EXISTS "IDX_users_email" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "IDX_users_username" ON "users" ("username");
CREATE INDEX IF NOT EXISTS "IDX_users_organizationId" ON "users" ("organizationId");
CREATE INDEX IF NOT EXISTS "IDX_users_roleId" ON "users" ("roleId");
CREATE INDEX IF NOT EXISTS "IDX_tasks_status" ON "tasks" ("status");
CREATE INDEX IF NOT EXISTS "IDX_tasks_priority" ON "tasks" ("priority");
CREATE INDEX IF NOT EXISTS "IDX_tasks_assigneeId" ON "tasks" ("assigneeId");
CREATE INDEX IF NOT EXISTS "IDX_tasks_createdById" ON "tasks" ("createdById");
CREATE INDEX IF NOT EXISTS "IDX_tasks_organizationId" ON "tasks" ("organizationId");
CREATE INDEX IF NOT EXISTS "IDX_tasks_dueDate" ON "tasks" ("dueDate");
