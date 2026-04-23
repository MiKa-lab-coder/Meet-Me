/**
 * composant formulaire de réinitialisation du mot de passe
 * utilisé dans la page de reinitialisation du mot de passe
 * permet à l'utilisateur d'entrer un nouveau mot de passe et de le confirmer
 * la validation du mot de passe est effectuée côté client avant d'envoyer la requête de reinitialisation
 * si le mot de passe est valide, une requête est envoyée à l'API pour mettre à jour le mot de passe de l'utilisateur
 * si la reinitialisation est réussie, un message de succès est affiché et l'utilisateur est redirigé vers la page de connexion
 * sinon, un message d'erreur est affiché
 */

import React from "react";

export interface ResetFormProps {
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    error?: string;
    isLoading?: boolean;
}

export default function ResetForm({onSubmit, error, isLoading}: ResetFormProps) {
    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4 w-full max-w-sm">
            {/* Message d'erreur affiché uniquement si le parent en envoie un */}
            {error && (
                <div className="text-meetme-red text-sm bg-red-50 p-2 rounded border border-red-200">
                    {error}
                </div>
            )}
            <label htmlFor="new-password" className="sr-only">Nouveau mot de passe</label>
            <input
                type="password"
                id="new-password"
                name="newPassword"
                placeholder="Nouveau mot de passe"
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-meetme-blue"
                autoComplete="new-password"
                required
            />
            <label htmlFor="confirm-password" className="sr-only">Confirmer le mot de passe</label>
            <input
                type="password"
                id="confirm-password"
                name="confirmPassword"
                placeholder="Confirmer le mot de passe"
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-meetme-blue"
                autoComplete="new-password"
                required
            />
            <div className="mt-2">
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
                </button>
            </div>
        </form>
    );

}