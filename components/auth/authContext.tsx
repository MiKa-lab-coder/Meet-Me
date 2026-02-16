/**
 * Fichier permettant de gérer le contexte d'authentification dans l'ensemble de l'application.
 * Permet de verifier si l'utilisateur est connecté en utilisant le token d'authentification stocké dans les cookies HTTP Only.
 */

import {createContext, useContext, useEffect, useState} from "react";


// Définition du type pour le contexte d'authentification
interface AuthContextType {
    isAuthenticated: boolean; // Indique si l'utilisateur est authentifié
    setIsAuthenticated: (value: boolean) => void; // Fonction pour mettre à jour l'état d'authentification
}

// Création du contexte d'authentification avec des valeurs par défaut
export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    setIsAuthenticated: () => {},
});

// Fournisseur de contexte d'authentification qui enveloppe les composants enfants
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Vérifie le token d'authentification lors du montage du composant
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Effectue une requête pour vérifier si l'utilisateur est authentifié en utilisant le token d'authentification
                const response = await fetch('/api/auth/me');
                setIsAuthenticated(response.ok);
            } catch (error) {
                setIsAuthenticated(false);
            }
        }
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
            {children} {/* Rend les composants enfants qui auront accès au contexte d'authentification */}
        </AuthContext.Provider>
    );
}