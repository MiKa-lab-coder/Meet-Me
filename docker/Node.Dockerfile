# Utilisation d'une image légère de Node.js
FROM node:20-alpine

# Installation des outils nécessaires pour certaines dépendances natives
RUN apk add --no-cache libc6-compat

# Définition du répertoire de travail
WORKDIR /app

# Copie d'abord les fichiers de dépendances pour profiter du cache Docker
COPY package.json package-lock.json* ./

# Installation des dépendances
RUN npm install

# Copie le reste des fichiers du projet
COPY . .

# On expose le port 3000
EXPOSE 3000

# Commande par défaut (Next.js start pour la "prod" ou dev pour le confort)
CMD ["npm", "run", "dev"]