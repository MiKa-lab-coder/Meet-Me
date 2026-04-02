/**
 * Fichier gendarme l'accès à la page share-location qui est accessible uniquement pour les utilisateurs connectés
 * et qui redirige les utilisateurs non connectés vers la page de connexion
 */

import {NextResponse} from "next/server";
import type { NextRequest } from 'next/server';
import {getAuthToken} from "@/lib/httpOnly";
import {verifyToken} from "@/lib/auth";

export async function middleware(request: NextRequest) {
    // Utilisation de request.nextUrl
    const magicToken = request.nextUrl.searchParams.get('magicToken');

    // Si un magicToken est présent, on laisse passer l'utilisateur.
    if (magicToken) {
        return NextResponse.next();
    }

    // Vérification du cookie de session
    const token = await getAuthToken();

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        await verifyToken(token);
        return NextResponse.next();
    } catch (error) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

export const config = {
    matcher: '/share-location/:path*'
};