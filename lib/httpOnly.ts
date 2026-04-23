/**
 * Fichier de configuration pour les cookies HTTP Only
 * Utilisé pour stocker les tokens d'authentification de manière sécurisée
 * Les cookies HTTP Only ne sont pas accessibles via JavaScript côté client,
 * ce qui les rend plus sûrs contre les attaques XSS
 */

// Importation de la fonction cookies de Next.js pour gérer les cookies dans les routes API
import { cookies } from 'next/headers';

// Configuration du cookie HTTP Only pour stocker le token d'authentification
export const httpOnlyCookie = {
    name: 'authToken',
    options: {
        httpOnly: true,// Le cookie est accessible uniquement via HTTP (non accessible via JavaScript)
        sameSite: 'strict' as const, // Le "as const" aide TypeScript à être précis
        maxAge: 60 * 60, // 1 heure
    }
}

// Fonctions définir le cookie d'authentification
export async function setAuthCookie(token: string) {
    const cookieStore = await cookies();

    cookieStore.set(httpOnlyCookie.name, token, {
        ...httpOnlyCookie.options,
        // Le cookie est sécurisé (transmis uniquement via HTTPS) en production, mais pas en développement pour faciliter les tests
        secure: process.env.APP_ENV === 'prod',
    });
}
// Fonction pour supprimer le cookie d'authentification
export async function deleteAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(httpOnlyCookie.name);
}
// Fonction pour récupérer le token d'authentification depuis le cookie HTTP Only
export async function getAuthToken() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(httpOnlyCookie.name);
    return cookie ? cookie.value : null;
}