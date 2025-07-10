# Image de base Node.js Alpine pour la légèreté
FROM node:18-alpine AS base

# Informations du mainteneur
LABEL maintainer="Hassan - ZenBilling Team"
LABEL description="Microservice de métriques et analytics pour ZenBilling"

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3003

# Création de l'utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S metrics -u 1001

# Stage de dépendances
FROM base AS deps
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./
COPY tsconfig.json ./

# Installation des dépendances
RUN npm ci --only=production --silent

# Stage de build
FROM base AS builder
WORKDIR /app

# Copie des dépendances depuis le stage précédent
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Génération du client Prisma
RUN npx prisma generate

# Build de l'application TypeScript
RUN npm run build

# Stage de production
FROM base AS runner
WORKDIR /app

# Installation des packages systèmes nécessaires
RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    dumb-init

# Configuration du timezone
ENV TZ=Europe/Paris

# Copie des fichiers nécessaires
COPY --from=builder --chown=metrics:nodejs /app/dist ./dist
COPY --from=builder --chown=metrics:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=metrics:nodejs /app/package.json ./package.json
COPY --from=builder --chown=metrics:nodejs /app/prisma ./prisma

# Création du répertoire pour les logs
RUN mkdir -p /app/logs && chown -R metrics:nodejs /app/logs

# Changement vers l'utilisateur non-root
USER metrics

# Exposition du port
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); \
        const options = { host: 'localhost', port: 3003, path: '/health', timeout: 2000 }; \
        const req = http.request(options, (res) => { \
            if (res.statusCode === 200) process.exit(0); \
            else process.exit(1); \
        }); \
        req.on('error', () => process.exit(1)); \
        req.end();"

# Commande de démarrage avec dumb-init pour la gestion des signaux
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/app.js"] 