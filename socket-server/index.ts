/**
 * Serveur Socket.IO standalone
 * ---------------------------------------------------------
 * Séparé de Next.js car l'App Router (et Turbopack) ne permet
 * pas d'accéder au serveur HTTP brut via res.socket.server.
 * Ce serveur tourne sur le port 3001 dans son propre container.
 */

import { createServer } from 'http';
import { Server } from 'socket.io';
import { socketTunnel } from '@/lib/socket';

const PORT = Number(process.env.SOCKET_PORT) || 3001;
const APP_URL = process.env.APP_URL || '*';

const httpServer = createServer((req, res) => {
    // Health-check endpoint
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
        return;
    }
    res.writeHead(404);
    res.end();
});

const io = new Server(httpServer, {
    cors: {
        origin: APP_URL === '*' ? '*' : [APP_URL],
        methods: ['GET', 'POST'],
    },
});

// Active la logique métier (rooms, messages, etc.)
socketTunnel(io);

httpServer.listen(PORT, () => {
    console.log(`Serveur Socket.IO démarré sur le port ${PORT}`);
});
