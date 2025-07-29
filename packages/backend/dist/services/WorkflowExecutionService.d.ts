import { Server } from 'socket.io';
import { Workflow, WorkflowExecution, APIResponse, PaginationParams } from '../types';
export declare class WorkflowExecutionService {
    private mongoDb;
    private io;
    constructor(io?: Server);
    executeWorkflow(workflow: Workflow, input: Record<string, any>, userId: string): Promise<WorkflowExecution>;
    private executeWorkflowNodes;
    private executeNode;
    private shouldExecuteEdge;
    private evaluateCondition;
    private executeEmailNode;
    private executeApprovalNode;
    private executeConditionNode;
    private executeDelayNode;
    private executeWebhookNode;
    private executeDatabaseNode;
    private executeAINode;
    private executeIntegrationNode;
    private executeNotificationNode;
    private executeReportNode;
    private executeTransformNode;
    getWorkflowExecutions(workflowId: string, organizationId: string, filters: PaginationParams & {
        status?: string;
    }): Promise<APIResponse<WorkflowExecution[]>>;
    getExecutionById(executionId: string): Promise<WorkflowExecution | null>;
    getWorkflowAnalytics(workflowId: string, organizationId: string, period: string): Promise<any>;
    private saveExecution;
    private updateExecution;
    private updateExecutionStatus;
    private emitExecutionUpdate;
    private calculateProgress;
}
//# sourceMappingURL=WorkflowExecutionService.d.ts.map