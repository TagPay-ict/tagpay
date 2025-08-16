#!/bin/bash

# TagPay Docker Management Script

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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to build images
build_images() {
    print_status "Building Docker images..."
    docker-compose build
    print_success "Docker images built successfully!"
}

# Function to start production environment
start_production() {
    print_status "Starting production environment..."
    docker-compose up -d
    print_success "Production environment started!"
    print_status "Access points:"
    echo "  - Admin Dashboard: http://localhost:80"
    echo "  - API Server: http://localhost:3000"
    echo "  - Nginx Proxy: http://localhost:8080"
}

# Function to start development environment
start_development() {
    print_status "Starting development environment..."
    docker-compose -f docker-compose.dev.yml up -d
    print_success "Development environment started!"
    print_status "Access points:"
    echo "  - Admin Dashboard: http://localhost:5173"
    echo "  - API Server: http://localhost:3000"
}

# Function to stop all containers
stop_containers() {
    print_status "Stopping all containers..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    print_success "All containers stopped!"
}

# Function to show logs
show_logs() {
    local service=${1:-""}
    if [ -z "$service" ]; then
        print_status "Showing logs for all services..."
        docker-compose logs -f
    else
        print_status "Showing logs for $service..."
        docker-compose logs -f "$service"
    fi
}

# Function to show development logs
show_dev_logs() {
    local service=${1:-""}
    if [ -z "$service" ]; then
        print_status "Showing development logs for all services..."
        docker-compose -f docker-compose.dev.yml logs -f
    else
        print_status "Showing development logs for $service..."
        docker-compose -f docker-compose.dev.yml logs -f "$service"
    fi
}

# Function to clean up
cleanup() {
    print_warning "This will remove all containers, images, and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up Docker resources..."
        docker-compose down -v --rmi all
        docker-compose -f docker-compose.dev.yml down -v --rmi all
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to show status
show_status() {
    print_status "Container status:"
    docker-compose ps
    echo ""
    print_status "Development container status:"
    docker-compose -f docker-compose.dev.yml ps
}

# Function to show help
show_help() {
    echo "TagPay Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build              Build all Docker images"
    echo "  up                 Start production environment"
    echo "  dev                Start development environment"
    echo "  down               Stop all containers"
    echo "  logs [SERVICE]     Show logs (production)"
    echo "  dev:logs [SERVICE] Show logs (development)"
    echo "  status             Show container status"
    echo "  cleanup            Remove all containers, images, and volumes"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build           # Build all images"
    echo "  $0 up              # Start production"
    echo "  $0 dev             # Start development"
    echo "  $0 logs server     # Show server logs"
    echo "  $0 dev:logs admin  # Show admin development logs"
}

# Main script logic
main() {
    check_docker

    case "${1:-help}" in
        build)
            build_images
            ;;
        up)
            start_production
            ;;
        dev)
            start_development
            ;;
        down)
            stop_containers
            ;;
        logs)
            show_logs "$2"
            ;;
        dev:logs)
            show_dev_logs "$2"
            ;;
        status)
            show_status
            ;;
        cleanup)
            cleanup
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
