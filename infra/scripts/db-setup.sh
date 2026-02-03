#!/bin/bash

# =============================================================================
# CANNEO - Database Setup Script
# =============================================================================
# Este script configura o ambiente de desenvolvimento do banco de dados:
# - Sobe containers Docker (PostgreSQL, Redis, MinIO)
# - Aguarda os serviços estarem saudáveis
# - Executa migrations do Prisma
# - Executa seed com dados de teste
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║              CANNEO - Database Setup Script                   ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

cd "$PROJECT_ROOT"

# =============================================================================
# Functions
# =============================================================================

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

wait_for_postgres() {
    log_info "Waiting for PostgreSQL to be ready..."
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if docker exec canneo-postgres pg_isready -U canneo -d canneo_db > /dev/null 2>&1; then
            log_success "PostgreSQL is ready!"
            return 0
        fi
        echo -n "."
        sleep 1
        attempt=$((attempt + 1))
    done

    log_error "PostgreSQL failed to start after $max_attempts attempts"
    return 1
}

wait_for_redis() {
    log_info "Waiting for Redis to be ready..."
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if docker exec canneo-redis redis-cli ping > /dev/null 2>&1; then
            log_success "Redis is ready!"
            return 0
        fi
        echo -n "."
        sleep 1
        attempt=$((attempt + 1))
    done

    log_error "Redis failed to start after $max_attempts attempts"
    return 1
}

wait_for_minio() {
    log_info "Waiting for MinIO to be ready..."
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:9000/minio/health/live > /dev/null 2>&1; then
            log_success "MinIO is ready!"
            return 0
        fi
        echo -n "."
        sleep 1
        attempt=$((attempt + 1))
    done

    log_error "MinIO failed to start after $max_attempts attempts"
    return 1
}

# =============================================================================
# Check dependencies
# =============================================================================

log_info "Checking dependencies..."

if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    log_warning "pnpm is not installed. Installing via npm..."
    npm install -g pnpm
fi

log_success "All dependencies are installed!"

# =============================================================================
# Start Docker containers
# =============================================================================

echo ""
log_info "Starting Docker containers..."

# Use docker compose v2 syntax if available
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

$DOCKER_COMPOSE -f docker-compose.dev.yml up -d postgres redis minio

# Wait for services
echo ""
wait_for_postgres
wait_for_redis
wait_for_minio

# Start minio-setup to create buckets
log_info "Creating MinIO buckets..."
$DOCKER_COMPOSE -f docker-compose.dev.yml up minio-setup

# =============================================================================
# Check .env file
# =============================================================================

echo ""
log_info "Checking environment configuration..."

if [ ! -f ".env" ]; then
    log_warning ".env file not found. Creating from .env.example..."
    cp .env.example .env
    log_success ".env file created. Please review and update the values if needed."
fi

# =============================================================================
# Install dependencies (if needed)
# =============================================================================

echo ""
log_info "Checking npm dependencies..."

if [ ! -d "node_modules" ]; then
    log_info "Installing dependencies with pnpm..."
    pnpm install
fi

# =============================================================================
# Generate Prisma Client
# =============================================================================

echo ""
log_info "Generating Prisma client..."
pnpm prisma generate

log_success "Prisma client generated!"

# =============================================================================
# Run migrations
# =============================================================================

echo ""
log_info "Running database migrations..."
pnpm prisma migrate dev --name init

log_success "Database migrations complete!"

# =============================================================================
# Run seed
# =============================================================================

echo ""
log_info "Seeding database with test data..."
pnpm prisma db seed

log_success "Database seeded successfully!"

# =============================================================================
# Summary
# =============================================================================

echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete! 🎉                         ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "Services running:"
echo "  • PostgreSQL: localhost:5432"
echo "  • Redis:      localhost:6379"
echo "  • MinIO:      localhost:9000 (API) / localhost:9001 (Console)"
echo "  • Mailhog:    localhost:8025 (Web UI)"
echo ""
echo "Database credentials:"
echo "  • Host:     localhost"
echo "  • Port:     5432"
echo "  • Database: canneo_db"
echo "  • User:     canneo"
echo "  • Password: canneo_password"
echo ""
echo "MinIO credentials:"
echo "  • Access Key: canneo_minio"
echo "  • Secret Key: canneo_minio_secret"
echo ""
echo "Useful commands:"
echo "  • pnpm prisma studio    - Open Prisma Studio"
echo "  • pnpm db:migrate       - Run migrations"
echo "  • pnpm db:seed          - Seed database"
echo "  • docker compose -f docker-compose.dev.yml logs -f  - View logs"
echo "  • docker compose -f docker-compose.dev.yml down     - Stop services"
echo ""
