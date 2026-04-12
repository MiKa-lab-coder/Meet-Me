/**
 * Fichier de routes pour l'authentification
 * Ce fichier gère la route d'inscription (POST)
 * Il utilise les règles de validation définies dans rules.json pour valider les données d'entrée.
 */

// Importation des règles de validation et des interfaces nécessaires
import rules from '@/shared/rules.json';
import {IRegistrationData, Iuser} from '@/shared/interfaces';
import {NextResponse} from "next/server";
import bcrypt from 'bcryptjs';
import clientPromise from "@/lib/mongodb";
import {createToken} from "@/lib/auth";
import {setAuthCookie} from "@/lib/httpOnly";

export async function POST(request: Request) {
    try {
        // Récupération des données d'inscription depuis le corps de la requête
        const data: IRegistrationData = await request.json();

        // Vérification que tous les champs requis sont présents
        if (!data.username || !data.email || !data.password || !data.confirmPassword) {
            return NextResponse.json({error: "Tous les champs sont requis"}, {status: 400});
        }

        /**
         * Validation des données d'inscription en utilisant les règles définies dans rules.json
         * Chaque champ (username, email, password) est validé en utilisant une expression régulière définie dans les règles.
         * Si une validation échoue, on utilise le message d'erreur correspondant défini dans les règles
         * et on retourne une réponse JSON avec un statut 400 (Bad Request).
         */
        const usernameRules = rules.rules.users.username;
        const usernameRegex = new RegExp(usernameRules.pattern);
        const usernameError = rules.rules.users.username.error;

        const emailRules = rules.rules.users.email;
        const emailRegex = new RegExp(emailRules.pattern);
        const emailError = rules.rules.users.email.error;

        const passwordRules = rules.rules.users.password;
        const passwordRegex = new RegExp(passwordRules.pattern);
        const passwordError = rules.rules.users.password.error;

        const confirmPasswordError = rules.rules.users.confirmPassword.error;

        // Validation des données d'inscription
        if (!usernameRegex.test(data.username)) {
            return NextResponse.json({error: usernameError}, {status: 400});
        }
        if (!emailRegex.test(data.email)) {
            return NextResponse.json({error: emailError}, {status: 400});
        }
        if (!passwordRegex.test(data.password)) {
            return NextResponse.json({error: passwordError}, {status: 400});
        }
        if (data.password !== data.confirmPassword) {
            return NextResponse.json({error: confirmPasswordError}, {status: 400});
        }

        // Création de l'objet utilisateur final à partir des données d'inscription validées
        // en ajoutant les champs createdAt et updatedAt et en supprimant le champ confirmPassword qui n'est pas nécessaire
        const finalData: Iuser = {
            username: data.username,
            email: data.email,
            password: data.password,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // verification que l'utilisateur et l'email n'existent pas déjà dans la base de données
        const client = await clientPromise;
        const db = client.db();
        // Vérification combinée username/email avec des valeurs strictement string (pas d'opérateurs MongoDB)
        if (typeof data.username !== 'string' || typeof data.email !== 'string') {
            return NextResponse.json({error: "Données invalides"}, {status: 400});
        }
        const existingUser = await db.collection('users').findOne({
            $or: [{username: data.username}, {email: data.email}]
        });
        if (existingUser) {
            if (existingUser.username === data.username) {
                return NextResponse.json({error: "Le nom d'utilisateur existe déjà"}, {status: 400});
            }
            return NextResponse.json({error: "L'email existe déjà"}, {status: 400});
        }

        /**
         * Hashage du mot de passe en utilisant bcryptjs pour sécuriser les données de l'utilisateur
         * avant de les stocker dans la base de données.
         * npm install bcryptjs
         * npm install --save-dev @types/bcryptjs car ici on utilise TypeScript
         */
        // Le mot de passe est hashé avec un coût de 10 (le nombre de rounds de salage)
        finalData.password = await bcrypt.hash(data.password, 12);

        // Si toutes les validations passent, on peut procéder à l'inscription de l'utilisateur
        const saveUser = await db.collection('users').insertOne
            // Omet le champ _id qui est automatiquement généré par MongoDB lors de l'insertion
        (finalData as Omit<IRegistrationData, '_id'>);

        // Si l'insertion de l'utilisateur dans la base de données échoue (pas d'ID inséré), on retourne une erreur
        if (!saveUser.insertedId) {
            throw new Error("l'inscription a échoué");
        }
        // Création d'un token d'authentification pour connecter l'utilisateur immédiatement après l'inscription
        const token = await createToken(
            {
                username: finalData.username,
                email: finalData.email,
                userId: saveUser.insertedId.toString()
            });
        // Stockage du token d'authentification dans un cookie HTTP Only pour sécuriser la session de l'utilisateur
        await setAuthCookie(token);

        return NextResponse.json({message: "Inscription réussie",userId :saveUser.insertedId}, {status: 201});

    } catch (error) {
        // En cas d'erreur, on retourne une réponse JSON avec un statut 500 (Internal Server Error)
        //console.log("detail de 500 :",error);
        return NextResponse.json({error: "Une erreur est survenue pendant l'inscription"}, {status: 500});
    }
}