/**
 *  Fichier pour la gestion de token d'authentification
 *  Utilise le package jose pour créer et vérifier les tokens JWT
 */

// Importation des types nécessaires pour la gestion des tokens JWT
import { SignJWT, jwtVerify } from 'jose';

// Clé secrète pour signer les tokens récupérée depuis .env
const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

// Encodage de la clé secrète en Uint8Array pour jose
const secret = new TextEncoder().encode(secretKey);

// Durée de validité du token (ex: 1 heure)
const tokenExpiration = '1h';

// Interface pour les données utilisateur à inclure dans le token
export interface ITokenPayload {
    username: string;
    email: string;
    userId?: string;
}

// Fonction pour créer un token JWT avec les données utilisateur
export async function createToken(payload: ITokenPayload){
    return await new SignJWT({...payload}) // Données utilisateur à inclure dans le token
        .setProtectedHeader({ alg: 'HS256' }) // Algorithme de signature
        .setIssuedAt() // Date d'émission du token
        .setExpirationTime(tokenExpiration) // Durée de validité du token
        .sign(secret); // Signature du token avec la clé secrète
}

// Fonction pour vérifier un token JWT et extraire les données utilisateur
export async function verifyToken(token: string){
    try {
        const { payload } = await jwtVerify(token, secret, {
            algorithms: ['HS256'] // Algorithme de vérification
        });
        return payload; // Retourne les données utilisateur extraites du token
    } catch (error) {
        throw new Error('Invalid token'); // Lève une erreur si le token est invalide
    }
}