import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { Workflow, WorkflowExecution, ExecutionStatus, APIResponse, PaginationParams } from '../types';
import { MongoClient, Db } from 'mongodb';
import dbManager from '../config/database';

export class WorkflowExecutionService {
  private mongoDb: Db;
  private io: Server;

  constructor(io?: Server) {
    this.mongoDb = dbManager.getMongoDb();
    this.io = io!;
  }

  async executeWorkflow(
    workflow: Workflow,
    input: Record<string, any>,
    userId: string
  ): Promise<WorkflowExecution> {
    const executionId = uuidv4();
    const startedAt = new Date();

    // Create execution record
    const execution: WorkflowExecution = {
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

    // Save to MongoDB
    await this.saveExecution(execution);

    // Emit real-time update
    this.emitExecutionUpdate(execution);

    try {
      // Update status to running
      execution.status = 'running';
      await this.updateExecutionStatus(executionId, 'running');
      this.emitExecutionUpdate(execution);

      // Execute workflow nodes
      const result = await this.executeWorkflowNodes(workflow, execution, input);

      // Update final status
      execution.status = 'completed';
      execution.completedAt = new Date();
      execution.duration = execution.completedAt.getTime() - startedAt.getTime();
      execution.output = result;

      await this.updateExecution(execution);
      this.emitExecutionUpdate(execution);

      return execution;
    } catch (error) {
      // Handle execution error
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

  private async executeWorkflowNodes(
    workflow: Workflow,
    execution: WorkflowExecution,
    input: Record<string, any>
  ): Promise<Record<string, any>> {
    const context = { ...input };
    const nodeExecutions: any[] = [];

    // Find start node
    const startNode = workflow.nodes.find(node => node.type === 'start');
    if (!startNode) {
      throw new Error('No start node found in workflow');
    }

    // Execute nodes in topological order
    const executedNodes = new Set<string>();
    const queue = [startNode.id];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (executedNodes.has(nodeId)) continue;

      const node = workflow.nodes.find(n => n.id === nodeId);
      if (!node) continue;

      // Execute node
      const nodeExecution = await this.executeNode(node, context);
      nodeExecutions.push(nodeExecution);
      execution.nodeExecutions.push(nodeExecution);

      // Update execution in database
      await this.updateExecution(execution);
      this.emitExecutionUpdate(execution);

      executedNodes.add(nodeId);

      // Find next nodes
      const nextEdges = workflow.edges.filter(edge => edge.source === nodeId);
      for (const edge of nextEdges) {
        if (this.shouldExecuteEdge(edge, nodeExecution)) {
          queue.push(edge.target);
        }
      }
    }

    return context;
  }

  private async executeNode(node: any, context: Record<string, any>): Promise<any> {
    const nodeExecution = {
      id: uuidv4(),
      nodeId: node.id,
      status: 'running' as ExecutionStatus,
      startedAt: new Date(),
      input: { ...context },
      output: {},
      logs: [],
    };

    try {
      // Execute based on node type
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

      // Update context with node output
      Object.assign(context, nodeExecution.output);

    } catch (error) {
      nodeExecution.status = 'failed';
      nodeExecution.completedAt = new Date();
      nodeExecution.duration = nodeExecution.completedAt.getTime() - nodeExecution.startedAt.getTime();
      nodeExecution.error = {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'NODE_EXECUTION_FAILED',
        details: { nodeType: node.type, nodeId: node.id },
      };

      // Add error log
      nodeExecution.logs.push({
        timestamp: new Date(),
        level: 'error',
        message: `Node execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: { nodeType: node.type, nodeId: node.id },
      });
    }

    return nodeExecution;
  }

  private shouldExecuteEdge(edge: any, nodeExecution: any): boolean {
    if (!edge.condition) return true;

    switch (edge.condition.type) {
      case 'always':
        return true;
      case 'onSuccess':
        return nodeExecution.status === 'completed';
      case 'onError':
        return nodeExecution.status === 'failed';
      case 'custom':
        // Evaluate custom expression
        return this.evaluateCondition(edge.condition.expression, nodeExecution);
      default:
        return true;
    }
  }

  private evaluateCondition(expression: string, nodeExecution: any): boolean {
    try {
      // Simple expression evaluation (in production, use a proper expression evaluator)
      return eval(expression);
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  }

  // Node execution methods (simplified implementations)
  private async executeEmailNode(node: any, context: any): Promise<any> {
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { emailSent: true, recipient: node.config?.recipient || 'default@example.com' };
  }

  private async executeApprovalNode(node: any, context: any): Promise<any> {
    // Simulate approval process
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { approved: true, approver: node.config?.approver || 'system' };
  }

  private async executeConditionNode(node: any, context: any): Promise<any> {
    // Evaluate condition
    const condition = node.config?.condition || 'true';
    const result = this.evaluateCondition(condition, context);
    return { conditionResult: result };
  }

  private async executeDelayNode(node: any, context: any): Promise<any> {
    const delay = node.config?.delay || 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    return { delayed: true, delayMs: delay };
  }

  private async executeWebhookNode(node: any, context: any): Promise<any> {
    // Simulate webhook call
    await new Promise(resolve => setTimeout(resolve, 500));
    return { webhookCalled: true, url: node.config?.url || 'https://api.example.com' };
  }

  private async executeDatabaseNode(node: any, context: any): Promise<any> {
    // Simulate database operation
    await new Promise(resolve => setTimeout(resolve, 300));
    return { databaseOperation: 'completed', operation: node.config?.operation || 'select' };
  }

  private async executeAINode(node: any, context: any): Promise<any> {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { aiProcessed: true, result: 'AI analysis completed' };
  }

  private async executeIntegrationNode(node: any, context: any): Promise<any> {
    // Simulate external integration
    await new Promise(resolve => setTimeout(resolve, 800));
    return { integrationCompleted: true, service: node.config?.service || 'external-service' };
  }

  private async executeNotificationNode(node: any, context: any): Promise<any> {
    // Simulate notification sending
    await new Promise(resolve => setTimeout(resolve, 200));
    return { notificationSent: true, channel: node.config?.channel || 'email' };
  }

  private async executeReportNode(node: any, context: any): Promise<any> {
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { reportGenerated: true, reportType: node.config?.type || 'summary' };
  }

  private async executeTransformNode(node: any, context: any): Promise<any> {
    // Simulate data transformation
    await new Promise(resolve => setTimeout(resolve, 400));
    return { transformed: true, transformation: node.config?.transformation || 'default' };
  }

  async getWorkflowExecutions(
    workflowId: string,
    organizationId: string,
    filters: PaginationParams & { status?: string }
  ): Promise<APIResponse<WorkflowExecution[]>> {
    const { page = 1, limit = 10, status, sortBy = 'startedAt', sortOrder = 'desc' } = filters;
    const skip = (page - 1) * limit;

    const collection = this.mongoDb.collection('workflow_executions');
    
    // Build query
    const query: any = { workflowId, organizationId };
    if (status) {
      query.status = status;
    }

    // Get total count
    const total = await collection.countDocuments(query);

    // Get executions
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

  async getExecutionById(executionId: string): Promise<WorkflowExecution | null> {
    const collection = this.mongoDb.collection('workflow_executions');
    const execution = await collection.findOne({ id: executionId });
    return execution || null;
  }

  async getWorkflowAnalytics(
    workflowId: string,
    organizationId: string,
    period: string
  ): Promise<any> {
    const collection = this.mongoDb.collection('workflow_executions');
    
    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
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
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to month
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
        executions: [], // Would implement time-series data here
        errors: [],
        duration: []
      }
    };
  }

  private async saveExecution(execution: WorkflowExecution): Promise<void> {
    const collection = this.mongoDb.collection('workflow_executions');
    await collection.insertOne(execution);
  }

  private async updateExecution(execution: WorkflowExecution): Promise<void> {
    const collection = this.mongoDb.collection('workflow_executions');
    await collection.updateOne(
      { id: execution.id },
      { $set: execution }
    );
  }

  private async updateExecutionStatus(executionId: string, status: ExecutionStatus): Promise<void> {
    const collection = this.mongoDb.collection('workflow_executions');
    await collection.updateOne(
      { id: executionId },
      { $set: { status, updatedAt: new Date() } }
    );
  }

  private emitExecutionUpdate(execution: WorkflowExecution): void {
    if (this.io) {
      this.io.to(`execution-${execution.id}`).emit('execution-updated', {
        executionId: execution.id,
        status: execution.status,
        progress: this.calculateProgress(execution),
        timestamp: new Date(),
      });
    }
  }

  private calculateProgress(execution: WorkflowExecution): number {
    if (execution.status === 'completed') return 100;
    if (execution.status === 'failed') return 0;
    
    const totalNodes = execution.nodeExecutions.length;
    const completedNodes = execution.nodeExecutions.filter(n => n.status === 'completed').length;
    
    return totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;
  }
} 