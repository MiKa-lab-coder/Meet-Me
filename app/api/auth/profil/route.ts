/**
 * Route pour récupérer les informations du profil de l'utilisateur connecté
 */
import {getAuthToken} from "@/lib/httpOnly";
import {NextResponse} from "next/server";
import {verifyToken} from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import {ObjectId} from "mongodb";
import {IProfileUpdateData} from "@/shared/interfaces";
import rules from '@/shared/rules.json';

export async function GET(request: Request) {
    // Récupération du token d'authentification depuis les cookies
    const token = await getAuthToken();
    if (!token) {
        return NextResponse.json({ error: "Token d'authentification manquant" }, { status: 401 });
    }

    // Vérification du token d'authentification et extraction des données utilisateur
    let payload: Awaited<ReturnType<typeof verifyToken>>;
    try {
        payload = await verifyToken(token);
    } catch {
        return NextResponse.json({ error: "Token d'authentification invalide" }, { status: 401 });
    }

    // Validation de l'ID utilisateur extrait du token
    const userId = payload.userId;
    if (typeof userId !== "string" || !ObjectId.isValid(userId)) {
        return NextResponse.json({ error: "ID utilisateur invalide dans le token" }, { status: 401 });
    }

    // Récupération des informations du profil de l'utilisateur depuis la base de données
    try {
        const client = await clientPromise;
        const db = client.db();
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        const { username, email } = user;
        return NextResponse.json({ username, email }, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de la récupération du profil utilisateur:", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}

/**
 * route de mise a jour du profil de l'utilisateur connecté
 * elle utilise les mêmes règles de validation que pour l'inscription
 * et vérifie que le token d'authentification est valide avant de mettre à jour les informations du profil dans la base de données
 */

export async function PUT(request: Request) {
    const token = await getAuthToken();
    if (!token) {
        return NextResponse.json({ error: "Token d'authentification manquant" }, { status: 401 });
    }

    let payload: Awaited<ReturnType<typeof verifyToken>>;
    try {
        payload = await verifyToken(token);
    } catch {
        return NextResponse.json({ error: "Token d'authentification invalide" }, { status: 401 });
    }

    const userId = payload.userId;
    if (typeof userId !== "string" || !ObjectId.isValid(userId)) {
        return NextResponse.json({ error: "ID utilisateur invalide dans le token" }, { status: 401 });
    }

    const data: IProfileUpdateData = await request.json();

    // Validation des données de mise à jour du profil en utilisant les règles définies dans rules.json
    const usernameRules = rules.rules.users.username;
    const usernameRegex = new RegExp(usernameRules.pattern);
    const usernameError = rules.rules.users.username.error;

    const emailRules = rules.rules.users.email;
    const emailRegex = new RegExp(emailRules.pattern);
    const emailError = rules.rules.users.email.error;

    if (data.username && !usernameRegex.test(data.username)) {
        return NextResponse.json({ error: usernameError }, { status: 400 });
    }
    if (data.email && !emailRegex.test(data.email)) {
        return NextResponse.json({ error: emailError }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();
        const updateData: Partial<{ username: string; email: string }> = {};
        if (data.username) updateData.username = data.username;
        if (data.email) updateData.email = data.email;

        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        return NextResponse.json({ message: "Profil mis à jour avec succès" }, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du profil utilisateur:", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}