"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = require("express-rate-limit");
const database_1 = __importDefault(require("./config/database"));
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = require("./middleware/auth");
const requestLogger_1 = require("./middleware/requestLogger");
const workflows_1 = __importDefault(require("./routes/workflows"));
const executions_1 = __importDefault(require("./routes/executions"));
const users_1 = __importDefault(require("./routes/users"));
const organizations_1 = __importDefault(require("./routes/organizations"));
const ai_1 = __importDefault(require("./routes/ai"));
const integrations_1 = __importDefault(require("./routes/integrations"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const WorkflowExecutionService_1 = require("./services/WorkflowExecutionService");
const NotificationService_1 = require("./services/NotificationService");
const AIService_1 = require("./services/AIService");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});
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
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('combined'));
app.use(limiter);
app.use(requestLogger_1.requestLogger);
app.get('/health', async (req, res) => {
    try {
        const dbHealth = await database_1.default.healthCheck();
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
    }
    catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
app.use('/api/workflows', auth_1.authMiddleware, workflows_1.default);
app.use('/api/executions', auth_1.authMiddleware, executions_1.default);
app.use('/api/users', auth_1.authMiddleware, users_1.default);
app.use('/api/organizations', auth_1.authMiddleware, organizations_1.default);
app.use('/api/ai', auth_1.authMiddleware, ai_1.default);
app.use('/api/integrations', auth_1.authMiddleware, integrations_1.default);
app.use('/api/analytics', auth_1.authMiddleware, analytics_1.default);
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('join-organization', (organizationId) => {
        socket.join(`org-${organizationId}`);
        console.log(`Client ${socket.id} joined organization ${organizationId}`);
    });
    socket.on('join-execution', (executionId) => {
        socket.join(`execution-${executionId}`);
        console.log(`Client ${socket.id} joined execution ${executionId}`);
    });
    socket.on('execution-update', async (data) => {
        try {
            const { executionId, status, progress } = data;
            io.to(`execution-${executionId}`).emit('execution-updated', {
                executionId,
                status,
                progress,
                timestamp: new Date(),
            });
        }
        catch (error) {
            console.error('Error handling execution update:', error);
        }
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
app.use(errorHandler_1.errorHandler);
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
    });
});
const workflowExecutionService = new WorkflowExecutionService_1.WorkflowExecutionService(io);
const notificationService = new NotificationService_1.NotificationService();
const aiService = new AIService_1.AIService();
app.use((req, res, next) => {
    req.workflowExecutionService = workflowExecutionService;
    req.notificationService = notificationService;
    req.aiService = aiService;
    next();
});
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await database_1.default.close();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await database_1.default.close();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
const PORT = process.env.PORT || 8000;
async function startServer() {
    try {
        await database_1.default.initialize(dbConfig);
        server.listen(PORT, () => {
            console.log(`🚀 Automaton Workflow Platform server running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`🔗 API Documentation: http://localhost:${PORT}/api-docs`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=index.js.map