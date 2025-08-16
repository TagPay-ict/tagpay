# TagPay Makefile - Comprehensive Development and Deployment Tool
# This Makefile provides a unified interface for all TagPay operations

# Configuration
PROJECT_NAME := tagpay
DOCKER_COMPOSE := docker-compose
DOCKER_COMPOSE_DEV := docker-compose -f docker-compose.dev.yml
PULUMI_DIR := infra/pulumi
K8S_DIR := infra/k8s
SCRIPTS_DIR := scripts

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
PURPLE := \033[0;35m
CYAN := \033[0;36m
NC := \033[0m # No Color

# Default target
.DEFAULT_GOAL := help

# Help target
.PHONY: help
help: ## Show this help message
	@echo "$(CYAN)TagPay Development and Deployment Commands$(NC)"
	@echo "$(CYAN)============================================$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)For detailed help on specific categories:$(NC)"
	@echo "  make help:infra     - Infrastructure commands"
	@echo "  make help:docker    - Docker commands"
	@echo "  make help:k8s       - Kubernetes commands"
	@echo "  make help:dev       - Development commands"

# =============================================================================
# SETUP & INSTALLATION
# =============================================================================

.PHONY: setup
setup: ## Initial project setup
	@echo "$(BLUE)[SETUP]$(NC) Setting up TagPay project..."
	@npm install
	@cd $(PULUMI_DIR) && npm install
	@echo "$(GREEN)[SUCCESS]$(NC) Project setup completed!"

.PHONY: setup-dev
setup-dev: ## Setup development environment
	@echo "$(BLUE)[SETUP]$(NC) Setting up development environment..."
	@make setup
	@make docker-build
	@echo "$(GREEN)[SUCCESS]$(NC) Development environment ready!"

.PHONY: setup-infra
setup-infra: ## Setup infrastructure
	@echo "$(BLUE)[SETUP]$(NC) Setting up infrastructure..."
	@cd $(PULUMI_DIR) && pulumi stack init staging || true
	@cd $(PULUMI_DIR) && pulumi stack init production || true
	@cd $(PULUMI_DIR) && pulumi config set environment staging --stack staging
	@cd $(PULUMI_DIR) && pulumi config set environment production --stack production
	@echo "$(GREEN)[SUCCESS]$(NC) Infrastructure setup completed!"

.PHONY: install
install: ## Install all dependencies
	@echo "$(BLUE)[INSTALL]$(NC) Installing dependencies..."
	@npm install
	@cd $(PULUMI_DIR) && npm install
	@echo "$(GREEN)[SUCCESS]$(NC) Dependencies installed!"

.PHONY: install-dev
install-dev: ## Install development dependencies
	@echo "$(BLUE)[INSTALL]$(NC) Installing development dependencies..."
	@npm install
	@cd $(PULUMI_DIR) && npm install
	@echo "$(GREEN)[SUCCESS]$(NC) Development dependencies installed!"

# =============================================================================
# INFRASTRUCTURE AS CODE (PULUMI)
# =============================================================================

.PHONY: infra-init
infra-init: ## Initialize Pulumi stacks
	@echo "$(BLUE)[INFRA]$(NC) Initializing Pulumi stacks..."
	@cd $(PULUMI_DIR) && pulumi stack init staging || true
	@cd $(PULUMI_DIR) && pulumi stack init production || true
	@echo "$(GREEN)[SUCCESS]$(NC) Pulumi stacks initialized!"

.PHONY: infra-staging
infra-staging: ## Deploy infrastructure to staging
	@echo "$(BLUE)[INFRA]$(NC) Deploying to staging..."
	@cd $(PULUMI_DIR) && npm run deploy:staging
	@echo "$(GREEN)[SUCCESS]$(NC) Staging infrastructure deployed!"

.PHONY: infra-production
infra-production: ## Deploy infrastructure to production
	@echo "$(BLUE)[INFRA]$(NC) Deploying to production..."
	@cd $(PULUMI_DIR) && npm run deploy:production
	@echo "$(GREEN)[SUCCESS]$(NC) Production infrastructure deployed!"

.PHONY: infra-preview
infra-preview: ## Preview infrastructure changes
	@echo "$(BLUE)[INFRA]$(NC) Previewing changes..."
	@cd $(PULUMI_DIR) && npm run preview:staging
	@echo "$(GREEN)[SUCCESS]$(NC) Preview completed!"

.PHONY: infra-destroy
infra-destroy: ## Destroy infrastructure (with confirmation)
	@echo "$(RED)[WARNING]$(NC) This will destroy all infrastructure!"
	@read -p "Are you sure? Type 'yes' to confirm: " confirm && [ "$$confirm" = "yes" ]
	@cd $(PULUMI_DIR) && npm run destroy:staging
	@cd $(PULUMI_DIR) && npm run destroy:production
	@echo "$(GREEN)[SUCCESS]$(NC) Infrastructure destroyed!"

.PHONY: infra-refresh
infra-refresh: ## Refresh infrastructure state
	@echo "$(BLUE)[INFRA]$(NC) Refreshing state..."
	@cd $(PULUMI_DIR) && npm run refresh:staging
	@cd $(PULUMI_DIR) && npm run refresh:production
	@echo "$(GREEN)[SUCCESS]$(NC) State refreshed!"

.PHONY: infra-config
infra-config: ## Show infrastructure configuration
	@echo "$(BLUE)[INFRA]$(NC) Configuration:"
	@cd $(PULUMI_DIR) && npm run config:staging
	@cd $(PULUMI_DIR) && npm run config:production

.PHONY: infra-logs
infra-logs: ## Show Pulumi logs
	@echo "$(BLUE)[INFRA]$(NC) Pulumi logs:"
	@cd $(PULUMI_DIR) && pulumi logs --stack staging

# =============================================================================
# DOCKER ENVIRONMENT MANAGEMENT
# =============================================================================

.PHONY: docker-build
docker-build: ## Build all Docker images
	@echo "$(BLUE)[DOCKER]$(NC) Building images..."
	@$(DOCKER_COMPOSE) build
	@$(DOCKER_COMPOSE_DEV) build
	@echo "$(GREEN)[SUCCESS]$(NC) Images built!"

.PHONY: docker-up
docker-up: ## Start production environment
	@echo "$(BLUE)[DOCKER]$(NC) Starting production environment..."
	@$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)[SUCCESS]$(NC) Production environment started!"
	@echo "$(CYAN)Access points:$(NC)"
	@echo "  - Admin Dashboard: http://localhost:80"
	@echo "  - API Server: http://localhost:3000"
	@echo "  - Nginx Proxy: http://localhost:8080"

.PHONY: docker-down
docker-down: ## Stop all containers
	@echo "$(BLUE)[DOCKER]$(NC) Stopping containers..."
	@$(DOCKER_COMPOSE) down
	@$(DOCKER_COMPOSE_DEV) down
	@echo "$(GREEN)[SUCCESS]$(NC) Containers stopped!"

.PHONY: docker-dev
docker-dev: ## Start development environment
	@echo "$(BLUE)[DOCKER]$(NC) Starting development environment..."
	@$(DOCKER_COMPOSE_DEV) up -d
	@echo "$(GREEN)[SUCCESS]$(NC) Development environment started!"
	@echo "$(CYAN)Access points:$(NC)"
	@echo "  - Admin Dashboard: http://localhost:5173"
	@echo "  - API Server: http://localhost:3000"

.PHONY: docker-dev-down
docker-dev-down: ## Stop development environment
	@echo "$(BLUE)[DOCKER]$(NC) Stopping development environment..."
	@$(DOCKER_COMPOSE_DEV) down
	@echo "$(GREEN)[SUCCESS]$(NC) Development environment stopped!"

.PHONY: docker-logs
docker-logs: ## Show container logs
	@echo "$(BLUE)[DOCKER]$(NC) Container logs:"
	@$(DOCKER_COMPOSE) logs -f

.PHONY: docker-dev-logs
docker-dev-logs: ## Show development logs
	@echo "$(BLUE)[DOCKER]$(NC) Development logs:"
	@$(DOCKER_COMPOSE_DEV) logs -f

.PHONY: docker-clean
docker-clean: ## Clean up containers and images
	@echo "$(BLUE)[DOCKER]$(NC) Cleaning up..."
	@$(DOCKER_COMPOSE) down -v --remove-orphans
	@$(DOCKER_COMPOSE_DEV) down -v --remove-orphans
	@docker system prune -f
	@echo "$(GREEN)[SUCCESS]$(NC) Cleanup completed!"

.PHONY: docker-status
docker-status: ## Show container status
	@echo "$(BLUE)[DOCKER]$(NC) Container status:"
	@$(DOCKER_COMPOSE) ps
	@echo ""
	@echo "$(BLUE)[DOCKER]$(NC) Development container status:"
	@$(DOCKER_COMPOSE_DEV) ps

# =============================================================================
# KUBERNETES/SKAFFOLD OPERATIONS
# =============================================================================

.PHONY: k8s-dev
k8s-dev: ## Start Skaffold development
	@echo "$(BLUE)[K8S]$(NC) Starting Skaffold development..."
	@./$(SCRIPTS_DIR)/skaffold-dev.sh dev
	@echo "$(GREEN)[SUCCESS]$(NC) Skaffold development started!"

.PHONY: k8s-dev-hot
k8s-dev-hot: ## Start Skaffold with hot reload
	@echo "$(BLUE)[K8S]$(NC) Starting Skaffold with hot reload..."
	@./$(SCRIPTS_DIR)/skaffold-dev.sh dev local-dev
	@echo "$(GREEN)[SUCCESS]$(NC) Skaffold hot reload started!"

.PHONY: k8s-deploy
k8s-deploy: ## Deploy to Kubernetes
	@echo "$(BLUE)[K8S]$(NC) Deploying to Kubernetes..."
	@./$(SCRIPTS_DIR)/skaffold-dev.sh deploy
	@echo "$(GREEN)[SUCCESS]$(NC) Deployed to Kubernetes!"

.PHONY: k8s-logs
k8s-logs: ## Show Kubernetes logs
	@echo "$(BLUE)[K8S]$(NC) Kubernetes logs:"
	@./$(SCRIPTS_DIR)/skaffold-dev.sh logs

.PHONY: k8s-status
k8s-status: ## Show Kubernetes status
	@echo "$(BLUE)[K8S]$(NC) Kubernetes status:"
	@./$(SCRIPTS_DIR)/skaffold-dev.sh status

.PHONY: k8s-cleanup
k8s-cleanup: ## Cleanup Kubernetes resources
	@echo "$(BLUE)[K8S]$(NC) Cleaning up Kubernetes resources..."
	@./$(SCRIPTS_DIR)/skaffold-dev.sh cleanup
	@echo "$(GREEN)[SUCCESS]$(NC) Kubernetes cleanup completed!"

# =============================================================================
# APPLICATION DEVELOPMENT
# =============================================================================

.PHONY: dev
dev: ## Start development environment
	@echo "$(BLUE)[DEV]$(NC) Starting development environment..."
	@make docker-dev
	@echo "$(GREEN)[SUCCESS]$(NC) Development environment started!"

.PHONY: dev-server
dev-server: ## Start server only
	@echo "$(BLUE)[DEV]$(NC) Starting server..."
	@npm run start:server

.PHONY: dev-admin
dev-admin: ## Start admin only
	@echo "$(BLUE)[DEV]$(NC) Starting admin..."
	@npm run start:admin

.PHONY: dev-full
dev-full: ## Start full stack (server + admin + db)
	@echo "$(BLUE)[DEV]$(NC) Starting full stack..."
	@make docker-dev
	@echo "$(GREEN)[SUCCESS]$(NC) Full stack started!"

.PHONY: build
build: ## Build all applications
	@echo "$(BLUE)[BUILD]$(NC) Building applications..."
	@npm run build
	@echo "$(GREEN)[SUCCESS]$(NC) Applications built!"

.PHONY: build-server
build-server: ## Build server only
	@echo "$(BLUE)[BUILD]$(NC) Building server..."
	@npm run build --workspace=@tagpay/server
	@echo "$(GREEN)[SUCCESS]$(NC) Server built!"

.PHONY: build-admin
build-admin: ## Build admin only
	@echo "$(BLUE)[BUILD]$(NC) Building admin..."
	@npm run build --workspace=@tagpay/admin
	@echo "$(GREEN)[SUCCESS]$(NC) Admin built!"

.PHONY: test
test: ## Run all tests
	@echo "$(BLUE)[TEST]$(NC) Running tests..."
	@npm run test
	@echo "$(GREEN)[SUCCESS]$(NC) Tests completed!"

.PHONY: test-server
test-server: ## Test server
	@echo "$(BLUE)[TEST]$(NC) Testing server..."
	@npm run test --workspace=@tagpay/server
	@echo "$(GREEN)[SUCCESS]$(NC) Server tests completed!"

.PHONY: test-admin
test-admin: ## Test admin
	@echo "$(BLUE)[TEST]$(NC) Testing admin..."
	@npm run test --workspace=@tagpay/admin
	@echo "$(GREEN)[SUCCESS]$(NC) Admin tests completed!"

.PHONY: lint
lint: ## Lint all code
	@echo "$(BLUE)[LINT]$(NC) Linting code..."
	@npm run lint
	@echo "$(GREEN)[SUCCESS]$(NC) Linting completed!"

.PHONY: lint-fix
lint-fix: ## Fix linting issues
	@echo "$(BLUE)[LINT]$(NC) Fixing linting issues..."
	@npm run lint:fix
	@echo "$(GREEN)[SUCCESS]$(NC) Linting fixes completed!"

# =============================================================================
# DATABASE OPERATIONS
# =============================================================================

.PHONY: db-generate
db-generate: ## Generate database migrations
	@echo "$(BLUE)[DB]$(NC) Generating migrations..."
	@npm run db:generate
	@echo "$(GREEN)[SUCCESS]$(NC) Migrations generated!"

.PHONY: db-migrate
db-migrate: ## Run database migrations
	@echo "$(BLUE)[DB]$(NC) Running migrations..."
	@npm run db:migrate
	@echo "$(GREEN)[SUCCESS]$(NC) Migrations completed!"

.PHONY: db-studio
db-studio: ## Open Drizzle Studio
	@echo "$(BLUE)[DB]$(NC) Opening Drizzle Studio..."
	@npm run db:studio

.PHONY: db-reset
db-reset: ## Reset database
	@echo "$(RED)[WARNING]$(NC) This will reset the database!"
	@read -p "Are you sure? Type 'yes' to confirm: " confirm && [ "$$confirm" = "yes" ]
	@echo "$(BLUE)[DB]$(NC) Resetting database..."
	@make docker-down
	@docker volume rm tagpay_postgres_data || true
	@make docker-up
	@echo "$(GREEN)[SUCCESS]$(NC) Database reset!"

.PHONY: db-seed
db-seed: ## Seed database
	@echo "$(BLUE)[DB]$(NC) Seeding database..."
	@npm run db:seed
	@echo "$(GREEN)[SUCCESS]$(NC) Database seeded!"

.PHONY: db-backup
db-backup: ## Backup database
	@echo "$(BLUE)[DB]$(NC) Creating backup..."
	@docker exec tagpay-postgres pg_dump -U tagpay_user tagpay > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)[SUCCESS]$(NC) Backup created!"

.PHONY: db-restore
db-restore: ## Restore database
	@echo "$(BLUE)[DB]$(NC) Restoring database..."
	@docker exec -i tagpay-postgres psql -U tagpay_user tagpay < backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)[SUCCESS]$(NC) Database restored!"

# =============================================================================
# MONITORING & DEBUGGING
# =============================================================================

.PHONY: logs
logs: ## Show all logs
	@echo "$(BLUE)[LOGS]$(NC) All logs:"
	@make docker-logs

.PHONY: logs-server
logs-server: ## Show server logs
	@echo "$(BLUE)[LOGS]$(NC) Server logs:"
	@$(DOCKER_COMPOSE) logs -f server

.PHONY: logs-admin
logs-admin: ## Show admin logs
	@echo "$(BLUE)[LOGS]$(NC) Admin logs:"
	@$(DOCKER_COMPOSE) logs -f admin

.PHONY: logs-db
logs-db: ## Show database logs
	@echo "$(BLUE)[LOGS]$(NC) Database logs:"
	@$(DOCKER_COMPOSE) logs -f postgres

.PHONY: logs-infra
logs-infra: ## Show infrastructure logs
	@echo "$(BLUE)[LOGS]$(NC) Infrastructure logs:"
	@make infra-logs

.PHONY: status
status: ## Show overall status
	@echo "$(BLUE)[STATUS]$(NC) Overall status:"
	@make docker-status
	@echo ""
	@make k8s-status

.PHONY: health
health: ## Health check all services
	@echo "$(BLUE)[HEALTH]$(NC) Health checks:"
	@curl -f http://localhost:3000/api/v1/health || echo "$(RED)Server: DOWN$(NC)"
	@curl -f http://localhost:5173 || echo "$(RED)Admin: DOWN$(NC)"
	@echo "$(GREEN)[SUCCESS]$(NC) Health checks completed!"

.PHONY: debug
debug: ## Debug mode
	@echo "$(BLUE)[DEBUG]$(NC) Debug information:"
	@echo "Project: $(PROJECT_NAME)"
	@echo "Docker Compose: $(DOCKER_COMPOSE)"
	@echo "Pulumi Dir: $(PULUMI_DIR)"
	@echo "K8s Dir: $(K8S_DIR)"

# =============================================================================
# SECURITY & VALIDATION
# =============================================================================

.PHONY: security-scan
security-scan: ## Security scan
	@echo "$(BLUE)[SECURITY]$(NC) Running security scan..."
	@npm audit
	@echo "$(GREEN)[SUCCESS]$(NC) Security scan completed!"

.PHONY: security-audit
security-audit: ## Security audit
	@echo "$(BLUE)[SECURITY]$(NC) Running security audit..."
	@npm audit --audit-level=moderate
	@echo "$(GREEN)[SUCCESS]$(NC) Security audit completed!"

.PHONY: validate
validate: ## Validate configuration
	@echo "$(BLUE)[VALIDATE]$(NC) Validating configuration..."
	@make validate-infra
	@make validate-k8s
	@echo "$(GREEN)[SUCCESS]$(NC) Validation completed!"

.PHONY: validate-infra
validate-infra: ## Validate infrastructure
	@echo "$(BLUE)[VALIDATE]$(NC) Validating infrastructure..."
	@cd $(PULUMI_DIR) && npx tsc --noEmit
	@echo "$(GREEN)[SUCCESS]$(NC) Infrastructure validation completed!"

.PHONY: validate-k8s
validate-k8s: ## Validate Kubernetes
	@echo "$(BLUE)[VALIDATE]$(NC) Validating Kubernetes..."
	@kubectl apply --dry-run=client -f $(K8S_DIR)/base/
	@echo "$(GREEN)[SUCCESS]$(NC) Kubernetes validation completed!"

.PHONY: secrets-generate
secrets-generate: ## Generate secrets
	@echo "$(BLUE)[SECRETS]$(NC) Generating secrets..."
	@cd $(K8S_DIR) && ./scripts/generate-secrets.sh
	@echo "$(GREEN)[SUCCESS]$(NC) Secrets generated!"

.PHONY: secrets-validate
secrets-validate: ## Validate secrets
	@echo "$(BLUE)[SECRETS]$(NC) Validating secrets..."
	@cd $(K8S_DIR) && ./scripts/validate-secrets.sh
	@echo "$(GREEN)[SUCCESS]$(NC) Secrets validation completed!"

# =============================================================================
# DEPLOYMENT & CI/CD
# =============================================================================

.PHONY: deploy-staging
deploy-staging: ## Deploy to staging
	@echo "$(BLUE)[DEPLOY]$(NC) Deploying to staging..."
	@make infra-staging
	@make k8s-deploy
	@echo "$(GREEN)[SUCCESS]$(NC) Staging deployment completed!"

.PHONY: deploy-production
deploy-production: ## Deploy to production
	@echo "$(BLUE)[DEPLOY]$(NC) Deploying to production..."
	@make infra-production
	@make k8s-deploy
	@echo "$(GREEN)[SUCCESS]$(NC) Production deployment completed!"

.PHONY: deploy-rollback
deploy-rollback: ## Rollback deployment
	@echo "$(BLUE)[DEPLOY]$(NC) Rolling back deployment..."
	@kubectl rollout undo deployment/server
	@kubectl rollout undo deployment/admin
	@echo "$(GREEN)[SUCCESS]$(NC) Rollback completed!"

.PHONY: ci-test
ci-test: ## CI test suite
	@echo "$(BLUE)[CI]$(NC) Running CI test suite..."
	@make install
	@make lint
	@make test
	@make security-scan
	@echo "$(GREEN)[SUCCESS]$(NC) CI test suite completed!"

.PHONY: ci-build
ci-build: ## CI build process
	@echo "$(BLUE)[CI]$(NC) Running CI build process..."
	@make build
	@make docker-build
	@echo "$(GREEN)[SUCCESS]$(NC) CI build process completed!"

.PHONY: ci-deploy
ci-deploy: ## CI deployment
	@echo "$(BLUE)[CI]$(NC) Running CI deployment..."
	@make deploy-staging
	@echo "$(GREEN)[SUCCESS]$(NC) CI deployment completed!"

# =============================================================================
# CLEANUP & MAINTENANCE
# =============================================================================

.PHONY: clean
clean: ## Clean build artifacts
	@echo "$(BLUE)[CLEAN]$(NC) Cleaning build artifacts..."
	@npm run clean
	@rm -rf node_modules
	@rm -rf $(PULUMI_DIR)/node_modules
	@echo "$(GREEN)[SUCCESS]$(NC) Cleanup completed!"

.PHONY: clean-all
clean-all: ## Clean everything
	@echo "$(BLUE)[CLEAN]$(NC) Cleaning everything..."
	@make clean
	@make docker-clean
	@make k8s-cleanup
	@echo "$(GREEN)[SUCCESS]$(NC) Complete cleanup finished!"

.PHONY: update
update: ## Update dependencies
	@echo "$(BLUE)[UPDATE]$(NC) Updating dependencies..."
	@npm update
	@cd $(PULUMI_DIR) && npm update
	@echo "$(GREEN)[SUCCESS]$(NC) Dependencies updated!"

.PHONY: update-infra
update-infra: ## Update infrastructure
	@echo "$(BLUE)[UPDATE]$(NC) Updating infrastructure..."
	@cd $(PULUMI_DIR) && npm update
	@make infra-refresh
	@echo "$(GREEN)[SUCCESS]$(NC) Infrastructure updated!"

# =============================================================================
# HELP TARGETS
# =============================================================================

.PHONY: help-infra
help-infra: ## Show infrastructure commands
	@echo "$(CYAN)Infrastructure Commands:$(NC)"
	@echo "  infra-init        - Initialize Pulumi stacks"
	@echo "  infra-staging     - Deploy to staging"
	@echo "  infra-production  - Deploy to production"
	@echo "  infra-preview     - Preview changes"
	@echo "  infra-destroy     - Destroy infrastructure"
	@echo "  infra-refresh     - Refresh state"
	@echo "  infra-config      - Show configuration"
	@echo "  infra-logs        - Show Pulumi logs"

.PHONY: help-docker
help-docker: ## Show Docker commands
	@echo "$(CYAN)Docker Commands:$(NC)"
	@echo "  docker-build      - Build all images"
	@echo "  docker-up         - Start production environment"
	@echo "  docker-down       - Stop all containers"
	@echo "  docker-dev        - Start development environment"
	@echo "  docker-dev-down   - Stop development environment"
	@echo "  docker-logs       - Show container logs"
	@echo "  docker-clean      - Clean up containers/images"
	@echo "  docker-status     - Show container status"

.PHONY: help-k8s
help-k8s: ## Show Kubernetes commands
	@echo "$(CYAN)Kubernetes Commands:$(NC)"
	@echo "  k8s-dev           - Start Skaffold development"
	@echo "  k8s-dev-hot       - Start with hot reload"
	@echo "  k8s-deploy        - Deploy to Kubernetes"
	@echo "  k8s-logs          - Show K8s logs"
	@echo "  k8s-status        - Show K8s status"
	@echo "  k8s-cleanup       - Cleanup K8s resources"

.PHONY: help-dev
help-dev: ## Show development commands
	@echo "$(CYAN)Development Commands:$(NC)"
	@echo "  dev               - Start development environment"
	@echo "  dev-server        - Start server only"
	@echo "  dev-admin         - Start admin only"
	@echo "  dev-full          - Start full stack"
	@echo "  build             - Build all applications"
	@echo "  test              - Run all tests"
	@echo "  lint              - Lint all code"
	@echo "  db-generate       - Generate database migrations"
	@echo "  db-migrate        - Run database migrations"
