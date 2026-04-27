/**
 * Composant de formulaire de connexion pour l'authentification des utilisateurs.
 * Permet aux utilisateurs de saisir leur adresse e-mail et mot de passe pour se connecter à leur compte.
 * le composant est aveugle, il met en place la structure du formulaire et les styles
 * meme le msg d'erreur, est à la charge du parent qui utilise ce composant
 */

import {ValidateButton} from "@/components/ui/button";
import React from "react"; // Import du bouton de validation réutilisable
import Link from "next/link";

interface LoginFormProps {
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    error?: string; // Message d'erreur unique venant du SSoT (rules.json via le parent)
        isLoading?: boolean; // Indique si le formulaire est en cours de soumission, pour désactiver les boutons
}

export function LoginForm({onSubmit, error,isLoading}: LoginFormProps) {
    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4 w-full max-w-sm">
            {/* Message d'erreur affiché uniquement si le parent en envoie un */}
            {error && (
                <div className="text-meetme-red text-sm bg-red-50 p-2 rounded border border-red-200">
                    {error}
                </div>
            )}

            <label htmlFor="login-username" className="sr-only">Nom d&apos;utilisateur</label>
            <input
                id="login-username"
                name="username" // Important pour récupérer la valeur facilement
                type="text"
                placeholder="Nom d'utilisateur"
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-meetme-blue"
                autoComplete="username"
                required
            />

            <label htmlFor="login-password" className="sr-only">Mot de passe</label>
            <input
                id="login-password"
                name="password"
                type="password"
                placeholder="Mot de passe"
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-meetme-blue"
                autoComplete="current-password"
                required
            />
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-meetme-blue focus:ring-meetme-blue border-gray-300 rounded"
                    />
                </div>
                <div className="text-sm">
                    <Link href="/forgotID" className="font-medium text-meetme-blue hover:text-meetme-blue-dark">
                        Mot de passe oublié ?
                    </Link>
                </div>
            </div>

            {/* Appelle du bouton */}
            <div className="mt-2">
                <ValidateButton disabled={isLoading}>
                    {isLoading ? "Connexion..." : "Se connecter"}
                </ValidateButton>
            </div>
        </form>
    );
}