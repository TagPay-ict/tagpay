#!/bin/bash

# TagPay Kubernetes Deployment Script

set -e

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

# Function to check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed. Please install kubectl and try again."
        exit 1
    fi
}

# Function to check if kustomize is available
check_kustomize() {
    if ! command -v kustomize &> /dev/null; then
        print_warning "kustomize is not installed. Installing kustomize..."
        curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash
        sudo mv kustomize /usr/local/bin/
    fi
}

# Function to check cluster connectivity
check_cluster() {
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
        exit 1
    fi
}

# Function to check and generate secrets
check_secrets() {
    local environment=$1
    local secret_file="overlays/${environment}/secret-patch.yaml"
    
    if [ ! -f "$secret_file" ]; then
        print_warning "Secret file not found for $environment environment"
        print_status "Generating secrets..."
        
        case $environment in
            "development"|"dev")
                ./scripts/generate-secrets.sh dev
                ;;
            "staging"|"stage")
                ./scripts/generate-secrets.sh staging
                ;;
            "production"|"prod")
                print_error "Production secrets must be created manually from template"
                print_status "Run: ./scripts/generate-secrets.sh prod-template"
                print_status "Then edit overlays/production/secret-template.yaml with real values"
                exit 1
                ;;
        esac
    else
        print_success "Secret file found for $environment environment"
    fi
}

# Function to validate secrets before deployment
validate_secrets() {
    local environment=$1
    
    print_status "Validating secrets for $environment environment..."
    
    case $environment in
        "development"|"dev")
            ./scripts/validate-secrets.sh dev
            ;;
        "staging"|"stage")
            ./scripts/validate-secrets.sh staging
            ;;
        "production"|"prod")
            ./scripts/validate-secrets.sh prod
            ;;
    esac
}

# Function to deploy to environment
deploy_environment() {
    local environment=$1
    local namespace=""
    
    case $environment in
        "development"|"dev")
            namespace="tagpay-dev"
            ;;
        "staging"|"stage")
            namespace="tagpay-staging"
            ;;
        "production"|"prod")
            namespace="tagpay-prod"
            ;;
        *)
            print_error "Invalid environment: $environment. Use development, staging, or production."
            exit 1
            ;;
    esac
    
    print_status "Deploying to $environment environment..."
    
    # Check and generate secrets if needed
    check_secrets $environment
    
    # Validate secrets
    validate_secrets $environment
    
    # Check if namespace exists
    if ! kubectl get namespace $namespace &> /dev/null; then
        print_status "Creating namespace $namespace..."
        kubectl create namespace $namespace
    fi
    
    # Apply kustomization
    print_status "Applying kustomization for $environment..."
    kubectl apply -k overlays/$environment
    
    # Wait for deployments to be ready
    print_status "Waiting for deployments to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/server -n $namespace
    kubectl wait --for=condition=available --timeout=300s deployment/admin -n $namespace
    kubectl wait --for=condition=available --timeout=300s deployment/nginx -n $namespace
    
    print_success "Deployment to $environment completed successfully!"
    
    # Show deployment status
    print_status "Deployment status:"
    kubectl get all -n $namespace
}

# Function to delete environment
delete_environment() {
    local environment=$1
    local namespace=""
    
    case $environment in
        "development"|"dev")
            namespace="tagpay-dev"
            ;;
        "staging"|"stage")
            namespace="tagpay-staging"
            ;;
        "production"|"prod")
            namespace="tagpay-prod"
            ;;
        *)
            print_error "Invalid environment: $environment. Use development, staging, or production."
            exit 1
            ;;
    esac
    
    print_warning "Deleting $environment environment..."
    
    # Delete kustomization
    kubectl delete -k overlays/$environment --ignore-not-found=true
    
    # Delete namespace
    kubectl delete namespace $namespace --ignore-not-found=true
    
    print_success "Deletion of $environment environment completed!"
}

# Function to show status
show_status() {
    local environment=$1
    
    if [ -z "$environment" ]; then
        print_status "Showing status for all environments..."
        echo ""
        print_status "Development Environment:"
        kubectl get all -n tagpay-dev 2>/dev/null || echo "Development environment not deployed"
        echo ""
        print_status "Staging Environment:"
        kubectl get all -n tagpay-staging 2>/dev/null || echo "Staging environment not deployed"
        echo ""
        print_status "Production Environment:"
        kubectl get all -n tagpay-prod 2>/dev/null || echo "Production environment not deployed"
    else
        local namespace=""
        case $environment in
            "development"|"dev")
                namespace="tagpay-dev"
                ;;
            "staging"|"stage")
                namespace="tagpay-staging"
                ;;
            "production"|"prod")
                namespace="tagpay-prod"
                ;;
            *)
                print_error "Invalid environment: $environment"
                exit 1
                ;;
        esac
        
        print_status "Showing status for $environment environment..."
        kubectl get all -n $namespace
    fi
}

# Function to show logs
show_logs() {
    local environment=$1
    local service=$2
    
    local namespace=""
    case $environment in
        "development"|"dev")
            namespace="tagpay-dev"
            ;;
        "staging"|"stage")
            namespace="tagpay-staging"
            ;;
        "production"|"prod")
            namespace="tagpay-prod"
            ;;
        *)
            print_error "Invalid environment: $environment"
            exit 1
            ;;
    esac
    
    if [ -z "$service" ]; then
        print_status "Available services: server, admin, nginx, postgres, redis"
        print_error "Please specify a service to view logs"
        exit 1
    fi
    
    print_status "Showing logs for $service in $environment environment..."
    kubectl logs -f deployment/$service -n $namespace
}

# Function to port forward
port_forward() {
    local environment=$1
    local service=$2
    local local_port=$3
    local remote_port=$4
    
    local namespace=""
    case $environment in
        "development"|"dev")
            namespace="tagpay-dev"
            ;;
        "staging"|"stage")
            namespace="tagpay-staging"
            ;;
        "production"|"prod")
            namespace="tagpay-prod"
            ;;
        *)
            print_error "Invalid environment: $environment"
            exit 1
            ;;
    esac
    
    if [ -z "$service" ] || [ -z "$local_port" ] || [ -z "$remote_port" ]; then
        print_error "Usage: $0 port-forward <environment> <service> <local-port> <remote-port>"
        exit 1
    fi
    
    print_status "Port forwarding $service:$remote_port to localhost:$local_port in $environment environment..."
    kubectl port-forward service/$service-service $local_port:$remote_port -n $namespace
}

# Function to show help
show_help() {
    echo "TagPay Kubernetes Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND] [ENVIRONMENT] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  deploy <environment>     Deploy to specified environment"
    echo "  delete <environment>     Delete specified environment"
    echo "  status [environment]     Show deployment status"
    echo "  logs <environment> <service>  Show logs for service"
    echo "  port-forward <environment> <service> <local-port> <remote-port>  Port forward service"
    echo "  validate <environment>   Validate secrets for environment"
    echo "  generate <environment>   Generate secrets for environment"
    echo "  help                     Show this help message"
    echo ""
    echo "Environments:"
    echo "  development, dev         Development environment"
    echo "  staging, stage           Staging environment"
    echo "  production, prod         Production environment"
    echo ""
    echo "Services:"
    echo "  server                   API server"
    echo "  admin                    Admin dashboard"
    echo "  nginx                    Nginx reverse proxy"
    echo "  postgres                 PostgreSQL database"
    echo "  redis                    Redis cache"
    echo ""
    echo "Examples:"
    echo "  $0 deploy development    # Deploy to development"
    echo "  $0 status production     # Show production status"
    echo "  $0 logs staging server   # Show server logs in staging"
    echo "  $0 port-forward dev server 3000 3000  # Port forward server"
    echo "  $0 validate dev          # Validate development secrets"
    echo "  $0 generate dev          # Generate development secrets"
}

# Main script logic
main() {
    check_kubectl
    check_kustomize
    check_cluster

    case "${1:-help}" in
        deploy)
            if [ -z "$2" ]; then
                print_error "Please specify an environment to deploy to"
                show_help
                exit 1
            fi
            deploy_environment "$2"
            ;;
        delete)
            if [ -z "$2" ]; then
                print_error "Please specify an environment to delete"
                show_help
                exit 1
            fi
            delete_environment "$2"
            ;;
        status)
            show_status "$2"
            ;;
        logs)
            if [ -z "$2" ] || [ -z "$3" ]; then
                print_error "Please specify environment and service for logs"
                show_help
                exit 1
            fi
            show_logs "$2" "$3"
            ;;
        port-forward)
            if [ -z "$2" ] || [ -z "$3" ] || [ -z "$4" ] || [ -z "$5" ]; then
                print_error "Please specify environment, service, local port, and remote port"
                show_help
                exit 1
            fi
            port_forward "$2" "$3" "$4" "$5"
            ;;
        validate)
            if [ -z "$2" ]; then
                print_error "Please specify an environment to validate"
                show_help
                exit 1
            fi
            validate_secrets "$2"
            ;;
        generate)
            if [ -z "$2" ]; then
                print_error "Please specify an environment to generate secrets for"
                show_help
                exit 1
            fi
            case $2 in
                "development"|"dev")
                    ./scripts/generate-secrets.sh dev
                    ;;
                "staging"|"stage")
                    ./scripts/generate-secrets.sh staging
                    ;;
                "production"|"prod")
                    ./scripts/generate-secrets.sh prod-template
                    ;;
                *)
                    print_error "Invalid environment: $2"
                    exit 1
                    ;;
            esac
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
