import { PrismaClient } from "@prisma/client";
import logger from "../utils/logger";

const prisma = new PrismaClient({
    log: [
        {
            emit: "event",
            level: "query",
        },
        {
            emit: "event",
            level: "error",
        },
        {
            emit: "event",
            level: "info",
        },
        {
            emit: "event",
            level: "warn",
        },
    ],
});

// Logging des requêtes en développement
if (process.env.NODE_ENV !== "production") {
    prisma.$on("query", (e) => {
        logger.debug(
            {
                query: e.query,
                params: e.params,
                duration: `${e.duration}ms`,
            },
            "Prisma Query"
        );
    });
}

// Logging des erreurs
prisma.$on("error", (e) => {
    logger.error(
        {
            target: e.target,
            message: e.message,
        },
        "Prisma Error"
    );
});

// Logging des infos
prisma.$on("info", (e) => {
    logger.info(
        {
            target: e.target,
            message: e.message,
        },
        "Prisma Info"
    );
});

// Logging des warnings
prisma.$on("warn", (e) => {
    logger.warn(
        {
            target: e.target,
            message: e.message,
        },
        "Prisma Warning"
    );
});

// Connexion à la base de données
async function connectDB() {
    try {
        await prisma.$connect();
        logger.info("✅ Connexion à la base de données réussie");
    } catch (error) {
        logger.error({ error }, "❌ Erreur de connexion à la base de données");
        process.exit(1);
    }
}

// Déconnexion de la base de données
async function disconnectDB() {
    try {
        await prisma.$disconnect();
        logger.info("✅ Déconnexion de la base de données réussie");
    } catch (error) {
        logger.error(
            { error },
            "❌ Erreur lors de la déconnexion de la base de données"
        );
    }
}

// Gestion des signaux de fermeture
process.on("SIGINT", async () => {
    await disconnectDB();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    await disconnectDB();
    process.exit(0);
});

export { connectDB, disconnectDB };
export default prisma;
