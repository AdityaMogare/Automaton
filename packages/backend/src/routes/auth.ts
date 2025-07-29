import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

// Mock user data for demo purposes
const mockUser = {
  id: '1',
  email: 'demo@example.com',
  name: 'Demo User',
  role: 'admin' as const,
  organizationId: 'org-1',
  avatar: undefined,
  preferences: {
    theme: 'light' as const,
    notifications: {
      email: true,
      push: true,
      slack: false,
    },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // For demo purposes, accept any credentials
    if (email === 'demo@example.com' && password === 'password') {
      const token = jwt.sign(
        { 
          userId: mockUser.id, 
          email: mockUser.email,
          organizationId: mockUser.organizationId,
          role: mockUser.role 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token,
        user: mockUser,
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, organizationName } = req.body;

    // For demo purposes, always succeed
    const token = jwt.sign(
      { 
        userId: mockUser.id, 
        email: mockUser.email,
        organizationId: mockUser.organizationId,
        role: mockUser.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: mockUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
    });
  }
});

// Validate token endpoint
router.get('/validate', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // For demo purposes, always return the mock user
    res.json({
      success: true,
      user: mockUser,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
});

export default router; 