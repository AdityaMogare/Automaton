import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';

import dbManager from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { requestLogger } from './middleware/requestLogger';

// Import routes
import workflowRoutes from './routes/workflows';
import executionRoutes from './routes/executions';
import userRoutes from './routes/users';
import organizationRoutes from './routes/organizations';
import aiRoutes from './routes/ai';
import integrationRoutes from './routes/integrations';
import analyticsRoutes from './routes/analytics';

// Import services
import { WorkflowExecutionService } from './services/WorkflowExecutionService';
import { NotificationService } from './services/NotificationService';
import { AIService } from './services/AIService';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Database configuration
const dbConfig = {
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'automaton',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    ssl: process.env.NODE_ENV === 'production',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    database: process.env.MONGODB_DB || 'automaton',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
};

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use(limiter);
app.use(requestLogger);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await dbManager.healthCheck();
    const isHealthy = Object.values(dbHealth).every(status => status);
    
    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// API Routes
app.use('/api/workflows', authMiddleware, workflowRoutes);
app.use('/api/executions', authMiddleware, executionRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/organizations', authMiddleware, organizationRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/integrations', authMiddleware, integrationRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join organization room for real-time updates
  socket.on('join-organization', (organizationId: string) => {
    socket.join(`org-${organizationId}`);
    console.log(`Client ${socket.id} joined organization ${organizationId}`);
  });

  // Join workflow execution room
  socket.on('join-execution', (executionId: string) => {
    socket.join(`execution-${executionId}`);
    console.log(`Client ${socket.id} joined execution ${executionId}`);
  });

  // Handle workflow execution updates
  socket.on('execution-update', async (data) => {
    try {
      const { executionId, status, progress } = data;
      io.to(`execution-${executionId}`).emit('execution-updated', {
        executionId,
        status,
        progress,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error handling execution update:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Initialize services
const workflowExecutionService = new WorkflowExecutionService(io);
const notificationService = new NotificationService();
const aiService = new AIService();

// Make services available globally
declare global {
  namespace Express {
    interface Request {
      workflowExecutionService: WorkflowExecutionService;
      notificationService: NotificationService;
      aiService: AIService;
    }
  }
}

app.use((req, res, next) => {
  req.workflowExecutionService = workflowExecutionService;
  req.notificationService = notificationService;
  req.aiService = aiService;
  next();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await dbManager.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await dbManager.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    // Initialize database connections
    await dbManager.initialize(dbConfig);
    
    // Start the server
    server.listen(PORT, () => {
      console.log(`🚀 Automaton Workflow Platform server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 