/**
 * Composants de boutons réutilisables pour l'application.
 * Les boutons sont configurés par défaut en type "submit" pour fonctionner dans les formulaires,
 * mais peuvent être utilisés comme boutons classiques en changeant le type.
 */

import React from 'react';

interface ButtonProps {
    children: React.ReactNode; // Contenu du bouton (texte ou icône)
    onClick?: () => void; // Fonction à appeler lors du clic sur le bouton
    type?: "submit" | "button" | "reset"; // Type du bouton, par défaut "submit" pour les formulaires
    disabled?: boolean; // Permet de désactiver le bouton, par défaut false
}

// Bouton de validation (Vert Meet-Me)
export function ValidateButton({ children, onClick, type = "submit", disabled = false }: ButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`bg-meetme-green text-white px-6 py-2 rounded-full font-medium 
                hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {children}
        </button>
    );
}

// Bouton d'annulation (Jaune Meet-Me)
export function CancelButton({ children, onClick, type = "button", disabled = false }: ButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`bg-meetme-yellow text-gray-800 px-6 py-2 rounded-full font-medium 
                hover:bg-gray-400 transition-all disabled:opacity-50`}
        >
            {children}
        </button>
    );
}

// Bouton de suppression (Rouge Meet-Me)
export function DeleteButton({ children, onClick, type = "button", disabled = false }: ButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`bg-meetme-red text-white px-6 py-2 rounded-full font-medium 
                hover:bg-red-600 transition-all disabled:opacity-50`}
        >
            {children}
        </button>
    );
}