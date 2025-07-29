import { Router } from 'express';
import { ExecutionController } from '../controllers/ExecutionController';

const router = Router();
const executionController = new ExecutionController();

// Get all executions for organization
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, workflowId } = req.query;
    const result = await executionController.getExecutions(
      req.user!.organizationId,
      {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        workflowId: workflowId as string,
      }
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch executions',
    });
  }
});

// Get execution by ID
router.get('/:id', async (req, res) => {
  try {
    const execution = await executionController.getExecutionById(
      req.params.id,
      req.user!.organizationId
    );
    if (!execution) {
      return res.status(404).json({
        success: false,
        error: 'Execution not found',
      });
    }
    res.json({ success: true, data: execution });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch execution',
    });
  }
});

// Cancel execution
router.post('/:id/cancel', async (req, res) => {
  try {
    const cancelled = await executionController.cancelExecution(
      req.params.id,
      req.user!.organizationId
    );
    if (!cancelled) {
      return res.status(404).json({
        success: false,
        error: 'Execution not found or cannot be cancelled',
      });
    }
    res.json({ success: true, message: 'Execution cancelled successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel execution',
    });
  }
});

// Retry execution
router.post('/:id/retry', async (req, res) => {
  try {
    const newExecution = await executionController.retryExecution(
      req.params.id,
      req.user!.organizationId,
      req.user!.id
    );
    res.json({ success: true, data: newExecution });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retry execution',
    });
  }
});

// Get execution logs
router.get('/:id/logs', async (req, res) => {
  try {
    const logs = await executionController.getExecutionLogs(
      req.params.id,
      req.user!.organizationId
    );
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch execution logs',
    });
  }
});

export default router; 