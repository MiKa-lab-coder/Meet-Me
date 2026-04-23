/**
 * Page de recuperation de compte.
 * L'utilisateur entre son email puis choisit le type de demande:
 * - reinitialisation de mot de passe
 * - recuperation du username
 */

'use client';

import React, {useState} from 'react';
import ForgotForm, {ForgotRequestType} from '@/components/auth/forgotForm';
import rules from '@/shared/rules.json';

const endpointByType: Record<ForgotRequestType, string> = {
    password: '/api/auth/reset-password',
    username: '/api/auth/reveal-username',
};

const successByType: Record<ForgotRequestType, string> = {
    password: 'Si un compte existe avec cette adresse e-mail, un e-mail de reinitialisation du mot de passe sera envoye.',
    username: 'Si un compte existe avec cette adresse e-mail, un e-mail pour consulter votre username sera envoye.',
};

export default function ForgotIDPage() {
    const [requestType, setRequestType] = useState<ForgotRequestType>('password');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        // Recuperer l'email depuis le formulaire unique.
        const data = new FormData(e.currentTarget);
        const email = typeof data.get('email') === 'string' ? (data.get('email') as string).trim().toLowerCase() : '';

        // Validation front avec la regle partagee.
        const emailRegex = new RegExp(rules.rules.users.email.pattern);
        if (!emailRegex.test(email)) {
            setError(rules.rules.users.email.error);
            setIsLoading(false);
            return;
        }

        // Choisir la route selon le type selectionne par l'utilisateur.
        const endpoint = endpointByType[requestType];

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email}),
            });

            if (!response.ok) {
                setError('Une erreur est survenue lors de la demande. Veuillez reessayer.');
                return;
            }

            // Message de succes contextualise selon le choix.
            setSuccessMessage(successByType[requestType]);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Une erreur inconnue est survenue.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Recuperation de compte</h2>
                <p className="mb-4 text-sm text-gray-700">
                    Entrez votre adresse e-mail, puis choisissez si vous voulez recuperer votre username
                    ou reinitialiser votre mot de passe.
                </p>

                {successMessage ? (
                    <div className="text-green-600 text-sm bg-green-50 p-2 rounded border border-green-200">
                        {successMessage}
                    </div>
                ) : (
                    <ForgotForm
                        onSubmit={handleSubmit}
                        requestType={requestType}
                        onRequestTypeChange={setRequestType}
                        error={error}
                        isLoading={isLoading}
                    />
                )}
            </div>
        </div>
    );
}
