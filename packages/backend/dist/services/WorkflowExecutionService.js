"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowExecutionService = void 0;
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../config/database"));
class WorkflowExecutionService {
    constructor(io) {
        this.mongoDb = database_1.default.getMongoDb();
        this.io = io;
    }
    async executeWorkflow(workflow, input, userId) {
        const executionId = (0, uuid_1.v4)();
        const startedAt = new Date();
        const execution = {
            id: executionId,
            workflowId: workflow.id,
            organizationId: workflow.organizationId,
            status: 'pending',
            startedAt,
            trigger: {
                type: 'manual',
                data: { userId },
            },
            input,
            output: {},
            nodeExecutions: [],
            metadata: {
                userAgent: 'Automaton Platform',
                ipAddress: '127.0.0.1',
                sessionId: executionId,
                tags: ['manual-execution'],
            },
        };
        await this.saveExecution(execution);
        this.emitExecutionUpdate(execution);
        try {
            execution.status = 'running';
            await this.updateExecutionStatus(executionId, 'running');
            this.emitExecutionUpdate(execution);
            const result = await this.executeWorkflowNodes(workflow, execution, input);
            execution.status = 'completed';
            execution.completedAt = new Date();
            execution.duration = execution.completedAt.getTime() - startedAt.getTime();
            execution.output = result;
            await this.updateExecution(execution);
            this.emitExecutionUpdate(execution);
            return execution;
        }
        catch (error) {
            execution.status = 'failed';
            execution.completedAt = new Date();
            execution.duration = execution.completedAt.getTime() - startedAt.getTime();
            execution.error = {
                message: error instanceof Error ? error.message : 'Unknown error',
                code: 'EXECUTION_FAILED',
                details: { stack: error instanceof Error ? error.stack : undefined },
            };
            await this.updateExecution(execution);
            this.emitExecutionUpdate(execution);
            throw error;
        }
    }
    async executeWorkflowNodes(workflow, execution, input) {
        const context = { ...input };
        const nodeExecutions = [];
        const startNode = workflow.nodes.find(node => node.type === 'start');
        if (!startNode) {
            throw new Error('No start node found in workflow');
        }
        const executedNodes = new Set();
        const queue = [startNode.id];
        while (queue.length > 0) {
            const nodeId = queue.shift();
            if (executedNodes.has(nodeId))
                continue;
            const node = workflow.nodes.find(n => n.id === nodeId);
            if (!node)
                continue;
            const nodeExecution = await this.executeNode(node, context);
            nodeExecutions.push(nodeExecution);
            execution.nodeExecutions.push(nodeExecution);
            await this.updateExecution(execution);
            this.emitExecutionUpdate(execution);
            executedNodes.add(nodeId);
            const nextEdges = workflow.edges.filter(edge => edge.source === nodeId);
            for (const edge of nextEdges) {
                if (this.shouldExecuteEdge(edge, nodeExecution)) {
                    queue.push(edge.target);
                }
            }
        }
        return context;
    }
    async executeNode(node, context) {
        const nodeExecution = {
            id: (0, uuid_1.v4)(),
            nodeId: node.id,
            status: 'running',
            startedAt: new Date(),
            input: { ...context },
            output: {},
            logs: [],
        };
        try {
            switch (node.type) {
                case 'start':
                    nodeExecution.output = context;
                    break;
                case 'email':
                    nodeExecution.output = await this.executeEmailNode(node, context);
                    break;
                case 'approval':
                    nodeExecution.output = await this.executeApprovalNode(node, context);
                    break;
                case 'condition':
                    nodeExecution.output = await this.executeConditionNode(node, context);
                    break;
                case 'delay':
                    nodeExecution.output = await this.executeDelayNode(node, context);
                    break;
                case 'webhook':
                    nodeExecution.output = await this.executeWebhookNode(node, context);
                    break;
                case 'database':
                    nodeExecution.output = await this.executeDatabaseNode(node, context);
                    break;
                case 'ai':
                    nodeExecution.output = await this.executeAINode(node, context);
                    break;
                case 'integration':
                    nodeExecution.output = await this.executeIntegrationNode(node, context);
                    break;
                case 'notification':
                    nodeExecution.output = await this.executeNotificationNode(node, context);
                    break;
                case 'report':
                    nodeExecution.output = await this.executeReportNode(node, context);
                    break;
                case 'transform':
                    nodeExecution.output = await this.executeTransformNode(node, context);
                    break;
                case 'end':
                    nodeExecution.output = context;
                    break;
                default:
                    throw new Error(`Unknown node type: ${node.type}`);
            }
            nodeExecution.status = 'completed';
            nodeExecution.completedAt = new Date();
            nodeExecution.duration = nodeExecution.completedAt.getTime() - nodeExecution.startedAt.getTime();
            Object.assign(context, nodeExecution.output);
        }
        catch (error) {
            nodeExecution.status = 'failed';
            nodeExecution.completedAt = new Date();
            nodeExecution.duration = nodeExecution.completedAt.getTime() - nodeExecution.startedAt.getTime();
            nodeExecution.error = {
                message: error instanceof Error ? error.message : 'Unknown error',
                code: 'NODE_EXECUTION_FAILED',
                details: { nodeType: node.type, nodeId: node.id },
            };
            nodeExecution.logs.push({
                timestamp: new Date(),
                level: 'error',
                message: `Node execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                data: { nodeType: node.type, nodeId: node.id },
            });
        }
        return nodeExecution;
    }
    shouldExecuteEdge(edge, nodeExecution) {
        if (!edge.condition)
            return true;
        switch (edge.condition.type) {
            case 'always':
                return true;
            case 'onSuccess':
                return nodeExecution.status === 'completed';
            case 'onError':
                return nodeExecution.status === 'failed';
            case 'custom':
                return this.evaluateCondition(edge.condition.expression, nodeExecution);
            default:
                return true;
        }
    }
    evaluateCondition(expression, nodeExecution) {
        try {
            return eval(expression);
        }
        catch (error) {
            console.error('Error evaluating condition:', error);
            return false;
        }
    }
    async executeEmailNode(node, context) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { emailSent: true, recipient: node.config?.recipient || 'default@example.com' };
    }
    async executeApprovalNode(node, context) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { approved: true, approver: node.config?.approver || 'system' };
    }
    async executeConditionNode(node, context) {
        const condition = node.config?.condition || 'true';
        const result = this.evaluateCondition(condition, context);
        return { conditionResult: result };
    }
    async executeDelayNode(node, context) {
        const delay = node.config?.delay || 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return { delayed: true, delayMs: delay };
    }
    async executeWebhookNode(node, context) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { webhookCalled: true, url: node.config?.url || 'https://api.example.com' };
    }
    async executeDatabaseNode(node, context) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return { databaseOperation: 'completed', operation: node.config?.operation || 'select' };
    }
    async executeAINode(node, context) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { aiProcessed: true, result: 'AI analysis completed' };
    }
    async executeIntegrationNode(node, context) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return { integrationCompleted: true, service: node.config?.service || 'external-service' };
    }
    async executeNotificationNode(node, context) {
        await new Promise(resolve => setTimeout(resolve, 200));
        return { notificationSent: true, channel: node.config?.channel || 'email' };
    }
    async executeReportNode(node, context) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { reportGenerated: true, reportType: node.config?.type || 'summary' };
    }
    async executeTransformNode(node, context) {
        await new Promise(resolve => setTimeout(resolve, 400));
        return { transformed: true, transformation: node.config?.transformation || 'default' };
    }
    async getWorkflowExecutions(workflowId, organizationId, filters) {
        const { page = 1, limit = 10, status, sortBy = 'startedAt', sortOrder = 'desc' } = filters;
        const skip = (page - 1) * limit;
        const collection = this.mongoDb.collection('workflow_executions');
        const query = { workflowId, organizationId };
        if (status) {
            query.status = status;
        }
        const total = await collection.countDocuments(query);
        const executions = await collection
            .find(query)
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(limit)
            .toArray();
        return {
            success: true,
            data: executions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getExecutionById(executionId) {
        const collection = this.mongoDb.collection('workflow_executions');
        const execution = await collection.findOne({ id: executionId });
        return execution || null;
    }
    async getWorkflowAnalytics(workflowId, organizationId, period) {
        const collection = this.mongoDb.collection('workflow_executions');
        const now = new Date();
        let startDate;
        switch (period) {
            case 'day':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'year':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        const pipeline = [
            {
                $match: {
                    workflowId,
                    organizationId,
                    startedAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalExecutions: { $sum: 1 },
                    successfulExecutions: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    failedExecutions: {
                        $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
                    },
                    averageDuration: { $avg: '$duration' },
                    totalErrors: {
                        $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
                    }
                }
            }
        ];
        const result = await collection.aggregate(pipeline).toArray();
        const analytics = result[0] || {
            totalExecutions: 0,
            successfulExecutions: 0,
            failedExecutions: 0,
            averageDuration: 0,
            totalErrors: 0
        };
        return {
            workflowId,
            period,
            metrics: analytics,
            trends: {
                executions: [],
                errors: [],
                duration: []
            }
        };
    }
    async saveExecution(execution) {
        const collection = this.mongoDb.collection('workflow_executions');
        await collection.insertOne(execution);
    }
    async updateExecution(execution) {
        const collection = this.mongoDb.collection('workflow_executions');
        await collection.updateOne({ id: execution.id }, { $set: execution });
    }
    async updateExecutionStatus(executionId, status) {
        const collection = this.mongoDb.collection('workflow_executions');
        await collection.updateOne({ id: executionId }, { $set: { status, updatedAt: new Date() } });
    }
    emitExecutionUpdate(execution) {
        if (this.io) {
            this.io.to(`execution-${execution.id}`).emit('execution-updated', {
                executionId: execution.id,
                status: execution.status,
                progress: this.calculateProgress(execution),
                timestamp: new Date(),
            });
        }
    }
    calculateProgress(execution) {
        if (execution.status === 'completed')
            return 100;
        if (execution.status === 'failed')
            return 0;
        const totalNodes = execution.nodeExecutions.length;
        const completedNodes = execution.nodeExecutions.filter(n => n.status === 'completed').length;
        return totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;
    }
}
exports.WorkflowExecutionService = WorkflowExecutionService;
//# sourceMappingURL=WorkflowExecutionService.js.map