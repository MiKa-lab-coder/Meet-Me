/**
 * Fichier outil pour le tracking de l'application.
 * Contient le contenu de l'envoi à travers socket.ts
 * Utilisation de geolib pour calculer les distances et les vitesses à partir des coordonnées GPS
 * (npm install geolib)
 */
import {ITracking} from "@/shared/interfaces";
import {ISocketMessage} from "@/lib/socket";
import {getDistance} from "geolib";

/**
 * Démarre le partage de position et retourne une fonction de nettoyage.
 * Les variables de suivi sont encapsulées dans la closure pour éviter
 * les fuites mémoire liées aux globales de module.
 */
export const startSharingLocation = (
    pairingCode: string,
    senderId: string,
    socket: any,
    onPartnerMove: (position: ITracking) => void,
    onMeetSuccess: () => void,
    onError: (error: string) => void,
    onSelfMove?: (position: [number, number]) => void
): (() => void) => {

    let watchId: number | null = null;
    let myLastPosition: ITracking | null = null;

    // Vérifie que le navigateur supporte la géolocalisation
    if (!navigator.geolocation) {
        onError("La géolocalisation n'est pas supportée par ce navigateur.");
        return () => {};
    }

    // Rejoindre la room avant d'écouter ou d'émettre
    socket.emit('joinRoom', pairingCode);

    // Handler nommé pour pouvoir le retirer proprement
    const messageHandler = (packet: ISocketMessage) => {
        if (packet.type === 'LOCATION_UPDATE') {
            const partnerPosition = packet.data as ITracking;
            onPartnerMove(partnerPosition);

            // Logique de rencontre : vérifie si la distance entre les deux utilisateurs est dans le delta défini
            if (myLastPosition) {
                const distance = getDistance(
                    {latitude: myLastPosition.location.lat, longitude: myLastPosition.location.lng},
                    {latitude: partnerPosition.location.lat, longitude: partnerPosition.location.lng}
                );

                // Seuil de 12m : compromis optimal entre précision GPS et fiabilité de rencontre
                if (distance <= 12) {
                    onMeetSuccess();
                    cleanup();
                }
            }
        }
    };

    // Ecoute les mises à jour de position du partenaire
    socket.on('message', messageHandler);

    // Commence à partager la position de l'utilisateur
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

            // Met à jour la position locale sur la carte (callback vers page.tsx)
            if (onSelfMove) {
                onSelfMove([position.coords.latitude, position.coords.longitude]);
            }

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

    /**
     * Fonction de nettoyage : arrête le watch GPS, retire le listener socket,
     * et envoie un message de fin de session au partenaire.
     */
    const cleanup = () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }
        socket.off('message', messageHandler);
        socket.emit('message', {
            pairingCode,
            senderId,
            type: 'SESSION_END',
            data: 'Fin du partage de position',
        });
    };

    return cleanup;
};

/**
 * @deprecated Utiliser la fonction de cleanup retournée par startSharingLocation à la place
 */
export const stopSharingLocation = (socket: any, pairingCode: string, senderId: string) => {
    socket.emit('message', {
        pairingCode,
        senderId,
        type: 'SESSION_END',
        data: 'Fin du partage de position',
    });
};
