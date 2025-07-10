import { Response } from "express";
import { MetricsService } from "../services/metrics.service";
import { AuthRequest } from "../interfaces/auth.interface";
import { ApiResponse } from "../utils/apiResponse";
import {
    CustomError,
    NotFoundError,
    ValidationError,
} from "../utils/customError";
import logger from "../utils/logger";

export class MetricsController {
    /**
     * Récupère les métriques du dashboard
     */
    public static async getDashboardMetrics(req: AuthRequest, res: Response) {
        try {
            if (!req.user?.company_id) {
                return ApiResponse.error(res, 400, "ID d'entreprise requis");
            }

            logger.info(
                { userId: req.user.id, companyId: req.user.company_id },
                "Demande de métriques dashboard"
            );

            const metrics = await MetricsService.getDashboardMetrics(
                req.user.company_id
            );

            return ApiResponse.success(
                res,
                200,
                "Métriques du dashboard récupérées avec succès",
                metrics
            );
        } catch (error) {
            logger.error(
                {
                    error,
                    userId: req.user?.id,
                    companyId: req.user?.company_id,
                },
                "Erreur lors de la récupération des métriques dashboard"
            );

            if (error instanceof CustomError) {
                return ApiResponse.error(res, error.statusCode, error.message);
            }

            return ApiResponse.error(res, 500, "Erreur interne du serveur");
        }
    }

    /**
     * Récupère les analytics de revenus
     */
    public static async getRevenueAnalytics(req: AuthRequest, res: Response) {
        try {
            if (!req.user?.company_id) {
                return ApiResponse.error(res, 400, "ID d'entreprise requis");
            }

            const { period = "monthly", startDate, endDate } = req.query;

            logger.info(
                {
                    userId: req.user.id,
                    companyId: req.user.company_id,
                    period,
                    startDate,
                    endDate,
                },
                "Demande d'analytics revenus"
            );

            const analytics = await MetricsService.getRevenueAnalytics(
                req.user.company_id,
                period as any,
                startDate ? new Date(startDate as string) : undefined,
                endDate ? new Date(endDate as string) : undefined
            );

            return ApiResponse.success(
                res,
                200,
                "Analytics de revenus récupérées avec succès",
                analytics
            );
        } catch (error) {
            logger.error(
                {
                    error,
                    userId: req.user?.id,
                    companyId: req.user?.company_id,
                },
                "Erreur lors de la récupération des analytics revenus"
            );

            if (error instanceof CustomError) {
                return ApiResponse.error(res, error.statusCode, error.message);
            }

            return ApiResponse.error(res, 500, "Erreur interne du serveur");
        }
    }

    /**
     * Invalide le cache des métriques
     */
    public static async invalidateCache(req: AuthRequest, res: Response) {
        try {
            if (!req.user?.company_id) {
                return ApiResponse.error(res, 400, "ID d'entreprise requis");
            }

            logger.info(
                { userId: req.user.id, companyId: req.user.company_id },
                "Demande d'invalidation du cache"
            );

            await MetricsService.invalidateCache(req.user.company_id);

            return ApiResponse.success(res, 200, "Cache invalidé avec succès");
        } catch (error) {
            logger.error(
                {
                    error,
                    userId: req.user?.id,
                    companyId: req.user?.company_id,
                },
                "Erreur lors de l'invalidation du cache"
            );

            if (error instanceof CustomError) {
                return ApiResponse.error(res, error.statusCode, error.message);
            }

            return ApiResponse.error(res, 500, "Erreur interne du serveur");
        }
    }

    /**
     * Health check du service
     */
    public static async healthCheck(req: AuthRequest, res: Response) {
        try {
            const health = await MetricsService.healthCheck();

            return ApiResponse.success(
                res,
                200,
                "Service en bonne santé",
                health
            );
        } catch (error) {
            logger.error({ error }, "Health check failed");

            if (error instanceof CustomError) {
                return ApiResponse.error(res, error.statusCode, error.message);
            }

            return ApiResponse.error(res, 500, "Service indisponible");
        }
    }

    /**
     * Récupère les métriques en temps réel
     */
    public static async getRealTimeMetrics(req: AuthRequest, res: Response) {
        try {
            if (!req.user?.company_id) {
                return ApiResponse.error(res, 400, "ID d'entreprise requis");
            }

            logger.info(
                { userId: req.user.id, companyId: req.user.company_id },
                "Demande de métriques temps réel"
            );

            // Pour l'instant, on retourne les métriques dashboard
            // Cette fonction sera étendue avec des données en temps réel
            const metrics = await MetricsService.getDashboardMetrics(
                req.user.company_id
            );

            const realTimeData = {
                timestamp: new Date(),
                activeUsers: 1, // À implémenter avec Redis
                todayRevenue: metrics.monthlyRevenue, // Approximation pour l'instant
                pendingInvoices: metrics.pendingInvoices,
                recentActivities: [], // À implémenter
                alerts: [], // À implémenter
            };

            return ApiResponse.success(
                res,
                200,
                "Métriques temps réel récupérées avec succès",
                realTimeData
            );
        } catch (error) {
            logger.error(
                {
                    error,
                    userId: req.user?.id,
                    companyId: req.user?.company_id,
                },
                "Erreur lors de la récupération des métriques temps réel"
            );

            if (error instanceof CustomError) {
                return ApiResponse.error(res, error.statusCode, error.message);
            }

            return ApiResponse.error(res, 500, "Erreur interne du serveur");
        }
    }

    /**
     * Récupère les analytics des clients
     */
    public static async getCustomerAnalytics(req: AuthRequest, res: Response) {
        try {
            if (!req.user?.company_id) {
                return ApiResponse.error(res, 400, "ID d'entreprise requis");
            }

            const {
                page = 1,
                limit = 10,
                sortBy = "lifetimeValue",
                sortOrder = "desc",
            } = req.query;

            logger.info(
                {
                    userId: req.user.id,
                    companyId: req.user.company_id,
                    page,
                    limit,
                    sortBy,
                    sortOrder,
                },
                "Demande d'analytics clients"
            );

            // Placeholder - à implémenter
            const analytics = {
                data: [],
                total: 0,
                page: Number(page),
                pageSize: Number(limit),
                totalPages: 0,
                hasNextPage: false,
                hasPreviousPage: false,
            };

            return ApiResponse.paginated(
                res,
                analytics.data,
                analytics.total,
                analytics.page,
                analytics.pageSize,
                "Analytics clients récupérées avec succès"
            );
        } catch (error) {
            logger.error(
                {
                    error,
                    userId: req.user?.id,
                    companyId: req.user?.company_id,
                },
                "Erreur lors de la récupération des analytics clients"
            );

            if (error instanceof CustomError) {
                return ApiResponse.error(res, error.statusCode, error.message);
            }

            return ApiResponse.error(res, 500, "Erreur interne du serveur");
        }
    }

    /**
     * Récupère les analytics des produits
     */
    public static async getProductAnalytics(req: AuthRequest, res: Response) {
        try {
            if (!req.user?.company_id) {
                return ApiResponse.error(res, 400, "ID d'entreprise requis");
            }

            const {
                page = 1,
                limit = 10,
                sortBy = "totalRevenue",
                sortOrder = "desc",
            } = req.query;

            logger.info(
                {
                    userId: req.user.id,
                    companyId: req.user.company_id,
                    page,
                    limit,
                    sortBy,
                    sortOrder,
                },
                "Demande d'analytics produits"
            );

            // Placeholder - à implémenter
            const analytics = {
                data: [],
                total: 0,
                page: Number(page),
                pageSize: Number(limit),
                totalPages: 0,
                hasNextPage: false,
                hasPreviousPage: false,
            };

            return ApiResponse.paginated(
                res,
                analytics.data,
                analytics.total,
                analytics.page,
                analytics.pageSize,
                "Analytics produits récupérées avec succès"
            );
        } catch (error) {
            logger.error(
                {
                    error,
                    userId: req.user?.id,
                    companyId: req.user?.company_id,
                },
                "Erreur lors de la récupération des analytics produits"
            );

            if (error instanceof CustomError) {
                return ApiResponse.error(res, error.statusCode, error.message);
            }

            return ApiResponse.error(res, 500, "Erreur interne du serveur");
        }
    }

    /**
     * Génère un rapport personnalisé
     */
    public static async generateReport(req: AuthRequest, res: Response) {
        try {
            if (!req.user?.company_id) {
                return ApiResponse.error(res, 400, "ID d'entreprise requis");
            }

            const {
                reportType,
                period,
                format = "JSON",
                filters = {},
            } = req.body;

            if (!reportType || !period) {
                return ApiResponse.error(
                    res,
                    400,
                    "Type de rapport et période requis"
                );
            }

            logger.info(
                {
                    userId: req.user.id,
                    companyId: req.user.company_id,
                    reportType,
                    period,
                    format,
                },
                "Demande de génération de rapport"
            );

            // Placeholder - à implémenter avec service de génération de rapports
            const reportId = `report_${Date.now()}`;

            const report = {
                id: reportId,
                status: "pending",
                type: reportType,
                format,
                createdAt: new Date(),
                estimatedCompletion: new Date(Date.now() + 30000), // 30 secondes
            };

            return ApiResponse.success(
                res,
                202,
                "Rapport en cours de génération",
                report
            );
        } catch (error) {
            logger.error(
                {
                    error,
                    userId: req.user?.id,
                    companyId: req.user?.company_id,
                },
                "Erreur lors de la génération du rapport"
            );

            if (error instanceof CustomError) {
                return ApiResponse.error(res, error.statusCode, error.message);
            }

            return ApiResponse.error(res, 500, "Erreur interne du serveur");
        }
    }

    /**
     * Récupère le statut d'un rapport
     */
    public static async getReportStatus(req: AuthRequest, res: Response) {
        try {
            const { reportId } = req.params;

            if (!reportId) {
                return ApiResponse.error(res, 400, "ID de rapport requis");
            }

            logger.info(
                { userId: req.user?.id, reportId },
                "Demande de statut de rapport"
            );

            // Placeholder - à implémenter
            const report = {
                id: reportId,
                status: "completed",
                downloadUrl: `/api/metrics/reports/${reportId}/download`,
                generatedAt: new Date(),
                fileSize: 1024,
            };

            return ApiResponse.success(
                res,
                200,
                "Statut du rapport récupéré avec succès",
                report
            );
        } catch (error) {
            logger.error(
                { error, userId: req.user?.id, reportId: req.params.reportId },
                "Erreur lors de la récupération du statut du rapport"
            );

            if (error instanceof CustomError) {
                return ApiResponse.error(res, error.statusCode, error.message);
            }

            return ApiResponse.error(res, 500, "Erreur interne du serveur");
        }
    }
}
