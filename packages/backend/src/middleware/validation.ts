import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const workflowSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).optional(),
  nodes: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      type: Joi.string().valid(
        'start', 'end', 'email', 'approval', 'condition', 'delay',
        'webhook', 'database', 'ai', 'integration', 'notification',
        'report', 'transform'
      ).required(),
      position: Joi.object({
        x: Joi.number().required(),
        y: Joi.number().required(),
      }).required(),
      data: Joi.object({
        label: Joi.string().required(),
        description: Joi.string().optional(),
        icon: Joi.string().optional(),
        color: Joi.string().optional(),
      }).required(),
      config: Joi.object().optional(),
    })
  ).optional(),
  edges: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      source: Joi.string().required(),
      target: Joi.string().required(),
      label: Joi.string().optional(),
      condition: Joi.object({
        type: Joi.string().valid('always', 'onSuccess', 'onError', 'custom').required(),
        expression: Joi.string().optional(),
      }).optional(),
    })
  ).optional(),
  triggers: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      type: Joi.string().valid('webhook', 'schedule', 'manual', 'event').required(),
      config: Joi.object({
        webhook: Joi.object({
          url: Joi.string().uri().required(),
          method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE').required(),
          headers: Joi.object().optional(),
        }).optional(),
        schedule: Joi.object({
          cron: Joi.string().required(),
          timezone: Joi.string().required(),
        }).optional(),
        event: Joi.object({
          eventType: Joi.string().required(),
          filters: Joi.object().optional(),
        }).optional(),
      }).required(),
      enabled: Joi.boolean().required(),
    })
  ).optional(),
  settings: Joi.object({
    timeout: Joi.number().min(1000).max(3600000).optional(), // 1 second to 1 hour
    retryAttempts: Joi.number().min(0).max(10).optional(),
    retryDelay: Joi.number().min(100).max(60000).optional(),
    parallelExecution: Joi.boolean().optional(),
    maxConcurrentExecutions: Joi.number().min(1).max(100).optional(),
    notifications: Joi.object({
      onStart: Joi.boolean().optional(),
      onSuccess: Joi.boolean().optional(),
      onError: Joi.boolean().optional(),
      onTimeout: Joi.boolean().optional(),
      channels: Joi.array().items(Joi.string().valid('email', 'slack', 'webhook')).optional(),
      recipients: Joi.array().items(Joi.string().email()).optional(),
    }).optional(),
  }).optional(),
  status: Joi.string().valid('draft', 'active', 'archived').optional(),
});

export const validateWorkflow = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = workflowSchema.validate(req.body);
  
  if (error) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
    return;
  }
  
  next();
};

const executionInputSchema = Joi.object({
  input: Joi.object().optional(),
});

export const validateExecutionInput = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = executionInputSchema.validate(req.body);
  
  if (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid execution input',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
    return;
  }
  
  next();
}; 