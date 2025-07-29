import { Workflow, APIResponse, PaginationParams, WorkflowFilters } from '../types';
export declare class WorkflowService {
    private pool;
    constructor();
    createWorkflow(workflow: Workflow): Promise<Workflow>;
    getWorkflowById(id: string, organizationId: string): Promise<Workflow | null>;
    getWorkflows(organizationId: string, filters: PaginationParams & WorkflowFilters): Promise<APIResponse<Workflow[]>>;
    updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow>;
    deleteWorkflow(id: string, organizationId: string): Promise<boolean>;
    getWorkflowCount(organizationId: string): Promise<number>;
    getWorkflowsByStatus(organizationId: string, status: string): Promise<Workflow[]>;
    private mapRowToWorkflow;
}
//# sourceMappingURL=WorkflowService.d.ts.map