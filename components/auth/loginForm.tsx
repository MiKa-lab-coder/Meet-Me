/**
 * Composant de formulaire de connexion pour l'authentification des utilisateurs.
 * Permet aux utilisateurs de saisir leur adresse e-mail et mot de passe pour se connecter à leur compte.
 * le composant est aveugle, il met en place la structure du formulaire et les styles
 * meme le msg d'erreur, est à la charge du parent qui utilise ce composant
 */
import {ValidateButton} from "@/components/ui/button"; // Import du bouton de validation réutilisable

interface LoginFormProps {
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    error?: string; // Message d'erreur unique venant du SSoT (rules.json via le parent)
}

export function LoginForm({onSubmit, error}: LoginFormProps) {
    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4 w-full max-w-sm">
            {/* Message d'erreur affiché uniquement si le parent en envoie un */}
            {error && (
                <div className="text-meetme-red text-sm bg-red-50 p-2 rounded border border-red-200">
                    {error}
                </div>
            )}

            <input
                name="username" // Important pour récupérer la valeur facilement
                type="text"
                placeholder="Nom d'utilisateur"
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-meetme-blue"
                autoComplete="username" // Permet au navigateur de proposer les bonnes suggestions
                required
            />

            <input
                name="password"
                type="password"
                placeholder="Mot de passe"
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-meetme-blue"
                autoComplete="current-password"
                required
            />

            {/* Utilisation de ton bouton de validation */}
            <div className="mt-2">
                <ValidateButton onClick={() => {
                }} children="Se connecter"/>
            </div>
        </form>
    );
}