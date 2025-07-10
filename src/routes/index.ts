import { Router } from "express";
import metricsRoutes from "./metrics.routes";

const router = Router();

// Préfixe API pour toutes les routes
router.use("/api/metrics", metricsRoutes);

// Route de santé racine
router.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Microservice de métriques opérationnel",
        timestamp: new Date().toISOString(),
        service: "metrics-microservice",
        version: "1.0.0",
    });
});

// Route par défaut
router.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Bienvenue sur le microservice de métriques ZenBilling",
        service: "metrics-microservice",
        version: "1.0.0",
        endpoints: {
            health: "GET /health",
            dashboard: "GET /api/metrics/dashboard",
            revenue: "GET /api/metrics/revenue",
            realtime: "GET /api/metrics/realtime",
            customers: "GET /api/metrics/customers",
            products: "GET /api/metrics/products",
            reports: {
                create: "POST /api/metrics/reports",
                status: "GET /api/metrics/reports/:reportId",
            },
            cache: "DELETE /api/metrics/cache",
        },
    });
});

export default router;
