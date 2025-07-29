"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateExecutionInput = exports.validateWorkflow = void 0;
const joi_1 = __importDefault(require("joi"));
const workflowSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(255).required(),
    description: joi_1.default.string().max(1000).optional(),
    nodes: joi_1.default.array().items(joi_1.default.object({
        id: joi_1.default.string().required(),
        type: joi_1.default.string().valid('start', 'end', 'email', 'approval', 'condition', 'delay', 'webhook', 'database', 'ai', 'integration', 'notification', 'report', 'transform').required(),
        position: joi_1.default.object({
            x: joi_1.default.number().required(),
            y: joi_1.default.number().required(),
        }).required(),
        data: joi_1.default.object({
            label: joi_1.default.string().required(),
            description: joi_1.default.string().optional(),
            icon: joi_1.default.string().optional(),
            color: joi_1.default.string().optional(),
        }).required(),
        config: joi_1.default.object().optional(),
    })).optional(),
    edges: joi_1.default.array().items(joi_1.default.object({
        id: joi_1.default.string().required(),
        source: joi_1.default.string().required(),
        target: joi_1.default.string().required(),
        label: joi_1.default.string().optional(),
        condition: joi_1.default.object({
            type: joi_1.default.string().valid('always', 'onSuccess', 'onError', 'custom').required(),
            expression: joi_1.default.string().optional(),
        }).optional(),
    })).optional(),
    triggers: joi_1.default.array().items(joi_1.default.object({
        id: joi_1.default.string().required(),
        type: joi_1.default.string().valid('webhook', 'schedule', 'manual', 'event').required(),
        config: joi_1.default.object({
            webhook: joi_1.default.object({
                url: joi_1.default.string().uri().required(),
                method: joi_1.default.string().valid('GET', 'POST', 'PUT', 'DELETE').required(),
                headers: joi_1.default.object().optional(),
            }).optional(),
            schedule: joi_1.default.object({
                cron: joi_1.default.string().required(),
                timezone: joi_1.default.string().required(),
            }).optional(),
            event: joi_1.default.object({
                eventType: joi_1.default.string().required(),
                filters: joi_1.default.object().optional(),
            }).optional(),
        }).required(),
        enabled: joi_1.default.boolean().required(),
    })).optional(),
    settings: joi_1.default.object({
        timeout: joi_1.default.number().min(1000).max(3600000).optional(),
        retryAttempts: joi_1.default.number().min(0).max(10).optional(),
        retryDelay: joi_1.default.number().min(100).max(60000).optional(),
        parallelExecution: joi_1.default.boolean().optional(),
        maxConcurrentExecutions: joi_1.default.number().min(1).max(100).optional(),
        notifications: joi_1.default.object({
            onStart: joi_1.default.boolean().optional(),
            onSuccess: joi_1.default.boolean().optional(),
            onError: joi_1.default.boolean().optional(),
            onTimeout: joi_1.default.boolean().optional(),
            channels: joi_1.default.array().items(joi_1.default.string().valid('email', 'slack', 'webhook')).optional(),
            recipients: joi_1.default.array().items(joi_1.default.string().email()).optional(),
        }).optional(),
    }).optional(),
    status: joi_1.default.string().valid('draft', 'active', 'archived').optional(),
});
const validateWorkflow = (req, res, next) => {
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
exports.validateWorkflow = validateWorkflow;
const executionInputSchema = joi_1.default.object({
    input: joi_1.default.object().optional(),
});
const validateExecutionInput = (req, res, next) => {
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
exports.validateExecutionInput = validateExecutionInput;
//# sourceMappingURL=validation.js.map