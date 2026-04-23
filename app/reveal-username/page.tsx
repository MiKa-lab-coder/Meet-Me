/**
 * page permettant a un utilisateur de récupérer son username
 * cette page est accessible via un lien de reinitialisation temporaire envoyé par e-mail
 * la page vérifie la validité du token de reinitialisation avant d'afficher le username
 * si le token est invalide ou expiré, un message d'erreur est affiché et l'utilisateur est invité à demander un nouveau lien de reinitialisation
 *
 * le username est affiché en clair sur la page une fois que le token est validé pour une durée limitée,
 * apres quoi on redirige vers la page de connexion
 * la page utilise un timer pour afficher le username pendant une durée limitée (ex: 30 secondes) avant de rediriger automatiquement vers la page de connexion
 */

'use client';

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";

export default function RevealUsernamePage() {
    const [username, setUsername] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Récupérer le token de l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
            setError("Token de reinitialisation manquant.");
            return;
        }

        // Vérifier la validité du token auprès de l'API
        fetch(`/api/auth/reveal-username?token=${token}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setUsername(data.username);
                    // Rediriger vers la page de connexion après 30 secondes
                    setTimeout(() => {
                        router.push('/login');
                    }, 30000);
                }
            })
            .catch(() => {
                setError("Une erreur est survenue lors de la vérification du token.");
            });
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
                {error ? (
                    <p className="text-red-500">{error}</p>
                ) : username ? (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Votre nom d'utilisateur</h2>
                        <p className="text-lg mb-6">{username}</p>
                        <p className="text-sm text-gray-600">Ce nom d'utilisateur sera affiché pendant 30 secondes avant de rediriger vers la page de connexion.</p>
                    </>
                ) : (
                    <p>Vérification du token en cours...</p>
                )}
            </div>
        </div>
    );
}