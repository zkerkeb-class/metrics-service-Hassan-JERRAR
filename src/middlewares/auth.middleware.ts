import { Request, Response, NextFunction } from "express";
import { getUserFromToken } from "../lib/supabase";
import { ApiResponse } from "../utils/apiResponse";
import { AuthRequest } from "../interfaces/auth.interface";
import logger from "../utils/logger";
import prisma from "../lib/prisma";

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Récupération du token depuis l'en-tête Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            logger.warn(
                { ip: req.ip },
                "Tentative d'accès sans token d'authentification"
            );
            ApiResponse.error(res, 401, "Token d'authentification requis");
            return;
        }

        // Extraction du token (format: "Bearer TOKEN")
        const token = authHeader.split(" ")[1];

        if (!token) {
            logger.warn({ ip: req.ip }, "Format de token invalide");
            ApiResponse.error(res, 401, "Format de token invalide");
            return;
        }

        // Vérification du token avec Supabase
        const supabaseUser = await getUserFromToken(token);

        if (!supabaseUser) {
            logger.warn(
                { ip: req.ip, token: token.substring(0, 20) + "..." },
                "Token invalide ou expiré"
            );
            ApiResponse.error(res, 401, "Token invalide ou expiré");
            return;
        }

        // Récupération des informations utilisateur depuis la base de données
        const user = await prisma.user.findUnique({
            where: { id: supabaseUser.id },
            include: {
                Company: true,
            },
        });

        if (!user) {
            logger.warn(
                { userId: supabaseUser.id },
                "Utilisateur non trouvé en base de données"
            );
            ApiResponse.error(res, 404, "Utilisateur non trouvé");
            return;
        }

        // Ajout des informations utilisateur à la requête
        req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            company_id: user.company_id || undefined,
            first_name: user.first_name,
            last_name: user.last_name,
            stripe_account_id: user.stripe_account_id || undefined,
            stripe_onboarded: user.stripe_onboarded,
            onboarding_completed: user.onboarding_completed,
        };

        logger.info(
            {
                userId: user.id,
                email: user.email,
                companyId: user.company_id,
                ip: req.ip,
            },
            "Utilisateur authentifié avec succès"
        );

        next();
    } catch (error) {
        logger.error(
            { error, ip: req.ip },
            "Erreur lors de l'authentification"
        );
        ApiResponse.error(res, 500, "Erreur interne du serveur");
        return;
    }
};
