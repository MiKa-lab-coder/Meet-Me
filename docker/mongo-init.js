// Connexion à la base de données spécifiée dans le .env
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

// Petit log de confirmation dans la console Docker
print('Utilisateur privilégié créé avec succès sur la base : ' + process.env.MONGO_DB_NAME);