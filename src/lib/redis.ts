import Redis from "ioredis";
import logger from "../utils/logger";

// Configuration Redis principale pour le cache
const redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || "0"),
    retryDelayOnFailover: 100,
    enableReadyCheck: true,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
});

// Configuration Redis pour les files d'attente Bull
const redisQueue = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_QUEUE_DB || "1"),
    retryDelayOnFailover: 100,
    enableReadyCheck: true,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
});

// Gestion des événements Redis principal
redis.on("connect", () => {
    logger.info("✅ Connexion Redis (cache) établie");
});

redis.on("ready", () => {
    logger.info("✅ Redis (cache) prêt");
});

redis.on("error", (error) => {
    logger.error({ error }, "❌ Erreur Redis (cache)");
});

redis.on("close", () => {
    logger.warn("⚠️ Connexion Redis (cache) fermée");
});

redis.on("reconnecting", () => {
    logger.info("🔄 Reconnexion Redis (cache) en cours...");
});

// Gestion des événements Redis queue
redisQueue.on("connect", () => {
    logger.info("✅ Connexion Redis (queue) établie");
});

redisQueue.on("ready", () => {
    logger.info("✅ Redis (queue) prêt");
});

redisQueue.on("error", (error) => {
    logger.error({ error }, "❌ Erreur Redis (queue)");
});

redisQueue.on("close", () => {
    logger.warn("⚠️ Connexion Redis (queue) fermée");
});

redisQueue.on("reconnecting", () => {
    logger.info("🔄 Reconnexion Redis (queue) en cours...");
});

// Classe utilitaire pour le cache
export class CacheService {
    private static readonly DEFAULT_TTL = 3600; // 1 heure en secondes

    static async get(key: string): Promise<any> {
        try {
            const cached = await redis.get(key);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            logger.error(
                { error, key },
                "Erreur lors de la récupération du cache"
            );
            return null;
        }
    }

    static async set(
        key: string,
        value: any,
        ttl: number = this.DEFAULT_TTL
    ): Promise<boolean> {
        try {
            await redis.setex(key, ttl, JSON.stringify(value));
            return true;
        } catch (error) {
            logger.error({ error, key }, "Erreur lors de la mise en cache");
            return false;
        }
    }

    static async del(key: string): Promise<boolean> {
        try {
            await redis.del(key);
            return true;
        } catch (error) {
            logger.error(
                { error, key },
                "Erreur lors de la suppression du cache"
            );
            return false;
        }
    }

    static async exists(key: string): Promise<boolean> {
        try {
            const result = await redis.exists(key);
            return result === 1;
        } catch (error) {
            logger.error(
                { error, key },
                "Erreur lors de la vérification du cache"
            );
            return false;
        }
    }

    static async clear(pattern: string = "*"): Promise<number> {
        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                return await redis.del(...keys);
            }
            return 0;
        } catch (error) {
            logger.error(
                { error, pattern },
                "Erreur lors du nettoyage du cache"
            );
            return 0;
        }
    }

    static async ttl(key: string): Promise<number> {
        try {
            return await redis.ttl(key);
        } catch (error) {
            logger.error(
                { error, key },
                "Erreur lors de la récupération du TTL"
            );
            return -1;
        }
    }

    static async increment(
        key: string,
        increment: number = 1
    ): Promise<number> {
        try {
            return await redis.incrby(key, increment);
        } catch (error) {
            logger.error({ error, key }, "Erreur lors de l'incrémentation");
            return 0;
        }
    }

    static generateKey(prefix: string, ...parts: string[]): string {
        return `metrics:${prefix}:${parts.join(":")}`;
    }
}

// Fonction de test de connectivité
export async function testRedisConnection(): Promise<boolean> {
    try {
        await redis.ping();
        await redisQueue.ping();
        logger.info("✅ Test de connectivité Redis réussi");
        return true;
    } catch (error) {
        logger.error({ error }, "❌ Test de connectivité Redis échoué");
        return false;
    }
}

// Connexion initiale
export async function connectRedis(): Promise<void> {
    try {
        await redis.connect();
        await redisQueue.connect();
        logger.info("✅ Connexions Redis établies");
    } catch (error) {
        logger.error({ error }, "❌ Erreur lors de la connexion Redis");
        throw error;
    }
}

// Fermeture des connexions
export async function disconnectRedis(): Promise<void> {
    try {
        await redis.disconnect();
        await redisQueue.disconnect();
        logger.info("✅ Connexions Redis fermées");
    } catch (error) {
        logger.error({ error }, "❌ Erreur lors de la fermeture Redis");
    }
}

// Gestion des signaux de fermeture
process.on("SIGINT", disconnectRedis);
process.on("SIGTERM", disconnectRedis);

export { redis, redisQueue };
export default redis;
