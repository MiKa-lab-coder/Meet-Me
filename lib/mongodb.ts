/**
 * interface de connexion à la base de données MongoDB
 * Utilise le package mongodb pour se connecter à la base de données MongoDB
 * Récupère l'URI de connexion depuis les variables d'environnement
 * Lance une erreur si l'URI n'est pas défini dans les variables d'environnement
 * Export une fonction connectToDB pour établir la connexion à la base de données
 */
import { MongoClient } from 'mongodb';

// déclare une variable globale pour stocker la promesse de connexion MongoDB
declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// crée une fonction pour établir la connexion à la base de données MongoDB
function createClientPromise(): Promise<MongoClient> {
    // récupère l'URI de connexion depuis les variables d'environnement
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI manquant');
    return new MongoClient(uri).connect();
}

// exporte une fonction pour obtenir la promesse de connexion MongoDB
export default function getClientPromise(): Promise<MongoClient> {
    // si l'environnement d'exécution n'est pas en production, utilise une variable globale pour stocker la promesse
    // de connexion MongoDB afin d'éviter de créer plusieurs connexions lors du développement
    if (process.env.APP_ENV !== 'prod') {
        return (global._mongoClientPromise ??= createClientPromise());
    }
    return createClientPromise();
}

