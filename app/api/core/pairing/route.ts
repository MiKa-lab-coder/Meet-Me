/**
 * Fichier de route pour la gestion des pairings entre les utilisateurs.
 * Ce fichier définit les endpoints pour créer, récupérer et supprimer les pairings.
 * Les pairings sont stockés dans une base de données MongoDB et sont associés à des utilisateurs via leurs IDs.
 */

import {NextResponse} from 'next/server';
import rules from '@/shared/rules.json';
import clientPromise from '@/lib/mongodb';
import {getAuthToken, setAuthCookie} from "@/lib/httpOnly";
import {verifyToken, createToken} from "@/lib/auth";
import {sendPairingCodeEmail} from "@/tools/mail";
import {ObjectId} from "mongodb";

// utilisateur A : initiateur du pairing
export async function POST(request: Request) {
    try {
        // Recuperation du nom de l'utilisateur cible depuis le corps de la requete
        const data = await request.json();
        const {targetUsername} = data;

        if (!targetUsername) {
            return NextResponse.json({error: 'Username cible requis'}, {status: 400});
        }

        // Récupération du token d'authentification de l'utilisateur A
        const token = await getAuthToken();
        if (!token) return NextResponse.json({error: 'Non autorisé'}, {status: 401});

        // Vérification du token pour obtenir les données de l'utilisateur A
        const userA = await verifyToken(token);

        // Récuperation du mail de l'utilisateur cible à partir du nom d'utilisateur
        const client = await clientPromise();
        const db = client.db();
        const userB = await db.collection('users').findOne({username: targetUsername});

        if (!userB || !userB.email) {
            return NextResponse.json({error: 'Utilisateur cible introuvable'}, {status: 404});
        }

        // Génération cryptographiquement sûre du code de pairing (Math.random() n'est pas sécurisé)
        const bytes = new Uint8Array(4);
        crypto.getRandomValues(bytes);
        const pairingCode = Array.from(bytes).map(b => b.toString(36)).join('').substring(0, 6).toUpperCase();
        const magicToken = crypto.randomUUID();

        // Utilisation d'objets Date natifs pour la précision et MongoDB
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + 15 * 60000);

        // Insertion du nouveau pairing dans la collection 'pairings' avec les champs requis
        const newPairing = await db.collection('pairings').insertOne({
            initiatorId: userA.userId,
            targetId: userB._id.toString(), // Connu dès la création, nécessaire pour l'auto-login
            status: 'pending', // Statut initial conforme au contrat
            pairingCode,
            magicToken,
            expiresAt,
            createdAt,
        });

        // Envoi de l'email à l'utilisateur cible avec le code de pairing et le lien magique
        const emailResult = await sendPairingCodeEmail({
            to: userB.email,
            pairingCode,
            magicToken,
        });

        if (!emailResult) {
            await db.collection('pairings').deleteOne({_id: newPairing.insertedId}); // Nettoyage en cas d'échec de l'email
            return NextResponse.json({error: 'Echec de l\'envoi de l\'email'}, {status: 500});
        }

        return NextResponse.json({
            message: 'Pairing créé avec succès',
            pairing: {
                id: newPairing.insertedId,
                pairingCode,
                magicToken,
                expiresAt,
            },
        }, {status: 201});

    } catch (error) {
        console.error('échec de la création du pairing', error);
        return NextResponse.json({error: 'Échec de la création du pairing'}, {status: 400});
    }
}

// utilisateur B : celui qui valide le pairing
export async function PATCH(request: Request) {
    try {
        // Récupération du code de pairing et du magic token depuis le corps de la requete
        const data = await request.json();
        const {pairingCode, magicToken} = data;

        // Validation via rules.json
        const codePattern = rules.rules.pairing.pairingCode.pattern;
        if (!new RegExp(codePattern).test(pairingCode)) {
            return NextResponse.json({error: rules.rules.pairing.pairingCode.error}, {status: 400});
        }

        const client = await clientPromise();
        const db = client.db();

        // Recherche stricte : code + token + statut pending
        const pairing = await db.collection('pairings').findOne({
            pairingCode,
            magicToken,
            status: 'pending'
        });

        if (!pairing) {
            return NextResponse.json({error: 'Pairing introuvable ou déjà activé'}, {status: 404});
        }

        // Comparaison de dates native
        if (new Date() > pairing.expiresAt) {
            return NextResponse.json({error: 'Le pairing a expiré'}, {status: 400});
        }

        const token = await getAuthToken();
        if (!token) return NextResponse.json({error: 'Non autorisé'}, {status: 401});
        const userB = await verifyToken(token);

        // Mise à jour : passage en 'active' et ajout de l'ID de l'utilisateur B
        await db.collection('pairings').updateOne(
            {_id: pairing._id},
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
        }, {status: 200});

    } catch (error) {
        console.error('Erreur lors de la validation du pairing', error);
        return NextResponse.json({error: 'Erreur technique lors de la validation'}, {status: 500});
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
        return NextResponse.json({error: 'Lien invalide ou incomplet'}, {status: 400});
    }

    // Validation format via rules.json
    if (!new RegExp(rules.rules.pairing.pairingCode.pattern).test(pairingCode)) {
        return NextResponse.json({error: rules.rules.pairing.pairingCode.error}, {status: 400});
    }

    const client = await clientPromise();
    const db = client.db();

    // Recherche en base strict : code + token + statut pending
    const pairing = await db.collection('pairings').findOne({
        pairingCode,
        magicToken,
        status: 'pending'
    });

    if (!pairing) {
        return NextResponse.json({error: 'Invitation expirée ou déjà utilisée'}, {status: 404});
    }

    // Vérification de l'expiration
    if (new Date() > pairing.expiresAt) {
        return NextResponse.json({error: 'Ce lien a expiré'}, {status: 400});
    }

    // Auto-login User B : on récupère son profil et on lui pose un cookie JWT
    const userB = await db.collection('users').findOne({_id: new ObjectId(pairing.targetId)});
    if (!userB) {
        return NextResponse.json({error: 'Utilisateur cible introuvable'}, {status: 404});
    }

    const token = await createToken({
        userId: userB._id.toString(),
        username: userB.username,
        email: userB.email,
    });
    await setAuthCookie(token);

    const redirectUrl = new URL('/share-location', request.url);
    redirectUrl.searchParams.set('pairingCode', pairingCode);
    redirectUrl.searchParams.set('magicToken', magicToken);

    return NextResponse.redirect(redirectUrl);
}

// Endpoint pour mettre fin à un pairing actif, accessible à l'initiateur ou à la cible du pairing.
// Change le statut du pairing en 'expired' au lieu de supprimer le document
export async function DELETE(request: Request) {
    try {
        // Récupération de l'ID du pairing depuis le corps de la requete
        const data = await request.json();
        const {pairingId} = data;

        if (!pairingId) {
            return NextResponse.json({error: 'ID de pairing requis'}, {status: 400});
        }

        // Validation du format ObjectId avant utilisation (évite une exception non gérée)
        if (!ObjectId.isValid(pairingId)) {
            return NextResponse.json({error: 'ID de pairing invalide'}, {status: 400});
        }

        const token = await getAuthToken();
        if (!token) return NextResponse.json({error: 'Non autorisé'}, {status: 401});
        const user = await verifyToken(token);

        const client = await clientPromise();
        const db = client.db();

        // Recherche de l'ID de pairing et vérification que l'utilisateur est soit l'initiateur soit la cible
        const pairing = await db.collection('pairings').findOne({
            _id: new ObjectId(pairingId),
            $or: [
                {initiatorId: user.userId},
                {targetId: user.userId}
            ]
        });

        if (!pairing) {
            return NextResponse.json({error: 'Pairing introuvable ou accès non autorisé'}, {status: 404});
        }

        // Mise à jour du statut en 'expired' au lieu de suppression
        await db.collection('pairings').updateOne(
            {_id: pairing._id},
            {
                $set:
                    {
                        status: 'expired',
                        expiredAt: new Date()
                    }
            }
        );

        return NextResponse.json({message: 'Pairing terminé avec succès'}, {status: 200});

    } catch (error) {
        console.error('Erreur lors de la fin du pairing', error);
        return NextResponse.json({error: 'Erreur technique lors de la suppression du pairing'}, {status: 500});
    }
}

