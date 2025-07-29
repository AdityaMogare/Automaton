const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Mock user data
const mockUser = {
  id: '1',
  email: 'demo@example.com',
  name: 'Demo User',
  role: 'admin',
  organizationId: 'org-1',
  avatar: undefined,
  preferences: {
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      slack: false,
    },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
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
        'your-secret-key',
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
      error: error.message || 'Login failed',
    });
  }
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
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
      'your-secret-key',
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
      error: error.message || 'Registration failed',
    });
  }
});

// Validate token endpoint
app.get('/api/auth/validate', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, 'your-secret-key');
    
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

// Mock workflow endpoints
app.get('/api/workflows', (req, res) => {
  res.json({
    success: true,
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔑 Login credentials: demo@example.com / password`);
}); 