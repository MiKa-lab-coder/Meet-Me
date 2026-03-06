/**
 * Bouton de déconnexion pour l'utilisateur connecté.
 * Affiche un bouton "Logout" qui, lorsqu'il est cliqué, supprime le token et redirige l'utilisateur vers la page Accueil.
 */

import {useRouter} from 'next/navigation';
import {useState} from "react";
import {LogOut} from 'lucide-react';


export function Logout() {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true); // Désactive le bouton pendant la déconnexion
        try {
            // Appeler l'API de déconnexion pour supprimer le token d'authentification
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Rediriger vers la page de connexion après une déconnexion réussie
                router.push('/');
            } else {
                console.error('Erreur lors de la déconnexion');
            }
        } catch (error) {
            console.error('Erreur lors de la déconnexion', error);
        } finally {
            setIsLoggingOut(false); // Réactive le bouton après la tentative de déconnexion
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-meetme-red  hover:font-bold focus:outline-none "
            disabled={isLoggingOut}
        >
            <LogOut size={20}/>
            <span>LogOut</span>
        </button>
    );
}