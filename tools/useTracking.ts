/**
 * Fichier outil pour le tracking de l'application.
 * Contient le contenu de l'envoi à travers socket.ts
 * Utilisation de geolib pour calculer les distances et les vitesses à partir des coordonnées GPS
 * (npm install geolib)
 */
import rules from "@/shared/rules.json";
import {ITracking} from "@/shared/interfaces";
import {ISocketMessage} from "@/lib/socket";
import {getDistance} from "geolib";

// Variables globales pour le suivi de localisation
let watchId: number | null = null;
let myLastPosition: ITracking | null = null;

export const startSharingLocation = (
    pairingCode: string,
    senderId: string,
    socket: any,
    onPartnerMove: (position: ITracking) => void,
    onMeetSuccess: () => void,
    onError: (error: string) => void
) => {

    // Vérifie que le navigateur supporte la géolocalisation
    if (!navigator.geolocation) {
        onError("La géolocalisation n'est pas supportée par ce navigateur.");
        return;
    }

    // Ecoute les mises à jour de position du partenaire
    socket.on('message', (packet: ISocketMessage) => {
        if (packet.type === 'LOCATION_UPDATE') {
            const partnerPosition = packet.data as ITracking;
            onPartnerMove(partnerPosition);

            // Logique de rencontre : vérifie si la distance entre les deux utilisateurs est dans le delta défini dans rules.json
            if (myLastPosition) {
                const distance = getDistance(
                    {latitude: myLastPosition.location.lat, longitude: myLastPosition.location.lng},
                    {latitude: partnerPosition.location.lat, longitude: partnerPosition.location.lng}
                );

                if (distance <= (rules.rules.tracking.accuracy.max + 5)) {
                    // +5m de marge pour compenser les imprécisions GPS
                    onMeetSuccess();
                    // On coupe le partage de position après la rencontre réussie
                    stopSharingLocation(socket, pairingCode, senderId);
                }
            }
        }
    });

    // Commence à partager la position de l'utilisateur
    if (navigator.geolocation) {
        // watchPosition : surveille les changements de position en temps réel
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                // Définit la position actuelle de l'utilisateur
                myLastPosition = {
                    userId: senderId,
                    location: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    },
                    accuracy: position.coords.accuracy,
                    timestamp: new Date().toISOString(),
                };

                // Envoie la position au serveur via WebSocket
                const message: ISocketMessage = {
                    pairingCode,
                    senderId,
                    type: 'LOCATION_UPDATE',
                    data: myLastPosition,
                };
                socket.emit('message', message);
            },
            (error) => {
                onError(`Erreur de géolocalisation : ${error.message}`);
            },
            {
                enableHighAccuracy: true, // Utilise le GPS pour une meilleure précision
                maximumAge: 10000, // Accepte les positions jusqu'à 10 secondes
                timeout: 20000, // Timeout de 20 secondes pour obtenir une position
            }
        );
    }
};

export const stopSharingLocation = (socket: any, pairingCode: string, senderId: string) => {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
    // Envoie un message de fin de session au serveur
    socket.emit('message', {
        pairingCode,
        senderId,
        type: 'SESSION_END',
        data: 'Fin du partage de position',
    });
};