/**
 * Fichier de routes pour l'authentification
 * Ce fichier gère la route de login (POST)
 * Il utilise les règles de validation définies dans rules.json pour valider les données d'entrée.
 */

// Importation des règles de validation et des interfaces nécessaires
import {IAuthData} from '@/shared/interfaces';
import rules from '@/shared/rules.json';
import {NextResponse} from "next/server";
import bcrypt from 'bcryptjs';
import clientPromise from "@/lib/mongodb";
import {createToken, ITokenPayload} from "@/lib/auth";
import {getAuthToken, setAuthCookie, deleteAuthCookie} from "@/lib/httpOnly";

export async function POST(request: Request) {
    try {
// Récupération des données de connexion depuis le corps de la requête
        const data: IAuthData = await request.json();

        // Vérification que les champs requis sont présents et qu'ils respectent les règles de validation
        if (!data.username || !data.password) {
            return NextResponse.json({error: "Tous les champs sont requis"}, {status: 400});
        }
        // Validation du format username et du password en utilisant les expressions régulières définies dans rules.json
        const validateUsername = new RegExp(rules.rules.users.username.pattern);
        const usernameErrorMessage = rules.rules.users.username.error;
        if (!validateUsername.test(data.username)) {
            return NextResponse.json({error: usernameErrorMessage}, {status: 400});
        }

        const validatePassword = new RegExp(rules.rules.users.password.pattern);
        const passwordErrorMessage = rules.rules.users.password.error;
        if (!validatePassword.test(data.password)) {
            return NextResponse.json({error: passwordErrorMessage}, {status: 400});
        }

        // Verification de l'existence de l'utilisateur dans la base de données
        const client = await clientPromise;
        const db = client.db();
        const user = await db.collection("users").findOne({username: data.username});
        if (!user) {
            return NextResponse.json({error: "Utilisateur non trouvé"}, {status: 404});
        }
        // Verification du mot de passe en utilisant bcrypt
        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({error: "Mot de passe incorrect"}, {status: 401});
        }
        //Verification de l'existence d'un token d'authentification dans les cookies HTTP Only
        const existingToken = await getAuthToken();
        // Si un token existe déjà, on l'ecrase pour éviter les conflits
        if (existingToken) {
            await deleteAuthCookie(); // Supprimer le token existant en le remplaçant par une chaîne vide
        }
        // Création d'un token JWT avec les données utilisateur nécessaires pour l'authentification
        const tokenPayload: ITokenPayload = {
            username: user.username,
            email: user.email,
            userId: user._id.toString(),
        };
        // Génération du token d'authentification en utilisant la fonction createToken et le payload défini précédemment
        const token = await createToken(tokenPayload);
        // Stockage du token d'authentification dans un cookie HTTP Only
        await setAuthCookie(token);
        // Retour d'une réponse JSON avec un message de succès et un statut 200 (OK)
        return NextResponse.json({message: "Utilisateur connecté"}, {status: 200});
    } catch (error) {
        // En cas d'erreur, on retourne une réponse JSON avec un statut 500 (Internal Server Error)
        return NextResponse.json({error: "Une erreur est survenue pendant la connexion"}, {status: 500});

    }
}