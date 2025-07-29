import { Workflow, WorkflowExecution, AISuggestion, APIResponse, PaginationParams } from '../types';
export declare class WorkflowController {
    private workflowService;
    private executionService;
    private aiService;
    constructor();
    getWorkflows(organizationId: string, filters: PaginationParams & {
        status?: string;
        search?: string;
    }): Promise<APIResponse<Workflow[]>>;
    getWorkflowById(id: string, organizationId: string): Promise<Workflow | null>;
    createWorkflow(workflowData: Partial<Workflow>): Promise<Workflow>;
    updateWorkflow(id: string, updates: Partial<Workflow>, organizationId: string): Promise<Workflow | null>;
    deleteWorkflow(id: string, organizationId: string): Promise<boolean>;
    executeWorkflow(id: string, input: Record<string, any>, organizationId: string, userId: string): Promise<WorkflowExecution>;
    getWorkflowExecutions(workflowId: string, organizationId: string, filters: PaginationParams & {
        status?: string;
    }): Promise<APIResponse<WorkflowExecution[]>>;
    getWorkflowAnalytics(workflowId: string, organizationId: string, period: string): Promise<any>;
    getAISuggestions(workflowId: string, organizationId: string): Promise<AISuggestion[]>;
    applyAISuggestion(workflowId: string, suggestionId: string, organizationId: string): Promise<Workflow>;
    duplicateWorkflow(id: string, organizationId: string, userId: string): Promise<Workflow>;
    exportWorkflow(id: string, organizationId: string): Promise<any>;
    importWorkflow(importData: any, organizationId: string, userId: string): Promise<Workflow>;
}
//# sourceMappingURL=WorkflowController.d.ts.map