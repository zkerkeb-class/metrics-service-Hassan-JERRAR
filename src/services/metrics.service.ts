import prisma from "../lib/prisma";
import { CacheService } from "../lib/redis";
import logger from "../utils/logger";
import {
    IDashboardMetrics,
    ITopCustomer,
    IInvoiceStatusCount,
    IQuoteStatusCount,
    IRevenueAnalytics,
    ICustomerAnalytics,
    IProductAnalytics,
    IKPISnapshot,
    IPeriodComparison,
    IMetricsFilter,
    IPaginatedMetrics,
} from "../interfaces/metrics.interface";
import { CustomError, NotFoundError } from "../utils/customError";
import {
    startOfMonth,
    endOfMonth,
    startOfYear,
    endOfYear,
    startOfDay,
    endOfDay,
    subMonths,
    subYears,
} from "date-fns";

export class MetricsService {
    private static readonly CACHE_TTL = 1800; // 30 minutes

    /**
     * Récupère les métriques du dashboard pour une entreprise
     */
    public static async getDashboardMetrics(
        companyId: string
    ): Promise<IDashboardMetrics> {
        const cacheKey = CacheService.generateKey("dashboard", companyId);

        try {
            // Vérifier le cache
            const cached = await CacheService.get(cacheKey);
            if (cached) {
                logger.info(
                    { companyId },
                    "Métriques dashboard récupérées depuis le cache"
                );
                return cached;
            }

            logger.info({ companyId }, "Calcul des métriques dashboard");

            const [
                monthlyRevenue,
                yearlyRevenue,
                pendingInvoices,
                overdueInvoices,
                topCustomers,
                invoiceStatusDistribution,
                monthlyQuotes,
                yearlyQuotes,
                pendingQuotes,
                acceptedQuotes,
                quoteStatusDistribution,
                quoteToInvoiceRatio,
                averagePaymentDelay,
                totalCustomers,
                newCustomersThisMonth,
                growthRate,
            ] = await Promise.all([
                this.getMonthlyRevenue(companyId),
                this.getYearlyRevenue(companyId),
                this.getPendingInvoices(companyId),
                this.getOverdueInvoices(companyId),
                this.getTopCustomers(companyId),
                this.getInvoiceStatusDistribution(companyId),
                this.getMonthlyQuotes(companyId),
                this.getYearlyQuotes(companyId),
                this.getPendingQuotes(companyId),
                this.getAcceptedQuotes(companyId),
                this.getQuoteStatusDistribution(companyId),
                this.getQuoteToInvoiceRatio(companyId),
                this.getAveragePaymentDelay(companyId),
                this.getTotalCustomers(companyId),
                this.getNewCustomersThisMonth(companyId),
                this.getGrowthRate(companyId),
            ]);

            const metrics: IDashboardMetrics = {
                monthlyRevenue,
                yearlyRevenue,
                pendingInvoices,
                overdueInvoices,
                topCustomers,
                invoiceStatusDistribution,
                monthlyQuotes,
                yearlyQuotes,
                pendingQuotes,
                acceptedQuotes,
                quoteStatusDistribution,
                quoteToInvoiceRatio,
                averagePaymentDelay,
                totalCustomers,
                newCustomersThisMonth,
                growthRate,
            };

            // Mettre en cache
            await CacheService.set(cacheKey, metrics, this.CACHE_TTL);

            return metrics;
        } catch (error) {
            logger.error(
                { error, companyId },
                "Erreur lors de la récupération des métriques dashboard"
            );
            throw new CustomError(
                "Erreur lors de la récupération des métriques",
                500
            );
        }
    }

    /**
     * Calcule le revenu mensuel
     */
    private static async getMonthlyRevenue(companyId: string): Promise<number> {
        const startDate = startOfMonth(new Date());
        const endDate = endOfMonth(new Date());

        const revenue = await prisma.invoice.aggregate({
            where: {
                company_id: companyId,
                invoice_date: {
                    gte: startDate,
                    lte: endDate,
                },
                status: "paid",
            },
            _sum: {
                amount_including_tax: true,
            },
        });

        return Number(revenue._sum?.amount_including_tax || 0);
    }

    /**
     * Calcule le revenu annuel
     */
    private static async getYearlyRevenue(companyId: string): Promise<number> {
        const startDate = startOfYear(new Date());
        const endDate = endOfYear(new Date());

        const revenue = await prisma.invoice.aggregate({
            where: {
                company_id: companyId,
                invoice_date: {
                    gte: startDate,
                    lte: endDate,
                },
                status: "paid",
            },
            _sum: {
                amount_including_tax: true,
            },
        });

        return Number(revenue._sum?.amount_including_tax || 0);
    }

    /**
     * Récupère le nombre de factures en attente
     */
    private static async getPendingInvoices(
        companyId: string
    ): Promise<number> {
        return await prisma.invoice.count({
            where: {
                company_id: companyId,
                status: "pending",
            },
        });
    }

    /**
     * Récupère le nombre de factures en retard
     */
    private static async getOverdueInvoices(
        companyId: string
    ): Promise<number> {
        return await prisma.invoice.count({
            where: {
                company_id: companyId,
                status: "late",
            },
        });
    }

    /**
     * Récupère les top clients
     */
    private static async getTopCustomers(
        companyId: string,
        limit: number = 5
    ): Promise<ITopCustomer[]> {
        const topCustomers = await prisma.customer.findMany({
            where: {
                company_id: companyId,
            },
            select: {
                customer_id: true,
                type: true,
                individual: {
                    select: {
                        first_name: true,
                        last_name: true,
                    },
                },
                business: {
                    select: {
                        name: true,
                    },
                },
                invoices: {
                    where: {
                        status: "paid",
                    },
                    select: {
                        amount_including_tax: true,
                    },
                },
            },
            take: limit,
        });

        return topCustomers
            .map((customer) => ({
                customer_id: customer.customer_id,
                name:
                    customer.type === "individual"
                        ? `${customer.individual?.first_name} ${customer.individual?.last_name}`
                        : customer.business?.name || "N/A",
                total_amount: customer.invoices.reduce(
                    (sum, invoice) =>
                        sum + Number(invoice.amount_including_tax),
                    0
                ),
                invoice_count: customer.invoices.length,
                type: customer.type as "individual" | "company",
            }))
            .sort((a, b) => b.total_amount - a.total_amount)
            .slice(0, limit);
    }

    /**
     * Récupère la distribution des statuts de factures
     */
    private static async getInvoiceStatusDistribution(
        companyId: string
    ): Promise<IInvoiceStatusCount[]> {
        const distribution = await prisma.invoice.groupBy({
            by: ["status"],
            where: {
                company_id: companyId,
            },
            _count: true,
        });

        const statusCounts: Record<string, number> = {
            pending: 0,
            sent: 0,
            paid: 0,
            cancelled: 0,
            late: 0,
        };

        distribution.forEach((item) => {
            statusCounts[item.status] = item._count;
        });

        return Object.entries(statusCounts).map(([status, count]) => ({
            status: status as any,
            _count: count,
        }));
    }

    /**
     * Récupère le nombre de devis du mois
     */
    private static async getMonthlyQuotes(companyId: string): Promise<number> {
        const startDate = startOfMonth(new Date());
        const endDate = endOfMonth(new Date());

        return await prisma.quote.count({
            where: {
                company_id: companyId,
                quote_date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });
    }

    /**
     * Récupère le nombre de devis de l'année
     */
    private static async getYearlyQuotes(companyId: string): Promise<number> {
        const startDate = startOfYear(new Date());
        const endDate = endOfYear(new Date());

        return await prisma.quote.count({
            where: {
                company_id: companyId,
                quote_date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });
    }

    /**
     * Récupère le nombre de devis en attente
     */
    private static async getPendingQuotes(companyId: string): Promise<number> {
        return await prisma.quote.count({
            where: {
                company_id: companyId,
                status: "sent",
            },
        });
    }

    /**
     * Récupère le nombre de devis acceptés
     */
    private static async getAcceptedQuotes(companyId: string): Promise<number> {
        return await prisma.quote.count({
            where: {
                company_id: companyId,
                status: "accepted",
            },
        });
    }

    /**
     * Récupère la distribution des statuts de devis
     */
    private static async getQuoteStatusDistribution(
        companyId: string
    ): Promise<IQuoteStatusCount[]> {
        const distribution = await prisma.quote.groupBy({
            by: ["status"],
            where: {
                company_id: companyId,
            },
            _count: true,
        });

        const statusCounts: Record<string, number> = {
            draft: 0,
            sent: 0,
            accepted: 0,
            rejected: 0,
            expired: 0,
        };

        distribution.forEach((item) => {
            statusCounts[item.status] = item._count;
        });

        return Object.entries(statusCounts).map(([status, count]) => ({
            status: status as any,
            _count: count,
        }));
    }

    /**
     * Calcule le ratio devis vers facture
     */
    private static async getQuoteToInvoiceRatio(
        companyId: string
    ): Promise<number> {
        const [quotes, invoices] = await Promise.all([
            prisma.quote.count({
                where: {
                    company_id: companyId,
                    status: "accepted",
                },
            }),
            prisma.invoice.count({
                where: {
                    company_id: companyId,
                },
            }),
        ]);

        return quotes > 0 ? Number((invoices / quotes).toFixed(2)) : 0;
    }

    /**
     * Calcule le délai moyen de paiement
     */
    private static async getAveragePaymentDelay(
        companyId: string
    ): Promise<number> {
        const paidInvoices = await prisma.invoice.findMany({
            where: {
                company_id: companyId,
                status: "paid",
            },
            include: {
                payments: true,
            },
        });

        if (paidInvoices.length === 0) return 0;

        const delays = paidInvoices
            .filter((invoice) => invoice.payments.length > 0)
            .map((invoice) => {
                const firstPayment = invoice.payments[0];
                const invoiceDate = new Date(invoice.invoice_date);
                const paymentDate = new Date(firstPayment.payment_date);
                return Math.ceil(
                    (paymentDate.getTime() - invoiceDate.getTime()) /
                        (1000 * 60 * 60 * 24)
                );
            });

        return delays.length > 0
            ? Math.round(
                  delays.reduce((sum, delay) => sum + delay, 0) / delays.length
              )
            : 0;
    }

    /**
     * Récupère le nombre total de clients
     */
    private static async getTotalCustomers(companyId: string): Promise<number> {
        return await prisma.customer.count({
            where: {
                company_id: companyId,
            },
        });
    }

    /**
     * Récupère le nombre de nouveaux clients ce mois
     */
    private static async getNewCustomersThisMonth(
        companyId: string
    ): Promise<number> {
        const startDate = startOfMonth(new Date());
        const endDate = endOfMonth(new Date());

        return await prisma.customer.count({
            where: {
                company_id: companyId,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });
    }

    /**
     * Calcule le taux de croissance du revenu
     */
    private static async getGrowthRate(companyId: string): Promise<number> {
        const currentMonth = await this.getMonthlyRevenue(companyId);

        const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
        const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));

        const lastMonth = await prisma.invoice.aggregate({
            where: {
                company_id: companyId,
                invoice_date: {
                    gte: lastMonthStart,
                    lte: lastMonthEnd,
                },
                status: "paid",
            },
            _sum: {
                amount_including_tax: true,
            },
        });

        const lastMonthRevenue = Number(
            lastMonth._sum?.amount_including_tax || 0
        );

        if (lastMonthRevenue === 0) return 0;

        return Number(
            (
                ((currentMonth - lastMonthRevenue) / lastMonthRevenue) *
                100
            ).toFixed(2)
        );
    }

    /**
     * Analyse des revenus par période
     */
    public static async getRevenueAnalytics(
        companyId: string,
        period: "daily" | "weekly" | "monthly" | "yearly" = "monthly",
        startDate?: Date,
        endDate?: Date
    ): Promise<IRevenueAnalytics[]> {
        const cacheKey = CacheService.generateKey(
            "revenue",
            companyId,
            period,
            startDate?.toISOString() || "null",
            endDate?.toISOString() || "null"
        );

        try {
            const cached = await CacheService.get(cacheKey);
            if (cached) {
                return cached;
            }

            logger.info({ companyId, period }, "Calcul analytics revenus");

            // Logique d'agrégation selon la période
            // Cette partie sera étendue selon les besoins spécifiques

            const analytics: IRevenueAnalytics[] = [];

            await CacheService.set(cacheKey, analytics, this.CACHE_TTL);
            return analytics;
        } catch (error) {
            logger.error({ error, companyId }, "Erreur analytics revenus");
            throw new CustomError("Erreur lors de l'analyse des revenus", 500);
        }
    }

    /**
     * Invalide le cache pour une entreprise
     */
    public static async invalidateCache(companyId: string): Promise<void> {
        try {
            const pattern = CacheService.generateKey("*", companyId, "*");
            await CacheService.clear(pattern);
            logger.info({ companyId }, "Cache invalidé pour l'entreprise");
        } catch (error) {
            logger.error(
                { error, companyId },
                "Erreur lors de l'invalidation du cache"
            );
        }
    }

    /**
     * Vérifie la santé du service
     */
    public static async healthCheck(): Promise<{
        status: string;
        timestamp: Date;
    }> {
        try {
            // Test de connectivité base de données
            await prisma.$queryRaw`SELECT 1`;

            return {
                status: "healthy",
                timestamp: new Date(),
            };
        } catch (error) {
            logger.error({ error }, "Health check failed");
            throw new CustomError("Service unhealthy", 500);
        }
    }
}
