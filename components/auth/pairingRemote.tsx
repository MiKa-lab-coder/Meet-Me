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

export default function PairingRemote() {
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isPaired, setIsPaired] = useState(false);
    const [error, setError] = useState("");
    const [pairingId, setPairingId] = useState<string | null>(null);

    const handlePairing = async () => {
        setIsLoading(true);
        setError("");

        try {
            // Appel à l'API pour initier le jumelage
            const response = await fetch('/api/core/pairing', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({targetUsername: username})
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erreur lors du jumelage');
            }

            // Récupère l'ID du pairing créé depuis la réponse
            const data = await response.json();
            setPairingId(data.pairing.id);
            setIsPaired(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors du jumelage");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnpairing = async () => {
        setIsLoading(true);
        setError("");

        try {
            // Appel à l'API pour terminer le jumelage avec l'ID réel
            const response = await fetch('/api/core/pairing', {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({pairingId: pairingId})
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erreur lors de la terminaison du jumelage');
            }

            setIsPaired(false);
            setPairingId(null);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Erreur lors de la terminaison du jumelage');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Nom d'utilisateur à jumeler"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading || isPaired}
            />
            {!isPaired ? (
                <ValidateButton onClick={handlePairing} disabled={isLoading || !username}>
                    Jumeler
                </ValidateButton>
            ) : (
                <DeleteButton onClick={handleUnpairing} disabled={isLoading}>
                    Terminer le jumelage
                </DeleteButton>
            )}
            {error && <p style={{color: 'red'}}>{error}</p>}
        </div>
    );
}

