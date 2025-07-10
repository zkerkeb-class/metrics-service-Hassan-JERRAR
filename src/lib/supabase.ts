import { createClient, SupabaseClient } from "@supabase/supabase-js";
import logger from "../utils/logger";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    logger.error("❌ Variables d'environnement Supabase manquantes");
    process.exit(1);
}

// Création du client Supabase
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Test de connectivité Supabase
export async function testSupabaseConnection(): Promise<boolean> {
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            logger.warn({ error }, "⚠️ Erreur lors du test Supabase");
            return false;
        }
        logger.info("✅ Connexion Supabase active");
        return true;
    } catch (error) {
        logger.error({ error }, "❌ Test de connectivité Supabase échoué");
        return false;
    }
}

// Fonction utilitaire pour vérifier un token JWT
export async function verifyJWT(token: string): Promise<any> {
    try {
        const { data: user, error } = await supabase.auth.getUser(token);

        if (error) {
            logger.warn({ error }, "Token JWT invalide");
            return null;
        }

        return user;
    } catch (error) {
        logger.error({ error }, "Erreur lors de la vérification du JWT");
        return null;
    }
}

// Fonction pour récupérer les informations utilisateur
export async function getUserFromToken(token: string): Promise<any> {
    try {
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser(token);

        if (error || !user) {
            logger.warn({ error }, "Utilisateur non trouvé");
            return null;
        }

        return user;
    } catch (error) {
        logger.error({ error }, "Erreur lors de la récupération utilisateur");
        return null;
    }
}

logger.info("✅ Client Supabase initialisé");

export default supabase;
