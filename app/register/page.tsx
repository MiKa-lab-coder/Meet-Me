/**
 * Page contenant le formulaire d'inscription pour les nouveaux utilisateurs.
 * Permet aux utilisateurs de créer un compte en fournissant leur username adresse e-mail,
 * mot de passe et confirmation de mot de passe.
 * Si l'utilisateur a déjà un compte, il peut cliquer sur le lien pour se connecter.
 * Le formulaire d'inscription est sécurisé et utilise des pratiques recommandées pour protéger les informations des utilisateurs.
 */

'use client';
import rules from '@/shared/rules.json';
import {IRegistrationData} from '@/shared/interfaces';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {RegisterForm} from '@/components/auth/registerForm';
import {useAuth} from "@/components/auth/authContext";
import {Loader} from 'lucide-react';

export default function RegistrationPage() {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { refreshAuth } = useAuth();

    // Fonction de gestion de la soumission du formulaire d'inscription
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true); // Active le chargement
        setError(null);

        // Récupération des données du formulaire
        const data = new FormData(e.currentTarget);
        const username = data.get('username') as string;
        const email = data.get('email') as string;
        const password = data.get('password') as string;
        const confirmPassword = data.get('confirmPassword') as string;

        // presence de tous les champs
        if (!username || !email || !password || !confirmPassword) {
            setError('Tous les champs sont requis.');
            setIsLoading(false);
            return;
        }

        // Validation SSoT avec rules.json
        const validateUsername = new RegExp(rules.rules.users.username.pattern);
        const usernameErrorMessage = rules.rules.users.username.error;
        if (!validateUsername.test(username)) {
            setError(usernameErrorMessage);
            setIsLoading(false); // Désactive le chargement en cas d'erreur
            return;
        }

        const validateEmail = new RegExp(rules.rules.users.email.pattern);
        const emailErrorMessage = rules.rules.users.email.error;
        if (!validateEmail.test(email)) {
            setError(emailErrorMessage);
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

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            setIsLoading(false); // Désactive le chargement en cas d'erreur
            return;
        }

        // Envoi de la requête d'inscription à l'API
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                // Envoi des données d'inscription dans le corps de la requête
                body: JSON.stringify({username, email, password, confirmPassword} as IRegistrationData),
            });
            // Si inscription ok redirection vers la page de partage de position
            // car l'utilisateur est automatiquement connecté après l'inscription
            if (response.ok) {
                await refreshAuth(); // Met à jour l'état d'authentification après l'inscription
                router.push('/share-location');
            } else {
                const errorData = await response.json();
                setError(errorData.error || errorData.message || 'Une erreur est survenue');
            }
            setIsLoading(false); // Désactive le chargement à la fin
        } catch (error) {
            setError('Une erreur est survenue. Veuillez réessayer.');
            setIsLoading(false); // Désactive le chargement en cas d'erreur
        }
    }

    // Fonction de gestion d'annulation de l'inscription
    const handleCancel = () => {
        const confirmCancel = window.confirm('Êtes-vous sûr de vouloir annuler votre inscription ?');
        if (confirmCancel) {
            // Réinitialisation du formulaire et redirection vers la page d'accueil
            const data = new FormData();
            data.append('username', '');
            data.append('email', '');
            data.append('password', '');
            data.append('confirmPassword', '');
            router.push('/');
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            {/* Relative pour l'overlay */}
            <div className="relative bg-white p-8 rounded shadow-md w-full max-w-md overflow-hidden">

                {/* Overlay de chargement */}
                {isLoading && (
                    <div
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
                        <Loader className="w-10 h-10 text-meetme-blue animate-spin"/>
                    </div>
                )}

                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Créer un compte</h2>
                <RegisterForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    error={error || undefined}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}