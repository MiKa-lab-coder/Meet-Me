/**
 * Composant modale pour entrer le PIN de jumelage entre deux utilisateurs.
 * Le PIN est un code alphanumerique de 6 caractères et envoyer par email à l'utilisateur à jumeler.
 * L'utilisateur doit entrer le PIN pour valider le jumelage et commencer à partager sa position en temps réel.
 * Le PIN est valide pendant une durée limitée (ex: 10 minutes) pour garantir la sécurité du jumelage.
 * Si le PIN est incorrect ou expiré, un message d'erreur est affiché et l'utilisateur peut réessayer.
 * Une fois le jumelage validé, le PIN n'est plus nécessaire et les utilisateurs peuvent voir leur position respective sur la carte.
 */

"use client";
import React, { useState, useEffect } from "react";
import { ValidateButton } from "@/components/ui/button";

interface PinPairingProps {
    onValidationSuccess: (code: string) => void;
}

export default function PinPairing({ onValidationSuccess }: PinPairingProps) {
    const [pairingCode, setPairingCode] = useState("");
    const [magicToken, setMagicToken] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setPairingCode(params.get('pairingCode') || "");
        setMagicToken(params.get('magicToken') || "");
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch('/api/core/pairing', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pairingCode, magicToken }),
                credentials: 'include'
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Code invalide');

            // Succès : on prévient la page avec le code validé
            onValidationSuccess(pairingCode);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-blue-50">
            <h3 className="font-bold mb-2">Entrez le code reçu par mail</h3>
            <input
                type="text"
                className="border p-2 rounded w-full mb-2 text-center text-xl font-mono"
                maxLength={6}
                value={pairingCode}
                onChange={(e) => setPairingCode(e.target.value.toUpperCase())}
            />
            <ValidateButton type="submit" disabled={isLoading || pairingCode.length !== 6}>
                {isLoading ? "Vérification..." : "Valider le jumelage"}
            </ValidateButton>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
    );
}
