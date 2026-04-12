/**
 * Menu burger pour version mobile de l'application.
 * Affiche une icône de menu (hamburger) qui, lorsqu'elle est cliquée, affiche un menu de navigation.
 * Le menu peut être fermé en cliquant à nouveau sur l'icône ou en cliquant en dehors du menu.
 */
import Link from 'next/link';
import {useState} from "react";
import {Logout} from "@/components/ui/logout";
import {useAuth} from "@/components/auth/authContext";
import {Menu, X} from 'lucide-react';

// Composant Burger pour la navigation mobile
export function Burger() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const {isAuthenticated} = useAuth();

    // Fonction pour basculer l'état du menu ouvert/fermé
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Rendu du composant
    return (
        <div className="relative">
            <button onClick={toggleMenu} className="p-2 text-meetme-blue">
                {isMenuOpen ? <X size={24}/> : <Menu size={24}/>}
            </button>

            {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 p-2">
                    <Link href="/" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-meetme-blue hover:bg-gray-100">Accueil</Link>

                    {isAuthenticated ? (
                        <>
                            <Link href="/share-location" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-meetme-blue hover:bg-gray-100">Meet</Link>
                            <div className="border-t border-gray-100 mt-2 pt-2">
                                <Logout/>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-meetme-blue hover:bg-gray-100">Connexion</Link>
                            <Link href="/register" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-meetme-blue hover:bg-gray-100">
                                Inscription
                            </Link>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}