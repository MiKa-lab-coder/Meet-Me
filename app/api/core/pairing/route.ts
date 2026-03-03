/**
 * Fichier de route pour la gestion des pairings entre les utilisateurs.
 * Ce fichier définit les endpoints pour créer, récupérer et supprimer les pairings.
 * Les pairings sont stockés dans une base de données MongoDB et sont associés à des utilisateurs via leurs IDs.
 */

import { NextResponse } from 'next/server';
import rules from '@/shared/rules.json';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getAuthToken } from "@/lib/httpOnly";
import { verifyToken } from "@/lib/auth";
import {error} from "next/dist/build/output/log";

// utilisateur A : initiateur du pairing
export async function POST(request: Request) {
    try {
        const token = await getAuthToken();
        if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

        // Vérification du token pour obtenir les données de l'utilisateur A
        const userA = await verifyToken(token);

        // Génération d'un code de pairing aléatoire et d'un magic token unique
        const pairingCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const magicToken = crypto.randomUUID();

        // Utilisation d'objets Date natifs pour la précision et MongoDB
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + 15 * 60000);

        // Connexion à la base de données MongoDB
        const client = await clientPromise;
        const db = client.db();

        const newPairing = await db.collection('pairings').insertOne({
            initiatorId: userA.userId, // Utilisation de l'ID réel du payload
            targetId: null,
            status: 'pending', // Statut initial conforme au contrat
            pairingCode,
            magicToken,
            expiresAt,
            createdAt,
        });

        return NextResponse.json({
            message: 'Pairing créé avec succès',
            pairing: {
                id: newPairing.insertedId,
                pairingCode,
                magicToken,
                expiresAt,
            },
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: 'Echec de la création du pairing' }, { status: 400 });
    }
}

// utilisateur B : celui qui valide le pairing
export async function PATCH(request: Request) {
    try {
        const data = await request.json();
        const { pairingCode, magicToken } = data;

        // Validation via rules.json
        const codePattern = rules.rules.pairing.pairingCode.pattern;
        if (!new RegExp(codePattern).test(pairingCode)) {
            return NextResponse.json({ error: rules.rules.pairing.pairingCode.error }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        // Recherche stricte : code + token + statut pending
        const pairing = await db.collection('pairings').findOne({
            pairingCode,
            magicToken,
            status: 'pending'
        });

        if (!pairing) {
            return NextResponse.json({ error: 'Pairing introuvable ou déjà activé' }, { status: 404 });
        }

        // Comparaison de dates native
        if (new Date() > pairing.expiresAt) {
            return NextResponse.json({ error: 'Le pairing a expiré' }, { status: 400 });
        }

        const token = await getAuthToken();
        if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        const userB = await verifyToken(token);

        // Mise à jour : passage en 'active' et ajout de l'ID de l'utilisateur B
        await db.collection('pairings').updateOne(
            { _id: pairing._id },
            {
                $set: {
                    targetId: userB.userId, // Utilisation de l'ID réel du payload
                    status: 'active', // Aligné sur pairing.json
                    validatedAt: new Date()
                }
            }
        );

        return NextResponse.json({
            message: 'Pairing validé avec succès',
            pairing: {
                id: pairing._id,
                status: 'active',
                pairingCode: pairing.pairingCode
            },
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: 'Erreur technique lors de la validation' }, { status: 500 });
    }
}

// Endpoint pour récupérer les détails d'un pairing via le code et le token,
// utilisé pour la redirection vers la page de partage de localisation depuis le lien de l'invitation.
export async function GET(request: Request) {
    const url = new URL(request.url);
    const pairingCode = url.searchParams.get('pairingCode');
    const magicToken = url.searchParams.get('magicToken');

    // Validation de présence
    if (!pairingCode || !magicToken) {
        return NextResponse.json({ error: 'Lien invalide ou incomplet' }, { status: 400 });
    }

    // Validation format via rules.json
    if (!new RegExp(rules.rules.pairing.pairingCode.pattern).test(pairingCode)) {
        return NextResponse.json({ error: rules.rules.pairing.pairingCode.error }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Recherche en base strict : code + token + statut pending
    const pairing = await db.collection('pairings').findOne({
        pairingCode,
        magicToken,
        status: 'pending'
    });

    if (!pairing) {
        return NextResponse.json({ error: 'Invitation expirée ou déjà utilisée' }, { status: 404 });
    }

    // Vérification de l'expiration
    if (new Date() > pairing.expiresAt) {
        return NextResponse.json({ error: 'Ce lien a expiré' }, { status: 400 });
    }

    // Redirection vers la page de partage de localisation avec les paramètres nécessaires pour la validation du pairing
    // On passe le code et le token dans l'URL pour que la page puisse appeler le PATCH
    const redirectUrl = new URL('/share-location', request.url);
    redirectUrl.searchParams.set('pairingCode', pairingCode);
    redirectUrl.searchParams.set('magicToken', magicToken);

    return NextResponse.redirect(redirectUrl);
}