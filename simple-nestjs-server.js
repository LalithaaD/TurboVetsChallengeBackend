/**
 * Simplified NestJS-style server with task management
 * This bypasses the complex build system and provides a working NestJS-like API
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

// In-memory storage (for testing only)
const users = [];
const tasks = [];
const auditLogs = [];

// Middleware
app.use(cors());
app.use(express.json());

// JWT verification middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to log audit events
const logAuditEvent = (userId, action, resource, resourceId, success, reason) => {
  const logEntry = {
    id: uuidv4(),
    userId,
    action,
    resource,
    resourceId,
    organizationId: 'default-org',
    timestamp: new Date(),
    success,
    reason,
    ipAddress: '127.0.0.1',
    userAgent: 'test-client'
  };
  auditLogs.push(logEntry);
  console.log(`[AUDIT] ${success ? 'SUCCESS' : 'FAILED'}: ${action} ${resource} by ${userId}`);
};

// Helper function to get user from token
const getUserFromToken = (req) => {
  return users.find(u => u.id === req.user.sub);
};

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'NestJS-style Task API Server is running!' });
});

// Registration endpoint
app.post('/auth/register', async (req, res) => {
  try {
    const { email, username, password, firstName, lastName } = req.body;

    // Validation
    if (!email || !username || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    if (users.find(u => u.email === email || u.username === username)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create user
    const user = {
      id: Date.now().toString(),
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
      role: { type: 'admin', name: 'Admin' }, // Default to admin for testing
      organizationId: 'default-org',
      organization: { id: 'default-org', name: 'Default Organization' },
      isActive: true,
      createdAt: new Date()
    };

    users.push(user);

    // Generate JWT token
    const token = jwt.sign(
      { 
        email: user.email, 
        sub: user.id, 
        username: user.username,
        role: user.role?.name,
        organizationId: user.organizationId
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      access_token: token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login endpoint
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'User account is inactive' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        email: user.email, 
        sub: user.id, 
        username: user.username,
        role: user.role?.name,
        organizationId: user.organizationId
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      access_token: token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user profile endpoint
app.get('/auth/profile', authenticateToken, (req, res) => {
  const user = getUserFromToken(req);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// TASK ENDPOINTS (NestJS-style with proper validation and RBAC)

// Create task endpoint
app.post('/tasks', authenticateToken, (req, res) => {
  try {
    const { title, description, priority = 'medium', assigneeId, dueDate, tags = [], isPublic = false } = req.body;
    const user = getUserFromToken(req);

    // Validation
    if (!title || !description) {
      logAuditEvent(user.id, 'create', 'task', null, false, 'Missing required fields');
      return res.status(400).json({ 
        statusCode: 400,
        message: 'Title and description are required',
        error: 'Bad Request'
      });
    }

    // Validate assignee if provided
    if (assigneeId && !users.find(u => u.id === assigneeId)) {
      logAuditEvent(user.id, 'create', 'task', null, false, 'Assignee not found');
      return res.status(400).json({ 
        statusCode: 400,
        message: 'Assignee not found',
        error: 'Bad Request'
      });
    }

    // Create task
    const task = {
      id: uuidv4(),
      title,
      description,
      status: 'todo',
      priority,
      assigneeId: assigneeId || null,
      createdById: user.id,
      organizationId: user.organizationId,
      dueDate: dueDate ? new Date(dueDate) : null,
      completedAt: null,
      tags,
      isPublic,
      createdAt: new Date(),
      updatedAt: new Date(),
      assignee: assigneeId ? users.find(u => u.id === assigneeId) : null,
      createdBy: user,
      organization: user.organization
    };

    tasks.push(task);

    logAuditEvent(user.id, 'create', 'task', task.id, true);
    res.status(201).json({
      statusCode: 201,
      message: 'Task created successfully',
      data: task
    });

  } catch (error) {
    console.error('Create task error:', error);
    const user = getUserFromToken(req);
    logAuditEvent(user.id, 'create', 'task', null, false, error.message);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error'
    });
  }
});

// List tasks endpoint with advanced filtering
app.get('/tasks', authenticateToken, (req, res) => {
  try {
    const user = getUserFromToken(req);
    const { page = 1, limit = 20, status, priority, assigneeId, createdById, isPublic, search } = req.query;

    let filteredTasks = tasks.filter(task => task.organizationId === user.organizationId);

    // Apply role-based visibility
    if (user.role?.type === 'viewer') {
      filteredTasks = filteredTasks.filter(task => 
        task.isPublic || task.assigneeId === user.id || task.createdById === user.id
      );
    }

    // Apply filters
    if (status) filteredTasks = filteredTasks.filter(task => task.status === status);
    if (priority) filteredTasks = filteredTasks.filter(task => task.priority === priority);
    if (assigneeId) filteredTasks = filteredTasks.filter(task => task.assigneeId === assigneeId);
    if (createdById) filteredTasks = filteredTasks.filter(task => task.createdById === createdById);
    if (isPublic !== undefined) filteredTasks = filteredTasks.filter(task => task.isPublic === (isPublic === 'true'));
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(searchLower) || 
        task.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort by creation date (newest first)
    filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

    logAuditEvent(user.id, 'read', 'task', null, true);
    res.json({
      statusCode: 200,
      message: 'Tasks retrieved successfully',
      data: paginatedTasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredTasks.length,
        totalPages: Math.ceil(filteredTasks.length / limit)
      }
    });

  } catch (error) {
    console.error('List tasks error:', error);
    const user = getUserFromToken(req);
    logAuditEvent(user.id, 'read', 'task', null, false, error.message);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error'
    });
  }
});

// Update task endpoint
app.put('/tasks/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assigneeId, dueDate, tags, isPublic } = req.body;
    const user = getUserFromToken(req);

    const taskIndex = tasks.findIndex(task => task.id === id && task.organizationId === user.organizationId);
    if (taskIndex === -1) {
      logAuditEvent(user.id, 'update', 'task', id, false, 'Task not found');
      return res.status(404).json({ 
        statusCode: 404,
        message: 'Task not found',
        error: 'Not Found'
      });
    }

    const task = tasks[taskIndex];

    // Check permissions
    const canModify = task.createdById === user.id || 
                     task.assigneeId === user.id || 
                     user.role?.type === 'admin' || 
                     user.role?.type === 'owner';

    if (!canModify) {
      logAuditEvent(user.id, 'update', 'task', id, false, 'Insufficient permissions');
      return res.status(403).json({ 
        statusCode: 403,
        message: 'You do not have permission to modify this task',
        error: 'Forbidden'
      });
    }

    // Validate assignee if being updated
    if (assigneeId && !users.find(u => u.id === assigneeId)) {
      logAuditEvent(user.id, 'update', 'task', id, false, 'Assignee not found');
      return res.status(400).json({ 
        statusCode: 400,
        message: 'Assignee not found',
        error: 'Bad Request'
      });
    }

    // Update task
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (assigneeId !== undefined) {
      task.assigneeId = assigneeId;
      task.assignee = assigneeId ? users.find(u => u.id === assigneeId) : null;
    }
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (tags !== undefined) task.tags = tags;
    if (isPublic !== undefined) task.isPublic = isPublic;
    
    task.updatedAt = new Date();

    // Auto-set completedAt when status changes to done
    if (status === 'done' && !task.completedAt) {
      task.completedAt = new Date();
    } else if (status !== 'done' && task.completedAt) {
      task.completedAt = null;
    }

    logAuditEvent(user.id, 'update', 'task', id, true);
    res.json({
      statusCode: 200,
      message: 'Task updated successfully',
      data: task
    });

  } catch (error) {
    console.error('Update task error:', error);
    const user = getUserFromToken(req);
    logAuditEvent(user.id, 'update', 'task', req.params.id, false, error.message);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error'
    });
  }
});

// Delete task endpoint
app.delete('/tasks/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const user = getUserFromToken(req);

    const taskIndex = tasks.findIndex(task => task.id === id && task.organizationId === user.organizationId);
    if (taskIndex === -1) {
      logAuditEvent(user.id, 'delete', 'task', id, false, 'Task not found');
      return res.status(404).json({ 
        statusCode: 404,
        message: 'Task not found',
        error: 'Not Found'
      });
    }

    const task = tasks[taskIndex];

    // Check permissions
    const canModify = task.createdById === user.id || 
                     task.assigneeId === user.id || 
                     user.role?.type === 'admin' || 
                     user.role?.type === 'owner';

    if (!canModify) {
      logAuditEvent(user.id, 'delete', 'task', id, false, 'Insufficient permissions');
      return res.status(403).json({ 
        statusCode: 403,
        message: 'You do not have permission to delete this task',
        error: 'Forbidden'
      });
    }

    // Soft delete (mark as deleted)
    task.deletedAt = new Date();
    task.isDeleted = true;

    logAuditEvent(user.id, 'delete', 'task', id, true);
    res.json({
      statusCode: 200,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    const user = getUserFromToken(req);
    logAuditEvent(user.id, 'delete', 'task', req.params.id, false, error.message);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error'
    });
  }
});

// Get audit logs endpoint
app.get('/tasks/audit-log', authenticateToken, (req, res) => {
  try {
    const user = getUserFromToken(req);
    const { page = 1, limit = 50, userId, action, resource, startDate, endDate } = req.query;

    // Check if user has permission to view audit logs (admin/owner only)
    if (user.role?.type !== 'admin' && user.role?.type !== 'owner') {
      logAuditEvent(user.id, 'read', 'audit_log', null, false, 'Insufficient permissions');
      return res.status(403).json({ 
        statusCode: 403,
        message: 'Only owners and admins can view audit logs',
        error: 'Forbidden'
      });
    }

    let filteredLogs = auditLogs.filter(log => log.organizationId === user.organizationId);

    // Apply filters
    if (userId) filteredLogs = filteredLogs.filter(log => log.userId === userId);
    if (action) filteredLogs = filteredLogs.filter(log => log.action.includes(action));
    if (resource) filteredLogs = filteredLogs.filter(log => log.resource.includes(resource));
    if (startDate) filteredLogs = filteredLogs.filter(log => log.timestamp >= new Date(startDate));
    if (endDate) filteredLogs = filteredLogs.filter(log => log.timestamp <= new Date(endDate));

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    logAuditEvent(user.id, 'read', 'audit_log', null, true);
    res.json({
      statusCode: 200,
      message: 'Audit logs retrieved successfully',
      data: paginatedLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredLogs.length,
        totalPages: Math.ceil(filteredLogs.length / limit)
      }
    });

  } catch (error) {
    console.error('Get audit logs error:', error);
    const user = getUserFromToken(req);
    logAuditEvent(user.id, 'read', 'audit_log', null, false, error.message);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NestJS-style Task API Server running on: http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   POST /auth/register - Register new user`);
  console.log(`   POST /auth/login - Login user`);
  console.log(`   GET /auth/profile - Get user profile (protected)`);
  console.log(`   POST /tasks - Create task (protected)`);
  console.log(`   GET /tasks - List tasks (protected)`);
  console.log(`   PUT /tasks/:id - Update task (protected)`);
  console.log(`   DELETE /tasks/:id - Delete task (protected)`);
  console.log(`   GET /tasks/audit-log - View audit logs (protected, admin/owner only)`);
  console.log(`   GET / - Health check`);
  console.log(`🔑 JWT Secret: ${JWT_SECRET.substring(0, 20)}...`);
  console.log(`⏰ Token expires in: ${JWT_EXPIRES_IN}`);
  console.log(`🔒 Bcrypt rounds: ${BCRYPT_ROUNDS}`);
});
