/**
 * Méthode pour gérer la déconnexion de l'utilisateur.
 * Supprime le token d'authentification de l'utilisateur en supprimant le cookie HTTP Only et redirige vers la page d'accueil.
 * Cette route est appelée lorsque l'utilisateur clique sur le bouton de déconnexion dans le composant Header.
 */

import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {deleteAuthCookie} from "@/lib/httpOnly";

// Route pour gérer la déconnexion de l'utilisateur
export async function POST() {
    // Supprimer le token d'authentification de l'utilisateur en supprimant le cookie HTTP Only
    await deleteAuthCookie();
}