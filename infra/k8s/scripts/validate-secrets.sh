#!/bin/bash

# TagPay Kubernetes Secret Validation Script
# This script validates secrets and checks for sensitive data

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

# Function to check if file contains sensitive data
check_sensitive_data() {
    local file="$1"
    local sensitive_patterns=(
        "password"
        "secret"
        "key"
        "token"
        "credential"
        "api_key"
        "private_key"
        "certificate"
    )
    
    for pattern in "${sensitive_patterns[@]}"; do
        if grep -i "$pattern" "$file" | grep -v "template\|placeholder\|example" > /dev/null; then
            return 1
        fi
    done
    return 0
}

# Function to check if file contains placeholders
check_placeholders() {
    local file="$1"
    if grep -E '\$\{[A-Z_]+\}' "$file" > /dev/null; then
        return 0
    fi
    return 1
}

# Function to validate development secrets
validate_dev_secrets() {
    local secret_file="overlays/development/secret-patch.yaml"
    
    print_status "Validating development secrets..."
    
    if [ ! -f "$secret_file" ]; then
        print_error "Development secret file not found: $secret_file"
        print_status "Run: ./scripts/generate-secrets.sh dev"
        return 1
    fi
    
    # Check if secrets are properly base64 encoded
    if grep -q "DATABASE_PASSWORD:" "$secret_file"; then
        local password=$(grep "DATABASE_PASSWORD:" "$secret_file" | cut -d':' -f2 | tr -d ' ')
        if [ -n "$password" ] && [ "$password" != '""' ]; then
            print_success "Development secrets found and appear to be properly encoded"
        else
            print_warning "Development secrets may be empty"
        fi
    else
        print_error "Development secrets file is missing required fields"
        return 1
    fi
}

# Function to validate staging secrets
validate_staging_secrets() {
    local secret_file="overlays/staging/secret-patch.yaml"
    
    print_status "Validating staging secrets..."
    
    if [ ! -f "$secret_file" ]; then
        print_error "Staging secret file not found: $secret_file"
        print_status "Run: ./scripts/generate-secrets.sh staging"
        return 1
    fi
    
    # Check if secrets are properly base64 encoded
    if grep -q "DATABASE_PASSWORD:" "$secret_file"; then
        local password=$(grep "DATABASE_PASSWORD:" "$secret_file" | cut -d':' -f2 | tr -d ' ')
        if [ -n "$password" ] && [ "$password" != '""' ]; then
            print_success "Staging secrets found and appear to be properly encoded"
        else
            print_warning "Staging secrets may be empty"
        fi
    else
        print_error "Staging secrets file is missing required fields"
        return 1
    fi
}

# Function to validate production template
validate_production_template() {
    local template_file="overlays/production/secret-template.yaml"
    
    print_status "Validating production secret template..."
    
    if [ ! -f "$template_file" ]; then
        print_error "Production secret template not found: $template_file"
        print_status "Run: ./scripts/generate-secrets.sh prod-template"
        return 1
    fi
    
    # Check if template contains placeholders
    if check_placeholders "$template_file"; then
        print_success "Production template contains proper placeholders"
    else
        print_error "Production template missing placeholders"
        return 1
    fi
    
    # Check if template contains sensitive data
    if check_sensitive_data "$template_file"; then
        print_success "Production template appears safe (no real secrets)"
    else
        print_warning "Production template may contain sensitive data"
    fi
}

# Function to scan for sensitive files
scan_sensitive_files() {
    print_status "Scanning for sensitive files..."
    
    local sensitive_files=()
    
    # Find all yaml files that might contain secrets
    while IFS= read -r -d '' file; do
        if [[ "$file" == *"secret"* ]] || [[ "$file" == *"configmap"* ]]; then
            if [[ "$file" != *"template"* ]] && [[ "$file" != *"example"* ]]; then
                sensitive_files+=("$file")
            fi
        fi
    done < <(find . -name "*.yaml" -print0)
    
    if [ ${#sensitive_files[@]} -eq 0 ]; then
        print_success "No sensitive files found"
        return 0
    fi
    
    print_warning "Found ${#sensitive_files[@]} potentially sensitive files:"
    for file in "${sensitive_files[@]}"; do
        echo "  - $file"
    done
    
    return 1
}

# Function to check git status
check_git_status() {
    print_status "Checking git status..."
    
    if ! git status --porcelain | grep -q "infra/k8s/"; then
        print_success "No k8s files staged for commit"
    else
        print_warning "K8s files are staged for commit. Review before pushing!"
        git status --porcelain | grep "infra/k8s/"
    fi
}

# Function to show help
show_help() {
    echo "TagPay Kubernetes Secret Validation Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev          Validate development secrets"
    echo "  staging      Validate staging secrets"
    echo "  prod         Validate production template"
    echo "  scan         Scan for sensitive files"
    echo "  git          Check git status"
    echo "  all          Run all validations"
    echo "  help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev           # Validate development secrets"
    echo "  $0 staging       # Validate staging secrets"
    echo "  $0 prod          # Validate production template"
    echo "  $0 scan          # Scan for sensitive files"
    echo "  $0 all           # Run all validations"
}

# Main script logic
main() {
    case "${1:-help}" in
        dev)
            validate_dev_secrets
            ;;
        staging)
            validate_staging_secrets
            ;;
        prod)
            validate_production_template
            ;;
        scan)
            scan_sensitive_files
            ;;
        git)
            check_git_status
            ;;
        all)
            validate_dev_secrets
            validate_staging_secrets
            validate_production_template
            scan_sensitive_files
            check_git_status
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
