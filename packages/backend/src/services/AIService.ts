import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { Workflow, AISuggestion, AISuggestionChange } from '../types';

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateSuggestions(workflow: Workflow): Promise<AISuggestion[]> {
    try {
      const suggestions: AISuggestion[] = [];

      // Analyze workflow structure
      const structureAnalysis = await this.analyzeWorkflowStructure(workflow);
      if (structureAnalysis) {
        suggestions.push(structureAnalysis);
      }

      // Check for performance optimizations
      const performanceSuggestion = await this.analyzePerformance(workflow);
      if (performanceSuggestion) {
        suggestions.push(performanceSuggestion);
      }

      // Check for error prevention
      const errorPreventionSuggestion = await this.analyzeErrorPrevention(workflow);
      if (errorPreventionSuggestion) {
        suggestions.push(errorPreventionSuggestion);
      }

      // Generate enhancement suggestions
      const enhancementSuggestion = await this.generateEnhancements(workflow);
      if (enhancementSuggestion) {
        suggestions.push(enhancementSuggestion);
      }

      return suggestions;
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      return [];
    }
  }

  async getSuggestionById(suggestionId: string): Promise<AISuggestion | null> {
    // In a real implementation, this would fetch from database
    // For now, return null as suggestions are generated on-demand
    return null;
  }

  async applySuggestion(workflow: Workflow, suggestion: AISuggestion): Promise<Workflow> {
    const updatedWorkflow = { ...workflow };

    for (const change of suggestion.changes) {
      switch (change.type) {
        case 'addNode':
          updatedWorkflow.nodes.push({
            id: uuidv4(),
            type: change.data.type,
            position: change.data.position,
            data: change.data.data,
            config: change.data.config || {},
          });
          break;

        case 'removeNode':
          updatedWorkflow.nodes = updatedWorkflow.nodes.filter(
            node => node.id !== change.target
          );
          updatedWorkflow.edges = updatedWorkflow.edges.filter(
            edge => edge.source !== change.target && edge.target !== change.target
          );
          break;

        case 'modifyNode':
          const nodeIndex = updatedWorkflow.nodes.findIndex(
            node => node.id === change.target
          );
          if (nodeIndex !== -1) {
            updatedWorkflow.nodes[nodeIndex] = {
              ...updatedWorkflow.nodes[nodeIndex],
              ...change.data,
            };
          }
          break;

        case 'addEdge':
          updatedWorkflow.edges.push({
            id: uuidv4(),
            source: change.data.source,
            target: change.data.target,
            label: change.data.label,
            condition: change.data.condition,
          });
          break;

        case 'removeEdge':
          updatedWorkflow.edges = updatedWorkflow.edges.filter(
            edge => edge.id !== change.target
          );
          break;

        case 'modifyEdge':
          const edgeIndex = updatedWorkflow.edges.findIndex(
            edge => edge.id === change.target
          );
          if (edgeIndex !== -1) {
            updatedWorkflow.edges[edgeIndex] = {
              ...updatedWorkflow.edges[edgeIndex],
              ...change.data,
            };
          }
          break;
      }
    }

    return updatedWorkflow;
  }

  async naturalLanguageToWorkflow(prompt: string): Promise<Partial<Workflow>> {
    try {
      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert workflow automation specialist. Convert natural language descriptions into workflow structures. Return only valid JSON with the following structure:
            {
              "name": "Workflow name",
              "description": "Workflow description",
              "nodes": [
                {
                  "id": "unique-id",
                  "type": "node-type",
                  "position": {"x": 0, "y": 0},
                  "data": {"label": "Node label"},
                  "config": {}
                }
              ],
              "edges": [
                {
                  "id": "unique-id",
                  "source": "source-node-id",
                  "target": "target-node-id"
                }
              ]
            }
            
            Available node types: start, end, email, approval, condition, delay, webhook, database, ai, integration, notification, report, transform`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Error converting natural language to workflow:', error);
      throw new Error('Failed to convert natural language to workflow');
    }
  }

  private async analyzeWorkflowStructure(workflow: Workflow): Promise<AISuggestion | null> {
    try {
      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Analyze this workflow structure and suggest improvements. Focus on:
            1. Missing essential nodes (start, end)
            2. Logical flow issues
            3. Unnecessary complexity
            4. Best practices violations
            
            Return a JSON object with:
            {
              "title": "Suggestion title",
              "description": "Detailed description",
              "confidence": 0.85,
              "impact": "medium",
              "changes": [
                {
                  "type": "addNode|removeNode|modifyNode|addEdge|removeEdge|modifyEdge",
                  "target": "node-id",
                  "data": {},
                  "reason": "Why this change is needed"
                }
              ]
            }`
          },
          {
            role: 'user',
            content: `Analyze this workflow: ${JSON.stringify(workflow, null, 2)}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.2,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return null;

      const analysis = JSON.parse(content);
      
      return {
        id: uuidv4(),
        workflowId: workflow.id,
        type: 'optimization',
        title: analysis.title,
        description: analysis.description,
        confidence: analysis.confidence,
        impact: analysis.impact,
        changes: analysis.changes,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Error analyzing workflow structure:', error);
      return null;
    }
  }

  private async analyzePerformance(workflow: Workflow): Promise<AISuggestion | null> {
    try {
      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Analyze this workflow for performance optimization opportunities. Look for:
            1. Unnecessary delays
            2. Sequential operations that could be parallel
            3. Redundant nodes
            4. Inefficient data flow
            
            Return a JSON object with performance suggestions.`
          },
          {
            role: 'user',
            content: `Analyze performance of: ${JSON.stringify(workflow, null, 2)}`
          }
        ],
        max_tokens: 800,
        temperature: 0.2,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return null;

      const analysis = JSON.parse(content);
      
      return {
        id: uuidv4(),
        workflowId: workflow.id,
        type: 'optimization',
        title: 'Performance Optimization',
        description: analysis.description || 'Performance improvements suggested',
        confidence: analysis.confidence || 0.8,
        impact: 'high',
        changes: analysis.changes || [],
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Error analyzing performance:', error);
      return null;
    }
  }

  private async analyzeErrorPrevention(workflow: Workflow): Promise<AISuggestion | null> {
    try {
      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Analyze this workflow for potential error scenarios and suggest error handling improvements. Look for:
            1. Missing error handling nodes
            2. Unhandled edge cases
            3. Missing validation steps
            4. Potential failure points
            
            Return a JSON object with error prevention suggestions.`
          },
          {
            role: 'user',
            content: `Analyze error prevention for: ${JSON.stringify(workflow, null, 2)}`
          }
        ],
        max_tokens: 800,
        temperature: 0.2,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return null;

      const analysis = JSON.parse(content);
      
      return {
        id: uuidv4(),
        workflowId: workflow.id,
        type: 'errorFix',
        title: 'Error Prevention',
        description: analysis.description || 'Error handling improvements suggested',
        confidence: analysis.confidence || 0.9,
        impact: 'high',
        changes: analysis.changes || [],
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Error analyzing error prevention:', error);
      return null;
    }
  }

  private async generateEnhancements(workflow: Workflow): Promise<AISuggestion | null> {
    try {
      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Suggest enhancements for this workflow. Consider:
            1. Additional useful nodes
            2. Better user experience
            3. Monitoring and logging
            4. Integration opportunities
            
            Return a JSON object with enhancement suggestions.`
          },
          {
            role: 'user',
            content: `Suggest enhancements for: ${JSON.stringify(workflow, null, 2)}`
          }
        ],
        max_tokens: 800,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return null;

      const analysis = JSON.parse(content);
      
      return {
        id: uuidv4(),
        workflowId: workflow.id,
        type: 'enhancement',
        title: 'Workflow Enhancements',
        description: analysis.description || 'Enhancement suggestions',
        confidence: analysis.confidence || 0.7,
        impact: 'medium',
        changes: analysis.changes || [],
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Error generating enhancements:', error);
      return null;
    }
  }

  async optimizeWorkflow(workflow: Workflow): Promise<Workflow> {
    try {
      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Optimize this workflow for better performance, reliability, and maintainability. Return the optimized workflow as JSON.`
          },
          {
            role: 'user',
            content: `Optimize this workflow: ${JSON.stringify(workflow, null, 2)}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.2,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No optimization response from OpenAI');
      }

      const optimizedWorkflow = JSON.parse(content);
      return {
        ...workflow,
        ...optimizedWorkflow,
        version: workflow.version + 1,
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error optimizing workflow:', error);
      throw new Error('Failed to optimize workflow');
    }
  }

  async predictErrors(workflow: Workflow): Promise<any[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Analyze this workflow and predict potential errors or failure scenarios. Return a JSON array of error predictions.`
          },
          {
            role: 'user',
            content: `Predict errors for: ${JSON.stringify(workflow, null, 2)}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.2,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return [];

      return JSON.parse(content);
    } catch (error) {
      console.error('Error predicting errors:', error);
      return [];
    }
  }
} 