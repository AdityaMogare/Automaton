import { WorkflowExecution, APIResponse, PaginationParams } from '../types';
import { WorkflowExecutionService } from '../services/WorkflowExecutionService';
import { WorkflowService } from '../services/WorkflowService';

export class ExecutionController {
  private executionService: WorkflowExecutionService;
  private workflowService: WorkflowService;

  constructor() {
    this.executionService = new WorkflowExecutionService();
    this.workflowService = new WorkflowService();
  }

  async getExecutions(
    organizationId: string,
    filters: PaginationParams & { status?: string; workflowId?: string }
  ): Promise<APIResponse<WorkflowExecution[]>> {
    try {
      // For now, return empty results since we need to implement cross-workflow execution queries
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
    } catch (error) {
      throw new Error(`Failed to fetch executions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getExecutionById(id: string, organizationId: string): Promise<WorkflowExecution | null> {
    try {
      const execution = await this.executionService.getExecutionById(id);
      
      if (!execution || execution.organizationId !== organizationId) {
        return null;
      }

      return execution;
    } catch (error) {
      throw new Error(`Failed to fetch execution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async cancelExecution(id: string, organizationId: string): Promise<boolean> {
    try {
      const execution = await this.executionService.getExecutionById(id);
      
      if (!execution || execution.organizationId !== organizationId) {
        return false;
      }

      if (execution.status !== 'running' && execution.status !== 'pending') {
        return false;
      }

      // Update execution status to cancelled
      await this.executionService.updateExecutionStatus(id, 'cancelled');
      
      return true;
    } catch (error) {
      throw new Error(`Failed to cancel execution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async retryExecution(id: string, organizationId: string, userId: string): Promise<WorkflowExecution> {
    try {
      const originalExecution = await this.executionService.getExecutionById(id);
      
      if (!originalExecution || originalExecution.organizationId !== organizationId) {
        throw new Error('Execution not found');
      }

      if (originalExecution.status !== 'failed') {
        throw new Error('Only failed executions can be retried');
      }

      // Get the original workflow
      const workflow = await this.workflowService.getWorkflowById(
        originalExecution.workflowId,
        organizationId
      );

      if (!workflow) {
        throw new Error('Original workflow not found');
      }

      // Execute the workflow again with the same input
      return await this.executionService.executeWorkflow(
        workflow,
        originalExecution.input,
        userId
      );
    } catch (error) {
      throw new Error(`Failed to retry execution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getExecutionLogs(id: string, organizationId: string): Promise<any[]> {
    try {
      const execution = await this.executionService.getExecutionById(id);
      
      if (!execution || execution.organizationId !== organizationId) {
        return [];
      }

      // Collect all logs from node executions
      const logs: any[] = [];
      
      // Add execution-level logs
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

      // Add node execution logs
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

        // Add node-specific logs
        logs.push(...nodeExecution.logs);
      }

      // Sort logs by timestamp
      return logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (error) {
      throw new Error(`Failed to fetch execution logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 