/**
 * Formulaire de récupération de compte.
 * Un seul champ email + un choix du type de récupération.
 */
'use client';
import React from 'react';
import {Loader, SendHorizontal} from 'lucide-react';

export type ForgotRequestType = 'password' | 'username';

interface ForgotFormProps {
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    requestType: ForgotRequestType;
    onRequestTypeChange: (value: ForgotRequestType) => void;
    error?: string | null;
    isLoading?: boolean;
}

export default function ForgotForm({onSubmit, requestType, onRequestTypeChange, error, isLoading}: ForgotFormProps) {
    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4 w-full max-w-sm">
            {error && (
                <div className="text-meetme-red text-sm bg-red-50 p-2 rounded border border-red-200">
                    {error}
                </div>
            )}

            <label htmlFor="forgot-email" className="sr-only">Adresse e-mail</label>
            <input
                id="forgot-email"
                name="email"
                type="email"
                placeholder="Adresse e-mail"
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-meetme-blue"
                autoComplete="email"
                required
            />

            {/* Toggle de choix sans ajouter un second champ textuel. */}
            <div className="flex flex-col gap-2">
                <span className="text-sm text-gray-700">Je souhaite :</span>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        className={`px-3 py-2 rounded-md border text-sm transition ${requestType === 'password'
                            ? 'bg-meetme-blue text-white border-meetme-blue'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                        onClick={() => onRequestTypeChange('password')}
                        disabled={isLoading}
                    >
                        Reinit mot de passe
                    </button>
                    <button
                        type="button"
                        className={`px-3 py-2 rounded-md border text-sm transition ${requestType === 'username'
                            ? 'bg-meetme-blue text-white border-meetme-blue'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                        onClick={() => onRequestTypeChange('username')}
                        disabled={isLoading}
                    >
                        Recuperer username
                    </button>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    className="px-4 py-2 bg-meetme-blue text-white rounded-md hover:bg-meetme-blue-dark
                     focus:outline-none focus:ring-2 focus:ring-meetme-blue-light flex items-center gap-2"
                    disabled={isLoading}
                >
                    {isLoading ? <Loader className="animate-spin" size={16}/> : <SendHorizontal size={16}/>}
                    Envoyer
                </button>
            </div>
        </form>
    );
}