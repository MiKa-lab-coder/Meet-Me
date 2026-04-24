/**
 * Route pour la demande de réinitialisation du mot de passe.
 *
 * L'utilisateur ouvre le formulaire "mot de passe oublié".
 * Il renseigne uniquement son adresse e-mail.
 * Le front envoie un seul `POST` avec `email`.
 * Le backend valide l'e-mail, crée un token temporaire, l'enregistre en base,
 *    puis envoie le lien de réinitialisation du mot de passe.
 * La réponse reste volontairement générique pour éviter l'énumération de comptes.
 *
 * Le flux `username` sera géré dans une autre route dédiée.
 */

import {NextResponse} from 'next/server';
import clientPromise from '@/lib/mongodb';
import rules from '@/shared/rules.json';
import {sendResetPasswordEmail} from '@/tools/mail';
import bcrypt from 'bcryptjs';

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
            type: 'password',
            used: false,
        });

        if (!record) {
            return NextResponse.json({error: 'Lien invalide ou déjà utilisé'}, {status: 400});
        }

        if (new Date() > record.expiresAt) {
            return NextResponse.json({error: 'Lien expiré, veuillez en demander un nouveau'}, {status: 400});
        }

        return NextResponse.json({valid: true}, {status: 200});
    } catch (error) {
        console.error('Échec de la vérification du token de réinitialisation', error);
        return NextResponse.json({error: 'Une erreur est survenue'}, {status: 500});
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const token = typeof body?.token === 'string' ? body.token : '';
        const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';

        if (!token || !newPassword) {
            return NextResponse.json({error: 'Token et nouveau mot de passe requis'}, {status: 400});
        }

        const passwordRules = rules.rules.users.password;
        const passwordRegex = new RegExp(passwordRules.pattern);
        if (
            !passwordRegex.test(newPassword) ||
            newPassword.length < passwordRules.min ||
            newPassword.length > passwordRules.max
        ) {
            return NextResponse.json({error: passwordRules.error}, {status: 400});
        }

        const client = await clientPromise();
        const db = client.db();

        const record = await db.collection('forgot').findOne({
            magicToken: token,
            type: 'password',
            used: false,
        });

        if (!record) {
            return NextResponse.json({error: 'Lien invalide ou déjà utilisé'}, {status: 400});
        }

        if (new Date() > record.expiresAt) {
            return NextResponse.json({error: 'Lien expiré, veuillez en demander un nouveau'}, {status: 400});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await db.collection('users').updateOne(
            {_id: record.userId},
            {$set: {password: hashedPassword, updatedAt: new Date()}},
        );

        await db.collection('forgot').updateOne(
            {_id: record._id},
            {$set: {used: true, usedAt: new Date()}},
        );

        return NextResponse.json({message: 'Mot de passe réinitialisé avec succès'}, {status: 200});
    } catch (error) {
        console.error('Échec de la réinitialisation du mot de passe', error);
        return NextResponse.json({error: 'Une erreur est survenue pendant la réinitialisation'}, {status: 500});
    }
}

const TOKEN_TTL_MINUTES = 15;

function genericMessage() {
    return 'Si cette adresse existe, un e-mail de réinitialisation a été envoyé';
}

export async function POST(request: Request) {
    try {
        // Récupérer et normaliser les données envoyées par le formulaire.
        const body = await request.json();
        const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

        // Vérifier que le formulaire contient bien l'unique champ attendu.
        if (!email) {
            return NextResponse.json({error: 'Email requis'}, {status: 400});
        }

        // Valider le format de l'adresse e-mail avec la règle partagée front/back.
        const emailRules = rules.rules.users.email;
        const emailRegex = new RegExp(emailRules.pattern);

        if (!emailRegex.test(email)) {
            return NextResponse.json({error: emailRules.error}, {status: 400});
        }

        // Ouvrir la connexion MongoDB et chercher l'utilisateur associé à l'email.
        const client = await clientPromise();
        const db = client.db();
        const user = await db.collection('users').findOne({email});

        // Anti-enumération.
        // On ne révèle jamais si le compte existe ou non : on répond toujours de façon générique.
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
            {email, type: 'password', used: false},
            {$set: {used: true, usedAt: new Date()}},
        );

        // Enregistrer la nouvelle demande en base.
        const insertResult = await db.collection('forgot').insertOne({
            email,
            userId: user._id,
            magicToken,
            type: 'password',
            createdAt,
            expiresAt,
            used: false,
        });

        // Envoyer l'e-mail de réinitialisation du mot de passe.
        const mailResult = await sendResetPasswordEmail({to: email, magicToken});

        // Étape 10 : si l'envoi échoue, on nettoie la demande créée juste avant.
        if (!mailResult.success) {
            await db.collection('forgot').deleteOne({_id: insertResult.insertedId});
            return NextResponse.json({error: "Échec de l'envoi de l'e-mail"}, {status: 500});
        }

        // Réponse finale volontairement générique.
        return NextResponse.json({message: genericMessage()}, {status: 200});
    } catch (error) {
        console.error('Échec de la demande de réinitialisation du mdp', error);
        return NextResponse.json({error: 'Une erreur est survenue pendant la demande de récupération'}, {status: 500});
    }
}