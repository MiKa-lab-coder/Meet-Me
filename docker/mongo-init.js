// Connexion à la base de données spécifiée dans le .env
if (!process.env.MONGO_DB_NAME || !process.env.MONGO_USERNAME || !process.env.MONGO_PASSWORD) {
    throw new Error('Variables MONGO_DB_NAME, MONGO_USERNAME et MONGO_PASSWORD requises');
}
db = db.getSiblingDB(process.env.MONGO_DB_NAME);

// Création de l'utilisateur "Application" avec des droits restreints
db.createUser({
    user: process.env.MONGO_USERNAME,
    pwd: process.env.MONGO_PASSWORD,
    roles: [
        {
            role: "readWrite",
            db: process.env.MONGO_DB_NAME,
        },
    ],
});
// Création des index pour les performances et la cohérence des données
db.users.createIndex({username: 1}, {unique: true});
db.users.createIndex({email: 1}, {unique: true});
db.pairings.createIndex({pairingCode: 1, magicToken: 1, status: 1});
db.pairings.createIndex({initiatorId: 1, status: 1});
db.pairings.createIndex({targetId: 1, status: 1});
db.pairings.createIndex({expiresAt: 1}, {expireAfterSeconds: 0}); // TTL : auto-suppression des pairings expirés

// Petit log de confirmation dans la console Docker
print('Utilisateur privil��gié et index créés avec succès sur la base : ' + process.env.MONGO_DB_NAME);