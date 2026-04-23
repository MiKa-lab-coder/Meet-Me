/**
 * Composant pour le jumelage entre deux utilisateurs.
 * Simple Input Text pour enter le nom de l'utilisateur à jumeler
 * Ajout d'un bouton pour initier et terminer le jumelage
 * Le status du jumelage est affiché directement dans /share-location
 * Le jumelage est géré via un contexte global pour permettre à tous les composants d'accéder au status du jumelage
 * et de réagir en conséquence (ex: afficher la position de l'autre utilisateur sur la carte)
 */

"use client";
import React, {useState} from "react";
import {ValidateButton, DeleteButton} from "@/components/ui/button";

interface PairingRemoteProps {
    isPaired: boolean;
    pairingId: string | null;
    onPairingSuccess: (id: string, code: string) => void;
    onUnpair: () => void;
}

export default function PairingRemote({
                                          isPaired,
                                          pairingId,
                                          onPairingSuccess,
                                          onUnpair
                                      }: PairingRemoteProps) {
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handlePairing = async () => {
        setIsLoading(true);
        setError("");
        try {
            const response = await fetch('/api/core/pairing', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({targetUsername: username})
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Erreur lors du jumelage');

            // On transmet les infos à la page parente
            onPairingSuccess(data.pairing.id, data.pairing.pairingCode);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnpairing = async () => {
        if (!pairingId) {
            setError("Impossible d'arrêter: identifiant de session introuvable.");
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch('/api/core/pairing', {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({pairingId})
            });

            if (!response.ok) throw new Error('Erreur lors de la déconnexion');

            onUnpair(); // Notifie la page pour couper GPS/Socket
            setUsername("");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-white shadow-sm flex flex-col gap-3">
            <h3 className="font-bold text-gray-700">Gestion du partage</h3>

            {!isPaired ? (
                <>
                    <input
                        type="text"
                        className="border p-2 rounded w-full outline-none focus:ring-2 focus:ring-blue-400 text-black"
                        placeholder="Pseudo du destinataire..."
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isLoading}
                    />
                    <ValidateButton onClick={handlePairing} disabled={isLoading || !username}>
                        {isLoading ? "Envoi..." : "Démarrer le partage"}
                    </ValidateButton>
                </>
            ) : (
                <div className="flex flex-col gap-2">
                    <p className="text-green-600 text-sm font-medium">✓ Partage en cours</p>
                    <DeleteButton onClick={handleUnpairing} disabled={isLoading}>
                        {isLoading ? "Déconnexion..." : "Arrêter le partage"}
                    </DeleteButton>
                </div>
            )}

            {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
        </div>
    );
}