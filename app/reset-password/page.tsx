/**
 * Page de reinitialisation de mot de passe.
 * L'utilisateur arrive sur cette page après avoir cliqué sur le lien de reinitialisation dans son email.
 * Le token de reinitialisation est present dans l'URL en tant que parametre de requete.
 * La page verifie la validite du token en appelant l'API.
 * Si le token est valide, le formulaire de reinitialisation est affiche.
 * L'utilisateur peut entrer un nouveau mot de passe et le confirmer.
 * La validation du mot de passe est effectuee cote client avant d'envoyer la requete de reinitialisation.
 * Si la reinitialisation est reussie, un message de succes est affiche et l'utilisateur est redirige vers la page de connexion.
 * Sinon, un message d'erreur est affiche.
 */
'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import rules from '@/shared/rules.json';
import ResetForm from '@/components/auth/resetForm';

export default function ResetPasswordPage() {
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState(false);
    const router = useRouter();

    // Extraire le token de l'URL et vérifier sa validité auprès de l'API dès que la page est chargée.
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const t = urlParams.get('token');

        if (!t) {
            setError('Token de réinitialisation manquant.');
            return;
        }

        setToken(t);

        // Vérification du token auprès de l'API
        fetch(`/api/auth/reset-password?token=${t}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setTokenValid(true);
                }
            })
            .catch(() => setError('Une erreur est survenue lors de la vérification du token.'));
    }, []);

    // Gestion de la soumission du formulaire de réinitialisation du mot de passe.
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError(null);

        const data = new FormData(e.currentTarget);
        const newPassword = (data.get('newPassword') as string) ?? '';
        const confirmPassword = (data.get('confirmPassword') as string) ?? '';

        const passwordRules = rules.rules.users.password;
        const passwordRegex = new RegExp(passwordRules.pattern);
        if (
            !passwordRegex.test(newPassword) ||
            newPassword.length < passwordRules.min ||
            newPassword.length > passwordRules.max
        ) {
            setFormError(passwordRules.error);
            return;
        }

        if (newPassword !== confirmPassword) {
            setFormError(rules.rules.users.confirmPassword.error);
            return;
        }

        // Envoyer la requête de réinitialisation à l'API
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({token, newPassword}),
            });
            const result = await res.json();
            if (!res.ok) {
                setFormError(result.error ?? 'Une erreur est survenue.');
            } else {
                setSuccess(result.message);
                setTimeout(() => router.push('/login'), 3000);
            }
        } catch {
            setFormError('Une erreur réseau est survenue.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
                {error ? (
                    <p className="text-red-500">{error}</p>
                ) : success ? (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Mot de passe réinitialisé</h2>
                        <p className="text-lg mb-6">{success}</p>
                        <p className="text-sm text-gray-600">Redirection vers la connexion dans 3 secondes…</p>
                    </>
                ) : tokenValid ? (
                    <>
                        <h2 className="text-2xl font-bold mb-6">Nouveau mot de passe</h2>
                        <ResetForm onSubmit={handleSubmit} error={formError ?? undefined} isLoading={isLoading}/>
                    </>
                ) : (
                    <p>Vérification du token en cours…</p>
                )}
            </div>
        </div>
    );
}