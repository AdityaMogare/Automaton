export interface User {
    id: string;
    email: string;
    name: string;
    organizationId: string;
    role: 'admin' | 'user' | 'viewer';
    createdAt: Date;
    updatedAt: Date;
}
export interface Organization {
    id: string;
    name: string;
    domain: string;
    settings: OrganizationSettings;
    createdAt: Date;
    updatedAt: Date;
}
export interface OrganizationSettings {
    maxWorkflows: number;
    maxExecutionsPerMonth: number;
    allowedIntegrations: string[];
    aiFeaturesEnabled: boolean;
}
export interface Workflow {
    id: string;
    name: string;
    description: string;
    organizationId: string;
    createdBy: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    triggers: WorkflowTrigger[];
    settings: WorkflowSettings;
    status: 'draft' | 'active' | 'archived';
    version: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface WorkflowNode {
    id: string;
    type: NodeType;
    position: {
        x: number;
        y: number;
    };
    data: NodeData;
    config: NodeConfig;
}
export type NodeType = 'start' | 'end' | 'email' | 'approval' | 'condition' | 'delay' | 'webhook' | 'database' | 'ai' | 'integration' | 'notification' | 'report' | 'transform';
export interface NodeData {
    label: string;
    description?: string;
    icon?: string;
    color?: string;
}
export interface NodeConfig {
    [key: string]: any;
}
export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
    condition?: EdgeCondition;
}
export interface EdgeCondition {
    type: 'always' | 'onSuccess' | 'onError' | 'custom';
    expression?: string;
}
export interface WorkflowTrigger {
    id: string;
    type: 'webhook' | 'schedule' | 'manual' | 'event';
    config: TriggerConfig;
    enabled: boolean;
}
export interface TriggerConfig {
    webhook?: {
        url: string;
        method: 'GET' | 'POST' | 'PUT' | 'DELETE';
        headers?: Record<string, string>;
    };
    schedule?: {
        cron: string;
        timezone: string;
    };
    event?: {
        eventType: string;
        filters?: Record<string, any>;
    };
}
export interface WorkflowSettings {
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
    parallelExecution: boolean;
    maxConcurrentExecutions: number;
    notifications: NotificationSettings;
}
export interface NotificationSettings {
    onStart: boolean;
    onSuccess: boolean;
    onError: boolean;
    onTimeout: boolean;
    channels: ('email' | 'slack' | 'webhook')[];
    recipients: string[];
}
export interface WorkflowExecution {
    id: string;
    workflowId: string;
    organizationId: string;
    status: ExecutionStatus;
    startedAt: Date;
    completedAt?: Date;
    duration?: number;
    trigger: ExecutionTrigger;
    input: Record<string, any>;
    output: Record<string, any>;
    error?: ExecutionError;
    nodeExecutions: NodeExecution[];
    metadata: ExecutionMetadata;
}
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';
export interface ExecutionTrigger {
    type: 'webhook' | 'schedule' | 'manual' | 'event';
    data?: Record<string, any>;
}
export interface ExecutionError {
    message: string;
    code: string;
    details?: Record<string, any>;
    stack?: string;
}
export interface NodeExecution {
    id: string;
    nodeId: string;
    status: ExecutionStatus;
    startedAt: Date;
    completedAt?: Date;
    duration?: number;
    input: Record<string, any>;
    output: Record<string, any>;
    error?: ExecutionError;
    logs: ExecutionLog[];
}
export interface ExecutionLog {
    timestamp: Date;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    data?: Record<string, any>;
}
export interface ExecutionMetadata {
    userAgent?: string;
    ipAddress?: string;
    sessionId?: string;
    tags?: string[];
}
export interface AISuggestion {
    id: string;
    workflowId: string;
    type: 'optimization' | 'newWorkflow' | 'errorFix' | 'enhancement';
    title: string;
    description: string;
    confidence: number;
    impact: 'low' | 'medium' | 'high';
    changes: AISuggestionChange[];
    createdAt: Date;
}
export interface AISuggestionChange {
    type: 'addNode' | 'removeNode' | 'modifyNode' | 'addEdge' | 'removeEdge' | 'modifyEdge';
    target: string;
    data: Record<string, any>;
    reason: string;
}
export interface Integration {
    id: string;
    name: string;
    type: string;
    organizationId: string;
    config: IntegrationConfig;
    status: 'active' | 'inactive' | 'error';
    lastSync?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface IntegrationConfig {
    apiKey?: string;
    apiSecret?: string;
    baseUrl?: string;
    webhookUrl?: string;
    settings?: Record<string, any>;
}
export interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    workflow: Partial<Workflow>;
    usageCount: number;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface Analytics {
    workflowId: string;
    period: 'day' | 'week' | 'month' | 'year';
    metrics: {
        totalExecutions: number;
        successfulExecutions: number;
        failedExecutions: number;
        averageDuration: number;
        totalErrors: number;
        uniqueUsers: number;
    };
    trends: {
        executions: TimeSeriesData[];
        errors: TimeSeriesData[];
        duration: TimeSeriesData[];
    };
}
export interface TimeSeriesData {
    timestamp: Date;
    value: number;
}
export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface WorkflowFilters {
    status?: Workflow['status'];
    createdBy?: string;
    tags?: string[];
    dateFrom?: Date;
    dateTo?: Date;
}
export interface ExecutionFilters {
    status?: ExecutionStatus;
    workflowId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    triggerType?: ExecutionTrigger['type'];
}
//# sourceMappingURL=index.d.ts.map