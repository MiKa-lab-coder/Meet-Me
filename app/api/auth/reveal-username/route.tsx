/**
 * Route pour la demande de révélation du nom d'utilisateur.
 *
 * L'utilisateur ouvre le formulaire "nom d'utilisateur oublié".
 * Il renseigne uniquement son adresse e-mail.
 * Le front envoie un seul `POST` avec `email`.
 * Le backend valide l'e-mail, crée un token temporaire, l'enregistre en base,
 *    puis envoie un e-mail contenant le nom d'utilisateur.
 * La réponse reste volontairement générique pour éviter l'énumération de comptes.
 *
 * Le flux `password` est géré dans une autre route dédiée.
 */

import {NextResponse} from 'next/server';
import clientPromise from '@/lib/mongodb';
import rules from '@/shared/rules.json';
import {sendRevealUsernameEmail} from '@/tools/mail';

const TOKEN_TTL_MINUTES = 15;

export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({error: 'Token manquant'}, {status: 400});
    }

    try {
        const client = await clientPromise();
        const db = client.db();

        const record = await db.collection('forgot').findOne({
            magicToken: token,
            type: 'username',
            used: false,
        });

        if (!record) {
            return NextResponse.json({error: 'Lien invalide ou déjà utilisé'}, {status: 400});
        }

        if (new Date() > record.expiresAt) {
            return NextResponse.json({error: 'Lien expiré, veuillez en demander un nouveau'}, {status: 400});
        }

        const user = await db.collection('users').findOne({_id: record.userId});
        if (!user) {
            return NextResponse.json({error: 'Utilisateur introuvable'}, {status: 404});
        }

        await db.collection('forgot').updateOne(
            {_id: record._id},
            {$set: {used: true, usedAt: new Date()}},
        );

        return NextResponse.json({username: user.username}, {status: 200});
    } catch (error) {
        console.error('Échec de la vérification du token de récupération de nom d\'utilisateur', error);
        return NextResponse.json({error: 'Une erreur est survenue'}, {status: 500});
    }
}

function genericMessage() {
    return 'Si cette adresse existe, un e-mail de récuperation a été envoyé';
}

export async function POST(request: Request) {
    const {email} = await request.json();

    if (!email) {
        return NextResponse.json({error: "Adresse e-mail obligatoire"}, {status: 400});
    }

    const emailRules = rules.rules.users.email;
    const emailRegex = new RegExp(emailRules.pattern);
    const emailError = rules.rules.users.email.error;

    if (!emailRegex.test(email)) {
        return NextResponse.json({error: emailError}, {status: 400});
    }

    try {
        const client = await clientPromise();
        const db = client.db();

        const user = await db.collection('users').findOne({email: email});
        if (!user) {
            return NextResponse.json({message: genericMessage()}, {status: 200});
        }

        // Générer un token unique et fixer sa durée de vie.
        const magicToken = crypto.randomUUID();
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + TOKEN_TTL_MINUTES * 60000);

        // Invalider les anciennes demandes du même utilisateur et du même type.
        // Cela évite de laisser plusieurs liens valides en parallèle.
        await db.collection('forgot').updateMany(
            {email, type: 'username', used: false},
            {$set: {used: true, usedAt: new Date()}},
        );

        // Enregistrer la nouvelle demande en base.
        const insertResult = await db.collection('forgot').insertOne({
            email,
            userId: user._id,
            magicToken,
            type: 'username',
            createdAt,
            expiresAt,
            used: false,
        });

        const sendResulst = await sendRevealUsernameEmail({to: email, username: user.username, magicToken});

        if (!sendResulst.success) {
            console.log("Erreur lors de l'envoi de l'e-mail de récupération de nom d'utilisateur", sendResulst.error);
            return NextResponse.json({error: "Erreur lors de l'envoi de l'e-mail"}, {status: 500});
        }
        // Réponse finale volontairement générique.
        return NextResponse.json({message: genericMessage()}, {status: 200});
    } catch (error) {
        console.error("Échec la demande de récupération de nom d'utilisateur", error);
        return NextResponse.json({error: "Une erreur est survenue pendant la demande de récupération"}, {status: 500});
    }
}