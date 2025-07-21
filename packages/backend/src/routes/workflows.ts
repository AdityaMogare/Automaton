import { Router } from 'express';
import { WorkflowController } from '../controllers/WorkflowController';
import { validateWorkflow } from '../middleware/validation';

const router = Router();
const workflowController = new WorkflowController();

// Get all workflows for organization
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const result = await workflowController.getWorkflows(
      req.user!.organizationId,
      {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        search: search as string,
      }
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch workflows',
    });
  }
});

// Get workflow by ID
router.get('/:id', async (req, res) => {
  try {
    const workflow = await workflowController.getWorkflowById(
      req.params.id,
      req.user!.organizationId
    );
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found',
      });
    }
    res.json({ success: true, data: workflow });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch workflow',
    });
  }
});

// Create new workflow
router.post('/', validateWorkflow, async (req, res) => {
  try {
    const workflow = await workflowController.createWorkflow({
      ...req.body,
      organizationId: req.user!.organizationId,
      createdBy: req.user!.id,
    });
    res.status(201).json({ success: true, data: workflow });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create workflow',
    });
  }
});

// Update workflow
router.put('/:id', validateWorkflow, async (req, res) => {
  try {
    const workflow = await workflowController.updateWorkflow(
      req.params.id,
      req.body,
      req.user!.organizationId
    );
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found',
      });
    }
    res.json({ success: true, data: workflow });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update workflow',
    });
  }
});

// Delete workflow
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await workflowController.deleteWorkflow(
      req.params.id,
      req.user!.organizationId
    );
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found',
      });
    }
    res.json({ success: true, message: 'Workflow deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete workflow',
    });
  }
});

// Execute workflow
router.post('/:id/execute', async (req, res) => {
  try {
    const execution = await workflowController.executeWorkflow(
      req.params.id,
      req.body.input || {},
      req.user!.organizationId,
      req.user!.id
    );
    res.json({ success: true, data: execution });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to execute workflow',
    });
  }
});

// Get workflow executions
router.get('/:id/executions', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const executions = await workflowController.getWorkflowExecutions(
      req.params.id,
      req.user!.organizationId,
      {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
      }
    );
    res.json(executions);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch executions',
    });
  }
});

// Get workflow analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const analytics = await workflowController.getWorkflowAnalytics(
      req.params.id,
      req.user!.organizationId,
      period as string
    );
    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch analytics',
    });
  }
});

// Get AI suggestions for workflow
router.get('/:id/suggestions', async (req, res) => {
  try {
    const suggestions = await workflowController.getAISuggestions(
      req.params.id,
      req.user!.organizationId
    );
    res.json({ success: true, data: suggestions });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch AI suggestions',
    });
  }
});

// Apply AI suggestion
router.post('/:id/suggestions/:suggestionId/apply', async (req, res) => {
  try {
    const workflow = await workflowController.applyAISuggestion(
      req.params.id,
      req.params.suggestionId,
      req.user!.organizationId
    );
    res.json({ success: true, data: workflow });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to apply AI suggestion',
    });
  }
});

// Duplicate workflow
router.post('/:id/duplicate', async (req, res) => {
  try {
    const workflow = await workflowController.duplicateWorkflow(
      req.params.id,
      req.user!.organizationId,
      req.user!.id
    );
    res.json({ success: true, data: workflow });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to duplicate workflow',
    });
  }
});

// Export workflow
router.get('/:id/export', async (req, res) => {
  try {
    const exportData = await workflowController.exportWorkflow(
      req.params.id,
      req.user!.organizationId
    );
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="workflow-${req.params.id}.json"`);
    res.json(exportData);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export workflow',
    });
  }
});

// Import workflow
router.post('/import', async (req, res) => {
  try {
    const workflow = await workflowController.importWorkflow(
      req.body,
      req.user!.organizationId,
      req.user!.id
    );
    res.json({ success: true, data: workflow });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to import workflow',
    });
  }
});

export default router; 