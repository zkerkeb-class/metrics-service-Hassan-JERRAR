import { Response } from "express";

export class ApiResponse {
    static success(
        res: Response,
        statusCode: number = 200,
        message: string = "Succès",
        data?: any,
        meta?: any
    ) {
        const response: any = {
            success: true,
            statusCode,
            message,
        };

        if (data !== undefined) {
            response.data = data;
        }

        if (meta !== undefined) {
            response.meta = meta;
        }

        return res.status(statusCode).json(response);
    }

    static error(
        res: Response,
        statusCode: number = 500,
        message: string = "Erreur",
        error?: any,
        errors?: any[]
    ) {
        const response: any = {
            success: false,
            statusCode,
            message,
        };

        if (error !== undefined) {
            response.error = error;
        }

        if (errors !== undefined) {
            response.errors = errors;
        }

        return res.status(statusCode).json(response);
    }

    static paginated(
        res: Response,
        data: any[],
        total: number,
        page: number,
        pageSize: number,
        message: string = "Données récupérées avec succès"
    ) {
        const totalPages = Math.ceil(total / pageSize);

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message,
            data,
            meta: {
                total,
                page,
                pageSize,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        });
    }
}
