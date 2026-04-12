/**
 * Page contenant la carte et les fonctionnalités de partage de position en temps réel.
 * Cette page n'est accessible qu'aux utilisateurs connectés.
 * Les utilisateurs peuvent voir leur position actuelle ET celle de la personne avec qui ils partagent leur position.
 * Un seul partage de position est autorisé à la fois pour garantir la confidentialité et la sécurité des données de localisation.
 * Les utilisateurs peuvent également arrêter le partage de position à tout moment.
 */

"use client";

import { useEffect, useState } from 'react';
import Maps from '@/components/layout/map';
import PairingRemote from '@/components/auth/pairingRemote';
import PinPairing from '@/components/ui/pinPairing';
import { io, Socket } from "socket.io-client";
import { startSharingLocation, stopSharingLocation } from "@/tools/useTracking";

export default function SharingLocationPage() {
    const [userPos, setUserPos] = useState<[number, number] | null>(null);
    const [peerPos, setPeerPos] = useState<[number, number] | null>(null);
    const [isPaired, setIsPaired] = useState(false);
    const [pairingCode, setPairingCode] = useState<string | null>(null);
    const [pairingId, setPairingId] = useState<string | null>(null); // Pour le DELETE
    const [userId, setUserId] = useState<string | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);

    // Récupérer l'identité de l'utilisateur au démarrage
    useEffect(() => {
        fetch('/api/auth/me').then(res => res.json()).then(data => setUserId(data.userId));

        // Connexion du client Socket.IO au serveur WebSocket standalone
        const newSocket = io({
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            console.log('Socket.IO connecté');
        });

        newSocket.on('connect_error', (err) => {
            console.error('Erreur de connexion Socket.IO :', err.message);
        });

        // Stockage de l'instance du client Socket.IO pour une utilisation ultérieure
        setSocket(newSocket);

        // Nettoyage à la fermeture du composant : déconnexion du client Socket.IO pour libérer les ressources serveur
        return () => { newSocket.disconnect(); };
    }, []);

    // Centre la carte sur la position de l'utilisateur avant tout jumelage
    useEffect(() => {
        if (!navigator.geolocation) {
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserPos([position.coords.latitude, position.coords.longitude]);
            },
            (error) => {
                console.error('Impossible de récupérer la position initiale :', error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 30000,
            }
        );
    }, []);

    // Fonctions de rappels pour les composants enfants
    const handlePairingSuccess = (id: string, code: string) => {
        setPairingId(id);
        setPairingCode(code);
        setIsPaired(true); // Active le tracking et la carte
    };

    // Fonction pour arrêter le partage de position et nettoyer les états
    const handleUnpair = () => {
        if (socket && pairingCode && userId) {
            stopSharingLocation(socket, pairingCode, userId); // Coupe le GPS/Socket
        }
        setIsPaired(false);
        setPairingCode(null);
        setPairingId(null);
        setPeerPos(null);
    };

    // Lancer le tracker GPS/Socket quand isPaired devient vrai
    useEffect(() => {
        if (isPaired && pairingCode && socket && userId) {
            const cleanup = startSharingLocation(
                pairingCode,
                userId,
                socket,
                (partnerData) => setPeerPos([partnerData.location.lat, partnerData.location.lng]),
                () => alert("Arrivés !"),
                (err) => console.error(err),
                (position) => setUserPos(position) // Met à jour userPos en temps réel pendant le partage
            );

            // Nettoyage des listeners et du watchPosition au démontage
            return cleanup;
        }
    }, [isPaired, pairingCode, socket, userId]);

    return (
        <div className="flex flex-col gap-6 p-4">
            <h1 className="text-2xl font-bold">MeetMe - Tracking Live</h1>

            <Maps userPos={userPos} peerPos={peerPos} isPaired={isPaired} />

            <div className="flex flex-col gap-4">
                <PairingRemote
                    isPaired={isPaired}
                    pairingId={pairingId}
                    onPairingSuccess={handlePairingSuccess}
                    onUnpair={handleUnpair}
                />

                {!isPaired && (
                    <PinPairing onValidationSuccess={(code) => {
                        setPairingCode(code);
                        setIsPaired(true);
                    }} />
                )}
            </div>
        </div>
    );
}