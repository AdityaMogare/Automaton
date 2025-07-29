"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionController = void 0;
const WorkflowExecutionService_1 = require("../services/WorkflowExecutionService");
const WorkflowService_1 = require("../services/WorkflowService");
class ExecutionController {
    constructor() {
        this.executionService = new WorkflowExecutionService_1.WorkflowExecutionService();
        this.workflowService = new WorkflowService_1.WorkflowService();
    }
    async getExecutions(organizationId, filters) {
        try {
            return {
                success: true,
                data: [],
                pagination: {
                    page: filters.page || 1,
                    limit: filters.limit || 10,
                    total: 0,
                    totalPages: 0,
                },
            };
        }
        catch (error) {
            throw new Error(`Failed to fetch executions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getExecutionById(id, organizationId) {
        try {
            const execution = await this.executionService.getExecutionById(id);
            if (!execution || execution.organizationId !== organizationId) {
                return null;
            }
            return execution;
        }
        catch (error) {
            throw new Error(`Failed to fetch execution: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async cancelExecution(id, organizationId) {
        try {
            const execution = await this.executionService.getExecutionById(id);
            if (!execution || execution.organizationId !== organizationId) {
                return false;
            }
            if (execution.status !== 'running' && execution.status !== 'pending') {
                return false;
            }
            await this.executionService.updateExecutionStatus(id, 'cancelled');
            return true;
        }
        catch (error) {
            throw new Error(`Failed to cancel execution: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async retryExecution(id, organizationId, userId) {
        try {
            const originalExecution = await this.executionService.getExecutionById(id);
            if (!originalExecution || originalExecution.organizationId !== organizationId) {
                throw new Error('Execution not found');
            }
            if (originalExecution.status !== 'failed') {
                throw new Error('Only failed executions can be retried');
            }
            const workflow = await this.workflowService.getWorkflowById(originalExecution.workflowId, organizationId);
            if (!workflow) {
                throw new Error('Original workflow not found');
            }
            return await this.executionService.executeWorkflow(workflow, originalExecution.input, userId);
        }
        catch (error) {
            throw new Error(`Failed to retry execution: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getExecutionLogs(id, organizationId) {
        try {
            const execution = await this.executionService.getExecutionById(id);
            if (!execution || execution.organizationId !== organizationId) {
                return [];
            }
            const logs = [];
            logs.push({
                timestamp: execution.startedAt,
                level: 'info',
                message: `Execution started`,
                data: { executionId: execution.id, workflowId: execution.workflowId },
            });
            if (execution.completedAt) {
                logs.push({
                    timestamp: execution.completedAt,
                    level: execution.status === 'completed' ? 'info' : 'error',
                    message: `Execution ${execution.status}`,
                    data: {
                        executionId: execution.id,
                        duration: execution.duration,
                        error: execution.error,
                    },
                });
            }
            for (const nodeExecution of execution.nodeExecutions) {
                logs.push({
                    timestamp: nodeExecution.startedAt,
                    level: 'info',
                    message: `Node execution started: ${nodeExecution.nodeId}`,
                    data: { nodeId: nodeExecution.nodeId },
                });
                if (nodeExecution.completedAt) {
                    logs.push({
                        timestamp: nodeExecution.completedAt,
                        level: nodeExecution.status === 'completed' ? 'info' : 'error',
                        message: `Node execution ${nodeExecution.status}: ${nodeExecution.nodeId}`,
                        data: {
                            nodeId: nodeExecution.nodeId,
                            duration: nodeExecution.duration,
                            error: nodeExecution.error,
                        },
                    });
                }
                logs.push(...nodeExecution.logs);
            }
            return logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        }
        catch (error) {
            throw new Error(`Failed to fetch execution logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.ExecutionController = ExecutionController;
//# sourceMappingURL=ExecutionController.js.map