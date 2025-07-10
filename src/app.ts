import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

// Chargement des variables d'environnement
dotenv.config();

// Imports des modules locaux
import logger from "./utils/logger";
import routes from "./routes";
import { loggerMiddleware } from "./middlewares/logger.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";
import { connectDB } from "./lib/prisma";
import { connectRedis, testRedisConnection } from "./lib/redis";
import { testSupabaseConnection } from "./lib/supabase";

// Création de l'application Express
const app = express();

// Configuration du port
const PORT = process.env.PORT || 3003;

// Middlewares de sécurité
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    })
);

// Configuration CORS
app.use(
    cors({
        origin: process.env.CORS_ORIGIN?.split(",") || [
            "http://localhost:3000",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "x-requested-with"],
    })
);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === "production" ? 100 : 1000, // 100 requests per 15 minutes in production
    message: {
        success: false,
        message: "Trop de requêtes, veuillez réessayer plus tard",
        statusCode: 429,
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use("/api/", limiter);

// Middleware de parsing JSON
app.use(
    express.json({
        limit: "10mb",
    })
);

// Middleware de parsing URL-encoded
app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb",
    })
);

// Middleware de logging des requêtes
app.use(loggerMiddleware);

// Trust proxy pour Nginx/Load Balancer
app.set("trust proxy", 1);

// Routes principales
app.use(routes);

// Middleware de gestion d'erreurs (doit être en dernier)
app.use(errorMiddleware);

// Gestion des routes non trouvées
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "Route non trouvée",
        statusCode: 404,
        path: req.originalUrl,
    });
});

// Fonction de démarrage du serveur
async function startServer() {
    try {
        logger.info("🚀 Démarrage du microservice de métriques...");

        // Connexion à la base de données
        logger.info("📊 Connexion à la base de données...");
        await connectDB();

        // Connexion à Redis
        logger.info("🔴 Connexion à Redis...");
        await connectRedis();
        await testRedisConnection();

        // Test de Supabase
        logger.info("🔐 Test de connexion Supabase...");
        await testSupabaseConnection();

        // Démarrage du serveur HTTP
        const server = app.listen(PORT, () => {
            logger.info(
                `✅ Microservice de métriques démarré sur le port ${PORT}`
            );
            logger.info(
                `🌐 Environnement: ${process.env.NODE_ENV || "development"}`
            );
            logger.info(`📍 URL: http://localhost:${PORT}`);
            logger.info(`📊 Health check: http://localhost:${PORT}/health`);
            logger.info(
                `📈 API Dashboard: http://localhost:${PORT}/api/metrics/dashboard`
            );
        });

        // Configuration du timeout
        server.timeout = 30000; // 30 secondes

        // Gestion gracieuse de l'arrêt
        const gracefulShutdown = (signal: string) => {
            logger.info(`📋 Signal ${signal} reçu, arrêt gracieux en cours...`);

            server.close((err) => {
                if (err) {
                    logger.error(
                        { error: err },
                        "❌ Erreur lors de la fermeture du serveur"
                    );
                    process.exit(1);
                }

                logger.info("✅ Serveur fermé avec succès");
                process.exit(0);
            });

            // Force l'arrêt après 30 secondes
            setTimeout(() => {
                logger.warn("⚠️ Arrêt forcé après timeout");
                process.exit(1);
            }, 30000);
        };

        // Gestion des signaux système
        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
        process.on("SIGINT", () => gracefulShutdown("SIGINT"));

        // Gestion des erreurs non capturées
        process.on("uncaughtException", (error) => {
            logger.error({ error }, "❌ Exception non capturée");
            process.exit(1);
        });

        process.on("unhandledRejection", (reason, promise) => {
            logger.error({ reason, promise }, "❌ Promesse rejetée non gérée");
            process.exit(1);
        });
    } catch (error) {
        logger.error({ error }, "❌ Erreur lors du démarrage du serveur");
        process.exit(1);
    }
}

// Démarrage du serveur si ce fichier est exécuté directement
if (require.main === module) {
    startServer();
}

export default app;
