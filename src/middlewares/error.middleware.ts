import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/customError";
import { ApiResponse } from "../utils/apiResponse";
import logger from "../utils/logger";

export const errorMiddleware = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.error(
        {
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
            },
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.get("user-agent"),
        },
        "Erreur capturée par le middleware"
    );

    // Erreurs personnalisées
    if (error instanceof CustomError) {
        return ApiResponse.error(res, error.statusCode, error.message);
    }

    // Erreurs Prisma
    if (error.name === "PrismaClientKnownRequestError") {
        const prismaError = error as any;

        switch (prismaError.code) {
            case "P2002":
                return ApiResponse.error(
                    res,
                    409,
                    "Violation de contrainte d'unicité"
                );
            case "P2025":
                return ApiResponse.error(res, 404, "Enregistrement non trouvé");
            case "P2003":
                return ApiResponse.error(
                    res,
                    400,
                    "Violation de contrainte de clé étrangère"
                );
            default:
                return ApiResponse.error(res, 500, "Erreur de base de données");
        }
    }

    // Erreurs de validation JSON
    if (error instanceof SyntaxError && "body" in error) {
        return ApiResponse.error(res, 400, "Format JSON invalide");
    }

    // Erreur générique
    return ApiResponse.error(
        res,
        500,
        process.env.NODE_ENV === "production"
            ? "Erreur interne du serveur"
            : error.message
    );
};
