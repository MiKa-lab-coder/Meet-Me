/**
 * Boutons réutilisables de l'application.
 */

interface ButtonProps {
    onClick: () => void;
    children?: React.ReactNode; // Permet de changer le texte si besoin
}

// Bouton de validation
export function ValidateButton({ onClick, children = "Valider" }: ButtonProps) {
    return (
        <button
            onClick={onClick}
            className="bg-meetme-green text-white px-4 py-2 rounded-full font-medium hover:bg-opacity-90 transition-all"
        >
            {children}
        </button>
    );
}

// Bouton d'annulation
export function CancelButton({ onClick, children = "Annuler" }: ButtonProps) {
    return (
        <button
            onClick={onClick}
            className="bg-meetme-yellow text-gray-800 px-4 py-2 rounded-full font-medium hover:bg-gray-400 transition-all"
        >
            {children}
        </button>
    );
}

// Bouton de suppression
export function DeleteButton({ onClick, children = "Supprimer" }: ButtonProps) {
    return (
        <button
            onClick={onClick}
            className="bg-meetme-red text-white px-4 py-2 rounded-full font-medium hover:bg-red-600 transition-all"
        >
            {children}
        </button>
    );
}