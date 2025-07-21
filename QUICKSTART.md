# 🚀 Automaton Quick Start Guide

Get the AI-Enhanced Workflow Automation Platform up and running in minutes!

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm 9+** - Comes with Node.js
- **Docker & Docker Compose** - [Download here](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download here](https://git-scm.com/)

## 🎯 Quick Start (5 minutes)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd automaton-workflow-platform
```

### 2. Run the Setup Script
```bash
./setup.sh
```

This script will:
- ✅ Check system requirements
- ✅ Install all dependencies
- ✅ Set up environment variables
- ✅ Start databases (PostgreSQL, MongoDB, Redis)
- ✅ Build applications
- ✅ Run tests

### 3. Configure Environment Variables
```bash
cp env.example .env
# Edit .env with your configuration
```

**Required configurations:**
- `OPENAI_API_KEY` - Your OpenAI API key for AI features
- `JWT_SECRET` - A secure secret for authentication
- Database credentials (if not using Docker)

### 4. Start the Platform
```bash
npm run dev
```

### 5. Access the Application
- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:8000
- 📊 **Health Check**: http://localhost:8000/health
- 📈 **Grafana**: http://localhost:3001 (admin/admin)

## 🐳 Docker Quick Start

If you prefer Docker, you can start everything with one command:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📋 Manual Setup

If you prefer to set up manually:

### 1. Install Dependencies
```bash
# Root dependencies
npm install

# Backend dependencies
cd packages/backend
npm install
cd ../..

# Frontend dependencies
cd packages/frontend
npm install
cd ../..
```

### 2. Start Databases
```bash
# Using Docker
docker-compose up -d postgres mongodb redis

# Or manually install and start:
# - PostgreSQL on port 5432
# - MongoDB on port 27017
# - Redis on port 6379
```

### 3. Configure Environment
```bash
cp env.example .env
# Edit .env with your settings
```

### 4. Start Development Servers
```bash
# Terminal 1 - Backend
cd packages/backend
npm run dev

# Terminal 2 - Frontend
cd packages/frontend
npm run dev
```

## 🎨 Creating Your First Workflow

### 1. Access the Platform
Open http://localhost:3000 in your browser

### 2. Create a New Workflow
1. Click "Create New Workflow"
2. Give it a name (e.g., "Employee Onboarding")
3. Add a description

### 3. Design Your Workflow
1. **Add Start Node**: Drag from the palette
2. **Add Process Nodes**: Email notifications, approvals, etc.
3. **Connect Nodes**: Click and drag between nodes
4. **Configure Nodes**: Click on nodes to configure settings

### 4. Configure Triggers
- **Webhook**: External system triggers
- **Schedule**: Time-based triggers
- **Manual**: User-initiated execution

### 5. Test Your Workflow
1. Click "Test Workflow"
2. Provide test input data
3. Watch real-time execution
4. Review results and logs

## 🔧 Common Workflow Types

### Employee Onboarding
```
Start → Send Welcome Email → Create Accounts → Assign Manager → Send Notifications → End
```

### Approval Process
```
Start → Submit Request → Manager Approval → Finance Review → Final Approval → Notify → End
```

### Data Processing
```
Start → Fetch Data → Transform → Validate → Store → Generate Report → Send Email → End
```

### Customer Support
```
Start → Create Ticket → Assign Agent → Process Request → Update Customer → Close Ticket → End
```

## 🤖 AI Features

### Smart Suggestions
- AI analyzes your workflow
- Suggests optimizations
- Identifies potential issues
- Recommends new nodes

### Natural Language Processing
- Describe workflows in plain English
- AI converts to visual workflow
- Automatic node configuration

### Performance Optimization
- AI monitors execution patterns
- Suggests performance improvements
- Identifies bottlenecks

## 📊 Monitoring & Analytics

### Real-time Dashboard
- Live execution status
- Performance metrics
- Error tracking
- Usage statistics

### Execution History
- Detailed execution logs
- Step-by-step analysis
- Error investigation
- Performance trends

### AI Insights
- Workflow optimization suggestions
- Usage pattern analysis
- Predictive maintenance
- Performance recommendations

## 🔐 Security Features

### Authentication
- JWT-based authentication
- Role-based access control
- Organization isolation
- Session management

### Data Protection
- Encrypted data storage
- Secure API communication
- Input validation
- SQL injection prevention

### Audit Trail
- Complete execution history
- User action logging
- Change tracking
- Compliance reporting

## 🚀 Production Deployment

### Environment Variables
```bash
# Production settings
NODE_ENV=production
JWT_SECRET=your-super-secure-secret
OPENAI_API_KEY=your-openai-key
POSTGRES_PASSWORD=secure-password
```

### Docker Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment
```bash
# Apply Kubernetes manifests
kubectl apply -f kubernetes/

# Check deployment status
kubectl get pods
kubectl get services
```

## 🛠️ Development

### Project Structure
```
automaton-workflow-platform/
├── packages/
│   ├── frontend/          # React application
│   ├── backend/           # Node.js API server
│   └── shared/            # Shared types and utilities
├── docker-compose.yml     # Docker configuration
├── kubernetes/            # K8s deployment files
├── docs/                 # Documentation
└── setup.sh              # Setup script
```

### Available Scripts
```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only

# Building
npm run build            # Build both applications
npm run build:frontend   # Build frontend
npm run build:backend    # Build backend

# Testing
npm run test             # Run all tests
npm run test:frontend    # Frontend tests
npm run test:backend     # Backend tests

# Docker
npm run docker:build     # Build Docker images
npm run docker:up        # Start Docker services
npm run docker:down      # Stop Docker services
```

### API Documentation
Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/api-docs
- **Health Check**: http://localhost:8000/health

## 🆘 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

#### Database Connection Issues
```bash
# Check if databases are running
docker-compose ps

# Restart databases
docker-compose restart postgres mongodb redis
```

#### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules packages/*/node_modules
npm install
```

#### Docker Issues
```bash
# Clean up Docker
docker-compose down -v
docker system prune -f
docker-compose up -d
```

### Getting Help

1. **Check Logs**
   ```bash
   # Backend logs
   docker-compose logs backend
   
   # Frontend logs
   docker-compose logs frontend
   ```

2. **Health Checks**
   ```bash
   # API health
   curl http://localhost:8000/health
   
   # Database health
   docker-compose exec postgres pg_isready
   ```

3. **Debug Mode**
   ```bash
   # Enable debug logging
   DEBUG=* npm run dev
   ```

## 📚 Next Steps

1. **Explore the Documentation**
   - [Architecture Guide](docs/ARCHITECTURE.md)
   - [API Reference](docs/API.md)
   - [Deployment Guide](docs/DEPLOYMENT.md)

2. **Try Advanced Features**
   - AI-powered workflow suggestions
   - Custom node development
   - Integration with external services
   - Advanced monitoring and analytics

3. **Join the Community**
   - Report issues on GitHub
   - Contribute to the project
   - Share your workflows
   - Get help from the community

## 🎉 You're Ready!

Congratulations! You now have a fully functional AI-enhanced workflow automation platform running. Start creating workflows, exploring AI features, and automating your business processes!

---

**Need help?** Check the [documentation](docs/) or [create an issue](https://github.com/your-repo/issues) on GitHub. 