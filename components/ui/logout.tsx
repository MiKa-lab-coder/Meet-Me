/**
 * Bouton de déconnexion pour l'utilisateur connecté.
 * Affiche un bouton "Logout" qui, lorsqu'il est cliqué, supprime le token et redirige l'utilisateur vers la page Accueil.
 */

import {useRouter} from 'next/navigation';
import {useState} from "react";
import {LogOut} from 'lucide-react';
import {useAuth} from "@/components/auth/authContext";


export function Logout() {
    const router = useRouter();
    const { refreshAuth } = useAuth();
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
                // Met à jour l'état d'authentification puis redirige vers l'accueil
                await refreshAuth();
                // Utilise window.location pour forcer un rechargement complet (évite les conflits de cache)
                window.location.href = '/';
            } else {
                console.error('Erreur pendant la déconnexion');
                setIsLoggingOut(false);
            }
        } catch (error) {
            console.error('Erreur lors de la déconnexion', error);
            setIsLoggingOut(false);
        }
        // On ne remet pas isLoggingOut à false car la page va se recharger
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-meetme-red hover:font-bold focus:outline-none focus:ring-2 focus:ring-meetme-red focus:ring-offset-2 rounded"
            disabled={isLoggingOut}
        >
            <LogOut size={20}/>
            <span>LogOut</span>
        </button>
    );
}