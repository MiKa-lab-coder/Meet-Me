/**
 * Page qui affiche le formulaire de connexion pour les utilisateurs.
 * Les utilisateurs entrent username et password pour se connecter.
 * Si les informations sont correctes, ils sont redirigés vers la page de partage de position.
 */

// use client sert à indiquer que ce composant doit être rendu côté client,
// ce qui est nécessaire pour utiliser des hooks comme useState et useRouter
'use client';
import rules from '@/shared/rules.json';
import {IAuthData} from '@/shared/interfaces';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {LoginForm} from '@/components/auth/loginForm';

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Fonction de gestion de la soumission du formulaire de connexion
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true); // Active le chargement
        setError(null);

        const data = new FormData(e.currentTarget);
        const username = data.get('username') as string;
        const password = data.get('password') as string;

        // Validation SSoT avec rules.json
        const validateUsername = new RegExp(rules.rules.users.username.pattern);
        const usernameErrorMessage = rules.rules.users.username.error;
        if (!validateUsername.test(username)) {
            setError(usernameErrorMessage);
            setIsLoading(false); // Désactive le chargement en cas d'erreur
            return;
        }

        const validatePassword = new RegExp(rules.rules.users.password.pattern);
        const passwordErrorMessage = rules.rules.users.password.error;
        if (!validatePassword.test(password)) {
            setError(passwordErrorMessage);
            setIsLoading(false); // Désactive le chargement en cas d'erreur
            return;
        }

        // Envoi de la requête de connexion à l'API
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                // Envoi des données de connexion dans le corps de la requête
                body: JSON.stringify({username, password} as IAuthData),
            });

            if (response.ok) {
                router.push('/share-location'); // Redirige vers la page de partage de position
            }

            setIsLoading(false); // Désactive le chargement à la fin
        } catch (err) {
            setError('Une erreur est survenue. Veuillez réessayer.');
            setIsLoading(false); // Désactive le chargement en cas d'erreur
        }


        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Se connecter</h2>
                    {/* On laisse le LoginForm gérer l'affichage de l'erreur via sa prop */}
                    <LoginForm
                        onSubmit={handleSubmit}
                        error={error || undefined}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        );
    }
}