#!/bin/bash

# TagPay Skaffold Test Script
# This script tests the Skaffold configuration

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
        print_error "Skaffold is not installed."
        print_status "Install Skaffold: https://skaffold.dev/docs/install/"
        return 1
    fi
    print_success "Skaffold is installed: $(skaffold version)"
    return 0
}

# Function to check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed."
        return 1
    fi
    print_success "kubectl is installed: $(kubectl version --client --short)"
    return 0
}

# Function to check if docker is available
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed."
        return 1
    fi
    print_success "Docker is installed: $(docker --version)"
    return 0
}

# Function to check cluster connectivity
check_cluster() {
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster."
        return 1
    fi
    print_success "Connected to Kubernetes cluster"
    return 0
}

# Function to validate skaffold configuration
validate_config() {
    print_status "Validating Skaffold configuration..."
    
    if [ ! -f "skaffold.yaml" ]; then
        print_error "skaffold.yaml not found"
        return 1
    fi
    
    if skaffold diagnose &> /dev/null; then
        print_success "Skaffold configuration is valid"
        return 0
    else
        print_error "Skaffold configuration has issues"
        return 1
    fi
}

# Function to test build
test_build() {
    local profile=${1:-development}
    print_status "Testing build with profile: $profile"
    
    if skaffold build --profile $profile --dry-run &> /dev/null; then
        print_success "Build configuration is valid"
        return 0
    else
        print_error "Build configuration has issues"
        return 1
    fi
}

# Function to test deploy
test_deploy() {
    local profile=${1:-development}
    print_status "Testing deploy with profile: $profile"
    
    if skaffold deploy --profile $profile --dry-run &> /dev/null; then
        print_success "Deploy configuration is valid"
        return 0
    else
        print_error "Deploy configuration has issues"
        return 1
    fi
}

# Function to test profiles
test_profiles() {
    print_status "Testing Skaffold profiles..."
    
    local profiles=("development" "staging" "production" "local-dev")
    local failed=0
    
    for profile in "${profiles[@]}"; do
        print_status "Testing profile: $profile"
        
        if skaffold diagnose --profile $profile &> /dev/null; then
            print_success "Profile $profile is valid"
        else
            print_error "Profile $profile has issues"
            failed=$((failed + 1))
        fi
    done
    
    if [ $failed -eq 0 ]; then
        print_success "All profiles are valid"
        return 0
    else
        print_error "$failed profile(s) have issues"
        return 1
    fi
}

# Function to check required files
check_files() {
    print_status "Checking required files..."
    
    local files=(
        "skaffold.yaml"
        "apps/server/Dockerfile"
        "apps/server/Dockerfile.dev"
        "apps/admin/Dockerfile"
        "apps/admin/Dockerfile.dev"
        "infra/nginx/Dockerfile"
        "infra/nginx/Dockerfile.dev"
        "scripts/skaffold-dev.sh"
    )
    
    local missing=0
    
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            print_success "✓ $file"
        else
            print_error "✗ $file (missing)"
            missing=$((missing + 1))
        fi
    done
    
    if [ $missing -eq 0 ]; then
        print_success "All required files are present"
        return 0
    else
        print_error "$missing file(s) are missing"
        return 1
    fi
}

# Function to show help
show_help() {
    echo "TagPay Skaffold Test Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  all              Run all tests"
    echo "  prereqs          Check prerequisites"
    echo "  config           Validate configuration"
    echo "  build [profile]  Test build (default: development)"
    echo "  deploy [profile] Test deploy (default: development)"
    echo "  profiles         Test all profiles"
    echo "  files            Check required files"
    echo "  help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 all              # Run all tests"
    echo "  $0 build production # Test production build"
    echo "  $0 deploy staging   # Test staging deploy"
}

# Main script logic
main() {
    case "${1:-all}" in
        all)
            print_status "Running all Skaffold tests..."
            echo ""
            
            check_prereqs
            echo ""
            
            check_files
            echo ""
            
            validate_config
            echo ""
            
            test_profiles
            echo ""
            
            test_build
            echo ""
            
            test_deploy
            echo ""
            
            print_success "All tests completed!"
            ;;
        prereqs)
            check_prereqs
            ;;
        config)
            validate_config
            ;;
        build)
            test_build "$2"
            ;;
        deploy)
            test_deploy "$2"
            ;;
        profiles)
            test_profiles
            ;;
        files)
            check_files
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

# Function to check all prerequisites
check_prereqs() {
    print_status "Checking prerequisites..."
    echo ""
    
    local failed=0
    
    check_skaffold || failed=$((failed + 1))
    check_kubectl || failed=$((failed + 1))
    check_docker || failed=$((failed + 1))
    check_cluster || failed=$((failed + 1))
    
    if [ $failed -eq 0 ]; then
        print_success "All prerequisites are met"
        return 0
    else
        print_error "$failed prerequisite(s) failed"
        return 1
    fi
}

# Run main function with all arguments
main "$@"
