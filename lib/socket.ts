/**
 * Server de WebSocket pour gérer les connexions en temps réel entre les clients et le serveur.
 * Ici utilisé pour le partage de position en temps réel entre les utilisateurs et les appareils jumelés.
 * Utilisation de Socket.IO (npm install socket.io socket.io-client)
 */

import {Server, Socket} from 'socket.io';

// Interface de suivi de localisation
import {ITracking} from '@/shared/interfaces/tracking';

/**
 * Enveloppe standardisée pour les messages WebSocket
 * Permet de router les messages vers la bonne "Room" sans examiner le contenu
 */
export interface ISocketMessage {
    pairingCode: string;    // "Room" de destination (6 caractères)
    senderId: string;       // Identifiant du client émetteur
    type: 'LOCATION_UPDATE' | 'SESSION_END'; // Type de message
    data: ITracking | string; // Contenu du message
}

/**
 * Configuration du serveur WebSocket
 * "Rooms" = groupes de clients isolés. Chaque pairingCode = une "Room" indépendante.
 * Les messages envoyés à une "Room" ne vont qu'aux clients de cette "Room".
 */
export const socketTunnel = (io: Server) => {
    /**
     * io.on('connection') se déclenche à chaque nouvelle connexion WebSocket
     * Chaque client reçoit un ID unique (socket.id)
     */
    io.on('connection', (socket: Socket) => {
        console.log(`Client connecté : ${socket.id}`);

        /**
         * Vérifie que la "Room" n'est pas pleine (max 2 clients)
         * Puis ajoute le client à la "Room"
         */
        socket.on('joinRoom', (pairingCode: string) => {
            const room = io.sockets.adapter.rooms.get(pairingCode);

            // Limite : 2 clients maximum par jumelage
            if (room && room.size >= 2) {
                socket.emit('error', 'La salle est pleine');
                return;
            }

            // Ajoute le client à la "Room" (la crée si elle n'existe pas)
            socket.join(pairingCode);
            console.log(`Client ${socket.id} rejoint la salle ${pairingCode}`);
        });

        /**
         * Reçoit le message (IsocketMessage) d'un client et le retransmet à tous les autres clients de la "Room"
         */
        socket.on('message', (packet: ISocketMessage) => {
            console.log(`Message reçu de ${socket.id} pour la salle ${packet.pairingCode} : ${packet.type}`);

            // socket.to() = envoie à la "Room" spécifiée (exclut l'émetteur)
            socket.to(packet.pairingCode).emit('message', packet);
        });

        /**
         * Se déclenche automatiquement lors de la fermeture de la connexion WebSocket
         * Socket.IO gère automatiquement la suppression du socket de ses "Rooms"
         */
        socket.on('disconnect', () => {
            console.log(`Client déconnecté : ${socket.id}`);
            // Optionnel : notifier les autres clients, nettoyer les données, etc.
        });
    });
};
