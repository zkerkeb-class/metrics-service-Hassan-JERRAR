import { Router } from "express";
import { MetricsController } from "../controllers/metrics.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Routes pour les métriques dashboard
router.get("/dashboard", authMiddleware, MetricsController.getDashboardMetrics);

// Routes pour les analytics de revenus
router.get("/revenue", authMiddleware, MetricsController.getRevenueAnalytics);

// Routes pour les métriques en temps réel
router.get("/realtime", authMiddleware, MetricsController.getRealTimeMetrics);

// Routes pour les analytics clients
router.get(
    "/customers",
    authMiddleware,
    MetricsController.getCustomerAnalytics
);

// Routes pour les analytics produits
router.get("/products", authMiddleware, MetricsController.getProductAnalytics);

// Routes pour les rapports
router.post("/reports", authMiddleware, MetricsController.generateReport);

router.get(
    "/reports/:reportId",
    authMiddleware,
    MetricsController.getReportStatus
);

// Routes utilitaires
router.delete("/cache", authMiddleware, MetricsController.invalidateCache);

// Health check (sans authentification)
router.get("/health", MetricsController.healthCheck);

export default router;
