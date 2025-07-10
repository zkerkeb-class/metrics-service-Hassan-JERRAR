# 📊 Microservice de Métriques ZenBilling

Microservice autonome dédié aux métriques, analytics et reporting pour l'application ZenBilling, offrant des dashboards en temps réel, KPIs avancés et génération de rapports.

## 🚀 Fonctionnalités

### 📈 Dashboard et Métriques
- Métriques en temps réel des revenus et performances
- KPIs clés (CA mensuel/annuel, factures en attente, taux de conversion)
- Comparaisons de périodes avec calculs de croissance
- Top clients et distribution des statuts
- Métriques de productivité par utilisateur

### 📊 Analytics Avancées
- Analyse des revenus par période (jour, semaine, mois, année)
- Analytics clients avec scoring de risque et valeur vie
- Analytics produits avec tendances et conversions
- Analyse de cohortes pour la rétention client
- Prévisions et modélisation prédictive

### 📋 Reporting
- Génération de rapports personnalisés
- Export multi-formats (JSON, CSV, PDF, XLSX)
- Rapports de revenus, clients, produits, taxes
- Planification et envoi automatique par email
- Archivage et historique des rapports

### ⚡ Performance et Cache
- Cache Redis intelligent avec invalidation automatique
- Aggregation de données en arrière-plan
- Optimisation des requêtes complexes
- Métriques de performance du service

### 🔔 Alertes et Monitoring
- Système d'alertes configurable sur métriques
- Monitoring en temps réel des KPIs
- Notifications par email sur seuils
- Health checks et diagnostics

## 🏗️ Architecture

```
metrics-microservice/
├── src/
│   ├── analytics/           # Moteurs d'analyse avancée
│   ├── aggregators/         # Services d'agrégation de données
│   ├── controllers/         # Contrôleurs API
│   ├── services/           # Logique métier
│   ├── middlewares/        # Middlewares Express
│   ├── routes/             # Définition des routes
│   ├── interfaces/         # Types TypeScript
│   ├── lib/                # Configurations (Prisma, Redis, Supabase)
│   ├── utils/              # Utilitaires (logger, erreurs, etc.)
│   └── app.ts              # Application Express principale
├── prisma/                 # Schéma et migrations base de données
├── monitoring/             # Configuration Prometheus/Grafana
├── docker-compose.yml      # Orchestration Docker
├── Dockerfile             # Image Docker
└── start.sh               # Script de démarrage automatisé
```

## 🚀 Installation

### Prérequis
- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- Compte Supabase (authentification)

### Démarrage rapide avec script automatisé

```bash
# Cloner dans le dossier du microservice
cd metrics-microservice

# Lancer le script interactif
./start.sh
```

Le script vous guidera à travers:
1. Vérification de l'environnement
2. Installation des dépendances
3. Configuration de la base de données
4. Choix du mode de démarrage

### Installation manuelle

1. **Installation des dépendances**
   ```bash
   npm install
   ```

2. **Configuration des variables d'environnement**
   ```bash
   cp .env.example .env
   # Éditer le fichier .env avec vos configurations
   ```

3. **Configuration de la base de données**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Démarrage en développement**
   ```bash
   npm run dev
   ```

### Déploiement avec Docker

1. **Services principaux**
   ```bash
   docker-compose up -d --build
   ```

2. **Avec services d'administration (PgAdmin, Redis Commander)**
   ```bash
   docker-compose --profile admin up -d --build
   ```

3. **Avec monitoring (Prometheus, Grafana)**
   ```bash
   docker-compose --profile monitoring up -d --build
   ```

## 🔧 Configuration

### Variables d'environnement essentielles

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL PostgreSQL | `postgresql://user:pass@localhost:5434/metrics` |
| `REDIS_HOST` | Serveur Redis | `localhost` |
| `REDIS_PORT` | Port Redis | `6381` |
| `SUPABASE_URL` | URL Supabase | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Clé Supabase | `eyJ...` |
| `CACHE_TTL` | TTL cache (secondes) | `1800` |

### Configuration Docker

Les services Docker incluent:
- **metrics-app** (port 3003) : Application principale
- **metrics-db** (port 5434) : PostgreSQL avec optimisations
- **metrics-redis** (port 6381) : Redis avec persistance
- **metrics-pgadmin** (port 8084) : Administration DB (profile admin)
- **metrics-redis-commander** (port 8083) : Administration Redis (profile admin)
- **metrics-prometheus** (port 9091) : Métriques (profile monitoring)
- **metrics-grafana** (port 3001) : Dashboards (profile monitoring)

## 📚 API Endpoints

### Métriques Dashboard

#### Récupérer les métriques principales
```http
GET /api/metrics/dashboard
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "monthlyRevenue": 15000.00,
    "yearlyRevenue": 180000.00,
    "pendingInvoices": 5,
    "overdueInvoices": 2,
    "topCustomers": [
      {
        "customer_id": "uuid",
        "name": "Client A",
        "total_amount": 5000.00,
        "invoice_count": 12,
        "type": "company"
      }
    ],
    "invoiceStatusDistribution": [
      { "status": "paid", "_count": 45 },
      { "status": "pending", "_count": 5 }
    ],
    "quoteToInvoiceRatio": 0.75,
    "averagePaymentDelay": 15,
    "growthRate": 12.5
  }
}
```

### Analytics Revenus

#### Analyse des revenus par période
```http
GET /api/metrics/revenue?period=monthly&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

### Métriques Temps Réel

#### Données en temps réel
```http
GET /api/metrics/realtime
Authorization: Bearer <token>
```

### Analytics Clients

#### Analyse des clients avec pagination
```http
GET /api/metrics/customers?page=1&limit=10&sortBy=lifetimeValue&sortOrder=desc
Authorization: Bearer <token>
```

### Analytics Produits

#### Performance des produits
```http
GET /api/metrics/products?page=1&limit=10&sortBy=totalRevenue
Authorization: Bearer <token>
```

### Rapports

#### Générer un rapport personnalisé
```http
POST /api/metrics/reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "reportType": "revenue_report",
  "period": {
    "start": "2024-01-01",
    "end": "2024-12-31"
  },
  "format": "PDF",
  "filters": {
    "includeCharts": true,
    "customers": ["customer-1", "customer-2"]
  }
}
```

#### Statut d'un rapport
```http
GET /api/metrics/reports/{reportId}
Authorization: Bearer <token>
```

### Utilitaires

#### Invalider le cache
```http
DELETE /api/metrics/cache
Authorization: Bearer <token>
```

#### Health check
```http
GET /api/metrics/health
```

## 🏭 Base de Données

### Modèles principaux

Le microservice utilise les modèles du backend principal (Company, User, Customer, Invoice, Quote, Product) et ajoute des modèles spécialisés pour les métriques:

#### CompanyMetrics
Métriques agrégées par entreprise et période
```sql
- total_revenue, invoices_count, quotes_count
- avg_invoice_amount, conversion_rate
- new_customers_count, active_customers_count
```

#### KPISnapshot
Instantanés des KPIs à une date donnée
```sql
- monthly_revenue, yearly_revenue, mrr, arr
- churn_rate, customer_lifetime_value
- profit_margin, growth_rate
```

#### UserMetrics
Métriques de productivité par utilisateur
```sql
- invoices_created, quotes_created, revenue_generated
- customers_acquired, login_count, productivity_score
```

#### CustomerMetrics
Analytics clients détaillées
```sql
- total_invoiced, total_paid, lifetime_value
- average_payment_delay, risk_score, churn_date
```

#### MetricAlert
Configuration des alertes automatiques
```sql
- metric_type, condition, threshold_value
- notification_emails, last_triggered
```

### Optimisations

- **Index** sur toutes les colonnes de filtrage fréquent
- **Partitioning** par période pour les grandes tables
- **Agrégations** pré-calculées via jobs cron
- **Cache Redis** pour les requêtes coûteuses

## 📊 Monitoring et Observabilité

### Logs Structurés
Logging avec Pino incluant:
```json
{
  "level": "info",
  "time": "2024-01-15T10:30:00.000Z",
  "service": "metrics-microservice",
  "requestId": "req-uuid",
  "userId": "user-uuid",
  "companyId": "company-uuid",
  "action": "dashboard_metrics_calculated",
  "duration": "250ms",
  "cacheHit": true
}
```

### Métriques Prometheus
- Nombre de requêtes par endpoint
- Latence moyenne des requêtes
- Taux d'erreur par type
- Utilisation du cache Redis
- Performance des requêtes base de données

### Dashboards Grafana
- Vue d'ensemble du service
- Performance des APIs
- Santé de la base de données
- Métriques business en temps réel

### Health Checks
- **Endpoint** `/health` pour vérifications de base
- **Deep health check** avec tests de connectivité
- **Readiness probe** pour Kubernetes
- **Liveness probe** pour Docker

## 🔒 Sécurité

### Authentification
- **Supabase Auth** pour tous les endpoints protégés
- **JWT validation** avec vérification des claims
- **Rate limiting** : 100 req/15min par IP
- **CORS** restrictif selon configuration

### Protection des Données
- **Anonymisation** des données sensibles dans les logs
- **Chiffrement** des données en cache
- **Validation** stricte des entrées utilisateur
- **Audit trail** des actions sensibles

### Autorisation
- **Isolation** par entreprise (company_id)
- **Permissions** basées sur les rôles utilisateur
- **Accès restreint** aux métriques par propriétaire

## ⚡ Performance

### Stratégies de Cache
```typescript
// Cache intelligent par couches
const cacheKey = `metrics:dashboard:${companyId}`;
const ttl = 30 * 60; // 30 minutes

// Invalidation automatique lors de changements
await invalidateCache(`metrics:*:${companyId}`);
```

### Optimisations de Requêtes
- **Agrégations** pré-calculées en arrière-plan
- **Pagination** efficace pour grandes datasets
- **Index** composites pour requêtes complexes
- **Connection pooling** pour PostgreSQL

### Mise à l'Échelle
- **Clustering** Node.js pour utilisation multi-core
- **Redis Cluster** pour distribution du cache
- **Read replicas** PostgreSQL pour requêtes analytiques
- **Load balancing** avec health checks

## 🚨 Troubleshooting

### Problèmes Courants

**1. Erreur de connexion base de données**
```bash
# Vérifier le service PostgreSQL
docker-compose ps metrics-db
docker-compose logs metrics-db

# Tester la connectivité
npx prisma db push
```

**2. Cache Redis indisponible**
```bash
# Vérifier Redis
docker-compose ps metrics-redis
redis-cli -h localhost -p 6381 ping

# Nettoyer le cache
redis-cli -h localhost -p 6381 flushdb
```

**3. Métriques incorrectes**
```bash
# Recalculer les agrégations
curl -X DELETE http://localhost:3003/api/metrics/cache \
  -H "Authorization: Bearer YOUR_TOKEN"

# Vérifier les logs
docker-compose logs metrics-app
```

**4. Performance dégradée**
```bash
# Monitoring en temps réel
curl http://localhost:3003/api/metrics/health

# Vérifier les métriques Prometheus
curl http://localhost:9091/metrics
```

### Logs et Diagnostic

**Niveaux de log disponibles:**
- `error` : Erreurs critiques uniquement
- `warn` : Avertissements et erreurs
- `info` : Informations générales (défaut)
- `debug` : Détails de débogage

**Commandes utiles:**
```bash
# Logs en temps réel
docker-compose logs -f metrics-app

# Filtrer par niveau
docker-compose logs metrics-app | grep ERROR

# Stats Redis
redis-cli -h localhost -p 6381 info stats
```

## 🔄 Intégration

### Depuis le Backend Principal

```typescript
// Client pour le microservice de métriques
const metricsClient = {
  baseURL: 'http://localhost:3003',
  
  async getDashboard(token: string, companyId: string) {
    const response = await fetch(`${this.baseURL}/api/metrics/dashboard`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },
  
  async invalidateCache(token: string) {
    await fetch(`${this.baseURL}/api/metrics/cache`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
};
```

### Webhooks et Événements

Le microservice peut s'abonner aux événements business:
```typescript
// Événements à écouter pour mise à jour des métriques
const EVENTS = {
  INVOICE_PAID: 'invoice.paid',
  QUOTE_ACCEPTED: 'quote.accepted',
  CUSTOMER_CREATED: 'customer.created',
  PRODUCT_SOLD: 'product.sold'
};
```

## 📖 Exemples d'Utilisation

### Dashboard React

```typescript
import { useEffect, useState } from 'react';

const MetricsDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics/dashboard', {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        });
        const data = await response.json();
        setMetrics(data.data);
      } catch (error) {
        console.error('Erreur metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    // Refresh toutes les 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Chargement des métriques...</div>;

  return (
    <div className="metrics-dashboard">
      <div className="kpi-cards">
        <KPICard 
          title="Chiffre d'Affaires Mensuel"
          value={metrics.monthlyRevenue}
          format="currency"
          trend={metrics.growthRate}
        />
        <KPICard 
          title="Factures en Attente"
          value={metrics.pendingInvoices}
          format="number"
        />
      </div>
      
      <div className="charts">
        <RevenueChart data={metrics.revenueAnalytics} />
        <CustomerChart data={metrics.topCustomers} />
      </div>
    </div>
  );
};
```

### Génération de Rapports

```typescript
const generateMonthlyReport = async () => {
  // Lancer la génération
  const response = await fetch('/api/metrics/reports', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      reportType: 'revenue_report',
      period: {
        start: '2024-01-01',
        end: '2024-01-31'
      },
      format: 'PDF',
      filters: {
        includeCharts: true,
        includeDetails: true
      }
    })
  });
  
  const { data: report } = await response.json();
  
  // Polling du statut
  const checkStatus = async () => {
    const statusResponse = await fetch(`/api/metrics/reports/${report.id}`);
    const { data: status } = await statusResponse.json();
    
    if (status.status === 'completed') {
      // Télécharger le rapport
      window.open(status.downloadUrl);
    } else if (status.status === 'failed') {
      console.error('Génération échouée:', status.error);
    } else {
      // Retry dans 2 secondes
      setTimeout(checkStatus, 2000);
    }
  };
  
  checkStatus();
};
```

## 🤝 Contribution

1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/amazing-analytics`)
3. **Commit** les changements (`git commit -m 'Add amazing analytics'`)
4. **Push** vers la branche (`git push origin feature/amazing-analytics`)
5. **Ouvrir** une Pull Request

### Standards de Code

- **TypeScript** strict mode activé
- **ESLint** et **Prettier** pour le formatage
- **Tests** unitaires pour les services critiques
- **Documentation** JSDoc pour les fonctions publiques
- **Logs** structurés pour toutes les opérations

## 📄 Licence

Propriétaire - ZenBilling © 2024

---

## 🆘 Support

- **Documentation** : Ce README et commentaires inline
- **Logs** : Consultez les logs de l'application
- **Monitoring** : Dashboards Grafana disponibles
- **Contact** : Équipe ZenBilling

**Ports utilisés:**
- `3003` : Application principale
- `5434` : PostgreSQL
- `6381` : Redis
- `8084` : PgAdmin (profile admin)
- `8083` : Redis Commander (profile admin)
- `9091` : Prometheus (profile monitoring)
- `3001` : Grafana (profile monitoring) 