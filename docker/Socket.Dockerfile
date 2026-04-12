# Serveur Socket.IO standalone
FROM node:20-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copie des dépendances
COPY package.json package-lock.json* ./

RUN npm install

# Copie du code source
COPY . .

EXPOSE 3001

# tsx exécute directement le TypeScript avec support des path aliases
CMD ["npx", "tsx", "socket-server/index.ts"]
