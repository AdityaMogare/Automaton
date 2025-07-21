#!/bin/bash

# Automaton Workflow Automation Platform Setup Script
# This script sets up the entire platform with all dependencies

set -e

echo "🚀 Setting up Automaton Workflow Automation Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Some features may not work."
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_warning "Docker Compose is not installed. Some features may not work."
    fi
    
    print_success "System requirements check completed."
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install backend dependencies
    cd packages/backend
    npm install
    cd ../..
    
    # Install frontend dependencies
    cd packages/frontend
    npm install
    cd ../..
    
    print_success "Dependencies installed successfully."
}

# Setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    if [ ! -f .env ]; then
        cp env.example .env
        print_success "Environment file created. Please edit .env with your configuration."
    else
        print_warning "Environment file already exists. Skipping..."
    fi
}

# Setup database
setup_database() {
    print_status "Setting up databases..."
    
    # Check if Docker is available
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        print_status "Starting databases with Docker..."
        docker-compose up -d postgres mongodb redis
        
        # Wait for databases to be ready
        print_status "Waiting for databases to be ready..."
        sleep 10
        
        print_success "Databases started successfully."
    else
        print_warning "Docker not available. Please start databases manually:"
        echo "  - PostgreSQL on port 5432"
        echo "  - MongoDB on port 27017"
        echo "  - Redis on port 6379"
    fi
}

# Build applications
build_applications() {
    print_status "Building applications..."
    
    # Build backend
    cd packages/backend
    npm run build
    cd ../..
    
    # Build frontend
    cd packages/frontend
    npm run build
    cd ../..
    
    print_success "Applications built successfully."
}

# Setup development environment
setup_development() {
    print_status "Setting up development environment..."
    
    # Create necessary directories
    mkdir -p packages/backend/uploads
    mkdir -p packages/backend/logs
    mkdir -p packages/frontend/public
    
    # Set up Git hooks
    if [ -d .git ]; then
        print_status "Setting up Git hooks..."
        npm run prepare
    fi
    
    print_success "Development environment setup completed."
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Run backend tests
    cd packages/backend
    npm test
    cd ../..
    
    # Run frontend tests
    cd packages/frontend
    npm test
    cd ../..
    
    print_success "Tests completed successfully."
}

# Start development servers
start_development() {
    print_status "Starting development servers..."
    
    # Start backend
    cd packages/backend
    npm run dev &
    BACKEND_PID=$!
    cd ../..
    
    # Start frontend
    cd packages/frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ../..
    
    print_success "Development servers started!"
    echo ""
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:8000"
    echo "📊 Health Check: http://localhost:8000/health"
    echo ""
    echo "Press Ctrl+C to stop the servers"
    
    # Wait for user to stop
    trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
    wait
}

# Main setup function
main() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                AUTOMATON WORKFLOW PLATFORM                   ║"
    echo "║                    Setup Script                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    
    check_requirements
    install_dependencies
    setup_environment
    setup_database
    build_applications
    setup_development
    run_tests
    
    print_success "Setup completed successfully!"
    echo ""
    echo "🎉 Automaton Workflow Automation Platform is ready!"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env file with your configuration"
    echo "2. Run 'npm run dev' to start development servers"
    echo "3. Open http://localhost:3000 in your browser"
    echo ""
    echo "For more information, see README.md"
}

# Check command line arguments
case "${1:-}" in
    "dev")
        start_development
        ;;
    "test")
        run_tests
        ;;
    "build")
        build_applications
        ;;
    "db")
        setup_database
        ;;
    *)
        main
        ;;
esac 