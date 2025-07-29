"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowController = void 0;
const uuid_1 = require("uuid");
const WorkflowService_1 = require("../services/WorkflowService");
const WorkflowExecutionService_1 = require("../services/WorkflowExecutionService");
const AIService_1 = require("../services/AIService");
class WorkflowController {
    constructor() {
        this.workflowService = new WorkflowService_1.WorkflowService();
        this.executionService = new WorkflowExecutionService_1.WorkflowExecutionService();
        this.aiService = new AIService_1.AIService();
    }
    async getWorkflows(organizationId, filters) {
        try {
            const workflows = await this.workflowService.getWorkflows(organizationId, filters);
            return {
                success: true,
                data: workflows.data,
                pagination: workflows.pagination,
            };
        }
        catch (error) {
            throw new Error(`Failed to fetch workflows: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getWorkflowById(id, organizationId) {
        try {
            return await this.workflowService.getWorkflowById(id, organizationId);
        }
        catch (error) {
            throw new Error(`Failed to fetch workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async createWorkflow(workflowData) {
        try {
            const workflow = {
                id: (0, uuid_1.v4)(),
                name: workflowData.name || 'New Workflow',
                description: workflowData.description || '',
                organizationId: workflowData.organizationId,
                createdBy: workflowData.createdBy,
                nodes: workflowData.nodes || [],
                edges: workflowData.edges || [],
                triggers: workflowData.triggers || [],
                settings: workflowData.settings || {
                    timeout: 300000,
                    retryAttempts: 3,
                    retryDelay: 1000,
                    parallelExecution: false,
                    maxConcurrentExecutions: 10,
                    notifications: {
                        onStart: false,
                        onSuccess: true,
                        onError: true,
                        onTimeout: true,
                        channels: ['email'],
                        recipients: [],
                    },
                },
                status: 'draft',
                version: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            return await this.workflowService.createWorkflow(workflow);
        }
        catch (error) {
            throw new Error(`Failed to create workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async updateWorkflow(id, updates, organizationId) {
        try {
            const existingWorkflow = await this.workflowService.getWorkflowById(id, organizationId);
            if (!existingWorkflow) {
                return null;
            }
            const updatedWorkflow = {
                ...existingWorkflow,
                ...updates,
                version: existingWorkflow.version + 1,
                updatedAt: new Date(),
            };
            return await this.workflowService.updateWorkflow(id, updatedWorkflow);
        }
        catch (error) {
            throw new Error(`Failed to update workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async deleteWorkflow(id, organizationId) {
        try {
            return await this.workflowService.deleteWorkflow(id, organizationId);
        }
        catch (error) {
            throw new Error(`Failed to delete workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async executeWorkflow(id, input, organizationId, userId) {
        try {
            const workflow = await this.workflowService.getWorkflowById(id, organizationId);
            if (!workflow) {
                throw new Error('Workflow not found');
            }
            if (workflow.status !== 'active') {
                throw new Error('Workflow is not active');
            }
            return await this.executionService.executeWorkflow(workflow, input, userId);
        }
        catch (error) {
            throw new Error(`Failed to execute workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getWorkflowExecutions(workflowId, organizationId, filters) {
        try {
            const executions = await this.executionService.getWorkflowExecutions(workflowId, organizationId, filters);
            return {
                success: true,
                data: executions.data,
                pagination: executions.pagination,
            };
        }
        catch (error) {
            throw new Error(`Failed to fetch executions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getWorkflowAnalytics(workflowId, organizationId, period) {
        try {
            return await this.executionService.getWorkflowAnalytics(workflowId, organizationId, period);
        }
        catch (error) {
            throw new Error(`Failed to fetch analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getAISuggestions(workflowId, organizationId) {
        try {
            const workflow = await this.workflowService.getWorkflowById(workflowId, organizationId);
            if (!workflow) {
                throw new Error('Workflow not found');
            }
            return await this.aiService.generateSuggestions(workflow);
        }
        catch (error) {
            throw new Error(`Failed to generate AI suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async applyAISuggestion(workflowId, suggestionId, organizationId) {
        try {
            const workflow = await this.workflowService.getWorkflowById(workflowId, organizationId);
            if (!workflow) {
                throw new Error('Workflow not found');
            }
            const suggestion = await this.aiService.getSuggestionById(suggestionId);
            if (!suggestion) {
                throw new Error('Suggestion not found');
            }
            const updatedWorkflow = await this.aiService.applySuggestion(workflow, suggestion);
            return await this.workflowService.updateWorkflow(workflowId, updatedWorkflow);
        }
        catch (error) {
            throw new Error(`Failed to apply AI suggestion: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async duplicateWorkflow(id, organizationId, userId) {
        try {
            const originalWorkflow = await this.workflowService.getWorkflowById(id, organizationId);
            if (!originalWorkflow) {
                throw new Error('Workflow not found');
            }
            const duplicatedWorkflow = {
                ...originalWorkflow,
                id: (0, uuid_1.v4)(),
                name: `${originalWorkflow.name} (Copy)`,
                createdBy: userId,
                status: 'draft',
                version: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            return await this.workflowService.createWorkflow(duplicatedWorkflow);
        }
        catch (error) {
            throw new Error(`Failed to duplicate workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async exportWorkflow(id, organizationId) {
        try {
            const workflow = await this.workflowService.getWorkflowById(id, organizationId);
            if (!workflow) {
                throw new Error('Workflow not found');
            }
            return {
                version: '1.0',
                exportedAt: new Date().toISOString(),
                workflow: {
                    name: workflow.name,
                    description: workflow.description,
                    nodes: workflow.nodes,
                    edges: workflow.edges,
                    triggers: workflow.triggers,
                    settings: workflow.settings,
                },
            };
        }
        catch (error) {
            throw new Error(`Failed to export workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async importWorkflow(importData, organizationId, userId) {
        try {
            const workflow = {
                id: (0, uuid_1.v4)(),
                name: importData.workflow.name,
                description: importData.workflow.description,
                organizationId,
                createdBy: userId,
                nodes: importData.workflow.nodes || [],
                edges: importData.workflow.edges || [],
                triggers: importData.workflow.triggers || [],
                settings: importData.workflow.settings || {
                    timeout: 300000,
                    retryAttempts: 3,
                    retryDelay: 1000,
                    parallelExecution: false,
                    maxConcurrentExecutions: 10,
                    notifications: {
                        onStart: false,
                        onSuccess: true,
                        onError: true,
                        onTimeout: true,
                        channels: ['email'],
                        recipients: [],
                    },
                },
                status: 'draft',
                version: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            return await this.workflowService.createWorkflow(workflow);
        }
        catch (error) {
            throw new Error(`Failed to import workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.WorkflowController = WorkflowController;
//# sourceMappingURL=WorkflowController.js.map