/**
 * Header de l'application, affiché sur toutes les pages.
 * Contient le logo et la navigation principale.
 */
"use client";
import Link from 'next/link';
import {usePathname} from "next/navigation";
import {Burger} from "@/components/ui/burger";
import {Logout} from "@/components/ui/logout";
import {useAuth} from "@/components/auth/authContext";
import {User} from 'lucide-react';

export function Header() {
    const {isAuthenticated} = useAuth();
    const pathname = usePathname();
    const logo = "/logo.png"; // Chemin vers le logo de l'application dans le dossier public

    // Style commun pour les liens de navigation
    const getLinkClasses = (isActive: boolean) => {
        return `transition-colors hover:text-meetme-dark ${
            isActive ? 'text-meetme-blue font-bold' : 'text-gray-600'
        }`;
    };


    return (
        /* Fond très léger pour faire ressortir le blanc du logo ou bordure colorée */
        <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-meetme-light">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">

                {/* On applique le bleu meetme au texte */}
                <Link href="/" className="flex items-center space-x-2">
                    <img src={logo} alt="Logo" className="h-10 w-auto"/>
                    <span className="text-xl font-bold text-meetme-blue">Meet-Me</span>
                </Link>

                {/* Navigation principale */}
                <nav className="hidden md:flex space-x-6">
                    {/* Lien Accueil */}
                    <Link href="/" className={getLinkClasses(pathname === '/')}>
                        Accueil
                    </Link>

                    {/* Lien Meet-Me: affiché uniquement si authentifié */}
                    {isAuthenticated && (
                        <Link href="/share-location" className={getLinkClasses(pathname === '/share-location')}>
                            Meet-Me
                        </Link>
                    )}

                    {/* Lien Connexion: affiché si non authentifié */}
                    {!isAuthenticated && (
                        <Link href="/login" className={getLinkClasses(pathname === '/login')}>
                            Connexion
                        </Link>
                    )}

                    {/* Lien Inscription: affiché si non authentifié */}
                    {!isAuthenticated && (
                        <Link href="/register" className={getLinkClasses(pathname === '/register')}>
                            Inscription
                        </Link>
                    )}

                    {/* Bouton Déconnexion: affiché si authentifié */}
                    {isAuthenticated && (
                        <Logout />
                    )}
                    {isAuthenticated && (
                        <Link href="/profil" className={getLinkClasses(pathname === '/profil')}>
                            <User size={22}/>
                        </Link>
                    )}
                </nav>
                {/* Menu burger pour les écrans mobiles */}
                <div className="md:hidden">
                    <Burger/>
                </div>
            </div>
        </header>
    )
}