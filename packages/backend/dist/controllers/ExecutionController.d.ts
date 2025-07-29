import { WorkflowExecution, APIResponse, PaginationParams } from '../types';
export declare class ExecutionController {
    private executionService;
    private workflowService;
    constructor();
    getExecutions(organizationId: string, filters: PaginationParams & {
        status?: string;
        workflowId?: string;
    }): Promise<APIResponse<WorkflowExecution[]>>;
    getExecutionById(id: string, organizationId: string): Promise<WorkflowExecution | null>;
    cancelExecution(id: string, organizationId: string): Promise<boolean>;
    retryExecution(id: string, organizationId: string, userId: string): Promise<WorkflowExecution>;
    getExecutionLogs(id: string, organizationId: string): Promise<any[]>;
}
//# sourceMappingURL=ExecutionController.d.ts.map