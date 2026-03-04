/**
 * Composant modale (ifConfirm) pour entrer le PIN de jumelage entre deux utilisateurs.
 * Le PIN est un code alphanumerique de 6 caractères et envoyer par email à l'utilisateur à jumeler.
 * L'utilisateur doit entrer le PIN pour valider le jumelage et commencer à partager sa position en temps réel.
 * Le PIN est valide pendant une durée limitée (ex: 10 minutes) pour garantir la sécurité du jumelage.
 * Si le PIN est incorrect ou expiré, un message d'erreur est affiché et l'utilisateur peut réessayer.
 * Une fois le jumelage validé, le PIN n'est plus nécessaire et les utilisateurs peuvent voir leur position respective sur la carte.
 */

import React, {useState} from "react";

interface PinPairingProps {
    onSubmit: (pin: string) => void; // Fonction pour valider le PIN de jumelage
    error?: string; // Message d'erreur à afficher si le PIN est incorrect ou expiré
    isLoading: boolean; // Indique si la validation du PIN est en cours
}

export function PinPairing({onSubmit, error, isLoading}: PinPairingProps) {
    const [pin, setPin] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Convertit le PIN en majuscules pour éviter les erreurs de saisie (ex: "abc123" devient "ABC123")
        const value = e.target.value.toUpperCase();
        setPin(value);
    }
    // Gère la soumission du formulaire pour valider le PIN de jumelage
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(pin);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
            {error && (
                <div className="text-meetme-red text-sm bg-red-50 p-2 rounded border border-red-200">
                    {error}
                </div>
            )}
            <input
                name="pin"
                type="text"
                placeholder="Entrez le PIN de jumelage"
                autoFocus={true}
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-meetme-blue uppercase"
                value={pin}
                onChange={handleChange}
                disabled={isLoading} // Désactive l'input pendant la validation du PIN
                required
            />
            <button
                type="submit"
                className="bg-meetme-blue text-white px-4 py-2 rounded-md hover:bg-meetme-blue-dark disabled:bg-gray-400"
                disabled={isLoading} // Désactive le bouton pendant la validation du PIN
            >
                {isLoading ? "Validation en cours..." : "Valider le PIN"}
            </button>
        </form>
    );
}