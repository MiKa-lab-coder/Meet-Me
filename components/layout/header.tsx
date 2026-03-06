/**
 * Header de l'application, affiché sur toutes les pages.
 * Contient le logo et la navigation principale.
 */
"use client";
import Link from 'next/link';
import {useState, useEffect, useContext} from "react";
import {useRouter} from 'next/navigation';
import {usePathname} from "next/navigation";
import {Burger} from "@/components/ui/burger";
import {Logout} from "@/components/ui/logout";
import {AuthContext} from "@/components/auth/authContext";

export function Header() {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const {isAuthenticated} = useContext(AuthContext);
    const pathname = usePathname();
    const logo = "/logo.png"; // Chemin vers le logo de l'application dans le dossier public


    return (
        /* Fond très léger pour faire ressortir le blanc du logo ou bordure colorée */
        <header className="bg-white shadow-sm border-b border-meetme-light">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">

                {/* On applique le bleu meetme au texte */}
                <Link href="/" className="flex items-center space-x-2">
                    <img src={logo} alt="Logo" className="h-10 w-auto"/>
                    <span className="text-xl font-bold text-meetme-blue">Meet-Me</span>
                </Link>

                {/* Navigation principale */}
                <nav className="hidden md:flex space-x-6">
                    <Link href="/"
                          className={`transition-colors hover:text-meetme-dark ${
                              pathname === '/' ? 'text-meetme-blue font-bold' : 'text-gray-600'
                          }`}>
                        Accueil
                    </Link>

                    {/* Affiche le lien "Meet" uniquement si l'utilisateur est authentifié */}
                    {isAuthenticated && (
                        <Link href="/share-location"
                              className={`transition-colors hover:text-meetme-dark ${
                                  pathname === '/share-location' ? 'text-meetme-blue font-bold' : 'text-gray-600'
                              }`}>
                            Meet-Me
                        </Link>
                    )}

                    <Link href="/login"
                          className={`transition-colors hover:text-meetme-dark ${
                              pathname === '/login' ? 'text-meetme-blue font-bold' : 'text-gray-600'
                          }`}>
                        Connexion
                    </Link>

                    {/* Affiche le lien "Inscription" si l'utilisateur n'est PAS authentifié */}
                    {!isAuthenticated && (
                        <Link href="/register"
                              className="text-meetme-blue font-semibold hover:text-meetme-dark transition-colors">
                            Inscription
                        </Link>
                    )}

                    {/* Affiche un bouton de déconnexion si l'utilisateur est authentifié */}
                    {isAuthenticated && (
                        <Logout/>
                    )}

                </nav>
                {/* Menu burger pour les écrans mobiles */}
                <div
                    className="md:hidden text-meetme-blue cursor-pointer"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <Burger/>
                </div>
            </div>
        </header>
    )
}