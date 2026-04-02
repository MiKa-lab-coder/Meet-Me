/**
 * HANDLER WEBSOCKET (Pages Router)
 * ---------------------------------------------------------
 * Emplacement : /pages/api/socket/io.ts
 * Pourquoi ici ? L'App Router (app/api) ne permet pas d'accéder
 * à l'instance brute du serveur HTTP (res.socket.server).
 * Ce fichier sert d'initialisation au tunnel Socket.io.
 */

import { Server } from 'socket.io';
import { socketTunnel } from '@/lib/socket';
import {io} from "socket.io-client";

export const config = {
    api: {
        bodyParser: false, // Désactive le parsing du corps pour les requêtes WebSocket
    },
};

export default function SocketHandler(req: any, res: any) {
    // Si le moteur Socket.io n'est pas encore greffé au serveur HTTP
    if (!res.socket.server.io) {
        console.log('Initialisation du serveur WebSocket...');

        // Création d'une nouvelle instance de Socket.io attachée au serveur HTTP et réglage
        const io = new Server(res.socket.server, {
            path: '/api/socket/io',
            addTrailingSlash: false,
            cors:{
                origin: '*', // Autorise toutes les origines (à restreindre en production) comment on fait?
                methods: 'GET,POST', // pour la réception et l'envoi des data de position?
            }
        });

        // Activation de la logique métier (lib/socket.ts)
        socketTunnel(io);

        // sauvegarde de l'instance pour éviter les doublons au prochain appel
        res.socket.server.io = io;
    }

    // Fermeture propre de la requête d'éveil
    res.end();
}