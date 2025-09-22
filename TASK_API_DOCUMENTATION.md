# Task API Endpoints Documentation

This document describes the complete Task API implementation with RBAC (Role-Based Access Control) enforcement.

## Overview

The Task API provides comprehensive task management functionality with the following features:
- JWT-based authentication
- Role-based access control (RBAC)
- Organization-scoped task visibility
- Audit logging
- Input validation
- Proper error handling

## Authentication

All endpoints (except public auth endpoints) require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. POST /tasks - Create Task

Creates a new task with permission checking.

**Authentication:** Required  
**Permissions:** `task:create`

**Request Body:**
```json
{
  "title": "string (required, 1-255 chars)",
  "description": "string (required, 1-2000 chars)",
  "priority": "low|medium|high|urgent (optional, default: medium)",
  "assigneeId": "uuid (optional)",
  "dueDate": "ISO date string (optional)",
  "tags": "string[] (optional)",
  "isPublic": "boolean (optional, default: false)"
}
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Task created successfully",
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "status": "todo",
    "priority": "medium",
    "assigneeId": "uuid|null",
    "createdById": "uuid",
    "organizationId": "uuid",
    "dueDate": "ISO date|null",
    "completedAt": "ISO date|null",
    "tags": "string[]",
    "isPublic": "boolean",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input data
- `403 Forbidden` - Insufficient permissions or assignee validation failed
- `401 Unauthorized` - Invalid or missing JWT token

### 2. GET /tasks - List Accessible Tasks

Retrieves tasks with role and organization-based scoping.

**Authentication:** Required  
**Permissions:** `task:read`

**Query Parameters:**
- `page` (optional): Page number (default: 1, min: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `status` (optional): Filter by status (`todo`, `in_progress`, `in_review`, `done`, `cancelled`)
- `priority` (optional): Filter by priority (`low`, `medium`, `high`, `urgent`)
- `assigneeId` (optional): Filter by assignee UUID
- `createdById` (optional): Filter by creator UUID
- `isPublic` (optional): Filter by public status
- `search` (optional): Search in title and description

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "status": "todo",
      "priority": "medium",
      "assignee": {
        "id": "uuid",
        "username": "string",
        "firstName": "string",
        "lastName": "string"
      },
      "createdBy": {
        "id": "uuid",
        "username": "string",
        "firstName": "string",
        "lastName": "string"
      },
      "organization": {
        "id": "uuid",
        "name": "string"
      },
      "dueDate": "ISO date|null",
      "completedAt": "ISO date|null",
      "tags": "string[]",
      "isPublic": "boolean",
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Visibility Rules:**
- **Owners/Admins**: Can see all tasks in their organization
- **Viewers**: Can only see public tasks or tasks assigned to them or created by them
- **Default**: Users can see public tasks or tasks they're involved with

### 3. PUT /tasks/:id - Edit Task

Updates an existing task with permission checking.

**Authentication:** Required  
**Permissions:** `task:update`

**Path Parameters:**
- `id`: Task UUID

**Request Body:**
```json
{
  "title": "string (optional, 1-255 chars)",
  "description": "string (optional, 1-2000 chars)",
  "status": "todo|in_progress|in_review|done|cancelled (optional)",
  "priority": "low|medium|high|urgent (optional)",
  "assigneeId": "uuid (optional)",
  "dueDate": "ISO date string (optional)",
  "tags": "string[] (optional)",
  "isPublic": "boolean (optional)"
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Task updated successfully",
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "status": "todo",
    "priority": "medium",
    "assignee": {
      "id": "uuid",
      "username": "string",
      "firstName": "string",
      "lastName": "string"
    },
    "createdBy": {
      "id": "uuid",
      "username": "string",
      "firstName": "string",
      "lastName": "string"
    },
    "organization": {
      "id": "uuid",
      "name": "string"
    },
    "dueDate": "ISO date|null",
    "completedAt": "ISO date|null",
    "tags": "string[]",
    "isPublic": "boolean",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

**Modification Rules:**
- Creator can always modify their tasks
- Assignee can modify if they have permission
- Admins/Owners can modify any task in their organization
- Must be in the same organization
- Requires `task:assign` permission to change assignee

### 4. DELETE /tasks/:id - Delete Task

Soft deletes a task with permission checking.

**Authentication:** Required  
**Permissions:** `task:delete`

**Path Parameters:**
- `id`: Task UUID

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Task deleted successfully"
}
```

**Deletion Rules:**
- Same rules as task modification
- Task is soft deleted (marked as deleted, not permanently removed)

### 5. GET /tasks/audit-log - View Access Logs

Retrieves audit logs for access monitoring (Owner/Admin only).

**Authentication:** Required  
**Permissions:** `permission:read` + Owner/Admin role

**Query Parameters:**
- `page` (optional): Page number (default: 1, min: 1)
- `limit` (optional): Items per page (default: 50, max: 100)
- `userId` (optional): Filter by user UUID
- `action` (optional): Filter by action type
- `resource` (optional): Filter by resource type
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Audit logs retrieved successfully",
  "data": [
    {
      "userId": "uuid",
      "action": "create",
      "resource": "task",
      "resourceId": "uuid",
      "organizationId": "uuid",
      "timestamp": "ISO date",
      "success": true,
      "ipAddress": "string",
      "userAgent": "string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1000,
    "totalPages": 20
  }
}
```

## Role-Based Access Control

### Role Hierarchy
1. **Owner** - Full access to all resources in organization
2. **Admin** - Manage users, tasks, and organization settings
3. **Viewer** - Read-only access to assigned and public resources

### Permission Matrix

| Permission | Owner | Admin | Viewer |
|------------|-------|-------|--------|
| `task:create` | ✅ | ✅ | ❌ |
| `task:read` | ✅ | ✅ | ✅ |
| `task:update` | ✅ | ✅ | ❌ |
| `task:delete` | ✅ | ✅ | ❌ |
| `task:assign` | ✅ | ✅ | ❌ |
| `permission:read` | ✅ | ✅ | ✅ |

### Task Visibility Rules

**Public Tasks:**
- Visible to all users in the same organization

**Private Tasks:**
- Visible to creator, assignee, and users with `task:read` permission in the same organization

**Role-Specific Visibility:**
- **Owners/Admins**: See all tasks in their organization
- **Viewers**: See only public tasks or tasks they're involved with

## Error Handling

All endpoints return consistent error responses:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

**Common Error Codes:**
- `400 Bad Request` - Invalid input data or validation errors
- `401 Unauthorized` - Missing or invalid JWT token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Validation Rules

### Task Title
- Required
- 1-255 characters
- String type

### Task Description
- Required
- 1-2000 characters
- String type

### Priority
- Optional
- Enum: `low`, `medium`, `high`, `urgent`
- Default: `medium`

### Status
- Optional (for updates)
- Enum: `todo`, `in_progress`, `in_review`, `done`, `cancelled`
- Default: `todo`

### Assignee ID
- Optional
- Must be valid UUID
- Must be user in same organization
- Requires `task:assign` permission

### Due Date
- Optional
- ISO date string format
- Must be valid date

### Tags
- Optional
- Array of strings
- Default: empty array

### Is Public
- Optional
- Boolean type
- Default: `false`

## Example Usage

### Create a Task
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication to the API",
    "priority": "high",
    "isPublic": true,
    "tags": ["backend", "auth", "jwt"]
  }'
```

### List Tasks with Filters
```bash
curl -X GET "http://localhost:3000/tasks?status=todo&priority=high&page=1&limit=10" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Update Task Status
```bash
curl -X PUT http://localhost:3000/tasks/<task-id> \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "assigneeId": "<user-id>"
  }'
```

### View Audit Logs
```bash
curl -X GET "http://localhost:3000/tasks/audit-log?page=1&limit=20" \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Security Features

1. **JWT Authentication**: All endpoints require valid JWT tokens
2. **RBAC Enforcement**: Role-based permissions are enforced at the controller level
3. **Organization Scoping**: Users can only access resources within their organization
4. **Input Validation**: All inputs are validated using class-validator decorators
5. **Audit Logging**: All access attempts are logged for security monitoring
6. **Soft Deletion**: Tasks are soft deleted to maintain data integrity
7. **SQL Injection Protection**: TypeORM provides built-in SQL injection protection

## Performance Considerations

1. **Pagination**: All list endpoints support pagination to handle large datasets
2. **Database Indexing**: Proper indexes should be created on frequently queried fields
3. **Query Optimization**: Uses TypeORM query builder for efficient database queries
4. **Caching**: Consider implementing Redis caching for frequently accessed data
5. **Rate Limiting**: Implement rate limiting to prevent abuse

## Testing

Use the provided test script to verify endpoint functionality:

```bash
node test-task-endpoints.js
```

This script tests all endpoints with proper authentication and validates the complete workflow.
