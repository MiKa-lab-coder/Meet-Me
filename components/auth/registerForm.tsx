/**
 * Page qui affiche le formulaire de connexion pour les utilisateurs.
 * Permet aux utilisateurs de s'enregistrer et de se connecter à leur compte.
 * Les utilisateurs entrent username, email, password et confirmPassword pour créer un compte.
 */

import {ValidateButton} from "@/components/ui/button"; // Import du bouton de validation réutilisable
import {CancelButton} from "@/components/ui/button";
import React from "react";

interface RegisterFormProps {
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
    error?: string; // Message d'erreur unique venant du SSoT (rules.json via le parent)
}

export function RegisterForm({onSubmit, onCancel, error}: RegisterFormProps) {
    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4 w-full max-w-sm">
            {/* Message d'erreur affiché uniquement si le parent en envoie un */}
            {error && (
                <div className="text-meetme-red text-sm bg-red-50 p-2 rounded border border-red-200">
                    {error}
                </div>
            )}
            {/* Les champs du formulaire d'enregistrement */}
            <input
                name="username"
                type="text"
                placeholder="Nom d'utilisateur"
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-meetme-blue"
                required
            />

            <input
                name="email"
                type="email"
                placeholder="Adresse e-mail"
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-meetme-blue"
                required
            />

            <input
                name="password"
                type="password"
                placeholder="Mot de passe"
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-meetme-blue"
                required
            />

            <input
                name="confirmPassword"
                type="password"
                placeholder="Confirmer le mot de passe"
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-meetme-blue"
                required
            />
            {/* Utilisation des boutons de validation et d'annulation */}
            <div className="flex gap-2 mt-2">
                <ValidateButton onClick={() => {
                }} children="S'enregistrer"/>
                <CancelButton onClick={() => {
                }} children="Annuler"/>
            </div>
        </form>
    );
}
