/**
 * Composant modale pour entrer le PIN de jumelage entre deux utilisateurs.
 * Le PIN est un code alphanumerique de 6 caractères et envoyer par email à l'utilisateur à jumeler.
 * L'utilisateur doit entrer le PIN pour valider le jumelage et commencer à partager sa position en temps réel.
 * Le PIN est valide pendant une durée limitée (ex: 10 minutes) pour garantir la sécurité du jumelage.
 * Si le PIN est incorrect ou expiré, un message d'erreur est affiché et l'utilisateur peut réessayer.
 * Une fois le jumelage validé, le PIN n'est plus nécessaire et les utilisateurs peuvent voir leur position respective sur la carte.
 */

import React, {useState, useEffect} from "react";
import rules from "@/shared/rules.json";
import {ValidateButton} from "@/components/ui/button";

export function PinPairing() {
    const [pairingCode, setPairingCode] = useState("");
    const [magicToken, setMagicToken] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isPaired, setIsPaired] = useState(false);
    const [error, setError] = useState("");

    // Extrait pairingCode et magicToken depuis les paramètres d'URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('pairingCode');
        const token = params.get('magicToken');

        if (code && token) {
            setPairingCode(code);
            setMagicToken(token);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Convertit le code saisi en majuscules (format attendu: "ABC123")
        setPairingCode(e.target.value.toUpperCase());
    }

    // Valide le jumelage en envoyant le code et le token au serveur
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // Validation du format du code avant envoi (6 caractères alphanumériques)
            const codePattern = new RegExp(rules.rules.pairing.pairingCode.pattern);
            const codeError = rules.rules.pairing.pairingCode.error;
            if (!codePattern.test(pairingCode)) {
                throw new Error(codeError);
            }

            // Appel API PATCH pour valider le jumelage
            // Envoie: code + token + authentification utilisateur
            const response = await fetch('/api/core/pairing', {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    pairingCode,
                    magicToken
                }),
                credentials: 'include' // Important: envoie les cookies d'authentification
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erreur lors de la validation du jumelage');
            }

            // Jumelage validé avec succès
            setIsPaired(true);
            // Redirection optionnelle vers /share-location après succès
            setTimeout(() => {
                window.location.href = '/share-location';
            }, 1000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors de la validation du jumelage");
        } finally {
            setIsLoading(false);
        }
    };

    // Affichage du formulaire
    return (
        <div className="pairing-modal">
            <h2>Valider le jumelage</h2>
            {isPaired ? (
                <p style={{color: 'green'}}>Jumelage validé avec succès! ✓</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Code de 6 caractères (ex: ABC123)"
                        value={pairingCode}
                        onChange={handleChange}
                        maxLength={6}
                        disabled={isLoading}
                        required
                    />
                    <ValidateButton
                        type="submit"
                        disabled={isLoading || pairingCode.length !== 6}
                    >
                        {isLoading ? 'Validation...' : 'Valider le jumelage'}
                    </ValidateButton>
                    {error && <p style={{color: 'meetme-red'}}>{error}</p>}
                </form>
            )}
        </div>
    );
}
