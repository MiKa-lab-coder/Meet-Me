/**
 * Fichier permettant de gérer le contexte d'authentification dans l'ensemble de l'application.
 * Permet de verifier si l'utilisateur est connecté en utilisant le token d'authentification stocké dans les cookies HTTP Only.
 */
"use client";
import {createContext, useContext, useEffect, useState} from "react";
import {useRouter} from "next/navigation";



// Définition du type pour le contexte d'authentification
interface AuthContextType {
    isAuthenticated: boolean; // Indique si l'utilisateur est authentifié
    setIsAuthenticated: (value: boolean) => void;
    refreshAuth: () => Promise<void>;// Fonction pour mettre à jour l'état d'authentification
}

// Création du contexte d'authentification avec des valeurs par défaut
export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    setIsAuthenticated: () => {},
    refreshAuth: async () => {}
});

// Fournisseur de contexte d'authentification qui enveloppe les composants enfants
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    // Vérifie le token d'authentification
    const checkAuth = async () => {
        try {
            // Effectue une requête pour vérifier si l'utilisateur est authentifié en utilisant le token d'authentification
            const response = await fetch('/api/auth/me');
            setIsAuthenticated(response.ok);
        } catch (error) {
            setIsAuthenticated(false);
        }
    }

    // Vérifie l'authentification uniquement au montage du composant
    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            setIsAuthenticated,
            refreshAuth: checkAuth // On expose la fonction au reste de l'app
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Petit hook personnalisé pour faciliter l'usage
export const useAuth = () => useContext(AuthContext);