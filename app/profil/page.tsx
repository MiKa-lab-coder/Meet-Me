/**
 * Page simple permettant d'afficher ses infos user (username et mdp) et de les modifier
 *
 */

'use client'
import {Pencil,} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {useAuth} from "@/components/auth/authContext";

export default function ProfilPage() {
    const {refreshAuth} = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState('');
    const [editedUsername, setEditedUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setIsLoading] = useState(false);

    // Récupérer les infos de l'utilisateur au chargement de la page
    useEffect(() => {
        fetch('/api/auth/profil')
            .then(res => res.json())
            .then(data => {
                setUsername(data.username);
            })
            .catch(err => {
                console.error('Erreur lors de la récupération du profil :', err);
                setError('Impossible de charger les informations du profil.');
            });
    }, []);

    // Fonction de gestion de la soumission du formulaire de modification du profil
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const nextUsername = editedUsername.trim() || username;

        try {
            const response = await fetch('/api/auth/profil', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username: nextUsername, password}),
            });

            if (response.ok) {
                setUsername(nextUsername);
                setEditedUsername('');
                setPassword('');
                setIsEditing(false);
                return refreshAuth(); // Met à jour l'état d'authentification pour récupérer les nouvelles infos
            } else {
                const result = await response.json();
                setError(result.error || "Erreur lors de la mise à jour du profil.");
            }
        } catch (err) {
            console.error('Erreur lors de la mise à jour du profil :', err);
            setError('Erreur lors de la mise à jour du profil.');
        } finally {
            setIsLoading(false);
        }
    };

    // Suppression du compte
    const handleDeleteAccount = async () => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
            return;
        }
        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/profil', {
                method: 'DELETE',
            });

            if (response.ok) {
                alert("Votre compte a été supprimé.");
                window.location.href = "/"; // Redirige vers la page d'accueil après suppression
            } else {
                const result = await response.json();
                setError(result.error || "Erreur lors de la suppression du compte.");
            }
        } catch (err) {
            console.error('Erreur lors de la suppression du compte :', err);
            setError('Erreur lors de la suppression du compte.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Mon Profil</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-600">Nom d&apos;utilisateur actuel : <span className="font-medium">{username}</span></p>
                        <label htmlFor="login-username" className="mt-2 block text-sm font-medium text-gray-800">Nouveau nom d&apos;utilisateur</label>
                        <input
                            id={"login-username"}
                            type="text"
                            placeholder="Laisser vide pour conserver le nom actuel"
                            value={editedUsername}
                            onChange={(e) => setEditedUsername(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="login-password" className="block text-sm font-medium text-gray-800">Nouveau mot de passe</label>
                        <input
                            id={"login-password"}
                            type="password"
                            placeholder="Laisser vide pour conserver le mot de passe actuel"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div className="flex space-x-2">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-meetme-blue text-white rounded hover:bg-meetme-blue-dark disabled:bg-gray-400"
                            disabled={loading}
                        >
                            {loading ? "Enregistrement..." : "Enregistrer"}
                        </button>
                        <button
                            type="button"
                            className="bg-meetme-yellow text-gray-800 px-6 py-2 rounded font-medium
                            hover:bg-gray-400 transition-all disabled:opacity-50"
                            onClick={() => {
                                setIsEditing(false);
                                setEditedUsername('');
                                setPassword('');
                            }}
                            disabled={loading}
                        >

                            <span>Annuler</span>
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    <div className="space-y-2">
                        <p><strong>Nom d'utilisateur :</strong> {username}</p>
                        <button
                            className="flex items-center space-x-1 text-meetme-blue hover:text-meetme-blue-dark"
                            onClick={() => {
                                setIsEditing(true);
                                setEditedUsername('');
                                setPassword('');
                            }}
                        >
                            <Pencil size={16}/>
                            <span>Modifier</span>
                        </button>
                    </div>
                    <div className="mt-6">
                        <button
                            className="px-4 py-2 bg-meetme-red text-white rounded hover:bg-red-600"
                            onClick={handleDeleteAccount}
                            disabled={loading}
                        >
                            {loading ? "Suppression..." : "Supprimer mon compte"}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}