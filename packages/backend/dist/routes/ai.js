"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AIService_1 = require("../services/AIService");
const router = (0, express_1.Router)();
const aiService = new AIService_1.AIService();
router.post('/natural-language-to-workflow', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({
                success: false,
                error: 'Prompt is required',
            });
        }
        const workflow = await aiService.naturalLanguageToWorkflow(prompt);
        res.json({
            success: true,
            data: workflow,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to convert natural language to workflow',
        });
    }
});
router.post('/optimize-workflow', async (req, res) => {
    try {
        const { workflow } = req.body;
        if (!workflow) {
            return res.status(400).json({
                success: false,
                error: 'Workflow is required',
            });
        }
        const optimizedWorkflow = await aiService.optimizeWorkflow(workflow);
        res.json({
            success: true,
            data: optimizedWorkflow,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to optimize workflow',
        });
    }
});
router.post('/predict-errors', async (req, res) => {
    try {
        const { workflow } = req.body;
        if (!workflow) {
            return res.status(400).json({
                success: false,
                error: 'Workflow is required',
            });
        }
        const errorPredictions = await aiService.predictErrors(workflow);
        res.json({
            success: true,
            data: errorPredictions,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to predict errors',
        });
    }
});
exports.default = router;
//# sourceMappingURL=ai.js.map