/**
 * Fichier gendarme l'accès à la page share-location qui est accessible uniquement pour les utilisateurs connectés
 * et qui redirige les utilisateurs non connectés vers la page de connexion
 */

import {NextResponse} from "next/server";
import {getAuthToken} from "@/lib/httpOnly";
import {verifyToken} from "@/lib/auth";

export async function middleware(request: Request) {
    // Vérification de l'existence d'un token d'authentification dans les cookies HTTP Only
    const token = await getAuthToken();
    // Si aucun token n'est trouvé, rediriger l'utilisateur vers la page de connexion
    if (!token) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    // Si un token est trouvé, permettre l'accès à la page demandée
    try {
        await verifyToken(token); // Vérification de la validité du token
        return NextResponse.next(); // Permettre l'accès à la page demandée
    } catch (error) {
        // Si le token est invalide, rediriger l'utilisateur vers la page de connexion
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }
}

// Spécification des routes pour lesquelles ce middleware doit être appliqué
export const config = {
    matcher: '/share-location:path' // Appliquer le middleware uniquement pour les routes commençant par /share-location
};