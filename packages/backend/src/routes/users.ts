import { Router } from 'express';

const router = Router();

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user profile',
    });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    // In a real implementation, this would update the user in the database
    res.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile',
    });
  }
});

export default router; 