/**
 * Fichier qui s'assure que l'utilisateur est authentifié en vérifiant le token et sa validité.
 * Sinon, il retourne une réponse d'erreur indiquant que l'utilisateur n'est pas authentifié.
 */

import {getAuthToken} from "@/lib/httpOnly";
import {NextResponse} from "next/server";
import {verifyToken} from "@/lib/auth";

// Route pour vérifier l'authentification de l'utilisateur
export async function GET() {
    const token = await getAuthToken(); // Récupère le token d'authentification depuis les cookies

    if (!token) {
        // Si aucun token n'est trouvé, l'utilisateur n'est pas authentifié
        return NextResponse.json({error: "Utilisateur non authentifié"}, {status: 401});
    }

    try {
        // Vérifie la validité du token
        const userData = await verifyToken(token);
        // Si le token est valide, retourne les données de l'utilisateur
        return NextResponse.json({user: userData});
    } catch (error) {
        // Si le token est invalide ou expiré, retourne une réponse d'erreur
        return NextResponse.json({error: "Token invalide ou expiré"}, {status: 401});
    }
}
