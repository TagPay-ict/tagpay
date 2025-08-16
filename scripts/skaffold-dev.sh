#!/bin/bash

# TagPay Skaffold Development Script
# This script provides convenient commands for Skaffold development

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

# Function to check if skaffold is available
check_skaffold() {
    if ! command -v skaffold &> /dev/null; then
        print_error "Skaffold is not installed. Please install Skaffold and try again."
        print_status "Installation guide: https://skaffold.dev/docs/install/"
        exit 1
    fi
}

# Function to check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed. Please install kubectl and try again."
        exit 1
    fi
}

# Function to check cluster connectivity
check_cluster() {
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
        exit 1
    fi
}

# Function to start development mode
start_dev() {
    local profile=${1:-development}
    
    print_status "Starting Skaffold development mode with profile: $profile"
    
    # Check prerequisites
    check_skaffold
    check_kubectl
    check_cluster
    
    # Start Skaffold dev
    skaffold dev --profile $profile --port-forward --cleanup=false
}

# Function to run once
run_once() {
    local profile=${1:-development}
    
    print_status "Running Skaffold once with profile: $profile"
    
    # Check prerequisites
    check_skaffold
    check_kubectl
    check_cluster
    
    # Run Skaffold once
    skaffold run --profile $profile
}

# Function to build only
build_only() {
    local profile=${1:-development}
    
    print_status "Building images with profile: $profile"
    
    # Check prerequisites
    check_skaffold
    
    # Build only
    skaffold build --profile $profile
}

# Function to deploy only
deploy_only() {
    local profile=${1:-development}
    
    print_status "Deploying with profile: $profile"
    
    # Check prerequisites
    check_skaffold
    check_kubectl
    check_cluster
    
    # Deploy only
    skaffold deploy --profile $profile
}

# Function to clean up
cleanup() {
    print_status "Cleaning up Skaffold resources"
    
    # Check prerequisites
    check_skaffold
    check_kubectl
    check_cluster
    
    # Clean up
    skaffold delete
}

# Function to show status
show_status() {
    print_status "Showing Skaffold status"
    
    # Check prerequisites
    check_skaffold
    check_kubectl
    check_cluster
    
    # Show status
    skaffold status
}

# Function to show logs
show_logs() {
    print_status "Showing Skaffold logs"
    
    # Check prerequisites
    check_skaffold
    check_kubectl
    check_cluster
    
    # Show logs
    skaffold logs
}

# Function to show help
show_help() {
    echo "TagPay Skaffold Development Script"
    echo ""
    echo "Usage: $0 [COMMAND] [PROFILE]"
    echo ""
    echo "Commands:"
    echo "  dev [profile]      Start development mode (default: development)"
    echo "  run [profile]      Run once (build and deploy)"
    echo "  build [profile]    Build images only"
    echo "  deploy [profile]   Deploy only"
    echo "  cleanup           Clean up resources"
    echo "  status            Show Skaffold status"
    echo "  logs              Show Skaffold logs"
    echo "  help              Show this help message"
    echo ""
    echo "Profiles:"
    echo "  development       Development environment (default)"
    echo "  staging          Staging environment"
    echo "  production       Production environment"
    echo "  local-dev        Local development with hot reload"
    echo ""
    echo "Examples:"
    echo "  $0 dev              # Start development mode"
    echo "  $0 dev local-dev    # Start with hot reload"
    echo "  $0 run staging      # Run once in staging"
    echo "  $0 build production # Build for production"
    echo "  $0 cleanup          # Clean up resources"
}

# Main script logic
main() {
    case "${1:-help}" in
        dev)
            start_dev "$2"
            ;;
        run)
            run_once "$2"
            ;;
        build)
            build_only "$2"
            ;;
        deploy)
            deploy_only "$2"
            ;;
        cleanup)
            cleanup
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs
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
