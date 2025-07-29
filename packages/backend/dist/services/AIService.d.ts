import { Workflow, AISuggestion } from '../types';
export declare class AIService {
    private openai;
    constructor();
    generateSuggestions(workflow: Workflow): Promise<AISuggestion[]>;
    getSuggestionById(suggestionId: string): Promise<AISuggestion | null>;
    applySuggestion(workflow: Workflow, suggestion: AISuggestion): Promise<Workflow>;
    naturalLanguageToWorkflow(prompt: string): Promise<Partial<Workflow>>;
    private analyzeWorkflowStructure;
    private analyzePerformance;
    private analyzeErrorPrevention;
    private generateEnhancements;
    optimizeWorkflow(workflow: Workflow): Promise<Workflow>;
    predictErrors(workflow: Workflow): Promise<any[]>;
}
//# sourceMappingURL=AIService.d.ts.map