#!/bin/bash

# Script de démarrage automatisé pour le microservice de métriques ZenBilling
# Auteur: Hassan - ZenBilling Team
# Version: 1.0.0

set -e

echo "🚀 Démarrage du microservice de métriques ZenBilling..."

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
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

# Vérification de l'environnement
log_info "Vérification de l'environnement..."

# Vérification de Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js n'est pas installé"
    exit 1
fi

NODE_VERSION=$(node --version)
log_success "Node.js détecté: $NODE_VERSION"

# Vérification de npm
if ! command -v npm &> /dev/null; then
    log_error "npm n'est pas installé"
    exit 1
fi

NPM_VERSION=$(npm --version)
log_success "npm détecté: $NPM_VERSION"

# Vérification de Docker (optionnel)
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    log_success "Docker détecté: $DOCKER_VERSION"
else
    log_warning "Docker non détecté (optionnel)"
fi

# Vérification de Docker Compose (optionnel)
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION=$(docker-compose --version)
    log_success "Docker Compose détecté: $DOCKER_COMPOSE_VERSION"
else
    log_warning "Docker Compose non détecté (optionnel)"
fi

# Vérification du fichier .env
if [ ! -f .env ]; then
    log_warning "Fichier .env non trouvé"
    log_info "Création du fichier .env depuis .env.example..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        log_success "Fichier .env créé"
        log_warning "⚠️  Veuillez configurer les variables d'environnement dans .env"
    else
        log_error "Fichier .env.example non trouvé"
        exit 1
    fi
fi

# Installation des dépendances
log_info "Installation des dépendances..."
npm install

# Génération du client Prisma
log_info "Génération du client Prisma..."
npx prisma generate

# Choix du mode de démarrage
echo ""
echo "Choisissez le mode de démarrage:"
echo "1) Développement (npm run dev)"
echo "2) Production locale (npm start)"
echo "3) Docker (docker-compose up)"
echo "4) Docker avec services d'administration (docker-compose --profile admin up)"
echo "5) Docker avec monitoring (docker-compose --profile monitoring up)"
echo "6) Build seulement (npm run build)"
echo "7) Tests de santé seulement"

read -p "Votre choix (1-7): " choice

case $choice in
    1)
        log_info "Démarrage en mode développement..."
        npm run dev
        ;;
    2)
        log_info "Build de l'application..."
        npm run build
        log_info "Démarrage en mode production..."
        npm start
        ;;
    3)
        log_info "Démarrage avec Docker..."
        docker-compose up --build
        ;;
    4)
        log_info "Démarrage avec Docker + services d'administration..."
        docker-compose --profile admin up --build
        ;;
    5)
        log_info "Démarrage avec Docker + monitoring..."
        docker-compose --profile monitoring up --build
        ;;
    6)
        log_info "Build de l'application..."
        npm run build
        log_success "Build terminé"
        ;;
    7)
        log_info "Tests de santé..."
        
        # Test de la base de données
        if [ ! -z "$DATABASE_URL" ]; then
            log_info "Test de connexion à la base de données..."
            npx prisma db push --accept-data-loss || log_warning "Échec de connexion à la base de données"
        fi
        
        # Test de l'application
        log_info "Test de l'application..."
        timeout 30s npm run dev &
        sleep 10
        
        if curl -f http://localhost:3003/health > /dev/null 2>&1; then
            log_success "Application opérationnelle"
        else
            log_error "Application non accessible"
        fi
        
        pkill -f "npm run dev" || true
        ;;
    *)
        log_error "Choix invalide"
        exit 1
        ;;
esac

log_success "Script terminé" 