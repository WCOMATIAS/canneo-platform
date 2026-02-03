#!/bin/bash
# ============================================
# CANNEO Production Deployment Script
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/infra/docker/docker-compose.prod.yml"
ENV_FILE="$PROJECT_ROOT/.env"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking requirements..."

    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Check Docker Compose
    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    # Check .env file
    if [ ! -f "$ENV_FILE" ]; then
        log_error ".env file not found at $ENV_FILE"
        log_info "Please copy .env.example to .env and configure it:"
        log_info "  cp .env.example .env"
        exit 1
    fi

    log_success "All requirements satisfied."
}

validate_env() {
    log_info "Validating environment variables..."

    local required_vars=(
        "POSTGRES_PASSWORD"
        "REDIS_PASSWORD"
        "MINIO_ROOT_USER"
        "MINIO_ROOT_PASSWORD"
        "JWT_SECRET"
        "JWT_REFRESH_SECRET"
        "ENCRYPTION_KEY"
    )

    local missing_vars=()

    # Source .env file
    set -a
    source "$ENV_FILE"
    set +a

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi

    log_success "Environment variables validated."
}

create_directories() {
    log_info "Creating required directories..."

    mkdir -p "$PROJECT_ROOT/infra/nginx/ssl"
    mkdir -p "$PROJECT_ROOT/data/postgres"
    mkdir -p "$PROJECT_ROOT/data/redis"
    mkdir -p "$PROJECT_ROOT/data/minio"
    mkdir -p "$PROJECT_ROOT/logs/nginx"

    log_success "Directories created."
}

pull_images() {
    log_info "Pulling base images..."

    docker pull node:20-alpine
    docker pull postgres:16-alpine
    docker pull redis:7-alpine
    docker pull minio/minio:latest
    docker pull nginx:alpine

    log_success "Base images pulled."
}

build_images() {
    log_info "Building application images..."

    cd "$PROJECT_ROOT"

    docker compose -f "$COMPOSE_FILE" build --parallel

    log_success "Application images built."
}

run_migrations() {
    log_info "Running database migrations..."

    # Wait for postgres to be ready
    docker compose -f "$COMPOSE_FILE" up -d postgres

    log_info "Waiting for PostgreSQL to be ready..."
    sleep 10

    # Run migrations using the API container
    docker compose -f "$COMPOSE_FILE" run --rm api npx prisma migrate deploy

    log_success "Database migrations completed."
}

seed_database() {
    log_info "Seeding database..."

    docker compose -f "$COMPOSE_FILE" run --rm api npx prisma db seed

    log_success "Database seeded."
}

start_services() {
    log_info "Starting all services..."

    docker compose -f "$COMPOSE_FILE" up -d

    log_success "All services started."
}

stop_services() {
    log_info "Stopping all services..."

    docker compose -f "$COMPOSE_FILE" down

    log_success "All services stopped."
}

restart_services() {
    log_info "Restarting all services..."

    docker compose -f "$COMPOSE_FILE" restart

    log_success "All services restarted."
}

show_status() {
    log_info "Service status:"
    docker compose -f "$COMPOSE_FILE" ps
}

show_logs() {
    local service=$1
    if [ -z "$service" ]; then
        docker compose -f "$COMPOSE_FILE" logs -f
    else
        docker compose -f "$COMPOSE_FILE" logs -f "$service"
    fi
}

cleanup() {
    log_info "Cleaning up..."

    docker compose -f "$COMPOSE_FILE" down -v --rmi local
    docker system prune -f

    log_success "Cleanup completed."
}

health_check() {
    log_info "Running health checks..."

    local services=("api:3000" "hooks:3010" "admin:3001" "doctor:3002" "patient:3003" "pharmacy:3004")
    local failed=0

    for service_port in "${services[@]}"; do
        IFS=':' read -r service port <<< "$service_port"
        if docker compose -f "$COMPOSE_FILE" exec -T "$service" wget -q --spider "http://localhost:$port/health" 2>/dev/null; then
            log_success "$service is healthy"
        else
            log_error "$service health check failed"
            failed=$((failed + 1))
        fi
    done

    if [ $failed -gt 0 ]; then
        log_error "$failed service(s) failed health check"
        exit 1
    fi

    log_success "All services are healthy."
}

show_help() {
    echo "CANNEO Production Deployment Script"
    echo ""
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  deploy      Full deployment (build + migrate + start)"
    echo "  build       Build all Docker images"
    echo "  start       Start all services"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  status      Show service status"
    echo "  logs [svc]  Show logs (optionally for specific service)"
    echo "  migrate     Run database migrations"
    echo "  seed        Seed the database"
    echo "  health      Run health checks"
    echo "  cleanup     Stop services and clean up"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy           # Full deployment"
    echo "  $0 logs api         # Show API logs"
    echo "  $0 restart          # Restart all services"
}

# Main script
main() {
    local command=$1
    shift || true

    case "$command" in
        deploy)
            check_requirements
            validate_env
            create_directories
            pull_images
            build_images
            run_migrations
            seed_database
            start_services
            sleep 10
            health_check
            show_status
            log_success "Deployment completed successfully!"
            echo ""
            echo "Services available at:"
            echo "  - API:      https://api.canneo.com.br"
            echo "  - Hooks:    https://hooks.canneo.com.br"
            echo "  - Admin:    https://adm.canneo.com.br"
            echo "  - Doctor:   https://medico.canneo.com.br"
            echo "  - Patient:  https://web.canneo.com.br"
            echo "  - Pharmacy: https://farma.canneo.com.br"
            ;;
        build)
            check_requirements
            build_images
            ;;
        start)
            check_requirements
            validate_env
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs "$@"
            ;;
        migrate)
            check_requirements
            validate_env
            run_migrations
            ;;
        seed)
            check_requirements
            validate_env
            seed_database
            ;;
        health)
            health_check
            ;;
        cleanup)
            cleanup
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
