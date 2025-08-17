# TagPay Makefile Documentation

This comprehensive Makefile provides a unified interface for all TagPay development and deployment operations.

## 🚀 Quick Start

### Initial Setup
```bash
make setup              # Complete project setup
make setup:dev          # Development environment setup
make setup:infra        # Infrastructure setup
```

### Development Workflow
```bash
make dev:full           # Start full development stack
make logs               # View all logs
make status             # Check system status
```

### Deployment
```bash
make deploy:staging     # Deploy to staging
make deploy:production  # Deploy to production
```

## 📋 Available Commands

### 🏗️ Infrastructure as Code (Pulumi)
- `make infra:init` - Initialize Pulumi stacks
- `make infra:staging` - Deploy to staging
- `make infra:production` - Deploy to production
- `make infra:preview` - Preview changes
- `make infra:destroy` - Destroy infrastructure (with confirmation)
- `make infra:refresh` - Refresh state
- `make infra:config` - Show configuration
- `make infra:logs` - Show Pulumi logs

### 🐳 Docker Environment Management
- `make docker:build` - Build all images
- `make docker:up` - Start production environment
- `make docker:down` - Stop all containers
- `make docker:dev` - Start development environment
- `make docker:dev:down` - Stop development environment
- `make docker:logs` - Show container logs
- `make docker:dev:logs` - Show development logs
- `make docker:clean` - Clean up containers/images
- `make docker:status` - Show container status

### ☸️ Kubernetes/Skaffold Operations
- `make k8s:dev` - Start Skaffold development
- `make k8s:dev:hot` - Start with hot reload
- `make k8s:deploy` - Deploy to Kubernetes
- `make k8s:logs` - Show K8s logs
- `make k8s:status` - Show K8s status
- `make k8s:cleanup` - Cleanup K8s resources
- `make k8s:port-forward` - Setup port forwarding

### 💻 Application Development
- `make dev` - Start development environment
- `make dev:server` - Start server only
- `make dev:admin` - Start admin only
- `make dev:full` - Start full stack (server + admin + db)
- `make build` - Build all applications
- `make build:server` - Build server only
- `make build:admin` - Build admin only
- `make test` - Run all tests
- `make test:server` - Test server
- `make test:admin` - Test admin
- `make lint` - Lint all code
- `make lint:fix` - Fix linting issues

### 🗄️ Database Operations
- `make db:generate` - Generate database migrations
- `make db:migrate` - Run database migrations
- `make db:studio` - Open Drizzle Studio
- `make db:reset` - Reset database (with confirmation)
- `make db:seed` - Seed database
- `make db:backup` - Backup database
- `make db:restore` - Restore database

### 🔧 Setup & Maintenance
- `make setup` - Initial project setup
- `make setup:dev` - Setup development environment
- `make setup:infra` - Setup infrastructure
- `make install` - Install dependencies
- `make install:dev` - Install dev dependencies
- `make clean` - Clean build artifacts
- `make clean:all` - Clean everything
- `make update` - Update dependencies
- `make update:infra` - Update infrastructure

### 📊 Monitoring & Debugging
- `make logs` - Show all logs
- `make logs:server` - Show server logs
- `make logs:admin` - Show admin logs
- `make logs:db` - Show database logs
- `make logs:infra` - Show infrastructure logs
- `make status` - Show overall status
- `make health` - Health check all services
- `make debug` - Debug mode

### 🔒 Security & Validation
- `make security:scan` - Security scan
- `make security:audit` - Security audit
- `make validate` - Validate configuration
- `make validate:infra` - Validate infrastructure
- `make validate:k8s` - Validate Kubernetes
- `make secrets:generate` - Generate secrets
- `make secrets:validate` - Validate secrets

### 🚀 Deployment & CI/CD
- `make deploy:staging` - Deploy to staging
- `make deploy:production` - Deploy to production
- `make deploy:rollback` - Rollback deployment
- `make ci:test` - CI test suite
- `make ci:build` - CI build process
- `make ci:deploy` - CI deployment

### 📚 Help & Documentation
- `make help` - Show all available commands
- `make help:infra` - Show infrastructure commands
- `make help:docker` - Show Docker commands
- `make help:k8s` - Show Kubernetes commands
- `make help:dev` - Show development commands

## 🎯 Common Workflows

### New Developer Onboarding
```bash
make setup:dev          # Complete setup
make dev:full           # Start development
make help               # Learn available commands
```

### Daily Development
```bash
make dev:full           # Start development environment
make logs               # Monitor logs
make test               # Run tests
make lint               # Check code quality
```

### Feature Development
```bash
make db:generate        # Create new migration
make db:migrate         # Apply migration
make build              # Build changes
make test               # Test changes
```

### Deployment Process
```bash
make ci:test            # Run full test suite
make ci:build           # Build for production
make deploy:staging     # Deploy to staging
make health             # Verify deployment
make deploy:production  # Deploy to production
```

### Troubleshooting
```bash
make status             # Check system status
make health             # Health checks
make logs               # View logs
make debug              # Debug information
```

## 🔧 Configuration

### Environment Variables
The Makefile uses the following environment variables:
- `PROJECT_NAME` - Project name (default: tagpay)
- `DOCKER_COMPOSE` - Docker Compose command
- `PULUMI_DIR` - Pulumi directory path
- `K8S_DIR` - Kubernetes directory path
- `SCRIPTS_DIR` - Scripts directory path

### Prerequisites
- Docker and Docker Compose
- Node.js and npm
- Pulumi CLI
- kubectl
- Skaffold

## 🎨 Features

### Color-Coded Output
- 🟢 Green - Success messages
- 🔴 Red - Error messages
- 🟡 Yellow - Warnings
- 🔵 Blue - Information
- 🟣 Purple - Debug information
- 🔵 Cyan - Help text

### Safety Features
- Confirmation prompts for destructive operations
- Error handling and validation
- Dependency checking
- Rollback capabilities

### Developer Experience
- Single command interface
- Self-documenting commands
- Consistent workflows
- Comprehensive logging

## 🚨 Important Notes

### Safety Confirmations
Some commands require confirmation:
- `make infra:destroy` - Destroys all infrastructure
- `make db:reset` - Resets database
- `make clean:all` - Cleans everything

### Environment Isolation
- Staging and production environments are completely isolated
- Development environment uses local Docker containers
- Infrastructure changes are previewed before deployment

### Error Handling
- Commands include error checking
- Failed operations are clearly reported
- Rollback options are available for deployments

## 🤝 Contributing

When adding new commands to the Makefile:
1. Follow the existing naming conventions
2. Add help text with `## Description`
3. Include proper error handling
4. Add to appropriate help categories
5. Test thoroughly before committing

## 📞 Support

For issues with the Makefile:
1. Check the help commands: `make help`
2. Review the logs: `make logs`
3. Check system status: `make status`
4. Contact the DevOps team
