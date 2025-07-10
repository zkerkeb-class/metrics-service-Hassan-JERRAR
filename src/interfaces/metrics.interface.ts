export interface IDashboardMetrics {
    monthlyRevenue: number;
    yearlyRevenue: number;
    pendingInvoices: number;
    overdueInvoices: number;
    topCustomers: ITopCustomer[];
    invoiceStatusDistribution: IInvoiceStatusCount[];
    monthlyQuotes: number;
    yearlyQuotes: number;
    pendingQuotes: number;
    acceptedQuotes: number;
    quoteStatusDistribution: IQuoteStatusCount[];
    quoteToInvoiceRatio: number;
    averagePaymentDelay: number;
    totalCustomers: number;
    newCustomersThisMonth: number;
    growthRate: number;
}

export interface ITopCustomer {
    customer_id: string;
    name: string;
    total_amount: number;
    invoice_count: number;
    type: "individual" | "company";
}

export interface IInvoiceStatusCount {
    status: "pending" | "sent" | "paid" | "cancelled" | "late";
    _count: number;
}

export interface IQuoteStatusCount {
    status: "draft" | "sent" | "accepted" | "rejected" | "expired";
    _count: number;
}

export interface IRevenueAnalytics {
    period: string;
    revenue: number;
    invoiceCount: number;
    avgInvoiceAmount: number;
    growthRate: number;
    cumulativeRevenue: number;
}

export interface ICustomerAnalytics {
    customer_id: string;
    name: string;
    type: "individual" | "company";
    lifetimeValue: number;
    totalInvoices: number;
    totalQuotes: number;
    averageInvoiceAmount: number;
    lastInvoiceDate?: Date;
    lastPaymentDate?: Date;
    averagePaymentDelay: number;
    riskScore: number;
    acquisitionDate: Date;
    churnProbability: number;
}

export interface IProductAnalytics {
    product_id: string;
    name: string;
    totalRevenue: number;
    quantitySold: number;
    timesQuoted: number;
    timesInvoiced: number;
    conversionRate: number;
    averageSellingPrice: number;
    profitMargin: number;
    trend: "up" | "down" | "stable";
}

export interface IKPISnapshot {
    date: Date;
    monthlyRevenue: number;
    yearlyRevenue: number;
    mrr?: number; // Monthly Recurring Revenue
    arr?: number; // Annual Recurring Revenue
    churnRate?: number;
    customerLifetimeValue?: number;
    acquisitionCost?: number;
    profitMargin?: number;
    cashFlow?: number;
    growthRate?: number;
}

export interface IActivityMetrics {
    user_id: string;
    userName: string;
    company_id: string;
    period: string;
    actionsCount: number;
    invoicesCreated: number;
    quotesCreated: number;
    revenueGenerated: number;
    customersAcquired: number;
    loginCount: number;
    lastActivity?: Date;
    productivityScore: number;
    topActions: IActivityAction[];
}

export interface IActivityAction {
    action: string;
    count: number;
    percentage: number;
}

export interface ICompanyMetrics {
    company_id: string;
    companyName: string;
    period: {
        start: Date;
        end: Date;
        type: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
    };
    financial: {
        revenue: number;
        profit: number;
        margin: number;
        growth: number;
        cashFlow: number;
    };
    sales: {
        invoicesCount: number;
        quotesCount: number;
        avgInvoiceAmount: number;
        avgQuoteAmount: number;
        conversionRate: number;
    };
    customers: {
        total: number;
        new: number;
        active: number;
        churnRate: number;
        lifetimeValue: number;
    };
    performance: {
        avgPaymentDelay: number;
        overdueRate: number;
        quotationSuccessRate: number;
        customerSatisfaction?: number;
    };
}

export interface IMetricAlert {
    id: string;
    company_id: string;
    name: string;
    metricType: string;
    condition:
        | "greater_than"
        | "less_than"
        | "equals"
        | "percentage_change_up"
        | "percentage_change_down";
    thresholdValue: number;
    currentValue: number;
    isTriggered: boolean;
    lastTriggered?: Date;
    notificationEmails: string[];
    isActive: boolean;
}

export interface IReportRequest {
    company_id: string;
    name: string;
    type:
        | "revenue_report"
        | "customer_report"
        | "product_report"
        | "tax_report"
        | "payment_report"
        | "activity_report"
        | "kpi_dashboard"
        | "custom_report";
    periodStart: Date;
    periodEnd: Date;
    format: "JSON" | "CSV" | "PDF" | "XLSX";
    filters?: Record<string, any>;
    requestedBy: string;
}

export interface IReportResponse {
    id: string;
    status: "pending" | "processing" | "completed" | "failed" | "cancelled";
    downloadUrl?: string;
    generatedAt?: Date;
    fileSize?: number;
    data?: any;
    error?: string;
}

export interface IPeriodComparison {
    current: {
        period: string;
        value: number;
    };
    previous: {
        period: string;
        value: number;
    };
    change: {
        absolute: number;
        percentage: number;
        trend: "up" | "down" | "stable";
    };
}

export interface IMetricsFilter {
    company_id?: string;
    user_id?: string;
    customer_id?: string;
    product_id?: string;
    period?: {
        start: Date;
        end: Date;
        type?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
    };
    status?: string[];
    categories?: string[];
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface IPaginatedMetrics<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface IChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string[];
        borderColor?: string[];
        borderWidth?: number;
        fill?: boolean;
        tension?: number;
    }[];
}

export interface IRealTimeMetrics {
    timestamp: Date;
    activeUsers: number;
    todayRevenue: number;
    pendingInvoices: number;
    recentActivities: IRecentActivity[];
    alerts: IMetricAlert[];
}

export interface IRecentActivity {
    id: string;
    user_id: string;
    userName: string;
    action: string;
    entityType: string;
    entityId: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

export interface IBenchmarkData {
    metric: string;
    companyValue: number;
    industryAverage: number;
    topQuartile: number;
    bottomQuartile: number;
    ranking: number;
    totalCompanies: number;
    trend: "improving" | "declining" | "stable";
}

export interface ICohortAnalysis {
    cohort: string; // période d'acquisition (ex: "2024-01")
    size: number; // nombre de clients dans la cohorte
    periods: {
        period: number; // mois depuis acquisition (0, 1, 2, ...)
        retentionRate: number;
        revenue: number;
        activeCustomers: number;
    }[];
}

export interface IForecastData {
    metric: string;
    historical: {
        period: string;
        value: number;
    }[];
    forecast: {
        period: string;
        value: number;
        confidence: {
            low: number;
            high: number;
        };
    }[];
    model: string; // nom du modèle utilisé
    accuracy: number; // précision du modèle
}

export interface IMetricsHealth {
    service: string;
    status: "healthy" | "warning" | "error";
    uptime: number;
    lastUpdate: Date;
    cacheHitRate: number;
    averageResponseTime: number;
    totalRequests: number;
    errorRate: number;
    connectedDatabases: {
        main: boolean;
        cache: boolean;
    };
}

export interface IAggregationConfig {
    metrics: string[];
    groupBy: string[];
    period: "hour" | "day" | "week" | "month" | "quarter" | "year";
    functions: ("sum" | "avg" | "count" | "min" | "max" | "distinct")[];
    filters?: Record<string, any>;
}

export interface IExportOptions {
    format: "CSV" | "XLSX" | "PDF" | "JSON";
    includeCharts: boolean;
    includeRawData: boolean;
    compression?: "none" | "zip" | "gzip";
    emailDelivery?: {
        recipients: string[];
        subject: string;
        message?: string;
    };
}
