#!/bin/bash

# TagPay Kubernetes Secret Generation Script
# This script generates secrets for different environments

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

# Function to generate random string
generate_random_string() {
    local length=${1:-32}
    openssl rand -hex $((length / 2))
}

# Function to generate base64 encoded string
generate_base64() {
    echo -n "$1" | base64
}

# Function to generate development secrets
generate_dev_secrets() {
    local namespace="tagpay-dev"
    local output_file="overlays/development/secret-patch.yaml"
    
    print_status "Generating development secrets for namespace: $namespace"
    
    # Generate random secrets for development
    local db_password="dev_password_$(generate_random_string 16)"
    local jwt_secret="dev_jwt_secret_$(generate_random_string 32)"
    local dojah_key="dev_dojah_key_$(generate_random_string 24)"
    local termii_key="dev_termii_key_$(generate_random_string 24)"
    local encryption_key="dev_encryption_key_$(generate_random_string 32)"
    local redis_password="dev_redis_password_$(generate_random_string 16)"
    
    cat > "$output_file" << EOF
# Development Secrets - Generated automatically
# DO NOT use these in production!
apiVersion: v1
kind: Secret
metadata:
  name: tagpay-secrets
  namespace: ${namespace}
type: Opaque
data:
  # Database password (base64 encoded)
  DATABASE_PASSWORD: $(generate_base64 "$db_password")
  
  # JWT secret (base64 encoded)
  JWT_SECRET: $(generate_base64 "$jwt_secret")
  
  # API keys (base64 encoded)
  DOJAH_API_KEY: $(generate_base64 "$dojah_key")
  TERMII_API_KEY: $(generate_base64 "$termii_key")
  
  # Encryption keys (base64 encoded)
  ENCRYPTION_KEY: $(generate_base64 "$encryption_key")
  
  # Redis password (base64 encoded)
  REDIS_PASSWORD: $(generate_base64 "$redis_password")
  
  # SSL certificates (empty for development)
  SSL_CERT: ""
  SSL_KEY: ""
EOF
    
    print_success "Development secrets generated in $output_file"
    print_warning "These are development-only secrets. DO NOT use in production!"
}

# Function to generate staging secrets
generate_staging_secrets() {
    local namespace="tagpay-staging"
    local output_file="overlays/staging/secret-patch.yaml"
    
    print_status "Generating staging secrets for namespace: $namespace"
    
    # Generate random secrets for staging
    local db_password="staging_password_$(generate_random_string 16)"
    local jwt_secret="staging_jwt_secret_$(generate_random_string 32)"
    local dojah_key="staging_dojah_key_$(generate_random_string 24)"
    local termii_key="staging_termii_key_$(generate_random_string 24)"
    local encryption_key="staging_encryption_key_$(generate_random_string 32)"
    local redis_password="staging_redis_password_$(generate_random_string 16)"
    
    cat > "$output_file" << EOF
# Staging Secrets - Generated automatically
# DO NOT use these in production!
apiVersion: v1
kind: Secret
metadata:
  name: tagpay-secrets
  namespace: ${namespace}
type: Opaque
data:
  # Database password (base64 encoded)
  DATABASE_PASSWORD: $(generate_base64 "$db_password")
  
  # JWT secret (base64 encoded)
  JWT_SECRET: $(generate_base64 "$jwt_secret")
  
  # API keys (base64 encoded)
  DOJAH_API_KEY: $(generate_base64 "$dojah_key")
  TERMII_API_KEY: $(generate_base64 "$termii_key")
  
  # Encryption keys (base64 encoded)
  ENCRYPTION_KEY: $(generate_base64 "$encryption_key")
  
  # Redis password (base64 encoded)
  REDIS_PASSWORD: $(generate_base64 "$redis_password")
  
  # SSL certificates (empty for staging)
  SSL_CERT: ""
  SSL_KEY: ""
EOF
    
    print_success "Staging secrets generated in $output_file"
    print_warning "These are staging-only secrets. DO NOT use in production!"
}

# Function to create production secret template
create_production_template() {
    local output_file="overlays/production/secret-template.yaml"
    
    print_status "Creating production secret template"
    
    cat > "$output_file" << 'EOF'
# Production Secret Template
# Replace the placeholders with actual base64 encoded values
# DO NOT commit this file with real values!
apiVersion: v1
kind: Secret
metadata:
  name: tagpay-secrets
  namespace: tagpay-prod
type: Opaque
data:
  # RDS Database password (base64 encoded)
  # Replace with: echo -n "your_rds_password" | base64
  DATABASE_PASSWORD: ${RDS_DATABASE_PASSWORD}
  
  # Production JWT secret (base64 encoded)
  # Replace with: echo -n "your_jwt_secret" | base64
  JWT_SECRET: ${PROD_JWT_SECRET}
  
  # Production API keys (base64 encoded)
  # Replace with: echo -n "your_dojah_api_key" | base64
  DOJAH_API_KEY: ${PROD_DOJAH_API_KEY}
  # Replace with: echo -n "your_termii_api_key" | base64
  TERMII_API_KEY: ${PROD_TERMII_API_KEY}
  
  # Production encryption key (base64 encoded)
  # Replace with: echo -n "your_encryption_key" | base64
  ENCRYPTION_KEY: ${PROD_ENCRYPTION_KEY}
  
  # ElastiCache password (base64 encoded)
  # Replace with: echo -n "your_elasticache_password" | base64
  REDIS_PASSWORD: ${ELASTICACHE_PASSWORD}
  
  # SSL certificates (base64 encoded)
  # Replace with: cat your_cert.pem | base64
  SSL_CERT: ${SSL_CERT}
  # Replace with: cat your_key.pem | base64
  SSL_KEY: ${SSL_KEY}
EOF
    
    print_success "Production secret template created in $output_file"
    print_warning "Replace placeholders with actual values before deploying!"
}

# Function to show help
show_help() {
    echo "TagPay Kubernetes Secret Generation Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev          Generate development secrets"
    echo "  staging      Generate staging secrets"
    echo "  prod-template Create production secret template"
    echo "  all          Generate all environments"
    echo "  help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev           # Generate development secrets"
    echo "  $0 staging       # Generate staging secrets"
    echo "  $0 prod-template # Create production template"
    echo "  $0 all           # Generate all environments"
}

# Main script logic
main() {
    case "${1:-help}" in
        dev)
            generate_dev_secrets
            ;;
        staging)
            generate_staging_secrets
            ;;
        prod-template)
            create_production_template
            ;;
        all)
            generate_dev_secrets
            generate_staging_secrets
            create_production_template
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
