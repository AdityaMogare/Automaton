// User and Authentication
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  organizationId: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: {
      email: boolean;
      push: boolean;
      slack: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  settings: {
    maxWorkflows: number;
    maxExecutionsPerMonth: number;
    allowedIntegrations: string[];
    aiFeaturesEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Workflow Types
export interface WorkflowNode {
  id: string;
  type: 'start' | 'end' | 'email' | 'approval' | 'condition' | 'delay' | 'webhook' | 'database' | 'ai' | 'integration' | 'notification' | 'report' | 'transform';
  position: { x: number; y: number };
  data: {
    label: string;
    [key: string]: any;
  };
  config?: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: {
    type: 'always' | 'onSuccess' | 'onError' | 'custom';
    expression?: string;
  };
}

export interface WorkflowTrigger {
  id: string;
  type: 'manual' | 'schedule' | 'webhook' | 'event';
  config: Record<string, any>;
  enabled: boolean;
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
  settings: {
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
    parallelExecution: boolean;
    maxConcurrentExecutions: number;
    notifications: {
      onStart: boolean;
      onSuccess: boolean;
      onError: boolean;
      onTimeout: boolean;
      channels: string[];
      recipients: string[];
    };
  };
  status: 'draft' | 'active' | 'archived';
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

// Execution Types
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  organizationId: string;
  status: ExecutionStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  trigger: {
    type: string;
    data: Record<string, any>;
  };
  input: Record<string, any>;
  output: Record<string, any>;
  nodeExecutions: any[];
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  metadata: {
    userAgent: string;
    ipAddress: string;
    sessionId: string;
    tags: string[];
  };
}

// AI Types
export interface AISuggestion {
  id: string;
  workflowId: string;
  type: 'optimization' | 'errorFix' | 'enhancement';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  changes: AISuggestionChange[];
  createdAt: Date;
}

export interface AISuggestionChange {
  type: 'addNode' | 'removeNode' | 'modifyNode' | 'addEdge' | 'removeEdge' | 'modifyEdge';
  target?: string;
  data: any;
  reason?: string;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// UI Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
  children?: SidebarItem[];
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

export interface WorkflowForm {
  name: string;
  description: string;
  settings: Workflow['settings'];
}

// Socket Event Types
export interface ExecutionUpdateEvent {
  executionId: string;
  status: ExecutionStatus;
  progress: number;
  timestamp: Date;
}

export interface WorkflowUpdateEvent {
  workflowId: string;
  action: 'created' | 'updated' | 'deleted';
  data: any;
  timestamp: Date;
}

export interface NotificationEvent {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
} 