import { WorkflowExecutionService } from './services/WorkflowExecutionService';
import { NotificationService } from './services/NotificationService';
import { AIService } from './services/AIService';
declare global {
    namespace Express {
        interface Request {
            workflowExecutionService: WorkflowExecutionService;
            notificationService: NotificationService;
            aiService: AIService;
        }
    }
}
//# sourceMappingURL=index.d.ts.map