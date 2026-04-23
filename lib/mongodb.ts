/**
 * interface de connexion à la base de données MongoDB
 * Utilise le package mongodb pour se connecter à la base de données MongoDB
 * Récupère l'URI de connexion depuis les variables d'environnement
 * Lance une erreur si l'URI n'est pas défini dans les variables d'environnement
 * Export une fonction connectToDB pour établir la connexion à la base de données
 */
// Importation du client MongoDB depuis npm install mongodb
import { MongoClient } from 'mongodb';

// Déclaration d'une variable globale pour stocker la promesse de connexion MongoDB
declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Récupération de l'URI de connexion à MongoDB depuis les variables d'environnement
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI manquant');

// Création d'une instance du client MongoDB
const client = new MongoClient(uri);
// Déclaration d'une variable pour stocker la promesse de connexion MongoDB
let clientPromise: Promise<MongoClient>;

// On utilise APP_ENV pour déterminer si on est en environnement de production ou de développement
if (process.env.APP_ENV !== 'prod') {
    if (!global._mongoClientPromise) {
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    clientPromise = client.connect();
}

export default clientPromise;

